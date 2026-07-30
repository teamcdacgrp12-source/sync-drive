[CmdletBinding()]
param(
    [ValidateRange(0, 60)]
    [int]$StartupDelaySeconds = 6
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'backend'
$logDirectory = Join-Path $PSScriptRoot 'logs'
$processFile = Join-Path $logDirectory 'backend-processes.json'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

$services = @(
    'discovery-service',
    'gateway-service',
    'auth-service',
    'user-service',
    'room-service',
    'chat-service',
    'stream-service'
)

$startedProcesses = @()

foreach ($service in $services) {
    $serviceDirectory = Join-Path $backendRoot $service
    $wrapper = Join-Path $serviceDirectory 'mvnw.cmd'
    if (-not (Test-Path -LiteralPath $wrapper)) {
        throw "Missing Maven wrapper for $service at $wrapper"
    }

    $logFile = Join-Path $logDirectory "$service.log"
    $command = "mvnw.cmd spring-boot:run > `"$logFile`" 2>&1"
    $process = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c', $command) -WorkingDirectory $serviceDirectory -WindowStyle Hidden -PassThru
    $startedProcesses += [PSCustomObject]@{
        Service = $service
        ProcessId = $process.Id
        ServiceDirectory = $serviceDirectory
        StartedAtUtc = [DateTime]::UtcNow.ToString('o')
    }
    $startedProcesses | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $processFile -Encoding utf8

    Write-Host "Started $service (PID: $($process.Id), log: $logFile)"

    if ($service -ne $services[-1] -and $StartupDelaySeconds -gt 0) {
        Start-Sleep -Seconds $StartupDelaySeconds
    }
}

Write-Host "All backend services were launched in dependency order."
Write-Host "Process registry: $processFile"
