import React, { useContext, useEffect } from 'react';
import './css/App.css';
import { Header } from './components/layout/Header';
import { Content } from './components/layout/Content';
import { GlobalContext } from './context/GlobalState';
import { trackPromise } from 'react-promise-tracker';

function App() {
  const { 
    getRoomPlayer, 
    socket, 
    roomCode,
    player, 
    playerID, 
    addPlayer, 
    removePlayer, 
    deactivatePlayer, 
    reactivatePlayer, 
    setStatus, 
    initGame, 
    gameID, 
    clearRoom,
    clearGame,
    startTimer,
    stopTimer,
    sendRoundData,
    getNextRound,
    playerSubmitted,
    playerReady,
    resetReady,
    round,
    setReveal
   } = useContext(GlobalContext);

  useEffect(() => {
    
      if (roomCode !== '' && playerID !== '') {
        trackPromise(
          getRoomPlayer()
        );
      } else {
           
        const link = document.location.href.split('/');
        if (link[3].length === 4) {
          setStatus('joiningRoom');
        }
      }

      // eslint-disable-next-line
  }, []);

  useEffect(() => {

    if (socket !== null) {
      console.log('create socket listeners');
      console.log(roomCode);

        socket.removeAllListeners();

        socket.on('addPlayer', ({ room, player }) => {
            console.log(`add player ${player._id} to room ${room}`);
            addPlayer(room, player);                
        });

        socket.on('removePlayer', ({ room, playerID }) => {
          console.log(`remove player ${playerID} from room ${room}`);
           removePlayer(room, playerID);                
        });

        socket.on('deactivatePlayer', ({ room, playerID }) => {
            console.log(`deactivate player ${playerID} in room ${room}`);
            deactivatePlayer(room, playerID);   
            // stopTimer('Game paused due to player disconnecting');
        });

        socket.on('reactivatePlayer', ({ room, playerID }) => {
            console.log(`reactivate player ${playerID} in room ${room}`);
            reactivatePlayer(room, playerID);   
            // if (isHost) {
            //   stopTimer('Player re-connected', true);
            // }
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('reconnect to ' + roomCode);
            if (roomCode !== '') {
              //emit message to join room
              socket.emit('rejoinRoom', { room: roomCode, player });
            }
        });

        socket.on('gameStarting', ({ room, gameID }) => {
            console.log(`game ${gameID} starting in room ${room}`);
            trackPromise(
              initGame(room, gameID) 
            );        
        });

        socket.on('gameEnding', ({ room }) => {
            console.log(`current game is ending in room ${room}`);
            clearGame(room, 'Game ended by host');   
        });

        socket.on('startTimer', ({ room, init }) => {
            console.log(`start timer in room ${room}, ${init}`); 
            if (init) {
                setTimeout(() => {
                  startTimer();
                  resetReady();
                }, 1000);
            } else {
              startTimer();
            }          
        });

        socket.on('stopTimer', ({ room }) => {
            console.log(`stop timer in room ${room}`); 
            stopTimer('Game paused by host');
        });

        socket.on('playerSubmitted', ({ room, playerID }) => {
            console.log(`round submitted by ${playerID} in room ${room}`);
            playerSubmitted(room, playerID);   
        });

        socket.on('playerReady', ({ room, playerID }) => {
            console.log(`${playerID} ready in room ${room}`);
            playerReady(room, playerID);   
        });

        socket.on('roundSubmittedByAll', ({ room }) => {
            console.log(`round submitted by all in room ${room}`); 
            getNextRound();
        });

        socket.on('reveal', ({ cardNo, roundNo }) => {
          console.log(`reveal card ${cardNo} round ${roundNo}`); 
          setReveal(cardNo, roundNo);
        });

        socket.on('roomNotFound', ({ room }) => {
          console.log(`room ${room} not found`); 
          clearRoom();
        });

    }

    
    const onOnline = () => {
      console.log("You are now online");

      //reactivatePlayer(roomCode, playerID);  

      if (localStorage.getItem('roundData')) {
        const roundData = JSON.parse(localStorage.getItem('roundData'));
        const roundURL = localStorage.getItem('roundURL');
        sendRoundData(roundData, roundURL);
      }
    };

    const onOffline = () => {
      console.log("You are now offline");
      deactivatePlayer(roomCode, playerID);   
    }

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return function cleanupListener() {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    }

    // eslint-disable-next-line
  }, [socket, roomCode, player, playerID, gameID, round]);

  return ( 
      <div className="app">
        <Header />
        <div className="main">
          <Content />
        </div>
      </div>
  );
}

export default App;
