const express = require('express');
const router = express.Router();
const { getRoom, addRoom, updateRoom } = require('../controllers/rooms');
const { addPlayerToRoom, getPlayers, deletePlayer, getRoomPlayer } = require('../controllers/players');
const { getGames, addGame } = require('../controllers/games');
const { getPlayerCard } = require('../controllers/cards');
const { addRound, getRound } = require('../controllers/rounds');

router
    .route('/')
    .post(addRoom);

router
    .route('/:code')
    .get(getRoom)
    .put(updateRoom);

router
    .route('/:code/players')
    .get(getPlayers)
    .post(addPlayerToRoom);

router
    .route('/:code/players/:id')
    .delete(deletePlayer)
    .get(getRoomPlayer);

router
    .route('/:code/games')
    .get(getGames)
    .post(addGame);

router
    .route('/:code/games/:id/playercards/:playerID')
    .get(getPlayerCard);

router
    .route('/:code/games/:id/cards/:cardNo/rounds')
    .post(addRound);

router
    .route('/:code/games/:id/cards/:cardNo/rounds/:roundNo')
    .get(getRound);

module.exports = router;