// Simple multiplayer relay for ElastoClash
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const PORT = process.env.PORT || 3000;

let rooms = {}; // roomName -> { players: {id: {name}}, state }

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  socket.on('join_room', ({ room, name }) => {
    if (!rooms[room]) rooms[room] = { players: {}, state: {} };
    rooms[room].players[socket.id] = { name };
    socket.join(room);
    io.to(room).emit('player_list', Object.values(rooms[room].players));
    socket.emit('joined', { id: socket.id });
    console.log(`${name} joined room ${room}`);
  });

  socket.on('sync_state', ({ room, state }) => {
    rooms[room] && (rooms[room].state = state);
    socket.to(room).emit('state_update', state);
  });

  socket.on('player_action', ({ room, action }) => {
    socket.to(room).emit('player_action', { id: socket.id, action });
  });

  socket.on('leave_room', ({ room }) => {
    if (rooms[room]) {
      delete rooms[room].players[socket.id];
      io.to(room).emit('player_list', Object.values(rooms[room].players));
      if (Object.keys(rooms[room].players).length === 0) {
        delete rooms[room];
      }
    }
    socket.leave(room);
  });

  socket.on('disconnect', () => {
    for (const room in rooms) {
      if (rooms[room].players[socket.id]) {
        delete rooms[room].players[socket.id];
        io.to(room).emit('player_list', Object.values(rooms[room].players));
        if (Object.keys(rooms[room].players).length === 0) {
          delete rooms[room];
        }
      }
    }
    console.log('Player disconnected:', socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("ElastoClash multiplayer server is running.");
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
