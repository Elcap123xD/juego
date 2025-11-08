# Diseño inicial de Battle Royale "Proyecto Juego"

Este documento describe la arquitectura inicial para un juego de disparos tipo battle royale inspirado en Fortnite.

## Componentes

1. **Cliente**
   - Construido con [Phaser 3](https://phaser.io/).
   - Se ejecuta en el navegador y gestiona la representación gráfica, el input del jugador y la sincronización con el servidor vía WebSocket.
   - Se organiza en escenas (login, lobby y partida) y utiliza spritesheet para el personaje principal.

2. **Servidor**
   - Node.js con Express y `ws` para WebSockets.
   - Mantiene el estado del juego en memoria (jugadores, lobbies, partida).
   - Proporciona endpoints REST básicos para autenticación, emparejamiento y estadísticas.
   - Utiliza UUID para identificar partidas y jugadores.

3. **Base de datos**
   - Uso inicial de SQLite a través de `better-sqlite3` para prototipos.
   - Tablas previstas: `users`, `matches`, `match_players`, `leaderboard`.
   - El acceso se encapsula en un módulo DAO sencillo.

4. **Infraestructura**
   - El proyecto está preparado para ejecutar Docker Compose con tres servicios: `client`, `server` y `db`.
   - La comunicación cliente-servidor se realiza mediante HTTPS y WSS en entornos productivos.

## Flujo general

1. El jugador abre el cliente web y se autentica.
2. El cliente envía un `join_lobby` por WebSocket.
3. El servidor agrupa jugadores en partidas de 10 personas (configurable).
4. Cuando se llena una partida, se envía un snapshot inicial y se inicia el bucle de juego.
5. Cada 50 ms el cliente envía input y recibe updates del servidor.
6. Al finalizar la partida, el servidor guarda estadísticas en la base de datos y actualiza el ranking.

## Próximos pasos

1. Completar las escenas del cliente: login, lobby, partida.
2. Implementar autenticación real (registro/login) y almacenamiento de tokens.
3. Añadir físicas, armas, y sistema de inventario en el cliente.
4. Persistir estadísticas en la base de datos y exponer endpoints REST adicionales.
5. Preparar despliegue en la nube (por ejemplo, contenedores en Kubernetes o ECS).

## Roadmap de módulos

| Iteración | Objetivo | Entregables |
|-----------|----------|-------------|
| 0 | Configuración básica | Cliente Phaser con escena de prueba, servidor con matchmaking simplificado |
| 1 | Movimiento y disparos | Física básica, detección de colisiones, sincronización de proyectiles |
| 2 | Cierre de zona | Implementar círculo que se cierra, daño por permanecer fuera |
| 3 | Persistencia | Guardar estadísticas de partidas, leaderboard |
| 4 | Mejora visual | Sprites personalizados, efectos, sonido |

Este documento se actualizará conforme avancen los desarrollos.
