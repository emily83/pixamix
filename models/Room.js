const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please enter your name']
    },
    isHost: {
        type: Boolean, 
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    socketID: {
        type: String
    },
    sort: {
        type: Number,
        required: [true,'Please enter sort number']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RoundSchema = new mongoose.Schema({
    number: {
        type: Number,
        default: 1
    },
    type: {
        type: String,
        required: [true, 'Type is required']
    },
    canvasData: {
        type: {}
    },
    // drawingURL: {
    //     type: String
    // },
    word: {
        type: String
    },
    playerID: {
        type: String,
        required: [true, 'Please enter player id']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CardSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: [true, 'Please enter card number']
    },
    playerID: {
        type: String,
        required: [true, 'Please enter player ID']
    },
    secretWord: {
        type: String,
        required: [true, 'Please enter secret word']
    },
    rounds: {
        type: [RoundSchema]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const GameSchema = new mongoose.Schema({
    currentRound: {
        type: Number,
        default: 1
    },
    cards: {
        type: [CardSchema]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RoomSchema = new mongoose.Schema({
    code: {
        type: String,
        trim: true,
        required: [true, 'Please enter room code']
    },
    status: {
        type: String,
        default: 'waiting'
    },
    players: {
        type: [PlayerSchema],
        required: [true, 'Please enter players object']
    },
    games: {
        type: [GameSchema]
    },
    usedWords: {
        type: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', RoomSchema);