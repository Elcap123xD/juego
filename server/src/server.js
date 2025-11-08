import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuid } from 'uuid';

const PORT = process.env.PORT || 8080;
const TICK_RATE = 20; // 20 updates per second
const MATCH_SIZE = 10;

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const players = new Map();
const lobbies = new Map();
const matches = new Map();

function broadcast(matchId, payload) {
  const match = matches.get(matchId);
  if (!match) return;
  for (const clientId of match.players) {
    const connection = players.get(clientId)?.connection;
    if (connection && connection.readyState === 1) {
      connection.send(JSON.stringify(payload));
    }
  }
}

function createMatch() {
  const id = uuid();
  matches.set(id, {
    id,
    players: new Set(),
    state: 'waiting',
    worldState: {
      tick: 0,
      shrinkingCircle: {
        radius: 500,
        targetRadius: 50,
        shrinkDuration: 60 * 1000
      }
    }
  });
  return id;
}

function assignToMatch(playerId) {
  let targetMatch = null;
  for (const match of matches.values()) {
    if (match.state === 'waiting' && match.players.size < MATCH_SIZE) {
      targetMatch = match;
      break;
    }
  }

  if (!targetMatch) {
    const newMatchId = createMatch();
    targetMatch = matches.get(newMatchId);
  }

  targetMatch.players.add(playerId);
  if (targetMatch.players.size === MATCH_SIZE) {
    targetMatch.state = 'active';
    broadcast(targetMatch.id, {
      type: 'match_started',
      payload: {
        matchId: targetMatch.id,
        worldState: targetMatch.worldState
      }
    });
  }

  return targetMatch.id;
}

function removePlayer(playerId) {
  const player = players.get(playerId);
  if (!player) return;
  const { matchId } = player;
  if (matchId) {
    const match = matches.get(matchId);
    if (match) {
      match.players.delete(playerId);
      if (match.players.size === 0) {
        matches.delete(matchId);
      }
    }
  }
  players.delete(playerId);
}

wss.on('connection', (ws) => {
  const playerId = uuid();
  players.set(playerId, { connection: ws, matchId: null, inputs: [] });

  ws.send(JSON.stringify({ type: 'connected', payload: { playerId } }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(playerId, data);
    } catch (error) {
      console.error('Error parsing message', error);
    }
  });

  ws.on('close', () => {
    removePlayer(playerId);
  });
});

function handleMessage(playerId, data) {
  const player = players.get(playerId);
  if (!player) return;

  switch (data.type) {
    case 'join_lobby': {
      const lobbyId = data.payload?.lobbyId ?? 'default';
      if (!lobbies.has(lobbyId)) {
        lobbies.set(lobbyId, new Set());
      }
      const lobby = lobbies.get(lobbyId);
      lobby.add(playerId);

      const matchId = assignToMatch(playerId);
      player.matchId = matchId;
      const match = matches.get(matchId);
      player.connection.send(
        JSON.stringify({
          type: 'lobby_joined',
          payload: {
            lobbyId,
            matchId,
            playersInLobby: match ? match.players.size : 1
          }
        })
      );
      break;
    }
    case 'player_input': {
      const { input } = data.payload ?? {};
      if (!input) return;
      player.inputs.push({ ...input, receivedAt: Date.now() });
      break;
    }
    default:
      console.warn(`Unhandled message type: ${data.type}`);
  }
}

setInterval(() => {
  for (const match of matches.values()) {
    if (match.state !== 'active') continue;
    match.worldState.tick += 1;
    const circle = match.worldState.shrinkingCircle;
    const progress = Math.min(1, (match.worldState.tick / (TICK_RATE * (circle.shrinkDuration / 1000))));
    const newRadius = circle.radius - (circle.radius - circle.targetRadius) * progress;
    circle.currentRadius = newRadius;

    broadcast(match.id, {
      type: 'world_update',
      payload: {
        tick: match.worldState.tick,
        circleRadius: circle.currentRadius ?? circle.radius,
        playerCount: match.players.size
      }
    });
  }
}, 1000 / TICK_RATE);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), matches: matches.size });
});

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'username_required' });
  }
  const userId = uuid();
  res.status(201).json({ userId, username });
});

app.post('/api/matches/:matchId/complete', (req, res) => {
  const { matchId } = req.params;
  const { winnerId, stats } = req.body ?? {};
  if (!matches.has(matchId)) {
    return res.status(404).json({ error: 'match_not_found' });
  }
  matches.delete(matchId);
  res.json({ matchId, winnerId, stats });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor battle royale escuchando en http://localhost:${PORT}`);
});
