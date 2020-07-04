import React, { useContext } from 'react';
import { GlobalContext } from '../../context/GlobalState';
import { trackPromise } from 'react-promise-tracker';

export const Nav = () => {
    const { player, roomCode, leaveRoom, endGame, isHost, status } = useContext(GlobalContext);

    function handleEndGameClick(e) {
        e.preventDefault();

        const r = window.confirm("Are you sure you want to end this game?");
        if (r === true) {
            trackPromise(
                endGame()
            );
        }         
    }

    function handleLeaveRoomClick(e) {
        e.preventDefault();

        const r = window.confirm("Are you sure you want to leave the game?");
        if (r === true) {
            trackPromise(
                leaveRoom()
            );
        }         
    }

    return (
        <nav>
            <div className="navLeft">
                <div className="playerName">Player: <span>{ player.name }</span></div>
                <div className="roomCode">Room: <span>{ roomCode }</span></div>

                {isHost && (status === 'playing' || status === 'reveal') && (
                    <button className="link" onClick={handleEndGameClick}>End Game</button>  
                )}   
                
            </div>
            <button className="link" onClick={handleLeaveRoomClick}>Leave Room</button>  
        </nav>
    )
}
