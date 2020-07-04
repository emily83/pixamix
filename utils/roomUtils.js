const Room = require('../models/Room');

// Player leaves room
async function playerLeavingRoom(socketID, roomCode) {

    const room = await Room.findOne({ code: roomCode });
    if (room) {
        const player = await room.players.find(p => p.socketID === socketID);
        if (player) {
            player.active = false;
            room.save();
            return player._id;
        }       
    }
    return false;
}

// Player rejoining room
async function playerRejoiningRoom(playerID, socketID, roomCode) {

    const room = await Room.findOne({ code: roomCode });
    if (room) {
        const player = room.players.find(p => p._id == playerID);

        if (player) {
            player.active = true;
            player.socketID = socketID;
            await room.save();
            return true;
        }
        return false;       
    }
    return false;
}

async function getSocketID(roomCode, playerID) {
    const room = await Room.findOne({ code: roomCode });
    if (room) {
        const player = room.players.find(p => p._id === playerID);
        if (player) {       
            return player.socketID;
        }       
    }
    return false;
}


async function incrementRound(roomCode) {
    const room = await Room.findOne({ code: roomCode });
    if (room) {
        const game = room.games[room.games.length - 1];
        if (game) {
            if (game.currentRound === room.players.length) {
                room.status = 'reveal';
            } else {
                game.currentRound++;
            }           
            await room.save();
            return true;
        }
        return false;
    }
    return false;
}

module.exports = {
    playerLeavingRoom,
    playerRejoiningRoom,
    getSocketID,
    incrementRound
}