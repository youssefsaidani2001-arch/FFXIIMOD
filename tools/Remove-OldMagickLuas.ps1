<#
.SYNOPSIS
  Removes the old Blue Magick, Sword Magick and Black Magick Lua scripts from the
  FF12 Lua Loader scripts folder so the Summon System can take their slots.

.EXAMPLE
  .\Remove-OldMagickLuas.ps1 -GameDir "C:\Program Files (x86)\Steam\steamapps\common\FINAL FANTASY XII THE ZODIAC AGE"
  .\Remove-OldMagickLuas.ps1 -GameDir "..." -WhatIf     # list only, delete nothing
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Parameter(Mandatory = $true)] [string] $GameDir,
  # Add or change patterns to match your file names.
  [string[]] $Patterns = @('*Blue*Magick*.lua', '*BlueMagic*.lua', '*Azure*.lua',
                           '*Sword*Magick*.lua', '*SwordMagic*.lua',
                           '*Black*Magick*.lua', '*BlackMagic*.lua', 'Black*.lua'),
  [switch] $Backup
)

$scripts = Join-Path $GameDir 'x64\scripts'
if (-not (Test-Path $scripts)) { throw "Scripts folder not found: $scripts" }

$found = @()
foreach ($p in $Patterns) {
  $found += Get-ChildItem -Path $scripts -Recurse -File -Filter $p -ErrorAction SilentlyContinue
}
$found = $found | Sort-Object FullName -Unique | Where-Object { $_.Name -ne 'SummonSystem.lua' -and $_.FullName -notmatch '\\summon_system\\' }

if ($found.Count -eq 0) { Write-Host 'Nothing matched. Adjust -Patterns.'; return }

Write-Host "Matched $($found.Count) file(s):"
$found | ForEach-Object { Write-Host "  $($_.FullName)" }

if ($Backup) {
  $bak = Join-Path $GameDir ('x64\scripts_backup_' + (Get-Date -Format 'yyyyMMdd_HHmmss'))
  New-Item -ItemType Directory -Path $bak -Force | Out-Null
  $found | ForEach-Object { Copy-Item $_.FullName -Destination $bak }
  Write-Host "Backed up to $bak"
}

foreach ($f in $found) {
  if ($PSCmdlet.ShouldProcess($f.FullName, 'Delete')) { Remove-Item $f.FullName -Force }
}
Write-Host 'Done. Restart the game so the Lua Loader drops the removed scripts.'
