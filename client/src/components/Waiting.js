import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { trackPromise } from 'react-promise-tracker';

export const Waiting = () => {
    const { isHost } = useContext(GlobalContext);

    if (isHost) {
        return <WaitingHost />;
    } else {
        return <WaitingGuest />;
    }
}

const WaitingHost = () => {
    const { player, roomCode, startGame, gamesPlayed } = useContext(GlobalContext);

    const handleStartClick = () => {
        trackPromise(
            startGame()
        );
    }

    return (
        <>
            {gamesPlayed === 0 && (
                <p>Hi { player.name }!</p>
            )}   
            
            <p>You are the host of room <span className="highlight">{roomCode}</span></p>

            <p>Players can join your game using the following link:-</p>
            <p className="roomLink">{window.location.origin}/{ roomCode }</p>

            {gamesPlayed === 0 && (
                <p>The game works best with 8 players but you can start whenever you like</p>
            )} 

            <button className="btn largeBtn" onClick={handleStartClick}>Start Game</button>

        </>
    )
}

const WaitingGuest = () => {
    const { player, roomCode, gamesPlayed } = useContext(GlobalContext);

    return (
        <>
            {gamesPlayed === 0 && (
                <p>Hi { player.name }!</p>
            )}   
                
            <p>You are in room <span className="highlight">{roomCode}</span></p>

            <p>Waiting for host to start game</p>
        </>
    )
}