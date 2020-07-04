import React, { useContext } from 'react';
import { Player } from './Player';
import { GlobalContext } from '../../context/GlobalState';

export const PlayerList = () => {
    const { allPlayers } = useContext(GlobalContext);

    return (
        <ul className="playerList">
            {allPlayers.map((player, i) => (<Player key={player._id} player={player} number={i+1} />))}
        </ul>
    )
}
