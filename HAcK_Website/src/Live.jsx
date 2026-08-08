import './App.css'
import { Canvas,useFrame } from '@react-three/fiber'
import { useRef,useState } from 'react'

function Live({onExit}) {
    const[currentNote, setNote] = useState('C')
    return(
        <div className="LiveMode">

            <h1>Live Mode</h1>

            <div className="LiveInterface">
                <Canvas camera={{ fov:75, position:[0, 0, 2] }}>
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
            
            <button onClick={onExit}>Exit</button>
        </div>

    )
}

function Cube({Note}) {
    const cubeRef = useRef()

    useFrame(() => {
        cubeRef.current.rotation.x += 0.01
        cubeRef.current.rotation.y += 0.01
    })

    return (
        <mesh ref={cubeRef}>
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
