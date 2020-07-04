import React, { useContext } from "react";
import { GlobalContext } from '../context/GlobalState';
import '../css/Game.css';
import { Sketchpad } from './Sketchpad';
import { Guess } from './Guess';

export const Game = () => {
    const { round } = useContext(GlobalContext);

    if (round.type === 'D') {        
        return <Sketchpad />  
    } else {
        return <Guess />
    }     

}
