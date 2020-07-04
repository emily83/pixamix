import React, { useState, useRef, useLayoutEffect, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { trackPromise } from 'react-promise-tracker';
import { GameHeader } from './GameHeader';
import CanvasDraw from "react-canvas-draw";
import { useBeforeunload } from 'react-beforeunload';
import { Blocker } from './Blocker';
import Cookies from 'js-cookie';
import '../css/Game.css';
import pencil from '../images/pencil.png'; 
import rubber from '../images/rubber.png';
import undo from '../images/undo.png';

export const Sketchpad = () => {
    const { round, stopTimer, blockerMsg, submitRound, canvasData } = useContext(GlobalContext);

    const gameRef = useRef();
    const canvasRef = useRef();

    const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 400});
    const [brushType, setBrushType] = useState('P');

    useLayoutEffect(() => {
        if (gameRef.current) {
            setCanvasDimensions({
                width: gameRef.current.offsetWidth - 2,
                height: gameRef.current.offsetHeight - 2
            });
          }
    }, []);

    useBeforeunload(() => {
        if (canvasRef.current) {           
            const newCanvasData = canvasRef.current.getSaveData();
            localStorage.setItem("canvasData", newCanvasData);
        }
        
    });
    
    function clear() {
        canvasRef.current.clear();
        setBrushType('P');
    }

    const handleCountdownComplete = () => {
        Cookies.remove('secondsRemaining');
        Cookies.remove('canvasData');
        stopTimer('Time\'s Up! \n\n Sending drawing to next player...', false);
        const canvasData = canvasRef.current.getSaveData();
        canvasRef.current.clear();
        setTimeout(() => {
            trackPromise(
                submitRound({canvasData})
            ); 
        }, 2000);       
    }

    const handleCountdownTick = (seconds) => {
        if (seconds % 5 === 0) {
            if (canvasRef.current) {
                const newCanvasData = canvasRef.current.getSaveData();      
                localStorage.setItem("canvasData", newCanvasData);       
            }
        }
    }

    return (
        <div className="game" ref={gameRef}>
            <GameHeader handleCountdownComplete={handleCountdownComplete} handleCountdownTick={handleCountdownTick} />
            <div className="gameHeader2">
                <div className="word">{round.word}</div>
            </div>
            <div className="controls">
                <img src={pencil} alt="pencil" onClick={() => setBrushType('P')} className={`control ${brushType==='P' ? 'selected' : null}`} />
                <img src={rubber} alt="rubber" onClick={() => setBrushType('R')} className={`control ${brushType==='R' ? 'selected' : null}`} />
                <img src={undo} alt="undo" onClick={() => canvasRef.current.undo()} className="control" />              
            </div>
            <button className="clearBtn" onClick={() => clear()}>Clear</button>
            <CanvasDraw          
                ref={canvasRef}
                canvasWidth={canvasDimensions.width}
                canvasHeight={canvasDimensions.height}
                lazyRadius={0}
                brushColor={brushType==='P' ? "#f9046c" : "white"}
                brushRadius={brushType==='P' ? 2 : 8}
                hideGrid={true} 
                hideInterface={true}
                saveData={canvasData}
                immediateLoading={true}
                className={"brush" + brushType}
            />  
            {blockerMsg !== null && (
                <Blocker />
            )}          
        </div>
    )
}
