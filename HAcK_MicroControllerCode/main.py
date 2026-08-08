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
LEFT_THRESHOLD = 10000
RIGHT_THRESHOLD = 55000

row_pins = [Pin(i, Pin.OUT) for i in range(2, 6)]
col_pins = [Pin(i, Pin.IN, Pin.PULL_DOWN) for i in range(6, 9)]

# --- Musical Setup ---
FREQUENCIES = [
    [261.63, 277.18, 293.66],  # C4, C#4, D4 (Cello/Violin range)
    [311.13, 329.63, 349.23],  # D#4, E4, F4
    [369.99, 392.00, 415.30],  # F#4, G4, G#4
    [440.00, 466.16, 493.88]   # A4, A#4, B4
]

# --- Pre-Compute Wavetables (Array Optimized) ---
print("Initializing orchestral wavetables (optimized for memory and fast volume scaling)...")
tone_buffers = {}
sample_rate = 22050
# 15000 is safely below half the 16-bit integer max (32767). 
volume_max = 15000 
TARGET_SAMPLES = 1024 

for row in FREQUENCIES:
    for freq in row:
        samples_per_cycle = int(round(sample_rate / freq))
        actual_freq = sample_rate / samples_per_cycle
        
        num_cycles = max(1, TARGET_SAMPLES // samples_per_cycle)
        total_samples = samples_per_cycle * num_cycles
        
        buffer = array.array('h', [0] * total_samples)
        for i in range(total_samples):
            t = i / sample_rate
            t_cycle = t * 2 * math.pi * actual_freq
            
            # Bowed string harmonic modeling (Sawtooth approximation: 1/n amplitude)
            fundamental = math.sin(t_cycle)
            harmonic_2 = (1/2) * math.sin(2 * t_cycle)
            harmonic_3 = (1/3) * math.sin(3 * t_cycle) 
            harmonic_4 = (1/4) * math.sin(4 * t_cycle)
            harmonic_5 = (1/5) * math.sin(5 * t_cycle)
            harmonic_6 = (1/6) * math.sin(6 * t_cycle)
            
            # Normalize by the approximate sum of amplitudes (~2.45) to prevent clipping
            combined_wave = (fundamental + harmonic_2 + harmonic_3 + harmonic_4 + harmonic_5 + harmonic_6) / 2.45
            
            buffer[i] = int(combined_wave * volume_max)
            
        tone_buffers[freq] = buffer

# --- Non-Blocking Audio & Polyphony Management ---
CHUNK_SAMPLES = 512  # ~23ms of audio per loop
silent_chunk = array.array('h', [0] * CHUNK_SAMPLES)
mix_chunk = array.array('h', [0] * CHUNK_SAMPLES)

NUM_VOICES = 2
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
    """Scans the keypad and returns a list of up to NUM_VOICES frequencies."""
    pressed = []
    for row_idx, row in enumerate(row_pins):
        row.value(1) 
        for col_idx, col in enumerate(col_pins):
            if col.value() == 1: 
                pressed.append(FREQUENCIES[row_idx][col_idx])
                if len(pressed) == NUM_VOICES:
                    row.value(0) 
                    return pressed
        row.value(0) 
    return pressed 

# --- Main Event Loop ---
print("Polyphonic Cello/Violin Ready. Hold sensor to 'bow' up to 2 notes!")

was_strumming = False

try:
    while True:
        # 1. Read Inputs
        current_freqs = scan_keypad()
        x_val = x_axis.read_u16()
        # In this context, "strumming" acts more like drawing the bow
        is_strumming = (x_val < LEFT_THRESHOLD) or (x_val > RIGHT_THRESHOLD)
        
        # Read Slide Potentiometer and map 0-65535 to a 0.0-1.0 scale
        master_vol = slide_pot.read_u16() / 65535.0
        
        # 2. Trigger Logic
        if is_strumming and not was_strumming and len(current_freqs) > 0:
            for i in range(NUM_VOICES):
                if i < len(current_freqs):
                    # Only reset if it's a new frequency to allow continuous bowing
                    if voices[i]["freq"] != current_freqs[i] or voices[i]["buffer"] is None:
                        voices[i]["freq"] = current_freqs[i]
                        voices[i]["buffer"] = tone_buffers[current_freqs[i]]
                        voices[i]["pos"] = 0
                        voices[i]["vol"] = 0.0  # Start at 0 for the slow bow attack
                    voices[i]["hold"] = 0
                else:
                    voices[i]["buffer"] = None

        was_strumming = is_strumming
        
        # 3. Audio Playback, Mixing & Envelope Scaling
        any_active = False
        
        # Reset the mix chunk for this loop
        for i in range(CHUNK_SAMPLES):
            mix_chunk[i] = 0
            
        for v in voices:
            if v["buffer"] is None:
                continue
                
            any_active = True
            
            # Determine Envelope State for this voice
            is_sustain = is_strumming and (v["freq"] in current_freqs)
            
            if is_sustain:
                # ATTACK/SUSTAIN STATE (Drawing the bow)
                v["hold"] += 1
                if v["vol"] < 1.0:
                    v["vol"] += 0.03  # Slower volume swell
                if v["vol"] > 1.0:
                    v["vol"] = 1.0
            else:
                # RELEASE STATE (Lifting the bow)
                v["vol"] *= 0.85  # Moderate decay when bowing stops
                
                # Cutoff threshold to free up the voice
                if v["vol"] <= 0.01:
                    v["buffer"] = None
                    v["vol"] = 0.0
                    continue
                    
            # Mix audio stream into the shared mix_chunk buffer
            buf = v["buffer"]
            buf_len = len(buf)
            pos = v["pos"]
            vol = v["vol"]
            
            # CPU Optimization: Use integer math to prevent buffer underruns
            # Multiply the voice's envelope by the hardware master volume
            int_vol = int(vol * master_vol * 256) 
            
            if int_vol >= 253:
                for i in range(CHUNK_SAMPLES):
                    mix_chunk[i] += buf[pos]
                    pos += 1
                    if pos >= buf_len: 
                        pos = 0
            else:
                for i in range(CHUNK_SAMPLES):
                    # Integer math + bit-shifting (>> 8 divides by 256) is lightning fast
                    mix_chunk[i] += (buf[pos] * int_vol) >> 8
                    pos += 1
                    if pos >= buf_len: 
                        pos = 0
                        
            # Save the playhead position for the next audio loop
            v["pos"] = pos
            
        # Write the final mix to the amplifier
        if any_active:
            audio_out.write(mix_chunk)
        else:
            audio_out.write(silent_chunk)
            
except KeyboardInterrupt:
    audio_out.deinit()
    print("\nProgram safely stopped.")