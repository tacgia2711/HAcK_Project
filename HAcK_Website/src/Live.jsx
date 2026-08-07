import './App.css'

function Live({onExit}) {
    return(
        <div className="LiveMode">

            <h1>Live Mode</h1>

            <div className="LiveInterface">
                <p>Visualizer here</p>
            </div>

            <button onClick={onExit}>Exit</button>
        </div>
    )
}

export default Live
