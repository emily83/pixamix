const socketio = require('socket.io');
const { playerLeavingRoom, playerRejoiningRoom, getSocketID, incrementRound } = require('./utils/roomUtils');
const playersReady = {};
const playersSubmitted = {};

// declare module constructor that is passed the http server to bind to
module.exports = function(server) {
    const io = socketio(server);

     io.on("connection", (socket) => {
        //console.log("New client connected");
    
        socket.on('joinRoom', ({ room, player }) => {
            console.log(`join ${room}`);
            
            // Add client to socket room
            socket.join(room);
    
            // Send new player object to room
            socket.broadcast.to(room).emit('addPlayer', { room, player });
        });
    
        socket.on('rejoinRoom', async ({ room, player }) => {
            console.log(`${player.name} rejoin ${room}`);
            
            // Add client to socket room
            socket.join(room);
    
            // Set player to active in db
            const rejoined = await playerRejoiningRoom(player._id, socket.id, room);
           // console.log(`rejoined ${rejoined}`);
            // Tell room player is active
            if (rejoined) {
                socket.broadcast.to(room).emit('reactivatePlayer', { room, playerID: player._id });
            }
            
        });
    
        socket.on('disconnecting', async function(){
            //console.log(`${socket.id} is disconnecting`);
            var self = this;
            var rooms = Object.keys(self.rooms);
            var room = rooms[rooms.length-1];
    
            // Set player to inactive in db
            const playerID = await playerLeavingRoom(socket.id, room);
    
            // Tell room player is inactive
            if (playerID) {
                //console.log(playerID);
                
                socket.broadcast.to(room).emit('deactivatePlayer', { room, playerID });
            }
        });
    
        socket.on('leaveRoom', async ({ room, playerID }) => {
            //console.log(`player ${playerID} leaving ${room}`);  
    
            // Send broadcast to room to let them know player has left
            socket.broadcast.to(room).emit('removePlayer', { room, playerID });
    
            // Remove client from socket room
            socket.leave(room)
            
        });
    
        socket.on('removePlayer', async ({ room, playerID }) => {
            //console.log(`remove player ${playerID} from ${room}`);  
    
            // Send broadcast to room to let them know player has left
            socket.broadcast.to(room).emit('removePlayer', { room, playerID });
    
            //get socket id of player who is leaving
            const socketID = await getSocketID();
            if (socketID) {
                // Remove client from socket room
                io.sockets.connected[socketID].leave(room)
            }
        });
 
        socket.on('startGame', async ({ room, gameID, playerID }) => {
            console.log(`start game ${gameID} in ${room}`);  

            const numPlayers = io.sockets.adapter.rooms[room].length
            playersReady[room] = 1;
            playersSubmitted[room] = 0;

            // Send broadcast to room to let them know game is starting
            socket.broadcast.to(room).emit('gameStarting', { room, gameID });
            socket.broadcast.to(room).emit('playerReady', { room, playerID });

            if (numPlayers === playersReady[room]) {
                console.log('lets go!');      
                
                // Start timer
                io.emit('startTimer', { room, init: true });
            }
        });
           
        socket.on('ready', async ({ room, playerID }) => {
            console.log(`player ${playerID} ready, in room ${room}`); 

            socket.broadcast.to(room).emit('playerReady', { room, playerID });
   
            const numPlayers = io.sockets.adapter.rooms[room].length
            playersReady[room]++;

            if (numPlayers === playersReady[room]) {
                console.log('lets go!');  
                
                playersSubmitted[room] = 0;

                // Start timer
                io.emit('startTimer', { room, init: true });
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
    
            // Send broadcast to room to let them know game is ending
            socket.broadcast.to(room).emit('gameEnding', { room });
        });

        socket.on('roundSubmitted', async ({ room, playerID }) => {
            console.log(`round submitted by ${playerID} in room ${room}`); 

            socket.broadcast.to(room).emit('playerSubmitted', { room, playerID });

            const numPlayers = io.sockets.adapter.rooms[room].length
            playersSubmitted[room]++;

            if (numPlayers === playersSubmitted[room]) {  
                
                //increment round number
                const inc = await incrementRound(room);
                if (inc) {
                     
                    //reset
                    playersReady[room] = 0;

                    // Tell everyone in the room that round data has been submitted by all players
                    io.emit('roundSubmittedByAll', { room });

                }             
            }
  
        });

        socket.on('reveal', async ({ room, cardNo, roundNo }) => {
            console.log(`reveal card ${cardNo} round ${roundNo} in room ${room}`);  
    
            // Send broadcast to room to let them know what is currently being revealed
            socket.broadcast.to(room).emit('reveal', { cardNo, roundNo });
        });
    
    });
};