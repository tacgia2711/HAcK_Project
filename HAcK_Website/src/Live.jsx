import './App.css'
import { useRef, useState, useEffect } from 'react'

function Live({onExit}) {
    const[currentNote, setNote] = useState('C4')
    const[currentEffect, setEffect] = useState({distortion: false, reverb: false, bitcrush: false})

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
                />
           </div>

            <div>
                <button onClick={() => setNote('C4')}>C</button>
                <button onClick={() => setNote('C#4')}>D</button>
                <button onClick={() => setNote('D4')}>E</button>
                <button onClick={() => setNote('D#4')}>F</button>
                <button onClick={() => setNote('E4')}>G</button>
                <button onClick={() => setNote('F4')}>A</button>
                <button onClick={() => setNote('B4')}>B</button>
            </div>

            <div className="EffectControl">
                
            </div>

            <h2>Current Note: {currentNote}</h2>
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

function Wave({Note, Effects}) {
    const mainWave = useRef()
    const echoWave1 = useRef()
    const echoWave2 = useRef()

    const index =   Note === 'C4' ? 0: 
                    Note === 'C#4' ? 1:
                    Note === 'D4' ? 2:
                    Note === 'D#4' ? 3: 
                    Note === 'E4' ? 4:
                    Note === 'F4' ? 5:
                    Note === 'F#4' ? 5:
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

    useFrame(() => {

    })

    return (
        <div>
            
        </div>
    )
}

export default Live
