const socketio = require('socket.io');
const { playerLeavingRoom, playerRejoiningRoom, getSocketID, incrementRound } = require('./utils/roomUtils');
const rooms = {};

// declare module constructor that is passed the http server to bind to
module.exports = function(server) {
    const io = socketio(server);

     io.on("connection", (socket) => {
        console.log("New client connected "  + socket.id);
    
        socket.on('joinRoom', ({ room, player }) => {
            console.log(`${player.name} joining ${room}`);

            // Add client to socket room
            socket.join(room);

            // Add player to room players
            addPlayerToRoom(room, player._id, socket.id);

            //If revealing, send back card and round we are currently on
            if (rooms[room]['revealCardNo'] && rooms[room]['revealRoundNo']) {
                socket.emit('reveal', { cardNo : rooms[room]['revealCardNo'], roundNo: rooms[room]['revealRoundNo'] });
            }
    
            // Send new player object to room
            socket.broadcast.to(room).emit('addPlayer', { room, player });
        });
    
        socket.on('rejoinRoom', async ({ room, player }) => {
            if (!player) return false;
            console.log(`${player.name} rejoining ${room}`);

            const playerID = player._id;

            if (!rooms[room]) {
                socket.emit('roomNotFound', { room });
                return false;
            }
           
            if (rooms[room]['players'][playerID]) {
                rooms[room]['players'][playerID]['socketID'] = socket.id;

                // If all players have submitted tell player that has just rejoined
                if (checkAllSubmitted(room)) {
                    socket.emit('roundSubmittedByAll', { room });

                // Otherwise tell player who whas submitted
                } else {
                    for (const pID in rooms[room]['players']) {
                        if (rooms[room]['players'].hasOwnProperty(pID)) { 
                            if (rooms[room]['players'][pID]['submitted']) {
                                socket.emit('playerSubmitted', { room, playerID: pID });
                            }
                        }
                    }
                }

                //If revealing, send back card and round we are currently on
                if (rooms[room]['revealCardNo'] && rooms[room]['revealRoundNo']) {
                    socket.emit('reveal', { cardNo : rooms[room]['revealCardNo'], roundNo: rooms[room]['revealRoundNo'] });
                }
            }           

            // Add client to socket room
            socket.join(room);
    
            // Set player to active in db
            const rejoined = await playerRejoiningRoom(player._id, socket.id, room);

            // Tell room player is active
            if (rejoined) {
                io.emit('reactivatePlayer', { room, playerID: player._id });
            }
            
        });
    
        socket.on('disconnecting', async function(){
            console.log(`${socket.id} is disconnecting`);
            var self = this;
            var rooms = Object.keys(self.rooms);
            var room = rooms[rooms.length-1];
    
            // Set player to inactive in db
            const playerID = await playerLeavingRoom(socket.id, room);
    
            // Tell room player is inactive
            if (playerID) {
                socket.broadcast.to(room).emit('deactivatePlayer', { room, playerID });
            }
        });
    
        socket.on('leaveRoom', async ({ room, playerID }) => {
            console.log(`player ${playerID} leaving ${room}`);  
    
            delete rooms[room]['players'][playerID];
            if (Object.keys(rooms[room]['players']).length === 0) {
                delete rooms[room];
            }

            // Send broadcast to room to let them know player has left
            socket.broadcast.to(room).emit('removePlayer', { room, playerID });

            // Remove client from socket room
            socket.leave(room)
            
        });
    
        socket.on('removePlayer', async ({ room, playerID }) => {
            console.log(`remove player ${playerID} from ${room}`);  
    
            delete rooms[room]['players'][playerID];

            // Send broadcast to room to let them know player has left
            socket.broadcast.to(room).emit('removePlayer', { room, playerID });
    
            //get socket id of player who is leaving
            const socketID = await getSocketID();
            if (socketID) {
                // Remove client from socket room
                io.sockets.connected[socketID].leave(room)
            }
        });

        socket.on('shufflePlayers', async ({ room, players }) => {
            console.log(`shuffle players in ${room}`);     
    
            // Send broadcast to room to let them know new order of players
            socket.broadcast.to(room).emit('changePlayerOrder', { room, players });
  
        });
 
        socket.on('startGame', async ({ room, gameID, playerID }) => {
            console.log(`start game ${gameID} in ${room}`);  

            resetPlayers(room);

            if (!rooms[room]) {
                socket.emit('roomNotFound', { room });
                return false;
            }
         
            if (rooms[room]['players'][playerID]) {
                rooms[room]['players'][playerID]['ready'] = true;
                rooms[room]['players'][playerID]['submitted'] = false;
                console.log(rooms);
            }          
          
            // Send broadcast to room to let them know game is starting
            socket.broadcast.to(room).emit('gameStarting', { room, gameID });
            socket.broadcast.to(room).emit('playerReady', { room, playerID });

            if (checkAllReady(room)) {
                console.log('lets go!');      
                
                // Start timer
                io.emit('startTimer', { room, init: true });
            }
        });
           
        socket.on('ready', async ({ room, playerID }) => {
            console.log(`player ${playerID} ready, in room ${room}`); 

            socket.broadcast.to(room).emit('playerReady', { room, playerID });

            if (!rooms[room]) {
                socket.emit('roomNotFound', { room });
                return false;
            }
        
            if (rooms[room]['players'][playerID]) {
                rooms[room]['players'][playerID]['ready'] = true;

                if (checkAllReady(room)) {
                    console.log('lets go!');  
                    
                    resetPlayers(room);

                    // Start timer
                    io.emit('startTimer', { room, init: true });
                }
            }        

        });

        socket.on('startTimer', async ({ room }) => {
            console.log(`timer has been started in room ${room}`); 

             // Send broadcast to room to let them know timer has been started
             socket.broadcast.to(room).emit('startTimer', { room });
        });
        
        socket.on('stopTimer', async ({ room }) => {
            console.log(`timer has been stopped in room ${room}`); 

            // Send broadcast to room to let them know timer has been started
            socket.broadcast.to(room).emit('stopTimer', { room });
        });

        socket.on('endGame', async ({ room }) => {
            console.log(`end current game in ${room}`);  
            
            delete rooms[room]['revealCardNo'];
            delete rooms[room]['revealRoundNo'];
    
            // Send broadcast to room to let them know game is ending
            socket.broadcast.to(room).emit('gameEnding', { room });
        });

        socket.on('roundSubmitted', async ({ room, playerID }) => {
            console.log(`round submitted by ${playerID} in room ${room}`); 

            if (!rooms[room]) {
                socket.emit('roomNotFound', { room });
                return false;
            }

            rooms[room]['players'][playerID]['submitted'] = true;

            socket.broadcast.to(room).emit('playerSubmitted', { room, playerID });

            if (checkAllSubmitted(room)) {

                //increment round number
                const inc = await incrementRound(room);
                if (inc) {

                    // Tell everyone in the room that round data has been submitted by all players
                    io.emit('roundSubmittedByAll', { room });

                }             
            }
  
        });

        socket.on('reveal', async ({ room, cardNo, roundNo }) => {
            console.log(`reveal card ${cardNo} round ${roundNo} in room ${room}`);  
    
            if (!rooms[room]) {
                socket.emit('roomNotFound', { room });
                return false;
            }

            rooms[room]['revealCardNo'] = cardNo;
            rooms[room]['revealRoundNo'] = roundNo;
            
            // Send broadcast to room to let them know what is currently being revealed
            socket.broadcast.to(room).emit('reveal', { cardNo, roundNo });
        });

        function addPlayerToRoom(room, playerID, socketID) {
            if (!rooms[room]) {
                rooms[room] = {};
                rooms[room]['players'] = {};
            }
            rooms[room]['players'][playerID] = {
                socketID : socketID,
                ready: false,
                submitted: false
            }
        }

        function checkAllReady(room) {
            if (!rooms[room]) {
                socket.emit('roomNotFound', { room });
                return false;
            }
            for (const playerID in rooms[room]['players']) {
                if (rooms[room]['players'].hasOwnProperty(playerID)) {
                    if (rooms[room]['players'][playerID]['ready'] === false) {
                        return false;
                    }
                }
            }
            return true;
        }

        function checkAllSubmitted(room) {
            if (!rooms[room]) {
                socket.emit('roomNotFound', { room });
                return false;
            }
            for (const playerID in rooms[room]['players']) {
                if (rooms[room]['players'].hasOwnProperty(playerID)) {
                    if (rooms[room]['players'][playerID]['submitted'] === false) {
                        return false;
                    }
                }
            }
            return true;
        }

        function resetPlayers(room) {
            if (!rooms[room]) {
                socket.emit('roomNotFound', { room });
                return false;
            }
            for (const playerID in rooms[room]['players']) {
                if (rooms[room]['players'].hasOwnProperty(playerID)) {
                    rooms[room]['players'][playerID]['ready'] = false;
                    rooms[room]['players'][playerID]['submitted'] = false;
                }
            }
        }
    
    });
};