import React, { useContext } from 'react';
import { GlobalContext } from '../../context/GlobalState';
import "./blocker.css";

export const Blocker = () => {

    const { blockerMsg, showResumeBtn, startTimer } = useContext(GlobalContext);

    function handleStartClick() {
        startTimer();
        //socket.emit('startTimer', { room: roomCode });
    }

    return (
        <div className="blocker">
            <div>
                <p>{blockerMsg}</p>
                {showResumeBtn && (
                    <button className="btn largeBtn resumeBtn" onClick={handleStartClick}>Resume</button>  
                )}    
            </div>                
        </div>
    )
}
