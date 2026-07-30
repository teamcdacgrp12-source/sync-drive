[CmdletBinding(SupportsShouldProcess = $true)]
param()

$ErrorActionPreference = 'Stop'
$processFile = Join-Path $PSScriptRoot 'logs\backend-processes.json'

# Stop in reverse dependency order so discovery remains available until last.
$services = @(
    [PSCustomObject]@{ Name = 'stream-service'; Port = 8085 },
    [PSCustomObject]@{ Name = 'chat-service'; Port = 8083 },
    [PSCustomObject]@{ Name = 'room-service'; Port = 8082 },
    [PSCustomObject]@{ Name = 'user-service'; Port = 8084 },
    [PSCustomObject]@{ Name = 'auth-service'; Port = 8081 },
    [PSCustomObject]@{ Name = 'gateway-service'; Port = 8080 },
    [PSCustomObject]@{ Name = 'discovery-service'; Port = 8761 }
)

function Stop-BackendProcessTree {
    param(
        [Parameter(Mandatory = $true)]
        [int]$ProcessId,

        [Parameter(Mandatory = $true)]
        [string]$ServiceName,

        [string]$ExpectedStartTimeUtc,

        [switch]$DiscoveredByPort
    )

    $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $process) {
        return $false
    }

    if ($ExpectedStartTimeUtc) {
        try {
            $expectedStart = [DateTime]::Parse(
                $ExpectedStartTimeUtc,
                [Globalization.CultureInfo]::InvariantCulture,
                [Globalization.DateTimeStyles]::RoundtripKind)
            $actualStart = $process.StartTime.ToUniversalTime()
            if ([Math]::Abs(($actualStart - $expectedStart.ToUniversalTime()).TotalSeconds) -gt 10) {
                Write-Warning "Skipped stale PID $ProcessId for $ServiceName."
                return $false
            }
        } catch {
            Write-Warning "Could not verify registered PID $ProcessId for $ServiceName."
            return $false
        }
    } elseif ($DiscoveredByPort -and $process.ProcessName -notin @('java', 'javaw')) {
        Write-Warning (
            "Port for $ServiceName belongs to $($process.ProcessName) " +
            "(PID $ProcessId), not Java. It was not stopped."
        )
        return $false
    }

    if ($PSCmdlet.ShouldProcess(
            "$ServiceName process tree (root PID $ProcessId)",
            'Stop backend service')) {
        $taskkill = Join-Path $env:SystemRoot 'System32\taskkill.exe'
        & $taskkill /PID $ProcessId /T /F | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
        }
        Write-Host "Stopped $ServiceName."
    }

    $true
}

$registeredProcesses = @()
if (Test-Path -LiteralPath $processFile) {
    try {
        $registeredProcesses = @(
            Get-Content -LiteralPath $processFile -Raw |
                ConvertFrom-Json
        )
    } catch {
        Write-Warning 'The process registry is unreadable. Falling back to service ports.'
    }
}

$handledServices = [System.Collections.Generic.HashSet[string]]::new(
    [StringComparer]::OrdinalIgnoreCase
)

foreach ($service in $services) {
    $registered = $registeredProcesses |
        Where-Object { $_.Service -eq $service.Name } |
        Select-Object -First 1

    if ($registered -and (Stop-BackendProcessTree `
            -ProcessId ([int]$registered.ProcessId) `
            -ServiceName $service.Name `
            -ExpectedStartTimeUtc $registered.StartedAtUtc)) {
        $null = $handledServices.Add($service.Name)
        continue
    }

    $listener = Get-NetTCPConnection `
        -State Listen `
        -LocalPort $service.Port `
        -ErrorAction SilentlyContinue |
        Select-Object -First 1

    if (-not $listener) {
        Write-Host "$($service.Name) is not running."
        continue
    }

    if (Stop-BackendProcessTree `
            -ProcessId ([int]$listener.OwningProcess) `
            -ServiceName $service.Name `
            -DiscoveredByPort) {
        $null = $handledServices.Add($service.Name)
    }
}

if (-not $WhatIfPreference -and (Test-Path -LiteralPath $processFile)) {
    Remove-Item -LiteralPath $processFile -Force
}

if ($WhatIfPreference) {
    Write-Host "Preview complete. $($handledServices.Count) service process tree(s) would be stopped."
} elseif ($handledServices.Count -gt 0) {
    Write-Host "Backend shutdown complete. Stopped $($handledServices.Count) service(s)."
} else {
    Write-Host 'No SyncDrive backend services needed to be stopped.'
}
