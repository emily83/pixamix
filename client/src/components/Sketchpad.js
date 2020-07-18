import React, { useState, useRef, useLayoutEffect, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { trackPromise } from 'react-promise-tracker';
import { GameHeader } from './GameHeader';
import CanvasDraw from "react-canvas-draw";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useBeforeunload } from 'react-beforeunload';
import { Blocker } from './Blocker';
import '../css/Game.css';
import pencil from '../images/pencil.png'; 
import rubber from '../images/rubber.png';
import undo from '../images/undo.png';

export const Sketchpad = () => {
    const { round, stopTimer, blockerMsg, submitRound, canvasData } = useContext(GlobalContext);

    const gameRef = useRef();
    const canvasRef = useRef();
    const gameHeader2Ref = useRef();
    const wordRef = useRef();

    const penThicknesses = {
        'large' : 6,
        'medium' : 3,
        'small' : 1  
    }
 
    const rubberThicknesses = {
        'large' : 8,
        'medium' : 5,
        'small' : 2 
    }

    const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 400});
    const [brushType, setBrushType] = useState('P');
    const [penThickness, setPenThickness] = useState('medium');
    const [brushRadius, setBrushRadius] = useState(penThicknesses['medium']);
    const [showPenSelection, setShowPenSelection] = useState(false);
    const [showRubberSelection, setShowRubberSelection] = useState(false);
    const [rubberThickness, setRubberThickness] = useState('medium');

    useLayoutEffect(() => {
        if (gameRef.current) {
            setCanvasDimensions({
                width: gameRef.current.offsetWidth - 2,
                height: gameRef.current.offsetHeight - 2
            });
        }
    }, []);

    useLayoutEffect(() => {

        // If word is really long and goes on to 2 lines then resize the font

        if (gameHeader2Ref.current && wordRef.current) {
            if(wordRef.current.offsetHeight >= gameHeader2Ref.current.offsetHeight){
                resize_to_fit();
            }
        }

        function resize_to_fit(){
            const style = getComputedStyle(wordRef.current);
            const fontSize = parseFloat(style.fontSize);
            const newFontSize = fontSize - 1;
            wordRef.current.style.fontSize = newFontSize + 'px';

            if(wordRef.current.offsetHeight >= gameHeader2Ref.current.offsetHeight){
                resize_to_fit();
            }
        }

    }, [round]);

    useBeforeunload(() => {
        if (canvasRef.current) {           
            const newCanvasData = canvasRef.current.getSaveData();
            localStorage.setItem("canvasData", newCanvasData);
        }
        
    });

    const handlePenClick = () => {   
        setBrushType('P'); 
        setBrushRadius(penThicknesses[penThickness]); 
        if (!showPenSelection) {
            setShowPenSelection(true);
        }
    }

    const handleRubberClick = () => {
        setBrushType('R'); 
        setBrushRadius(rubberThicknesses[rubberThickness]); 
        if (!showRubberSelection) {
            setShowRubberSelection(true);
        }  
    }

    function clickPenThickness(thickness) {
        setPenThickness(thickness);
        setBrushRadius(penThicknesses[thickness]); 
        setTimeout(() => setShowPenSelection(false), 200);
    }

    function clickRubberThickness(thickness) {
        setRubberThickness(thickness);
        setBrushRadius(rubberThicknesses[thickness]); 
        setTimeout(() => setShowRubberSelection(false), 200);
    }

    const handleGameAreaClick = (e) => {
        if (e.target.classList.contains('brushSelector')) return;

        if (showPenSelection) {
            setShowPenSelection(false);
        }
        if (showRubberSelection) {
            setShowRubberSelection(false);
        }
    }
    
    function clear(e) {
        e.preventDefault();

        confirmAlert({
            title: 'Clear?',
            message: 'Are you sure you want to clear your drawing and start again?',
            buttons: [
                {
                    label: 'No'
                },
                {
                    label: 'Yes',
                    onClick: () => {
                        canvasRef.current.clear();
                        setBrushType('P');
                    }
                },

            ]
          }); 
    }

    const handleCountdownComplete = () => {     
        stopTimer('Time\'s Up! \n\n Sending drawing to next player...', false);
        submitForm(); 
    }

    const onSubmit = async e => {
        e.preventDefault();

        confirmAlert({
            title: 'Submit Drawing',
            message: 'Do you want to submit your drawing?',
            buttons: [
                {
                    label: 'No'
                },
                {
                    label: 'Yes',
                    onClick: () => {
                        stopTimer('Round submitted! \n\n Sending drawing to next player...', false);
                        submitForm(); 
                    }
                },

            ]
          });  
    }

    function submitForm() {
        const newCanvasData = canvasRef.current.getSaveData();

        trackPromise(
            submitRound({canvasData : newCanvasData})
        ); 
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
        <div className="game" ref={gameRef} onMouseDown={handleGameAreaClick} onTouchStart={handleGameAreaClick}>
            <GameHeader handleCountdownComplete={handleCountdownComplete} handleCountdownTick={handleCountdownTick} />
            <div className="gameHeader2" ref={gameHeader2Ref}>
                <div className="word" ref={wordRef}>{round.word}</div>
            </div>
            <CanvasDraw          
                ref={canvasRef}
                canvasWidth={canvasDimensions.width}
                canvasHeight={canvasDimensions.height}
                lazyRadius={0}
                brushColor={brushType==='P' ? "#f9046c" : "white"}
                brushRadius={brushRadius}
                hideGrid={true} 
                hideInterface={true}
                saveData={canvasData}
                immediateLoading={true}
                className={"brush" + brushType}
            />  
            <form className="controls" onSubmit={onSubmit}>
                <img src={pencil} alt="pencil" onClick={handlePenClick} className={`control ${penThickness} ${brushType==='P' ? 'selected' : ''}`} />
                <div className={`penSelection brushSelection ${showPenSelection ? '' : 'hide'}`}>
                    {
                        Object.keys(penThicknesses).map(t => (
                            <img key={t}
                                src={pencil} 
                                alt="pencil" 
                                onClick = {() => clickPenThickness(t)} 
                                className={`brushSelector ${t} ${penThickness===t ? 'selected' : ''}`} 
                            />
                        ))
                    }
                </div>
                <img src={rubber} alt="rubber" onClick={handleRubberClick} className={`control ${rubberThickness} ${brushType==='R' ? 'selected' : ''}`} />
                <div className={`rubberSelection brushSelection ${showRubberSelection ? '' : 'hide'}`}>
                    {
                        Object.keys(rubberThicknesses).map(t => (
                            <img key={t}
                                src={rubber} 
                                alt="rubber" 
                                onClick = {() => clickRubberThickness(t)} 
                                className={`brushSelector ${t} ${rubberThickness===t ? 'selected' : ''}`} 
                            />
                        ))
                    }
                </div>
                <img src={undo} alt="undo" onClick={() => canvasRef.current.undo()} className="control" />       
                <button className="clearBtn" onClick={(e) => clear(e)}>Clear</button>
                <button className="btn roundSubmitBtn">Submit</button>       
            </form>
            {blockerMsg !== null && (
                <Blocker />
            )}          
        </div>
    )
}
