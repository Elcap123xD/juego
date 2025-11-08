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

### 1. Preparar dependencias

```bash
cd server
npm install
```

### 2. Escoger tu modo de ejecución

#### Opción A: Servidor unificado (recomendado)

El backend expone las APIs y sirve el cliente estático desde la misma URL (`http://localhost:8080`).

```bash
npm start
```

- El proceso queda escuchando en la terminal actual. Presiona `Ctrl+C` para detenerlo.
- Abre `http://localhost:8080` en tu navegador. El cliente detecta automáticamente el host y puerto para el WebSocket.
- Puedes personalizar el puerto con la variable de entorno `PORT` (`PORT=3000 npm start`).

#### Opción B: Servidor y cliente por separado

Si prefieres trabajar con un servidor de archivos distinto (por ejemplo, `npm run dev` de Vite o un servidor estático), puedes seguir estos pasos:

1. Inicia el backend únicamente con APIs y WebSockets:

   ```bash
   npm run server
   ```

   Este script ejecuta el servidor con la opción `--no-static`, por lo que no intentará servir archivos del cliente. El puerto por defecto es `8080` (configurable con `PORT`).

2. Sirve el cliente desde la carpeta `client/` con tu herramienta preferida. Un ejemplo sencillo usando `http-server`:

   ```bash
   cd client
   npx http-server -p 5173
   ```

3. Abre el navegador en la URL del cliente (por ejemplo `http://localhost:5173`).

   El archivo `client/src/game.js` lee la variable `window.GAME_SERVER_URL`. Si sirves el cliente desde otro dominio o puerto, define la variable antes de cargar el script:

   ```html
   <script>
     window.GAME_SERVER_URL = "ws://localhost:8080";
   </script>
   <script src="src/game.js" type="module"></script>
   ```

### 3. Configuración adicional

- Edita `server/src/server.js` para cambiar reglas de lobby, tamaño del mapa u otras constantes.
- Usa `CLIENT_DIR=/ruta/a/tu/build npm start` si quieres que el servidor unificado sirva un cliente compilado distinto al incluido en `client/`.

## Instaladores automatizados

Se añadieron scripts en la carpeta `installer/` para facilitar la instalación en sistemas Windows y Linux/macOS.

- **Windows (PowerShell 5+):**

  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ./installer/install.ps1 -RepoZipUrl "https://github.com/<tu-org>/juego/archive/refs/heads/main.zip"
  ```

  Al finalizar, el script deja todo en `%LOCALAPPDATA%\JuegoBattleRoyale` y genera `Iniciar-Juego.ps1` para lanzar el servidor y abrir el cliente.

- **Linux/macOS (Bash):**

  ```bash
  chmod +x installer/install.sh
  ./installer/install.sh REPO_URL="https://github.com/<tu-org>/juego.git"
  ```

  La instalación queda en `$HOME/.local/share/juego-battle-royale` con el lanzador `iniciar-juego.sh` listo para ejecutarse (`PORT=9000 ./iniciar-juego.sh`).

## Próximos pasos sugeridos

- Implementar autenticación real y persistencia en base de datos.
- Añadir físicas, armas y sincronización de estado del jugador.
- Implementar el cierre de zona, daños y eliminación de jugadores.
- Crear un pipeline de CI/CD y scripts de despliegue.

## Licencia

Proyecto abierto bajo licencia MIT.
