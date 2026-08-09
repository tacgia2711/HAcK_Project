import './App.css'
import { useRef, useState, useEffect } from 'react'

function Live({onExit}) {
    const[currentNote, setNote] = useState('C4')
    const[currentEffect, setEffect] = useState({distortion: false, reverb: false, bitcrush: false})
    const[currentVolume, setVolume] = useState(0.7)

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8765')

        socket.onopen = () => {
            console.log('Connected to WebSocket server')
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)

            console.log('Received:', data)

            if (data.type === 'note') {
                setNote(data.value)
            }

            if (data.type === 'effect') {
                setEffect(prev => ({
                    ...prev,
                    [data.value]: data.enabled
                }))
            }

            if (data.type === 'volume') {
                setVolume(data.value)
            }
        }

        socket.onclose = () => {
            console.log('WebSocket disconnected')
        }

        return () => {
            socket.close()
        }
    }, [])

    return(
        <div className="LiveMode">

            <h1>Live Mode</h1>

           <div className = "LiveWaves">
                <Wave
                    Note = {currentNote}
                    Effects = {currentEffect}
                    Volume = {currentVolume}
                />
           </div>

            <div className="EffectControl">
                
            </div>

            <h2>Current Note: {currentNote}</h2>

            <div className="VolumeDisplay">

                <div className="VolumeHeader">
                    <span>Volume</span>
                    <span>{Math.round(currentVolume * 100)}%</span>
                </div>

                <div className="VolumeBar">
                    <div
                        className="VolumeLevel"
                        style={{
                            width: `${currentVolume * 100}%`
                        }}
                    />
                </div>

            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={currentVolume}
                onChange={(event) =>
                    setVolume(Number(event.target.value))
                }
            />

            </div>
            <div className = "SoundEffect">
                <h2>
                    Distortion: {currentEffect.distortion ? "On" : "Off"}
                </h2>
                <h2>
                    Reverb: {currentEffect.reverb ? "On" : "Off"}
                </h2>
                <h2>
                    Bitcrush: {currentEffect.bitcrush ? "On" : "Off"}
                </h2>
            </div>
            <button onClick={onExit}>Exit</button>
        </div>

    )
}

function Wave({Note, Effects, Volume}) {
    const mainWave = useRef()
    const echoWave1 = useRef()
    const echoWave2 = useRef()

    const index =   Note === 'C4' ? 0: 
                    Note === 'C#4' ? 1:
                    Note === 'D4' ? 2:
                    Note === 'D#4' ? 3: 
                    Note === 'E4' ? 4:
                    Note === 'F4' ? 5:
                    Note === 'F#4' ? 6:
                    Note === 'G4' ? 7:
                    Note === 'G#4' ? 8:
                    Note === 'A4' ? 9:
                    Note === 'A#4' ? 10:
                    Note === 'B4' ? 11:
                    12
    
    const waveColor =   Note === 'C4'  ? 'yellow' :
                        Note === 'C#4' ? 'gold' :
                        Note === 'D4'  ? 'orange' :
                        Note === 'D#4' ? 'coral' :
                        Note === 'E4'  ? 'red' :
                        Note === 'F4'  ? 'lime' :
                        Note === 'F#4' ? 'green' :
                        Note === 'G4'  ? 'cyan' :
                        Note === 'G#4' ? 'blue' :
                        Note === 'A4'  ? 'purple' :
                        Note === 'A#4' ? 'magenta' :
                        Note === 'B4'  ? 'pink' :
                        'white'

    useEffect(() => {
        let animationID
        let phase = 0

        const width = 900
        const height = 350
        const centerY = height/2

        const cycles = 2 + index *0.25
        const speed = 0.04 + index*0.003
        const amplitude = 10 + Volume * 90
        
        function createWave(phaseOffset = 0, amplitudeMultiplier = 1) {
            let path = ''

            for (let x = 0; x <= width; x = x +5) {
                const angle = (x / width) * Math.PI * 2 * cycles + phase + phaseOffset

                let y = Math.sin(angle) * amplitude * amplitudeMultiplier

                if (Effects.distortion) {
                    y += Math.sin(angle*3) * 20
                }

                if (Effects.bitcrush) {
                    y = Math.round(y/15) * 15
                }

                const screenY = centerY + y

                if (x === 0) {
                    path = `M ${x} ${screenY}`
                } else {
                    path += ` L ${x} ${screenY}`
                }
            }

             return path
        }

        function animate() {
            phase += speed

            if (mainWave.current) {
                mainWave.current.setAttribute('d', createWave())
            }

            if (Effects.reverb) {

                if (echoWave1.current) {
                    echoWave1.current.setAttribute(
                        'd',
                        createWave(-0.5, 0.85)
                    )
                }

                if (echoWave2.current) {
                    echoWave2.current.setAttribute(
                        'd',
                        createWave(-1.0, 0.7)
                    )
                }
            } else {

                if (echoWave1.current) {
                    echoWave1.current.setAttribute('d', '')
                }

                if (echoWave2.current) {
                    echoWave2.current.setAttribute('d', '')
                }
            }

            animationID = requestAnimationFrame(animate)
        }
        
         animate()

         return () => {
            cancelAnimationFrame(animationID)
         }
    }, [Note,Effects,index, Volume])

    return (
        <div className= "WaveVisualize">
            <svg viewBox="0 0 900 350" preserveAspectRatio='none'>
                <path ref={echoWave2} fill="none" stroke={waveColor} strokeWidth="3" opacity="0.15" />
                <path ref={echoWave1} fill="none" stroke={waveColor} strokeWidth="3" opacity="0.30"/>
                <path ref={mainWave} fill="none" stroke={waveColor} strokeWidth= {Effects.distortion ? 7 : 4} strokeLinecap={Effects.bitcrush ? "square" : "round"}/>
            </svg>
        </div>
    )
}

export default Live
