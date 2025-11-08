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

2. **Levantar el servidor unificado**

   El backend ahora expone tanto las APIs como los archivos estáticos del cliente en la misma URL (`http://localhost:8080`).

   ```bash
   npm start
   ```

   > El proceso queda escuchando en la terminal actual. Presiona `Ctrl+C` para detenerlo.

3. **Abrir el juego**

   Visita `http://localhost:8080` en tu navegador. El cliente detecta el puerto automáticamente y mantiene la comunicación WebSocket usando el mismo origen.

4. **(Opcional) Configurar variables**

   Puedes modificar el puerto estableciendo la variable de entorno `PORT` antes de ejecutar `npm start` o editando `server/src/server.js`. El cliente utiliza `window.location`, por lo que no requiere cambios adicionales si ambos se sirven desde el mismo host.

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
