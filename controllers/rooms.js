const Room = require('../models/Room');
const randomstring = require("randomstring");

// @desc    Get all rooms
// @route   GET /api/v1/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
   try {
       const rooms = await Room.find();

       return res.status(200).json({
           success: true,
           count: rooms.length,
           data: rooms
       });
   } catch (err) {
       return res.status(500).json({
           success: false,
           error: 'Server Error'
       });
   }
}

// @desc    Get individual room by code
// @route   GET /api/v1/rooms/:code
// @access  Public
exports.getRoom = async (req, res, next) => {
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

        return res.status(200).json({
            success: true,
            data: room
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
 }

// @desc    Add room
// @route   POST /api/v1/rooms
// @access  Public
exports.addRoom = async (req, res, next) => {
    try {

        // Generate random 4 character code (and make sure it doesn't already exist as a room code)
        let uniqueCode = false;
        let code = '';
        while (uniqueCode === false) {
            // Generate code
            code = randomstring.generate({
                length: 4,
                charset: 'alphabetic',
                capitalization:'uppercase'
            });

            // Check that a room with this code doesn't already exist
            const rooms = await Room.find({code});

            if (rooms.length == 0) {
                uniqueCode = true;
            }
        }

        // Get name of host and socket id from request body
        const { hostName, socketID } = req.body;
       
        // Create new room with this code
        const newRoom = await Room.create({
            code,
            players: [{ name: hostName, isHost: true, socketID, sort: 1 }],
            games: []
        });
    
        return res.status(201).json({
            success: true,
            data: newRoom 
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

// @desc    Update room by code
// @route   PUT /api/v1/rooms/:code
// @access  Public
exports.updateRoom = async (req, res, next) => {
    try {
        // Get room code from parameters
        const roomCode = req.params.code;

        // Get room from db
        const room = await Room.findOneAndUpdate({ code: roomCode }, req.body, (err, room) => {
            // Handle any possible database errors
                if (err) {
                    return res.status(404).json({
                        success: false,
                        error: 'Update failed'
                    });
                }
                return res.status(200).json({
                    success: true,
                    data: room
                });
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
 }