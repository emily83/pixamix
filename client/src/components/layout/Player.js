import React, {useContext} from 'react'
import { GlobalContext } from '../../context/GlobalState';
import { trackPromise } from 'react-promise-tracker';

export const Player = ({ player, number }) => {
    const { hostRemovePlayer, isHost, roomCode, status, playerID } = useContext(GlobalContext);

    function handleClick() {
        const r = window.confirm(`Are you sure you want to remove ${player.name} from the room?`);
        if (r === true) {
            trackPromise(
                hostRemovePlayer(roomCode, player._id)
            );
        }         
    }

    return (
        <li className={`player${player.active ? ' active' : ' inactive'}${player.submitted ? ' submitted' : ''}${player.ready ? ' ready' : ''}`}>
            <span className="playerNumber">
                <span className="text">Player</span>
                <span className="number">{number}</span>
            </span>
            <span className="name">{player.name}</span>
            
            {isHost && player._id !== playerID && status !== 'playing' && status !== 'reveal' && (
                <button 
                    className="remove-btn"
                    onClick={() => handleClick()}
                >x</button> 
            )}   
        </li>       
    )
}
