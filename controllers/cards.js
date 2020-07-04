const Room = require('../models/Room');

// @desc    Get individual player card within a game
// @route   GET /api/v1/rooms/:code/games/:id/playercards/:playerID
// @access  Public
exports.getPlayerCard = async (req, res, next) => {
    try {
        // Get room code from parameters
        const roomCode = req.params.code;

        // Get room from db
        const room = await Room.findOne({ code: roomCode });
        
        if(!room) {
            console.log(`Room not found  ${roomCode}`);
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        // Get game ID from parameters
        const gameID = req.params.id

        // Get game from room object
        const game = room.games.find(g => g._id == gameID);

        if(!game) {
            console.log(`Game not found  ${gameID}`);
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Get player ID from parameters
        const playerID = req.params.playerID;

        // Get game card from game object
        const card = game.cards.find(c => c.playerID === playerID);

        if(!card) {
            console.log(`Card not found for player ID ${playerID}`);
            
            return res.status(404).json({
                success: false,
                error: 'Game card not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: card
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
 }
