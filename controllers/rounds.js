const Room = require('../models/Room');

// @desc    Add round data to game card
// @route   POST /api/v1/rooms/:code/games/:id/cards/:cardNo/rounds
// @access  Public
exports.addRound = async (req, res, next) => {
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

        // Get game ID from parameters
        const gameID = req.params.id

        // Get game from room object
        const game = room.games.find(g => g._id == gameID);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Get card number from parameters
        const cardNo = req.params.cardNo

        // Get card from game object
        const card = game.cards.find(c => c.number == cardNo);

        if (!card) {
            return res.status(404).json({
                success: false,
                error: 'Card not found'
            });
        }

        // Get round data from request body
        const round = req.body;

         // Add round to array within card
         card.rounds.push(req.body);

        // Save room back to db
        await room.save();

        return res.status(201).json({
            success: true,
            data: round
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


// @desc    Get round data for a particular card
// @route   GET /api/v1/rooms/:code/games/:id/cards/:cardNo/rounds/:roundNo
// @access  Public
exports.getRound = async (req, res, next) => {
    try {
        console.log('getRound');
        

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

        // Get card number from parameters
        const cardNo = req.params.cardNo

        // Get card from game object
        const card = game.cards.find(c => c.number == cardNo);

        if (!card) {
            console.log(`Card not found  ${cardNo}`);
            return res.status(404).json({
                success: false,
                error: 'Card not found'
            });
        }

        // Get round number from parameters
        const roundNo = req.params.roundNo

        //get prev round data
        const prevRoundNo = roundNo - 1;
        const prevRound = card.rounds.find(r => r.number == prevRoundNo);

        if (!prevRound) {
            return res.status(404).json({
                success: false,
                error: 'Previous round not found'
            });
        }

        const round = {
            number: roundNo,
            cardNumber: cardNo
        }

        if (prevRound.type === 'D') {
            round.type = 'G';
            round.canvasData = prevRound.canvasData;
        } else {
            round.type = 'D';
            round.word = prevRound.word;
        }

        return res.status(200).json({
            success: true,
            data: round
        });

    } catch (err) {
        console.log(err);
        
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
 }