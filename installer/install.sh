#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/share/juego-battle-royale}"
REPO_URL="${REPO_URL:-https://github.com/your-org/juego.git}"
BRANCH="${BRANCH:-main}"
TEMP_DIR=""

function section() {
  echo -e "\n=== $1 ==="
}

function ensure_node() {
  section "Verificando Node.js"
  if ! command -v node >/dev/null 2>&1; then
    echo "Node.js 18+ es requerido. Instálalo desde https://nodejs.org" >&2
    exit 1
  fi
  local version
  version="$(node -v | tr -d 'v')"
  local major="${version%%.*}"
  if [[ "$major" -lt 18 ]]; then
    echo "Se requiere Node.js 18 o superior. Detectado: $version" >&2
    exit 1
  fi
  echo "Node.js detectado: v$version"
}

function clone_repo() {
  section "Descargando el proyecto"
  TEMP_DIR="$(mktemp -d)"
  trap 'rm -rf "$TEMP_DIR"' EXIT

  if command -v git >/dev/null 2>&1; then
    git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$TEMP_DIR/repo"
  else
    echo "git no está disponible. Intenta exportar REPO_ZIP_URL y usa el instalador de PowerShell." >&2
    exit 1
  fi

  section "Copiando archivos a $INSTALL_DIR"
  rm -rf "$INSTALL_DIR"
  mkdir -p "$INSTALL_DIR"
  cp -R "$TEMP_DIR/repo"/. "$INSTALL_DIR"

  section "Instalando dependencias del servidor"
  (cd "$INSTALL_DIR/server" && npm install)

  section "Creando lanzador"
  cat <<'LAUNCH' > "$INSTALL_DIR/iniciar-juego.sh"
#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-8080}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
export PORT

node "$SERVER_DIR/src/server.js" &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID"
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT
sleep 3
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:$PORT" >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then
  open "http://localhost:$PORT"
else
  echo "Abre http://localhost:$PORT en tu navegador" >&2
fi

echo "Servidor ejecutándose. Presiona Ctrl+C para salir."
wait "$SERVER_PID"
LAUNCH
  chmod +x "$INSTALL_DIR/iniciar-juego.sh"

  section "Instalación completada"
  echo "Ejecuta $INSTALL_DIR/iniciar-juego.sh para iniciar el juego"
}

ensure_node
clone_repo
