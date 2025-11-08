[CmdletBinding()]
param(
    [string]$InstallDir = "$env:LOCALAPPDATA\JuegoBattleRoyale",
    [string]$RepoZipUrl = "https://github.com/your-org/juego/archive/refs/heads/main.zip"
)

function Write-Section($message) {
    Write-Host "`n=== $message ===" -ForegroundColor Cyan
}

function Ensure-Node() {
    Write-Section "Verificando Node.js"
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCmd) {
        throw "Node.js 18+ es requerido. Instálalo desde https://nodejs.org antes de continuar."
    }
    $versionOutput = node -v
    if (-not $versionOutput) {
        throw "No fue posible obtener la versión de Node.js"
    }
    $normalized = $versionOutput.TrimStart('v')
    try {
        $parsedVersion = [System.Version]$normalized
    }
    catch {
        throw "No se pudo interpretar la versión de Node.js ($versionOutput)."
    }
    if ($parsedVersion.Major -lt 18) {
        throw "Se requiere Node.js 18 o superior. Versión detectada: $versionOutput"
    }
    Write-Host "Node.js detectado: $versionOutput" -ForegroundColor Green
}

function Download-Source($destination) {
    Write-Section "Descargando el proyecto"
    $zipPath = Join-Path $destination 'juego.zip'
    try {
        Invoke-WebRequest -Uri $RepoZipUrl -OutFile $zipPath -UseBasicParsing
    }
    catch {
        throw "Error al descargar el repositorio desde $RepoZipUrl. $_"
    }
    Write-Host "Archivo descargado en $zipPath" -ForegroundColor Green
    Write-Section "Descomprimiendo"
    Expand-Archive -Path $zipPath -DestinationPath $destination -Force
    $extracted = Get-ChildItem -Directory -Path $destination | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $extracted) {
        throw "No se encontró la carpeta descomprimida."
    }
    return $extracted.FullName
}

function Install-Dependencies($path) {
    Write-Section "Instalando dependencias del servidor"
    Push-Location (Join-Path $path 'server')
    try {
        npm install | Write-Host
    }
    finally {
        Pop-Location
    }
}

function Create-Launcher($path) {
    Write-Section "Creando lanzador"
    $launcherPath = Join-Path $path 'Iniciar-Juego.ps1'
$launcherContent = @'
param(
    [int]$Port = 8080
)

$serverDir = Join-Path $PSScriptRoot 'server'

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm no está disponible en el PATH. Instala Node.js para continuar."
}

$previousPort = $env:PORT
$env:PORT = $Port

Write-Host "Levantando servidor..." -ForegroundColor Cyan
$serverProcess = Start-Process -FilePath 'npm' -ArgumentList 'start' -WorkingDirectory $serverDir -WindowStyle Normal -PassThru
Start-Sleep -Seconds 3

$clientUrl = "http://localhost:$Port"
Write-Host "Abriendo cliente en $clientUrl" -ForegroundColor Cyan
Start-Process $clientUrl

try {
    Write-Host "El servidor se está ejecutando. Cierra esta ventana para detenerlo." -ForegroundColor Green
    Wait-Process -Id $serverProcess.Id
}
finally {
    if ($serverProcess -and -not $serverProcess.HasExited) {
        Write-Host "Deteniendo servidor..." -ForegroundColor Yellow
        $serverProcess | Stop-Process
    }
    if ($null -ne $previousPort) {
        $env:PORT = $previousPort
    }
    else {
        Remove-Item Env:PORT -ErrorAction SilentlyContinue
    }
}
'@
    Set-Content -Path $launcherPath -Value $launcherContent -Encoding UTF8
    Write-Host "Lanzador creado en $launcherPath" -ForegroundColor Green
}

try {
    Ensure-Node

    $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("juego-installer-" + [guid]::NewGuid())
    New-Item -ItemType Directory -Path $tempDir | Out-Null

    $sourceRoot = Download-Source -destination $tempDir

    if (Test-Path $InstallDir) {
        Write-Section "Limpiando instalación previa"
        Remove-Item -Recurse -Force -Path $InstallDir
    }

    Write-Section "Copiando archivos a $InstallDir"
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
    Get-ChildItem -Path $sourceRoot -Force | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $InstallDir -Recurse -Force
    }

    Install-Dependencies -path $InstallDir
    Create-Launcher -path $InstallDir

    Write-Section "Instalación completada"
    Write-Host "Ejecuta 'Iniciar-Juego.ps1' dentro de $InstallDir para lanzar el juego." -ForegroundColor Green
}
finally {
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force -Path $tempDir
    }
}
