import React, { useContext } from 'react';
import { GlobalContext } from '../../context/GlobalState';
import { Nav } from './Nav';
import { PlayerList } from './PlayerList';
import '../../css/Header.css';

export const Header = () => {
    const { player, roomCode,status, setStatus, message } = useContext(GlobalContext);

    const logoClick = (e) => {
        if (status === 'creatingRoom' || status === 'joiningRoom') {
            setStatus('');
        }
    }

    return (
        <header>    
            <h1 onClick={logoClick}>Pixamix</h1>
            {player !== null && roomCode !== '' && (
                <Nav />
            )}               
            <PlayerList />
            {message !== null && (
                <p className="message">{message}</p>
            )}
        </header>
    )
}