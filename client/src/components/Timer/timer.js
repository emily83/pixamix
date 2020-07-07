import React, { useRef, useContext, useEffect, useMemo } from "react";
import { GlobalContext } from '../../context/GlobalState';
import Countdown, { zeroPad } from "react-countdown";
import Cookies from 'js-cookie';
// import { useBeforeunload } from 'react-beforeunload';
import "./timer.css";

// Random component
const Completionist = () => <span className="timerFinished">Time's Up!</span>;

// Renderer callback with condition
const renderer = ({ total, minutes, seconds, completed }) => {

  if (completed) {
    // Render a complete state
    return <Completionist />;
  } else {
    // Render a countdown
    return (
      <div className={`timer ${total<=10000 ? 'timeLow' : ''}`}>
        {zeroPad(minutes, 2)}:{zeroPad(seconds, 2)}
      </div>
    );
  }
};

export const Timer = ({ seconds, handleCountdownComplete, handleCountdownTick }) => {
    const ms = seconds * 1000;
   
    const timerRef = useRef();

    const { timerState } = useContext(GlobalContext);
    
    // useBeforeunload(() => {
    //   let secondsRemaining = seconds;
    //   if (timerRef.current) {
    //     secondsRemaining = timerRef.current.state.timeDelta.total / 1000;
    //   }
    //   unload(secondsRemaining);
    // });

    useEffect(() => {
        if (timerRef.current) {
            const countdownAPI = timerRef.current.getApi();        
            if (timerState === 'started') {
                countdownAPI.start();           
            } else {
                countdownAPI.pause();  
            }
        }
    }, [timerState]);

    const handleTick =  timeDelta => {
      const secondsRemaining = timeDelta.total / 1000;
      Cookies.set('secondsRemaining', secondsRemaining, { expires: 1 });
      if (handleCountdownTick) {
        handleCountdownTick(secondsRemaining);
      }    
    }
    
    return useMemo(() => {
        return <Countdown 
                  ref={timerRef} 
                  date={Date.now() + ms} 
                  renderer={renderer} 
                  autoStart={false} 
                  onTick={handleTick} 
                  onComplete={handleCountdownComplete}
              />
           // eslint-disable-next-line
      }, [ms]);
      
  };