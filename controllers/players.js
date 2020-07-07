const Room = require('../models/Room');

// @desc    Add player to room
// @route   POST /api/v1/rooms/:code/players
// @access  Public
exports.addPlayerToRoom = async (req, res, next) => {
    try {

        // Get room code from parameters
        const roomCode = req.params.code;

        // Get room from db
        const room = await Room.findOne({ code: roomCode });

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        if (room.status === 'playing'|| room.status === 'reveal') {
            return res.status(404).json({
                success: false,
                error: 'Game in progress'
            });
        }

         // Get name of player and socket id from request body
         const { playerName, socketID } = req.body;

        // Add player to array within room
        room.players.push({ name: playerName, socketID });
        
        // Save room back to db
        await room.save();

        // Get updated room
        const updatedRoom = await Room.findOne({ code: roomCode });
    
        return res.status(201).json({
            success: true,
            data: updatedRoom
        });
    } catch (err) {

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            })
        } else {
            return res.status(500).json({
                success: false,
                error: 'Server Error'
            });
        }
       
    }
}

// @desc    Get all players in a room
// @route   GET /api/v1/rooms/:code/players
// @access  Public
exports.getPlayers = async (req, res, next) => {
    try {

        // Get room code from parameters
        const roomCode = req.params.code;

        // Get room from db
        const room = await Room.findOne({ code: roomCode });

        // Get array of players from room
        const players = room.players;
        
        return res.status(200).json({
            success: true,
            count: players.length,
            data: players
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
 }

 // @desc   Delete player from room
// @route   DELETE /api/v1/rooms/:code/players/:id
// @access  Public
exports.deletePlayer = async (req, res, next) => {
    try {

        // Get room code from parameters
        const roomCode = req.params.code;
        const playerID = req.params.id;

        const upd = await Room.updateOne( {code: roomCode}, { $pull: { players : { _id : playerID } } } )

        if (upd.nModified === 1) {
            return res.status(200).json({
                success: true,
                data: {}
            });
        } else {
            return res.status(404).json({
                success: false,
                error: messages
            })
        }

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
 }

// @desc    Get room data for player
// @route   GET /api/v1/rooms/:code/players/:id
// @access  Public
exports.getRoomPlayer = async (req, res, next) => {
    try {
        // Get room code from parameters
        const roomCode = req.params.code;

        // Get room from db
        const room = await Room.findOne({ code: roomCode });
        
        if(!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        const data = {
            status: room.status,
            players: room.players,
            gamesPlayed: room.games.length
        }

        //get current game
        if (room.games.length) {

            const game = room.games[room.games.length - 1];
            data.gameID = game._id;
            
            if (room.status === 'playing') {
                // if playing get round data for player

                            // Get player ID from parameters
            const playerID = req.params.id;

            // Get player's game card from game object
            const playerCard = game.cards.find(c => c.playerID == playerID);
            if (playerCard) {

                data.playerCardNumber = playerCard.number;

                const roundNo = game.currentRound;
                const numPlayers = room.players.length;

                let cardNo = playerCard.number - roundNo + 1;
                if (cardNo < 1) {
                    cardNo = cardNo + numPlayers;
                }

                data.round = {
                    number: roundNo,
                    cardNumber: cardNo
                }
                //console.log(data.round);
                

                //check to see if this player has submitted the round
                const card = game.cards.find(c => c.number === cardNo);
                const round = card.rounds.find(r => r.number === roundNo);
                if (round) {
                    data.round.complete = true;
                } else {
                    data.round.complete = false;

                    //get prev round data
                    if (roundNo === 1) {
                        data.round.type = 'D';
                        data.round.word = playerCard.secretWord;
                    } else {
                        const prevRoundNo = roundNo - 1;
                        const prevRound = card.rounds.find(r => r.number == prevRoundNo);

                        if (prevRound.type === 'D') {
                            data.round.type = 'G';
                            data.round.canvasData = prevRound.canvasData;
                        } else {
                            data.round.type = 'D';
                            data.round.word = prevRound.word;
                        }
                    }
                }
            }
                
            } else if (room.status === 'reveal') {
                // if revealing get all cards
                data.cards = game.cards;
            }

        } else {
            data.gameID = null;
            data.playerCardNumber = null;
            data.round = {};
        }

        return res.status(200).json({
            success: true,
            data
        });

    } catch (err) {
        console.log(err);
        
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
 }