import './App.css'
import { Canvas,useFrame } from '@react-three/fiber'
import { useRef,useState } from 'react'

function Live({onExit}) {
    return(
        <div className="LiveMode">

            <h1>Live Mode</h1>

            <div className="LiveInterface">
                <Canvas camera={{ fov:75, position:[0, 0, 2] }}>
                    <ambientLight intensity={1}/>
                    <directionalLight
                        position = {[2,2,2]} intensity = {2}
                    />
                    <Cube />
                </Canvas>
            </div>

            <button onClick={onExit}>Exit</button>
        </div>
    )
}

function Cube() {
    const cubeRef = useRef()

    useFrame(() => {
        cubeRef.current.rotation.x += 0.01
        cubeRef.current.rotation.y += 0.01
    })

    return (
        <mesh ref={cubeRef}>
            <boxGeometry args={[1.5,1.5,1.5]}/>
            <meshStandardMaterial color="yellow" />
        </mesh>
    )
}

export default Live
