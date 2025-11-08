const statusElement = document.getElementById('status');

function updateStatus(text) {
  if (statusElement) {
    statusElement.textContent = text;
  }
}

class LobbyScene extends Phaser.Scene {
  constructor() {
    super('Lobby');
    this.socket = null;
    this.playerId = null;
    this.matchId = null;
  }

  preload() {
    this.load.image('background', 'https://i.imgur.com/5fEvhcc.png');
    this.load.spritesheet('hero', 'https://i.imgur.com/AVPnk7N.png', {
      frameWidth: 64,
      frameHeight: 64
    });
  }

  create() {
    this.add.image(400, 300, 'background').setScale(1.2);
    this.playerSprite = this.add.sprite(400, 300, 'hero');
    this.playerSprite.setScale(1.5);
    this.playerSprite.setTint(0x87ceeb);
    this.add.text(400, 120, 'Lobby Battle Royale', {
      fontFamily: 'Segoe UI',
      fontSize: '36px',
      color: '#f8fafc'
    }).setOrigin(0.5);

    this.connect();
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const endpoint = `${protocol}://${window.location.host}`;
    this.socket = new WebSocket(endpoint);

    this.socket.addEventListener('open', () => {
      updateStatus('Conectado al servidor. Entrando al lobby...');
    });

    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.handleSocketMessage(data);
    });

    this.socket.addEventListener('close', () => {
      updateStatus('Desconectado. Reintentando en 3 segundos...');
      this.time.delayedCall(3000, () => this.connect());
    });
  }

  handleSocketMessage(message) {
    switch (message.type) {
      case 'connected': {
        this.playerId = message.payload.playerId;
        updateStatus(`Jugador ${this.playerId.slice(0, 8)} conectado`);
        this.socket.send(JSON.stringify({ type: 'join_lobby', payload: { lobbyId: 'default' } }));
        break;
      }
      case 'lobby_joined': {
        this.matchId = message.payload.matchId;
        updateStatus(`Lobby ${message.payload.playersInLobby}/${message.payload.playersNeeded ?? 10}`);
        break;
      }
      case 'match_started': {
        updateStatus('¡Partida iniciada!');
        this.scene.start('Battle', {
          socket: this.socket,
          playerId: this.playerId,
          matchId: message.payload.matchId,
          worldState: message.payload.worldState
        });
        break;
      }
      case 'world_update': {
        if (this.scene.isActive('Battle')) {
          this.scene.get('Battle').receiveWorldUpdate(message.payload);
        }
        break;
      }
      default:
        console.warn('Mensaje no manejado', message);
    }
  }

  update() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    const input = {
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown
    };

    this.socket.send(JSON.stringify({
      type: 'player_input',
      payload: { input }
    }));
  }
}

class BattleScene extends Phaser.Scene {
  constructor() {
    super('Battle');
    this.socket = null;
    this.playerId = null;
    this.circleGraphics = null;
  }

  init(data) {
    this.socket = data.socket;
    this.playerId = data.playerId;
    this.matchId = data.matchId;
    this.worldState = data.worldState;
  }

  create() {
    this.circleGraphics = this.add.graphics({ fillStyle: { color: 0x1d4ed8, alpha: 0.2 }, lineStyle: { width: 4, color: 0x2563eb } });
    this.player = this.add.circle(400, 300, 16, 0xfacc15);
    this.add.text(16, 16, `Jugador: ${this.playerId.slice(0, 8)}`, {
      fontFamily: 'Segoe UI',
      fontSize: '20px',
      color: '#f8fafc'
    });
    this.add.text(16, 44, 'Usa las flechas para moverte', {
      fontFamily: 'Segoe UI',
      fontSize: '16px',
      color: '#cbd5f5'
    });
  }

  receiveWorldUpdate(payload) {
    this.worldState = { ...this.worldState, ...payload };
    this.renderCircle();
  }

  renderCircle() {
    if (!this.circleGraphics || !this.worldState) return;
    const radius = this.worldState.circleRadius ?? this.worldState.shrinkingCircle?.radius ?? 300;
    this.circleGraphics.clear();
    this.circleGraphics.fillStyle(0x1d4ed8, 0.2);
    this.circleGraphics.fillCircle(400, 300, radius * 0.4);
    this.circleGraphics.lineStyle(4, 0x2563eb, 1);
    this.circleGraphics.strokeCircle(400, 300, radius * 0.4);
  }

  update(time, delta) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    const cursors = this.input.keyboard.createCursorKeys();
    const speed = 0.2 * delta;
    if (cursors.left.isDown) this.player.x -= speed;
    if (cursors.right.isDown) this.player.x += speed;
    if (cursors.up.isDown) this.player.y -= speed;
    if (cursors.down.isDown) this.player.y += speed;
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#0f172a',
  scene: [LobbyScene, BattleScene]
};

new Phaser.Game(config);
