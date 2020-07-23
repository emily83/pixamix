import React, { useContext, useEffect } from 'react';
import { Player } from './Player';
import { GlobalContext } from '../../context/GlobalState';

export const PlayerList = () => {
    const { allPlayers } = useContext(GlobalContext);

    useEffect(() => {
        function compare(a, b) {
            if ( a.sort < b.sort ){
                return -1;
              }
              if ( a.sort > b.sort ){
                return 1;
              }
              return 0;
        }
          
         allPlayers.sort(compare);
         console.log(allPlayers);
      });
    
    return (
        <ul className="playerList">
            {allPlayers.map((player, i) => (<Player key={player._id} player={player} number={i+1} />))}
        </ul>
    )
}
