import React, { useState, useContext, useRef, useLayoutEffect } from 'react';
import { useSwipeable } from 'react-swipeable'
import { GlobalContext } from '../context/GlobalState';
import CanvasDraw from "react-canvas-draw";
import { useEffect } from 'react';

export const Reveal = () => {

    const { completedCards, revealCardNo, revealRoundNo, reveal, allPlayers, isHost } = useContext(GlobalContext);

    const gameRef = useRef();
    const gameHeader2Ref = useRef();
    const wordRef = useRef();

    const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 400});
    const [isContent, setIsContent] = useState(false);
    const [revealCardPlayerName, setRevealCardPlayerName] = useState('');
    const [secretWord, setSecretWord] = useState('');
    const [revealRound, setRevealRound] = useState({});
    const [roundPlayerName, setRoundPlayerName] = useState('');
    const [isNextRound, setIsNextRound] = useState(false);

    useLayoutEffect(() => {
        console.log(gameRef);
        if (gameRef.current) {
            setCanvasDimensions({
                width: gameRef.current.offsetWidth - 2,
                height: gameRef.current.offsetHeight - 2
            });

          
        }
    }, [completedCards, revealCardNo, revealRoundNo]);

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

    });

    useEffect(() => { 
        if (completedCards.length > 0) {
            console.log(revealCardNo)

            for (let i in completedCards) {
                if (completedCards[i]['rounds'].length > 0) {
                    setIsContent(true);
                    break;
                }
            }

            const revealCard = completedCards.find(c => c.number === revealCardNo); 
            if (revealCard) {
                const revealCardPlayerID = revealCard.playerID;
                const revealCardPlayer = allPlayers.find(p => p._id === revealCardPlayerID);
                const revealRound = revealCard.rounds.find(r => r.number === revealRoundNo);
                setRevealCardPlayerName(revealCardPlayer.name);
                setSecretWord(revealCard.secretWord);
                if (revealRound) {
                    
                    setRevealRound(revealRound);
    
                    const roundPlayer = allPlayers.find(p => p._id === revealRound.playerID);
                    setRoundPlayerName(roundPlayer.name);

                    //set flag to indicate if there is a next round so we know whether to show button
                    setIsNextRound(revealCard.rounds.find(r => r.number === revealRoundNo+1));   
                } else {
                    setRevealRound({ canvasData: {}, word: ''});
                }    
            }        
  
        }     
        // eslint-disable-next-line
    }, [completedCards, revealCardNo, revealRoundNo]);

    function handleRevealClick() {
        reveal(1, 1);
    }

    const handlers = useSwipeable({ 
        onSwipedRight: () => prevCard(),
        onSwipedLeft: () => nextCard(),
        onSwipedUp: () => nextRound(),
        onSwipedDown: () => prevRound()
    })

    function prevCard() {
        console.log('prevCard');
        
        if (isHost && revealCardNo > 1) {
            reveal(revealCardNo - 1, 1);
        }
    }

    function nextCard() {
        console.log('nextCard');

        if (isHost && completedCards.length > revealCardNo) {
            reveal(revealCardNo + 1, 1);
        }
    }

    function prevRound() {
        if (isHost && revealRoundNo > 1) {
            reveal(revealCardNo, revealRoundNo - 1);
        }
    }
    
    function nextRound() {
        if (isHost && isNextRound) {
            reveal(revealCardNo, revealRoundNo + 1);                   
        }      
    }

    if (revealCardNo === null && revealRoundNo === null) {
        return (
            <>
                <p>Game Over!</p>
                { isHost && isContent &&
                    <button className="btn largeBtn" onClick={handleRevealClick}>Reveal Cards</button>
                }        
                { !isHost && isContent &&
                    <p>Waiting for host to reveal drawings</p>
                }  
                { !isContent &&
                   <p>No drawings to reveal</p>
                }  
            </>
        )
    } else {
        
        return (
            <div className="swipeableContainer" {...handlers} >
                <div className="game" ref={gameRef} >   

                    <div className="gameHeader">    
                        { isHost && revealCardNo > 1 &&
                            <button className="arrow left" onClick={() => prevCard()}></button>   
                        }
                        
                        <div className="title">Player {revealCardNo} - {revealCardPlayerName}</div>   

                        { isHost && completedCards.length > revealCardNo &&
                            <button className="arrow right" onClick={() => nextCard()}></button>
                        }
                    </div> 
                    <div className="gameHeader2 reveal" ref={gameHeader2Ref}>
                        <div className="secretWord" ref={wordRef}><span>Secret Word:</span> {secretWord}</div>
                    </div>
                    <div className="gameHeader3">
                        { revealRound.type &&
                            <>
                            Round {revealRoundNo} - {revealRound.type === 'D' ? 'Drawing' : 'Guess'} by {roundPlayerName}
                            </>
                        }
                        { !revealRound.type &&
                            <>
                            Round {revealRoundNo} - Not submitted
                            </>
                        }
                    </div>
                
                    { isHost && revealRoundNo > 1 &&
                        <button className="arrow up" onClick={() => prevRound()}></button>   
                    }

                    { isHost && isNextRound &&
                        <button className="arrow down" onClick={() => nextRound()}></button>   
                    }

                    { revealRound.type === 'D'
                        ?
                        <CanvasDraw                        
                            canvasWidth={canvasDimensions.width}
                            canvasHeight={canvasDimensions.height}              
                            hideGrid={true} 
                            hideInterface={true}
                            disabled={true}
                            saveData={revealRound.canvasData}
                            immediateLoading={true}
                        /> 
                        :
                        <div className="revealWord">{revealRound.word}</div>
                    }
            
                </div>
            </div>
        )
    }
}
