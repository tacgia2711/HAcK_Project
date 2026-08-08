import gc
# Force garbage collection to clear previous RAM before allocating new buffers
gc.collect() 

import math
import array
from machine import Pin, ADC, I2S

# --- Hardware Setup ---
bck_pin = Pin(16)
ws_pin = Pin(17)
sdout_pin = Pin(18)

# --- Physical Effect Buttons ---
btn_distortion = Pin(9, Pin.IN, Pin.PULL_UP)
btn_reverb = Pin(10, Pin.IN, Pin.PULL_UP)
btn_bitcrush = Pin(11, Pin.IN, Pin.PULL_UP)

# Track previous states for single-press toggle logic (1 = unpressed, 0 = pressed)
was_btn_dist = 1
was_btn_rev = 1
was_btn_bit = 1

audio_out = I2S(0, 
                sck=bck_pin, 
                ws=ws_pin, 
                sd=sdout_pin, 
                mode=I2S.TX, 
                bits=16, 
                format=I2S.MONO, 
                rate=22050, 
                ibuf=4096)

x_axis = ADC(Pin(26))
slide_pot = ADC(Pin(27)) # Master Volume Potentiometer
LEFT_THRESHOLD = 15000
RIGHT_THRESHOLD = 55000

row_pins = [Pin(i, Pin.OUT) for i in range(2, 6)]
col_pins = [Pin(i, Pin.IN, Pin.PULL_DOWN) for i in range(6, 9)]

# --- Software Toggles & Effects ---
DISTORTION_ENABLED = False 
REVERB_ENABLED = False 
BITCRUSH_ENABLED = False

# --- Musical Setup ---
FREQUENCIES = [
    [261.63, 277.18, 293.66],  # C4, C#4, D4 
    [311.13, 329.63, 349.23],  # D#4, E4, F4
    [369.99, 392.00, 415.30],  # F#4, G4, G#4
    [440.00, 466.16, 493.88]   # A4, A#4, B4
]

# --- Pre-Compute Wavetables (Array Optimized) ---
print("Initializing dual wavetables (Complex and Fuzzed Sine)...")
complex_tone_buffers = {}
sine_tone_buffers = {}

sample_rate = 22050 
# Reduced from 15000 to 8000 to prevent 16-bit array overflow when 4 notes overlap
volume_max = 8000  
TARGET_SAMPLES = 1024 

for row in FREQUENCIES:
    for freq in row:
        samples_per_cycle = int(round(sample_rate / freq))
        actual_freq = sample_rate / samples_per_cycle
        
        num_cycles = max(1, TARGET_SAMPLES // samples_per_cycle)
        total_samples = samples_per_cycle * num_cycles
        
        complex_buffer = array.array('h', [0] * total_samples)
        sine_buffer = array.array('h', [0] * total_samples)
        
        for i in range(total_samples):
            t = i / sample_rate
            t_cycle = t * 2 * math.pi * actual_freq
            
            # Fundamental sine wave
            fundamental = math.sin(t_cycle)
            
            # --- 1. Complex Bowed String ---
            harmonic_2 = (1/2) * math.sin(2 * t_cycle)
            harmonic_3 = (1/3) * math.sin(3 * t_cycle) 
            harmonic_4 = (1/4) * math.sin(4 * t_cycle)
            harmonic_5 = (1/5) * math.sin(5 * t_cycle)
            harmonic_6 = (1/6) * math.sin(6 * t_cycle)
            
            combined_wave = (fundamental + harmonic_2 + harmonic_3 + harmonic_4 + harmonic_5 + harmonic_6) / 2.45
            
            # --- 2. Polyphonic Fuzz (Soft-Clipped Sine) ---
            drive = 8.0 
            driven_sine = fundamental * drive
            soft_clipped = driven_sine / (1.0 + abs(driven_sine))
            fuzzed_sine = soft_clipped * ((1.0 + drive) / drive)
            
            # Store both versions
            complex_buffer[i] = int(combined_wave * volume_max)
            sine_buffer[i] = int(fuzzed_sine * volume_max)
            
        complex_tone_buffers[freq] = complex_buffer
        sine_tone_buffers[freq] = sine_buffer

# --- Non-Blocking Audio & Polyphony Management ---
CHUNK_SAMPLES = 512  
silent_chunk = array.array('h', [0] * CHUNK_SAMPLES)
mix_chunk = array.array('h', [0] * CHUNK_SAMPLES)

MAX_SIMULTANEOUS_KEYS = 2 # Limits the keypad scanner so we only read 2 inputs max at a time
NUM_VOICES = 4            # But we process 4 audio voices so tails can overlap
voices = []
for _ in range(NUM_VOICES):
    voices.append({
        "buffer": None, 
        "pos": 0, 
        "vol": 0.0, 
        "hold": 0, 
        "freq": 0
    })

def scan_keypad():
    pressed = []
    for row_idx, row in enumerate(row_pins):
        row.value(1) 
        for col_idx, col in enumerate(col_pins):
            if col.value() == 1: 
                pressed.append(FREQUENCIES[row_idx][col_idx])
                if len(pressed) == MAX_SIMULTANEOUS_KEYS:
                    row.value(0) 
                    return pressed
        row.value(0) 
    return pressed 

# --- Main Event Loop ---
print("The Stradibearius Quartet Polyphonic Instrument Ready.")
print("Hold sensor to 'bow' up to 2 notes!")

was_strumming = False

try:
    while True:
        # 1. Read Inputs
        current_freqs = scan_keypad()
        x_val = x_axis.read_u16()
        is_strumming = (x_val < LEFT_THRESHOLD) or (x_val > RIGHT_THRESHOLD)
        master_vol = slide_pot.read_u16() / 65535.0

        # Read physical buttons
        curr_dist = btn_distortion.value()
        curr_rev = btn_reverb.value()
        curr_bit = btn_bitcrush.value()
        
        #Distortion Button Toggle
        if curr_dist == 0 and was_btn_dist == 1:
            DISTORTION_ENABLED = not DISTORTION_ENABLED
            print("Distortion Toggled:", DISTORTION_ENABLED)
        was_btn_dist = curr_dist
        
        #Reverb Button Toggle
        if curr_rev == 0 and was_btn_rev == 1:
            REVERB_ENABLED = not REVERB_ENABLED
            print("Reverb Toggled:", REVERB_ENABLED)
        was_btn_rev = curr_rev
        
        #Bitcrush Button Toggle
        if curr_bit == 0 and was_btn_bit == 1:
            BITCRUSH_ENABLED = not BITCRUSH_ENABLED
            print("Bitcrush Toggled:", BITCRUSH_ENABLED)
        was_btn_bit = curr_bit
        
        # 2. Dynamic Voice Trigger Logic
        if is_strumming and not was_strumming and len(current_freqs) > 0:
            for freq in current_freqs:
                target_voice = None
                
                # Option A: Check if this exact frequency is already playing and re-use it to prevent phasing
                for v in voices:
                    if v["buffer"] is not None and v["freq"] == freq:
                        target_voice = v
                        break
                
                # Option B: If not found, look for a completely empty voice
                if target_voice is None:
                    for v in voices:
                        if v["buffer"] is None:
                            target_voice = v
                            break
                            
                # Option C: If all 4 voices are busy, steal the one with the lowest volume (oldest fading tail)
                if target_voice is None:
                    quietest_v = voices[0]
                    for v in voices:
                        if v["vol"] < quietest_v["vol"]:
                            quietest_v = v
                    target_voice = quietest_v
                
                # Assign the note to the dynamically chosen voice
                target_voice["freq"] = freq
                if DISTORTION_ENABLED:
                    target_voice["buffer"] = sine_tone_buffers[freq]
                else:
                    target_voice["buffer"] = complex_tone_buffers[freq]
                    
                target_voice["pos"] = 0
                target_voice["vol"] = 0.0  
                target_voice["hold"] = 0

        was_strumming = is_strumming
        
        # 3. Audio Playback, Mixing & Envelope Scaling
        any_active = False
        
        # Clear the mix chunk first
        for i in range(CHUNK_SAMPLES):
            mix_chunk[i] = 0
            
        # Mix active voices
        for v in voices:
            if v["buffer"] is None:
                continue
                
            any_active = True
            is_sustain = is_strumming and (v["freq"] in current_freqs)
            
            if is_sustain:
                v["hold"] += 1
                if v["vol"] < 1.0:
                    v["vol"] += 0.03  
                if v["vol"] > 1.0:
                    v["vol"] = 1.0
            else:
                # Reverb release envelope
                if REVERB_ENABLED:
                    v["vol"] *= 0.97  
                else:
                    v["vol"] *= 0.85  
                    
                if v["vol"] <= 0.01:
                    v["buffer"] = None
                    v["vol"] = 0.0
                    continue
                    
            buf = v["buffer"]
            buf_len = len(buf)
            pos = v["pos"]
            vol = v["vol"]
            
            int_vol = int(vol * master_vol * 256) 
            
            if int_vol >= 253:
                for i in range(CHUNK_SAMPLES):
                    mix_chunk[i] += buf[pos]
                    pos += 1
                    if pos >= buf_len: pos = 0
            else:
                for i in range(CHUNK_SAMPLES):
                    mix_chunk[i] += (buf[pos] * int_vol) >> 8
                    pos += 1
                    if pos >= buf_len: pos = 0
                        
            v["pos"] = pos
            
        # 4. Master Output & Bitcrusher Effect
        if BITCRUSH_ENABLED:
            for i in range(CHUNK_SAMPLES):
                mix_chunk[i] = mix_chunk[i] & 0xFC00
                
        if any_active:
            audio_out.write(mix_chunk)
        else:
            audio_out.write(silent_chunk)
            
except KeyboardInterrupt:
    audio_out.deinit()
    print("\nProgram safely stopped.")
