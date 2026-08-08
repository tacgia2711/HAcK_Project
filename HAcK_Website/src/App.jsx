import { useState } from 'react'
import Live from './Live.jsx'
import './App.css'

function MemberCard ({name, role, intro}) {
    const [openCard, setOpen] = useState(false)

    return (
        <div className = "MemberCard">
            
            <h3>{name}</h3>

            <p>Role: {role}</p>

            <button onClick={() => setOpen(!openCard)} className = "CardButton">
                About {name}
            </button>

            {openCard && (
                <p>{intro}</p>
            )}
        </div>
    )
}

function App() {
    const [liveMode, setLive] = useState(false)
    
    return (
        <div className = "HAcK_Website">
            <div className = "HomeSection">

                <h1 className="HackTitle">HAcK 2026</h1>

                <h1 className="GroupName">The Stradibearius Quartet</h1>
                
            </div>

            <div className = "MusicSection">

            </div>

            <div className = "BandSection">

                <MemberCard 
                    name = "Kien Nguyen"
                    role = "Web Developer"
                    intro = ""
                />

                <MemberCard 
                    name = "Matthew Kim"
                    role = "Circuit Designer - Tester"
                    intro = "My name is Matthew Kim, and I’m an Electrical Engineering major transferring to UCLA from El Camino College! I was born and raised in Torrance, California, but currently live in Long Beach. I’m a big fan of old-school video games and CRT TVs. My favorite food to eat is Korean BBQ. "
                />

                <MemberCard 
                    name = "Chris Penick"
                    role = "Circuit Designer - Tester"
                    intro = ""
                />

                <MemberCard 
                    name = "Kevin Alvarado"
                    role = "Circuit Designer - Tester"
                    intro = "My name is Kevin Alvarado. My major is electrical engineering. I am from South Central near USC for reference, and my community college is Los Angeles Trade Technical College. My favorite football team is Real Madrid. My favorite food is the Fried Rice from Vim’s Thai food in North Hollywood. "
                />
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
                <button onClick={() => setLive(true)}>Enter Live Mode</button>
            </div>

            {liveMode && (
                <Live onExit={() => setLive(false)} />
            )}
            
        </div>
    )
}

export default App
