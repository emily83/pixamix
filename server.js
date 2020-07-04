const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config({ path: './config/config.env' });

connectDB();

//const index = require('./routes/index');
const rooms = require('./routes/rooms');

const app = express();
const server = http.createServer(app);

// Body Parser Middleware
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/v1/rooms', rooms);

if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// now load and initialize my socket.io module
require('./socket')(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));
