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

> Todos los comandos se asumen desde la raíz del repositorio (`/workspace/juego`).

1. **Instalar dependencias del servidor**

   ```bash
   cd server
   npm install
   ```

2. **Levantar el backend en caliente**

   El servidor escucha en `http://localhost:8080` y expone el WebSocket en la misma dirección.

   ```bash
   npm run dev
   ```

   > Deja este proceso corriendo en una terminal.

3. **Servir el cliente estático**

   En otra terminal, desde la raíz del repo, levanta un servidor de archivos apuntando a la carpeta `client`:

   Con Node (npx `serve`):

   ```bash
   npx serve client
   ```

   Con Python (alternativa sin dependencias extras):

   ```bash
   cd client
   python -m http.server 3000
   ```

4. **Abrir el juego**

   En tu navegador accede a la URL mostrada por el servidor estático (por defecto `http://localhost:3000`). El cliente se conectará automáticamente al WebSocket del backend en `ws://localhost:8080`.

5. **(Opcional) Configurar variables**

   Si necesitas cambiar los puertos, edita las constantes en `client/src/game.js` y `server/src/server.js` para que apunten a las nuevas direcciones.

## Próximos pasos sugeridos

- Implementar autenticación real y persistencia en base de datos.
- Añadir físicas, armas y sincronización de estado del jugador.
- Implementar el cierre de zona, daños y eliminación de jugadores.
- Crear un pipeline de CI/CD y scripts de despliegue.

## Licencia

Proyecto abierto bajo licencia MIT.
