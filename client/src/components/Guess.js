import React, { useState, useContext, useRef, useLayoutEffect } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { trackPromise } from 'react-promise-tracker';
import { GameHeader } from './GameHeader';
import CanvasDraw from "react-canvas-draw";
import { Blocker } from './Blocker';
import '../css/Game.css';

export const Guess = () => {
    const { round, blockerMsg, setError, submitRound } = useContext(GlobalContext);

    const gameRef = useRef();
    const canvasRef = useRef();

    const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 400});
    const [formSubmitted, setFormSubmitted] = useState(false);

    const [guess, setGuess] = useState('');

    useLayoutEffect(() => {
        if (gameRef.current) {
            setCanvasDimensions({
                width: gameRef.current.offsetWidth - 2,
                height: gameRef.current.offsetHeight - 2
            });
          }
    }, []);

    const handleCountdownComplete = () => {
        console.log('countdown complete');
           
    }

    const onKeyDown = async e => {
        if (e.which===13) {
            e.target.blur();
            submitForm();  
        }
    }

    const onSubmit = async e => {
        e.preventDefault();
        submitForm(); 
    }

    function submitForm() {
        if (guess === '') {
            setError('Guess what the drawing is');
            return false;
        }
        setError(null);
        setFormSubmitted(true);

        trackPromise(
            submitRound({word: guess})
        ); 
    }

    return (
        <div className="game" ref={gameRef}>
            <GameHeader handleCountdownComplete={handleCountdownComplete} />
            <div className="gameHeader2">

            </div>
            <CanvasDraw          
                ref={canvasRef}
                canvasWidth={canvasDimensions.width}
                canvasHeight={canvasDimensions.height}              
                hideGrid={true} 
                hideInterface={true}
                disabled={true}
                saveData={round.canvasData}
                immediateLoading={true}
            />  
            <form onSubmit={onSubmit} className={`controls ${formSubmitted ? 'hide' : ''}`}>
                <input 
                    type="text" 
                    className="guessInput" 
                    value={guess} 
                    onChange={(e) => setGuess(e.target.value)} 
                    onKeyDown={onKeyDown}  
                />
                <button className="btn roundSubmitBtn">Submit</button>
            </form>
            {blockerMsg !== null && (
                <Blocker />
            )}          
        </div>
    )
}
