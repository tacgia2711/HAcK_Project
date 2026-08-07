import './App.css'

function App() {
    return (
        <div className = "HAcK_Website">
            <div className = "HomeSection">

                <h1 className="HackTitle">HAcK 2026</h1>

                <h1 className="GroupName">The Stradibearius Quartet</h1>
                
            </div>

            <div className = "MusicSection">

            </div>

            <div className = "BandSection">

                <div className = "MemberCard">
                    <h3>Kien Nguyen</h3>
                    <p>Role: Web Developer</p>
                </div>

                <div className = "MemberCard">
                    <h3>Matthew Kim</h3>
                    <p>Role: Circuit Designer</p>
                </div>

                <div className = "MemberCard">
                    <h3>Chris Penick</h3>
                    <p>Role: Instruments chassis Assembler/Designer</p>
                </div>

                <div className = "MemberCard">
                    <h3>Kevin Alvarado</h3>
                    <p>Role: Circuit Designer - Tester</p>
                </div>
            </div>

            <div className = "InstrumentSection">

                <h2 className='InstrumentTitle'>Instruments Info</h2>
                
                <div className="InstrumentImage">
                    
                    <p>
                        Place picture of instrument here
                    </p>

                </div>

                <h2 className="InstrumentName">Name of the instrument here</h2>
                
                <div className = "InstrumentInfo">

                    <div className = "InstrumentSubSec">
                        <h3>Sound Profile</h3>
                        <p>N/A - Waiting for instruments</p>
                    </div>

                    <div className = "InstrumentSubSec">
                        <h3>Effects</h3>
                        <p>N/A - Waiting for instruments</p>
                    </div>

                    <div className = "InstrumentSubSec">
                        <h3>Sound Section</h3>
                        <p>N/A - Waiting for instruments</p>
                    </div>

                </div>

            </div>

            <div className = "LiveSection">

            </div>

        </div>
    )
}

export default App
