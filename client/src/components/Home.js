import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import '../css/Home.css';

export const Home = () => {

    const { setStatus } = useContext(GlobalContext);

    return (
        <>
            <h2>Welcome to Pixamix!</h2>
            <button className="btn largeBtn createRoom" onClick={() => setStatus('creatingRoom')}>Create A New Room</button>       
            <button className="btn largeBtn joinRoom" onClick={() => setStatus('joiningRoom')}>Join A Room</button>
        </>
    )
}
