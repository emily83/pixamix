export default (state, action) => {
    switch(action.type) {
        case 'SET_ROOM':
            return {
                ...state,
                roomCode: action.payload.code ? action.payload.code : state.roomCode,
                allPlayers: action.payload.players,
                status: action.payload.status,
                gamesPlayed: action.payload.gamesPlayed ? action.payload.gamesPlayed : 0
            }
        case 'SET_GAME':         
            return {
                ...state,
                gameID: action.payload.gameID,
                playerCardNumber: action.payload.playerCardNumber,
                round: action.payload.round
            }  

        case 'SET_NUM_ROUNDS':             
            let numRounds = state.allPlayers.length;
            // If number of players is odd then number of rounds is one less than number of players so finish on guess
            if (numRounds > 1 && numRounds % 2 !== 0) {
                numRounds--;
            }
            return {
                ...state,
                numRounds
            }  

        case 'CLEAR_ROOM':
            return {
                ...state,
                roomCode: '',
                playerID: '',
                status: '',
                player: null,
                allPlayers: [],
                isHost: false,
                gamesPlayed: 0,
                gameID: null,
                playerCardNumber: null,
                round: {},
                timerState: 'stopped',
                secondsRemaining: null,
                canvasData: null,
                error: null,
                message: null,
                blockerMsg: null,
                showResumeBtn: false,
                completedCards: [],
                revealCardNo: null,
                revealRoundNo: null
            }
        case 'SET_PLAYER':
            return {
                ...state,
                playerID: action.payload._id,
                player: action.payload,
                isHost: action.payload.isHost
            }
        case 'GET_PLAYERS':
            return {
                ...state,
                players: action.payload
            }
       
        case 'ADD_PLAYER':
            if (action.payload.room === state.roomCode) {
                return {
                    ...state,
                    allPlayers: [...state.allPlayers, action.payload.player]
                }
            } else {
                return state;
            }
            
        case 'REMOVE_PLAYER':
            if (action.payload.room === state.roomCode) {
                if (action.payload.playerID === state.playerID) {
                    return {
                        ...state,
                        roomCode: '',
                        playerID: '',
                        status: '',
                        player: null,
                        allPlayers: [],
                        isHost: false,
                        error: null,
                        message: null
                    }
                } else {
                    return {
                        ...state,
                        allPlayers: state.allPlayers.filter(player => player._id !== action.payload.playerID)
                    }
                }
            } else {
                return state;
            }
            
        case 'DEACTIVATE_PLAYER':
            if (action.payload.room === state.roomCode) {
                return {
                    ...state,
                    allPlayers: state.allPlayers.map(player => player._id === action.payload.playerID ?
                        // transform the one with a matching id
                        { ...player, active: false } : 
                        // otherwise return original player
                        player
                    )
                }
            } else {
                return state;
            }    

        case 'REACTIVATE_PLAYER':
            if (action.payload.room === state.roomCode) {
                return {
                    ...state,
                    allPlayers: state.allPlayers.map(player => player._id === action.payload.playerID ?
                        // transform the one with a matching id
                        { ...player, active: true } : 
                        // otherwise return original player
                        player
                    )
                }
            } else {
                return state;
            } 

        case 'MAKE_HOST':
            return {
                ...state,
                isHost: true
            }
        case 'SET_STATUS':
            if (action.payload.room === '' || action.payload.room === state.roomCode) {
                return {
                    ...state,
                    status: action.payload.status
                }
            } else {
                return state;
            } 

        case 'INIT_GAME':
            if (action.payload.room === '' || action.payload.room === state.roomCode) {
                return {
                    ...state,
                    status: 'playing',
                    gamesPlayed: state.gamesPlayed + 1,
                    gameID: action.payload.gameID,
                    playerCardNumber: action.payload.card.number,
                    round: {
                        number: 1,
                        cardNumber: action.payload.card.number,
                        type: 'D',
                        word: action.payload.card.secretWord
                    },
                    message: null,
                }
            } else {
                return state;
            }

        case 'CLEAR_GAME':
            if (action.payload === null || action.payload === state.roomCode) {
                return {
                    ...state,
                    status: 'waiting',
                    gameID: null,
                    playerCardNumber: null,
                    round: {},
                    timerState: 'stopped',
                    blockerMsg: null,
                    secondsRemaining: null,
                    canvasData: null,
                    completedCards: [],
                    revealCardNo: null,
                    revealRoundNo: null
                }
            } else {
                return state;
            }

        case 'SET_ROUND':           
            return {
                ...state,
                round: action.payload,
                secondsRemaining: null,
                canvasData: null,
            }  

        case 'COMPLETE_ROUND':           
            return {
                ...state,
                round: { ...state.round, complete: true }
                // secondsRemaining: null,
                // canvasData: null,
            }  

        case 'PLAYER_SUBMITTED':
            if (action.payload.room === state.roomCode) {
                return {
                    ...state,
                    allPlayers: state.allPlayers.map(player => player._id === action.payload.playerID ?
                        // transform the one with a matching id
                        { ...player, submitted: true } : 
                        // otherwise return original player
                        player
                    )
                }
            } else {
                return state;
            } 

        case 'PLAYER_READY':
            if (action.payload.room === state.roomCode) {
                return {
                    ...state,
                    allPlayers: state.allPlayers.map(player => player._id === action.payload.playerID ?
                        // transform the one with a matching id
                        { ...player, ready: true } : 
                        // otherwise return original player
                        player
                    )
                }
            } else {
                return state;
            } 

        case 'RESET_READY':
            return {
                ...state,
                allPlayers: state.allPlayers.map(player => {
                    player.ready = false;
                    player.submitted = false;
                    return player;
                })
            }            

        case 'START_TIMER':
            return {
                ...state,
                timerState: 'started',
                blockerMsg: null, 
                showResumeBtn: false
            }

        case 'STOP_TIMER':
            return {
                ...state,
                timerState: 'stopped',
                blockerMsg: action.payload.msg,
                showResumeBtn: action.payload.showResumeBtn
            }

        case 'ROOM_ERROR':
            return {
                ...state,
                error: action.payload
            }

        case 'ROOM_MESSAGE':
            return {
                ...state,
                message: action.payload
            }

        case 'SET_CARDS':           
            return {
                ...state,
                completedCards: action.payload
            }  

        case 'SET_REVEAL':           
            return {
                ...state,
                revealCardNo: action.payload.cardNo,
                revealRoundNo: action.payload.roundNo,
            }  

        default:
            return state;
    }
}