import './App.css'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'

function Live({onExit}) {
    const[currentNote, setNote] = useState('C')
    const[currentEffect, setEffect] = useState('None')

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
                    <Cube Note={currentNote}/>
                </Canvas>
            </div>

            <div>
                <button onClick={() => setNote('C')}>C</button>
                <button onClick={() => setNote('D')}>D</button>
                <button onClick={() => setNote('E')}>E</button>
                <button onClick={() => setNote('F')}>F</button>
                <button onClick={() => setNote('G')}>G</button>
                <button onClick={() => setNote('A')}>A</button>
                <button onClick={() => setNote('B')}>B</button>
            </div>

            <div className="EffectControl">
                <button onClick={() => setEffect('TO BE ADDED 1')}>TO BE ADDED 1</button>
                <button onClick={() => setEffect('TO BE ADDED 2')}>TO BE ADDED 2</button>
                <button onClick={() => setEffect('TO BE ADDED 3')}>TO BE ADDED 3</button>
                <button onClick={() => setEffect('None')}>None</button>
            </div>

            <h2>Current Note: {currentNote}</h2>
            <h2>Current Effect: {currentEffect}</h2>
            <h2></h2>
            <button onClick={onExit}>Exit</button>
        </div>

    )
}

function Cube({Note}) {
    const cubeRef = useRef()

    const scale =   Note === 'C' ? 1.1: 
                    Note === 'D' ? 1.2:
                    Note === 'E' ? 1.3:
                    Note === 'F' ? 1.4: 
                    Note === 'G' ? 1.5:
                    Note === 'A' ? 1.6:
                    Note === 'B' ? 1.7:
                    1

    const rotationSpeed =   Note === 'C' ? 0.005: 
                            Note === 'D' ? 0.010:
                            Note === 'E' ? 0.015:
                            Note === 'F' ? 0.020: 
                            Note === 'G' ? 0.025:
                            Note === 'A' ? 0.030:
                            Note === 'B' ? 0.035:
                            0.001
    useFrame(() => {
        cubeRef.current.rotation.x += rotationSpeed
        cubeRef.current.rotation.y += rotationSpeed
    })

    return (
        <mesh ref={cubeRef}
            scale={[scale, scale, scale]}>
            <boxGeometry args={[1.5,1.5,1.5]}/>
            <meshStandardMaterial color={Note === 'C' ? 'yellow': 
                                         Note === 'D' ? 'orange':
                                         Note === 'E' ? 'red':
                                         Note === 'F' ? 'green': 
                                         Note === 'G' ? 'blue':
                                         Note === 'A' ? 'purple':
                                         Note === 'B' ? 'pink':
                                         'white'
            } />
        </mesh>
    )
}

export default Live
