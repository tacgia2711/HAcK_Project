import './App.css'
import { useRef, useState, useEffect } from 'react'

function Live({onExit}) {
    const[currentNote, setNote] = useState('C4')
    const[currentEffect, setEffect] = useState({distortion: false, reverb: false, bitcrush: false})
    const[currentVolume, setVolume] = useState(0.7)

    useEffect(() => {
        const socket = new WebSocket('ws://192.168.50.225:8765')

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
            
            <div className = "LiveStatus">
                <div className="StatusNoteCard">
                    <p>Current Note:</p>
                    <h2>{currentNote}</h2>
                </div>

                <div className="StatusVolumeCard">
                    <div className="VolumeHeader">
                        <span>Volume</span>
                        <span>{Math.round(currentVolume * 100)}%</span>
                    </div>

                    <div className="VolumeBar">
                        <div className="VolumeLevel" style={{width: `${currentVolume * 100}%`}}/>
                    </div>

                </div>

                <div className = "StatusEffectCard">
                    <p>Sound Effect</p>

                    <div className = "EffectStatus">
                        <span>Distortion:</span>
                        <span className={currentEffect.distortion ? "EffectOn" : "EffectOff"}>
                            {currentEffect.distortion ? " ON" : " OFF"}
                        </span>
                    </div>

                    <div className = "EffectStatus">
                        <span>Reverb:</span>
                        <span className={currentEffect.reverb ? "EffectOn" : "EffectOff"}>
                            {currentEffect.reverb ? " ON" : " OFF"}
                        </span>
                    </div>

                    <div className = "EffectStatus">
                        <span>Bitcrush:</span>
                        <span className={currentEffect.bitcrush ? "EffectOn" : "EffectOff"}>
                            {currentEffect.bitcrush ? " ON" : " OFF"}
                        </span>
                    </div>

                </div>
            </div>
            
            <button onClick={onExit}>Exit</button>
        </div>
    )
}

function Wave({Note, Effects, Volume}) {
    const mainWave = useRef()
    const echoWave1 = useRef()
    const echoWave2 = useRef()

    const noteIndex = {
        'C4': 0,
        'D4': 1,
        'D#4': 2,
        'E4': 3,
        'F4': 4,
        'F#4': 5,
        'G4': 6,
        'G#4': 7,
        'A4': 8,
        'B4': 9,
        'C5': 10
    }

    const index = noteIndex[Note] ?? 0
    
    const noteColors = {
        'C4': 'yellow',
        'D4': 'orange',
        'D#4': 'coral',
        'E4': 'red',
        'F4': 'lime',
        'F#4': 'green',
        'G4': 'cyan',
        'G#4': 'blue',
        'A4': 'purple',
        'B4': 'pink',
        'C5': 'gold'
    }

    const waveColor = noteColors[Note] ?? 'white'
    
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
