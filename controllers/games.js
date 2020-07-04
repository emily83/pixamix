const Room = require('../models/Room');
const Word = require('../models/Word');

// @desc    Get all games in a room
// @route   GET /api/v1/rooms/:code/games
// @access  Public
exports.getGames = async (req, res, next) => {
    try {

        // Get room code from parameters
        const roomCode = req.params.code;

        // Get room from db
        const room = await Room.findOne({ code: roomCode });

        // Get array of games from room
        const games = room.games;
        
        return res.status(200).json({
            success: true,
            count: games.length,
            data: games
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
 }


// @desc    Add game
// @route   POST /api/v1/rooms/:code/games
// @access  Public
exports.addGame = async (req, res, next) => {
    try {

        // Get room code from parameters
        const roomCode = req.params.code;

        // Get room from db
        const room = await Room.findOne({ code: roomCode });

        // If room not found return error
        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        // Get number of players
        const numPlayers = room.players.length;

        // If the number of words used in the room will exceed total number of words, reset used words (unlikely!!!)
        const numWords = await Word.countDocuments();
        if (room.usedWords.length + numPlayers > numWords) {
            room.usedWords = [];
        }

        // Get words
        const filter = { _id: { $nin: room.usedWords } };
        await Word.findRandom(filter, {}, {limit: numPlayers}, async function(err, wordObjects) {
            if (err) {
                return res.status(404).json({
                    success: false,
                    error: 'No words found'
                });

            } else {

                // Map each player to a gamecard
                const cards  = room.players.map((player, i) => {
                    return {
                        number: (i+1),
                        playerID: player._id,
                        secretWord: wordObjects[i].word,
                        rounds: []
                    }
                });

                // Add game to array within room
                room.games.push({ cards });

                // Set room status to playing
                room.status = 'playing';

                // Add words to the usedWords array
                const newWordIDs = wordObjects.map(w => w._id);
                room.usedWords.push(...newWordIDs);

                // Save room back to db
                await room.save();

                // Get updated room
                const updatedRoom = await Room.findOne({ code: roomCode });
            
                return res.status(201).json({
                    success: true,
                    data: updatedRoom.games[updatedRoom.games.length - 1]
                });
            }
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            })
        } else {
            console.log(err);
            
            return res.status(500).json({
                success: false,
                error: 'Server Error'
            });
        }
       
    }
}


