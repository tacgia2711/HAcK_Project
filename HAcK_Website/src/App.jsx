//Import file and functions for the website
import { useState } from 'react'
import Live from './Live.jsx'
import './App.css'

//Picture files
import kienNguyen from './assets/kienNguyen.png'
import kevinAlvarado from './assets/kevinAlvarado.png'
import matthewKim from './assets/kevinKim.png'
import chrisPenick from './assets/chrisPenick.png'
import logo from './assets/logo.png'
import instr_pic from './assets/instrument_pic.JPG'
import performace_vid from './assets/team15.mp4'

//Helper function for member cards section
function MemberCard ({firstName, lastName, role, intro, image}) {
    const [openCard, setOpen] = useState(false)

    return (
        <div className = {`MemberCard ${openCard ? 'open' : ''}`}>
            <div className = "MemberMain">
                <img src={image} alt={`${firstName} ${lastName}`} className = "MemberImage"></img>
                <h3>{firstName} {lastName}</h3>

                <p>Role: {role}</p>

                <button onClick={() => setOpen(!openCard)} className = "CardButton">
                    <strong>
                        {openCard ? 'Close': "About " + firstName}
                    </strong>
                </button>
            </div>  

            <div className = {`MemberIntro ${openCard ? 'show' : ''}`}>
                <p>{intro}</p>
            </div>
        </div>
    )
}

//Main Frontend App
function App() {

    //True/false variables for buttons
    const [liveMode, setLive] = useState(false)
    
    return (

        /*Main Website*/
        
        <div className = "HAcK_Website">
            
            {/*Section 1 - Group name and Logo*/}
            <div className = "HomeSection">
                
                {/*Group name and logo*/}
                <h1 className="HackTitle">HAcK 2026</h1>
                <img src={logo} alt={'Picture of team 15 logo'} className = "LogoImage"></img>
                <h1 className="GroupName">The Stradibearius Quartet</h1>
                
            </div>

            {/*Section 2 - Members Information*/}
            {/*Member Cards - including name, role, and info*/}
            <div className = "BandSection">

                <MemberCard 
                    firstName = "Kien"
                    lastName = "Nguyen"
                    role = "Web Developer - Frontend and Backend"
                    image = {kienNguyen}
                    intro = "Hi guys! My name is Kien Nguyen, and I am a Computer Engineering major. I transferred from Irvine Valley College. I’m originally from Vietnam, but now I study and live in Fountain Valley, CA. I like to play League of Legends or any games on Steam during my free time, and I also play badminton on the Weekends. Feel free to DM me any games you are interested in, or when you need a League player in the team xD"
                />

                <MemberCard 
                    firstName = "Matthew"
                    lastName= "Kim"
                    role = "Circuit Designer - Tester"
                    image = {matthewKim}
                    intro = "My name is Matthew Kim, and I’m an Electrical Engineering major transferring to UCLA from El Camino College! I was born and raised in Torrance, California, but currently live in Long Beach. I’m a big fan of old-school video games and CRT TVs. My favorite food to eat is Korean BBQ. "
                />

                <MemberCard 
                    firstName = "Chris"
                    lastName = "Penick"
                    role = "CAD Designer - Chassis Assembler"
                    image = {chrisPenick}
                    intro = "My name is Chris Penick, and I am a Mechanical Engineering major transferring from Cabrillo College in Santa Cruz. I was born and raised in San Jose, California, but have been living in Santa Cruz for the past two years while attending community college. Recently, I have been rock-climbing as often as I can, weightlifting, and watching tv/movies with my family and friends!"
                />

                <MemberCard 
                    firstName = "Kevin"
                    lastName = "Alvarado"
                    role = "Circuit Designer - Tester"
                    image = {kevinAlvarado}
                    intro = "My name is Kevin Alvarado. My major is electrical engineering. I am from South Central near USC for reference, and my community college is Los Angeles Trade Technical College. My favorite football team is Real Madrid. My favorite food is the Fried Rice from Vim’s Thai food in North Hollywood. "
                />
            </div>

            {/*Section 3 - Instrument Information*/}
            <div className = "InstrumentSection">

                <h2 className='InstrumentTitle'>Instruments Info</h2>
                
                {/*Picture of the instrument*/}
                <div className="InstrumentImage">

                    <img src={instr_pic} alt='Picture of the intrument' className = "InstrumentPhoto"></img>

                </div>

                {/*Info of the instrument*/}
                <div className = "InstrumentInfo">

                    <div className = "InstrumentSubSec">
                        <h3>Sound Profile</h3>
                        <p>A digitally synthesized bowed-string sound generated by Raspberry Pi Pico using fundamental frequencies and harmonics</p>
                    </div>

                    <div className = "InstrumentSubSec">
                        <h3>Effects</h3>
                        <p>Three selectible ON/OFF effects: distortion, reverb, and bitcrush.</p>
                    </div>

                    <div className = "InstrumentSubSec">
                        <h3>Sound Section</h3>
                        <li>A 4x3 keypad can be pressed down to form notes from C4-C5</li>
                        <li>A joystick acts as the strumming control</li> 
                        <li>A slide potentiometer controls volume.</li>  
                        <li>Three ON/OFF buttons for three sound effects: Distortion, Reverb, and Bitcrush</li>  
                    </div>

                </div>

            </div>

            <div className = "MusicSection">
                 <h2 className="MusicTitle">Music Set List</h2>

                <div className="MusicList">

                    <div className="MusicCard">
                        <h3>Twinkle, Twinkle, Little Star</h3>
                        <p>Notes used: C4, D4, E4, F4, G4, A4</p>
                        <p>Effect used: Reverb</p>
                    </div>

                    <div className="MusicCard">
                        <h3>Mary Had a Little Lamb</h3>
                        <p>Notes used:C4, D4, E4, G4</p>
                        <p>Effect used: None</p>
                    </div>

                    <div className="MusicCard">
                        <h3>Ode to Joy</h3>
                        <p>Notes used:C4, D4, E4, F4, G4</p>
                        <p>Effect used: Bitcrush</p>
                    </div>

                </div>

                <div className="MusicVideo">
                    <h3>Performance Video</h3>

                    <video controls className="PerformanceVideo">
                        <source src={performace_vid} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>

            <div className = "LiveSection">
                <button onClick={() => setLive(true)}>LIVE MODE!</button>
            </div>

            {liveMode && (
                <Live onExit={() => setLive(false)} />
            )}
            
        </div>
    )
}

export default App
