import React, { createContext, useReducer } from 'react';
import AppReducer from './AppReducer';
import axios from 'axios';
import io from "socket.io-client";
import Cookies from 'js-cookie';

// Initial state
const initialState = { 
    roomCode: Cookies.get('roomCode') ? Cookies.get('roomCode') : '',
    playerID: Cookies.get('playerID') ? Cookies.get('playerID') : '',
    status: '',
    player: null,
    allPlayers: [],
    isHost: false,
    gamesPlayed: 0,
    gameID: null,
    playerCardNumber: null,
    round: {},
    timerState: 'stopped',
    secondsRemaining: Cookies.get('secondsRemaining') ? Cookies.get('secondsRemaining') : null,
    canvasData: localStorage.getItem('canvasData') ? localStorage.getItem('canvasData') : null,
    error: null,
    message: null,
    //socket: io(':5000'),
    socket: io(),
    blockerMsg: null,
    showResumeBtn: false
}

//
const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}

// Create context
export const GlobalContext = createContext();

// Provider component
export const GlobalProvider = ({ children }) => {

    const [state, dispatch] = useReducer(AppReducer, initialState);

    // Actions
    async function getRoomPlayer() {    
             
        setStatus('checkingStatus');

        try {
            
            const res = await axios.get(`/api/v1/rooms/${state.roomCode}/players/${state.playerID}`);
            const data = res.data.data;
            if (!data) {
                clearRoom();
                return;
            }

            const player = data.players.find(p => p._id === state.playerID);           
            if (!player) {  
                clearRoom();
                return;
            }

            player.active = true;               
            player.submitted = false;  
            player.ready = false;
            dispatch({
                type: 'SET_PLAYER',
                payload: player
            });

            //emit message to join room
            state.socket.emit('rejoinRoom', { room: state.roomCode, player });

            dispatch({
                type: 'SET_ROOM',
                payload: { 
                    players : data.players, 
                    status: data.status,
                    gamesPlayed: data.gamesPlayed
                }
            }); 

            if (data.gameID) {
                console.log(data.gameID);
                console.log(data.playerCardNumber);
                console.log(data.round);
                
                dispatch({
                    type: 'SET_GAME',
                    payload: {
                        gameID: data.gameID,
                        playerCardNumber: data.playerCardNumber,
                        round: data.round
                    }
                });    

                if (player.isHost) {
                    stopTimer('You have re-connected', true);
                } else {
                    stopTimer('Waiting for host to restart game', false);
                }
            }

        } catch (err) {
            console.log(err);
            clearRoom();
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
        }
    }

    function clearRoom() {
        dispatch({ 
            type: 'CLEAR_ROOM', 
            payload: null 
        });
        Cookies.remove('roomCode');  
        Cookies.remove('playerID');
        Cookies.remove('timerState');
        Cookies.remove('secondsRemaining');
        Cookies.remove('canvasData');
        Cookies.remove('blockerMsg');
    }

    async function addRoom(hostName) {

        try {
            const res = await axios.post('/api/v1/rooms', { hostName, socketID: state.socket.id }, config);
            if (res.data.data) {
                setRoomAndPlayer(res.data.data)
                return true;
            }

        } catch (err) {
                
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
            return false;
        }

    }

    async function joinRoom(playerName, roomCode) {

        try {
            const res = await axios.post(`/api/v1/rooms/${roomCode}/players`, { playerName, socketID: state.socket.id }, config);

            if (res.data.data) {
                setRoomAndPlayer(res.data.data);
                return true;
            }
       
        } catch (err) {
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
            return false;
        }

    }

    function setRoomAndPlayer(room) {
        const player = room.players.slice(-1)[0];  

        dispatch({
            type: 'SET_PLAYER',
            payload: player
        });

        dispatch({
            type: 'SET_ROOM',
            payload: room
        });

        Cookies.set('roomCode', room.code, { expires: 1 });      
        Cookies.set('playerID', player._id, { expires: 1 });
        //Cookies.set('status', room.status);
        Cookies.set('name', player.name, { expires: 28 });

        //emit message to join room
        state.socket.emit('joinRoom', { room: room.code, player });
    }

    async function getAllPlayers() {
        try {
            if (state.roomCode !== '') {
                const res = await axios.get(`/api/v1/rooms/${state.roomCode}/players`);

                dispatch({
                    type: 'GET_PLAYERS',
                    payload: res.data.data
                });
            } else {
                dispatch({
                    type: 'GET_PLAYERS',
                    payload: []
                });
            }

        } catch (err) {
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
        }
    }

    function addPlayer(room, player) {
        dispatch({
            type: 'ADD_PLAYER',
            payload: { room, player }
        });
    }

    function removePlayer(room, playerID) {
        dispatch({
            type: 'REMOVE_PLAYER',
            payload: { room, playerID }
        }); 
        if (state.status === 'playing') {
            clearGame(null, 'Game ended due to a player leaving');
        }
    }

    async function hostRemovePlayer(room, playerID) {

        try {
            //remove player from db
            await axios.delete(`/api/v1/rooms/${room}/players/${playerID}`);
 
            //emit message to tell room that player has been removed
            state.socket.emit('removePlayer', { room, playerID });

            //remove player from state
            dispatch({
                type: 'REMOVE_PLAYER',
                payload: { room, playerID }
            });

        } catch (err) {
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
        }   
    }

    function deactivatePlayer(room, playerID) {
        dispatch({
            type: 'DEACTIVATE_PLAYER',
            payload: { room, playerID }
        });
    }

    function reactivatePlayer(room, playerID) {
        dispatch({
            type: 'REACTIVATE_PLAYER',
            payload: { room, playerID }
        });
    }

    function makeHost() {
        dispatch({
            type: 'MAKE_HOST',
            payload: null
        });
    }

    function setError(errorMsg) {
        dispatch({
            type: 'ROOM_ERROR',
            payload: errorMsg
        });
    }

    function setStatus(status, room='') {
        dispatch({
            type: 'SET_STATUS',
            payload: { status, room }
        });
    }

    async function leaveRoom() {
        try {
            await axios.delete(`/api/v1/rooms/${state.roomCode}/players/${state.playerID}`);

            //if leave room when game in progress, game ends and status goes to waiting
            if (state.status === 'playing') {
                await axios.put(`/api/v1/rooms/${state.roomCode}/`, { status : 'waiting' }, config);
            }

            //emit message to leave room
            state.socket.emit('leaveRoom', { room: state.roomCode, playerID: state.playerID });
            
            clearRoom();

        } catch (err) {
            console.log(err);
            
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
        }    
    }

    async function startGame() {

        try {
 
            const res = await axios.post(`/api/v1/rooms/${state.roomCode}/games`);
            const game = res.data.data;

            //emit message to start game
            state.socket.emit('startGame', { room: state.roomCode, gameID: game._id, playerID: state.playerID });
            const playerCard = game.cards.find(card => card.playerID === state.playerID);
            dispatch({
                type: 'INIT_GAME',
                payload: { room: state.roomCode, gameID: game._id, card: playerCard }
            });
            stopTimer('Waiting for all players to be ready');

            //set self as ready
            playerReady(state.roomCode, state.playerID);

        } catch (err) {
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
        }    
    }

    async function endGame() {

        try {
            await axios.put(`/api/v1/rooms/${state.roomCode}/`, { status : 'waiting' }, config);

            //emit message to end game
            state.socket.emit('endGame', { room: state.roomCode });

            clearGame(null, 'Game ended by you');

        } catch (err) {
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
        }    
    }

    function clearGame(room, msg) {
        dispatch({
            type: 'CLEAR_GAME',
            payload: room
        });

        dispatch({
            type: 'ROOM_MESSAGE',
            payload: msg
        });

        Cookies.remove('timerState');
        Cookies.remove('secondsRemaining');
        Cookies.remove('canvasData');
        Cookies.remove('blockerMsg');
    }

    async function initGame(room, gameID) {

        try {
            const res = await axios.get(`/api/v1/rooms/${room}/games/${gameID}/playercards/${state.playerID}`);
            const card = res.data.data;

            dispatch({
                type: 'INIT_GAME',
                payload: { room, gameID, card }
            });
            
            stopTimer('Waiting for all players to be ready');
                  
            //set self as ready
            playerReady(state.roomCode, state.playerID);

            //emit message to tell server ready to go
            state.socket.emit('ready', { room, playerID: state.playerID });

        } catch (err) {
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
        }
    }

    function startTimer() {
        dispatch({
            type: 'START_TIMER',
            payload: null
        });
    }

    function stopTimer(msg, showResumeBtn = false) {
        dispatch({
            type: 'STOP_TIMER',
            payload: { msg, showResumeBtn }
        });
    }
    async function submitRound(data) {
        const roundData =                 { 
            number: state.round.number,
            type: state.round.type,
            playerID: state.playerID
        }
        if (data.canvasData) {
            roundData.canvasData = data.canvasData;
        } else {
            roundData.guess = data.guess;
        }

        try {        
            await axios.post(
                `/api/v1/rooms/${state.roomCode}/games/${state.gameID}/cards/${state.round.cardNumber}/rounds`, 
                roundData,
                config
            );

            stopTimer('Waiting for all players to be ready');

            //set self as submitted
            playerSubmitted(state.roomCode, state.playerID);

            //emit message to tell server round submitted
            state.socket.emit('roundSubmitted', { room: state.roomCode, playerID: state.playerID });

        } catch (err) {
                
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
            return false;
        }

    }

    function playerSubmitted(room, playerID) {
        dispatch({
            type: 'PLAYER_SUBMITTED',
            payload: { room, playerID }
        });
    }

    function playerReady(room, playerID) {
        dispatch({
            type: 'PLAYER_READY',
            payload: { room, playerID }
        });
    }

    function resetReady() {
        dispatch({
            type: 'RESET_READY',
            payload: null
        });
    }

    async function getNextRound() {
        
        const numPlayers = state.allPlayers.length;
        const roundNo = parseInt(state.round.number)
        if (roundNo === numPlayers) {
            setStatus('reveal');
            console.log('reveal');
            
            return false;
        }
        const nextRoundNo = roundNo + 1;
        let nextCardNo = state.round.cardNumber - 1;
        if (nextCardNo < 1) {
            nextCardNo = nextCardNo + numPlayers;
        }
        console.log('cardNo: ' + nextCardNo);
        
        try {
            const res = await axios.get(`/api/v1/rooms/${state.roomCode}/games/${state.gameID}/cards/${nextCardNo}/rounds/${nextRoundNo}`);
            const round = res.data.data;

            dispatch({
                type: 'SET_ROUND',
                payload: round
            });

            //stopTimer('Waiting for all players to be ready');
            
            playerReady(state.roomCode, state.playerID);

            //emit message to tell server ready to go
            state.socket.emit('ready', { room: state.roomCode, playerID: state.playerID });

        } catch (err) {
            console.log(err);
            
            dispatch({
                type: 'ROOM_ERROR',
                payload: err.response.data.error
            });
        }
    }

    return (
        <GlobalContext.Provider value={{                            
            roomCode: state.roomCode,
            player: state.player,      
            playerID: state.playerID,
            allPlayers: state.allPlayers,
            isHost: state.isHost,
            error: state.error,
            message: state.message,
            socket: state.socket,
            status: state.status,
            gamesPlayed: state.gamesPlayed,
            gameID: state.gameID,
            round: state.round,
            timerState: state.timerState,
            secondsRemaining: state.secondsRemaining,
            canvasData: state.canvasData,
            blockerMsg: state.blockerMsg,
            showResumeBtn: state.showResumeBtn,
            addRoom,
            joinRoom,
            getRoomPlayer,
            getAllPlayers,
            makeHost,
            addPlayer,
            removePlayer,
            hostRemovePlayer,
            deactivatePlayer,
            reactivatePlayer,
            leaveRoom,
            clearRoom,
            setError,
            setStatus,
            startGame,
            initGame,
            endGame,
            clearGame,
            startTimer,
            stopTimer,
            submitRound,
            playerSubmitted,
            playerReady,
            resetReady,
            getNextRound
        }}>
            {children}
        </GlobalContext.Provider>
    );
}