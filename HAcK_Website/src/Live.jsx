import './App.css'
import { Canvas, useFrame } from '@react-three/fiber'
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

            <div className="LiveInterface">
                <Canvas camera={{ fov:85, position:[0, 0, 2] }}>
                    <ambientLight intensity={1}/>
                    <directionalLight
                        position = {[2,2,2]} intensity = {2}
                    />
                    <Cube Note={currentNote} Effects = {currentEffect}/>
                </Canvas>
            </div>

            <div>
                <button onClick={() => setNote('C4')}>C</button>
                <button onClick={() => setNote('C#4')}>D</button>
                <button onClick={() => setNote('D4')}>E</button>
                <button onClick={() => setNote('D#4')}>F</button>
                <button onClick={() => setNote('E4')}>G</button>
                <button onClick={() => setNote('F4')}>A</button>
                <button onClick={() => setNote('B')}>B</button>
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

function Cube({Note, Effects}) {
    const cubeRef = useRef()

    const scale =   Note === 'C4' ? 0.9: 
                    Note === 'C#4' ? 1.0:
                    Note === 'D4' ? 1.1:
                    Note === 'D#4' ? 1.2: 
                    Note === 'E4' ? 1.3:
                    Note === 'F4' ? 1.4:
                    Note === 'F#4' ? 1.5:
                    Note === 'G4' ? 1.6:
                    Note === 'G#4' ? 1.7:
                    Note === 'A4' ? 1.8:
                    Note === 'A#4' ? 1.9:
                    Note === 'B4' ? 2.0:
                    0.1

    const rotationSpeed =   Note === 'C4' ? 0.0005: 
                            Note === 'C#4' ? 0.0010:
                            Note === 'D4' ? 0.0015:
                            Note === 'D#4' ? 0.0025: 
                            Note === 'E4' ? 0.0030:
                            Note === 'F4' ? 0.0035:
                            Note === 'F#4' ? 0.0040:
                            Note === 'G4' ? 0.0045:
                            Note === 'G#4' ? 0.0050:
                            Note === 'A4' ? 0.0060:
                            Note === 'A#4' ? 0.0065:
                            Note === 'B4' ? 0.0070:
                            1

    useFrame(() => {
        cubeRef.current.rotation.x += rotationSpeed
        cubeRef.current.rotation.y += rotationSpeed
    })

    return (
        <mesh ref={cubeRef}
            scale={[scale, scale, scale]}>
            <boxGeometry args={[1.5,1.5,1.5]}/>
            <meshStandardMaterial color={   Note === 'C4'  ? 'yellow' :
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
            } />
        </mesh>
    )
}

export default Live
