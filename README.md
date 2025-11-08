# Proyecto Juego - Battle Royale

Este repositorio contiene la base para un prototipo de juego battle royale estilo Fortnite. Incluye un servidor Node.js con WebSockets para matchmaking simple y un cliente web construido con Phaser 3 que se conecta al servidor.

## Estructura

```
├── client
│   ├── index.html        # Cliente web con Phaser
│   └── src/game.js       # Lógica básica de lobby y partida
├── docs
│   └── design.md         # Documento de arquitectura inicial
└── server
    ├── package.json      # Dependencias y scripts del servidor
    └── src/server.js     # Servidor Express + WebSocket
```

## Requisitos

- Node.js 18+
- Navegador moderno

## Ejecución local

1. Instalar dependencias del servidor:
   ```bash
   cd server
   npm install
   ```

2. Levantar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir el cliente en el navegador:
   ```bash
   cd ..
   npx serve client
   ```
   (Puedes usar cualquier servidor estático; por ejemplo `python -m http.server` dentro de `client`).

4. Navega a `http://localhost:3000` (u otro puerto que utilice tu servidor estático). El cliente intentará conectarse al servidor WebSocket en `ws://localhost:8080`.

## Próximos pasos sugeridos

- Implementar autenticación real y persistencia en base de datos.
- Añadir físicas, armas y sincronización de estado del jugador.
- Implementar el cierre de zona, daños y eliminación de jugadores.
- Crear un pipeline de CI/CD y scripts de despliegue.

## Licencia

Proyecto abierto bajo licencia MIT.
