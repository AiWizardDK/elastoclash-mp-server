const express = require('express');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Socket.IO Server
const path = require('path');
const app = express();

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5500", // Allow connections from your Netlify frontend URL
        methods: ["GET", "POST"]
    }
});

// Store connected players and their states
let players = {}; // { socketId: { name, x, y, angle, alive, room } }

// Socket.IO event handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', ({ room, name }) => {
        socket.join(room);
        players[socket.id] = { id: socket.id, name, room, x: 0, y: 0, angle: 0, alive: true };
        console.log(`${name} (${socket.id}) joined room: ${room}`);

        // Notify everyone in the room about the updated player list
        io.to(room).emit('player_list', Object.values(players).filter(p => p.room === room));
    });

    socket.on('sync_state', (state) => {
        // Update player state
        if (players[socket.id]) {
            Object.assign(players[socket.id], state.state);
            // Broadcast state to other players in the same room
            socket.to(players[socket.id].room).emit('state_update', { [socket.id]: players[socket.id] });
        }
    });

    socket.on('player_action', (action) => {
        // Broadcast player actions to others in the same room
        if (players[socket.id]) {
            socket.to(players[socket.id].room).emit('player_action', { id: socket.id, action });
        }
    });

    socket.on('leave_room', ({ room }) => {
        socket.leave(room);
        delete players[socket.id];
        console.log(`User ${socket.id} left room: ${room}`);
        // Notify others in the room about disconnection
        io.to(room).emit('player_disconnected', { id: socket.id });
    });

    socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${socket.id} (${reason})`);
        if (players[socket.id]) {
            const room = players[socket.id].room;
            delete players[socket.id];
            // Notify others in the room about disconnection
            if (room) {
                io.to(room).emit('player_disconnected', { id: socket.id });
            }
        }
    });
});

// Konfigurer static fil servering (keep this for local dev/fallback)
app.use(express.static(path.join(__dirname, './'), {
    setHeaders: (res, filePath) => {
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.mp3': 'audio/mpeg',
        };
        
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
    }
}));

// Håndter 404 fejl
app.use((req, res) => {
    res.status(404).send('File not found');
});

// Håndter server fejl
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server error');
});

const port = process.env.PORT || 5500; // Use process.env.PORT for Render
server.listen(port, () => { // Listen on the http server, not the express app
    console.log(`Server kører på http://localhost:${port}/`);
});