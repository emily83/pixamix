import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { Timer } from './Timer';
// import start from '../images/start.png';
import pause from '../images/pause.png';

export const GameHeader = ({ handleCountdownComplete, handleCountdownTick }) => {
    const { timerState, stopTimer, secondsRemaining, round } = useContext(GlobalContext);

    //if resuming a countdown, set seconds to the number of seconds remaining
    let seconds = 30;
    if (round.type==='D') {
        seconds = 30;
    }
    
    if (secondsRemaining !== null) {
        seconds = secondsRemaining;
    }
 
    function handlePauseClick() {
        stopTimer('Game Paused', true);
        //socket.emit('stopTimer', { room: roomCode });
    }

    return ( 
        <div className="gameHeader">
            {timerState === 'started' && (
                <img 
                    src={pause}
                    alt={'Pause'} 
                    onClick={() => handlePauseClick()}
                    className="timerControl pauseBtn" 
                />
            )}             
            <div className="title">Round {round.number} - {round.type==='D' ? 'Draw' : 'Guess'}</div>
            <Timer seconds={seconds} handleCountdownComplete={handleCountdownComplete} handleCountdownTick={handleCountdownTick} />
        </div>      
    )
}
