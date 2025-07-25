// js/multiplayer.js

import { SOCKET_SERVER_URL } from './config.js';
import { getBike } from './game.js';
import { NETWORK_CONFIG } from './config.js'; // Import NETWORK_CONFIG

// Socket.IO setup
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

// Constants for multiplayer
const SYNC_INTERVAL_MS = 1000 / NETWORK_CONFIG.TICK_RATE; // Sync rate from config

let socket = null;
let room = "main"; // Kan gøres dynamisk for flere rum/lobbies
let playerName = "Player";
let players = {}; // Andre spillere (key = id, value = {name, x, y, angle})
let lastSyncTime = 0; // For rate limiting

// For at lytte på egne events i main.js eller andet
let onPlayersUpdate = () => {};

// Start multiplayer (kald fx når spillet starter eller bruger trykker "multiplayer")
export function startMultiplayer(name = "Player", roomName = "main") {
  playerName = name;
  room = roomName;

  socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });

  socket.on("connect", () => {
    console.log("Connected to multiplayer server.");
    socket.emit("join_room", { room, name: playerName });
  });

  socket.on("connect_error", (err) => {
    console.error("Multiplayer connection error:", err.message);
    // Optionally, display an error message to the user
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from multiplayer server:", reason);
    players = {}; // Clear players on disconnect
    onPlayersUpdate(players);
    // Optionally, inform the user about disconnection
  });

  socket.on("player_list", (list) => {
    // list: [{ id, name }] - Use actual player IDs
    players = list.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});
    onPlayersUpdate(players);
  });

  socket.on("state_update", (state) => {
    // state: { id: { name, x, y, angle, alive } }
    // Update existing players, add new ones
    for (const id in state) {
      if (players[id]) {
        Object.assign(players[id], state[id]);
      } else {
        players[id] = state[id];
      }
    }
    // Remove players not in the current state update (disconnected)
    for (const id in players) {
      if (!state[id] && id !== socket.id) { // Don't remove self
        delete players[id];
      }
    }
    onPlayersUpdate(players);
  });

  socket.on("player_disconnected", ({ id }) => {
    console.log(`Player ${id} disconnected.`);
    delete players[id];
    onPlayersUpdate(players);
  });

  socket.on("player_action", ({ id, action }) => {
    // Brug fx til at synkronisere hop, boost, crash
    // action: {type, data}
    console.log(`Player ${id} performed action: ${action.type}`);
  });
}

// Send din position til serveren
export function syncPlayerState() {
  const now = performance.now();
  if (socket && socket.connected && now - lastSyncTime > SYNC_INTERVAL_MS) {
    const bike = getBike();
    if (bike) { // Ensure bike object exists
      socket.emit("sync_state", {
        room,
        state: {
          id: socket.id, // Send own ID
          name: playerName,
          x: bike.x,
          y: bike.y,
          angle: bike.angle,
          alive: bike.isAlive,
        }
      });
      lastSyncTime = now;
    }
  }
}

// Brug denne i din game loop efter at have opdateret bike!
export function updateMultiplayer() {
  syncPlayerState();
}

// For at få opdateringer i main.js:
export function onRemotePlayersUpdate(cb) {
  onPlayersUpdate = cb;
}

// For at forlade rum (fx ved reset eller quit)
export function leaveMultiplayer() {
  if (socket && socket.connected) {
    socket.emit("leave_room", { room });
    socket.disconnect();
    players = {};
  }
}

export function getPlayers() {
  return players;
}
