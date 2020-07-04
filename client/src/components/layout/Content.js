import React, { useContext } from 'react';
import { Home } from '../Home';
import { CreateRoomForm } from '../CreateRoomForm';
import { JoinRoomForm } from '../JoinRoomForm';
import { Waiting } from '../Waiting';
import { Game } from '../Game';
import { Reveal } from '../Reveal';
import { GlobalContext } from '../../context/GlobalState';

export const Content = () => {
  const { status } = useContext(GlobalContext);

  switch (status) {
    case '':
        return <Home />;
    case 'creatingRoom':
        return <CreateRoomForm />;
    case 'joiningRoom':
        return <JoinRoomForm />;
    case 'waiting':
        return <Waiting />;
    case 'playing':
        return <Game />;
    case 'reveal':
        return <Reveal />;
    case 'checkingStatus':
        return null;
    default:
        return null;
  }
}