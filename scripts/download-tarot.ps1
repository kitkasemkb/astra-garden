# Download Rider-Waite Tarot Images (Public Domain since 1909)
# Source: Wikimedia Commons — commons.wikimedia.org
# Run from project root: .\scripts\download-tarot.ps1

$outDir = "public\tarot"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$base = "https://commons.wikimedia.org/wiki/Special:FilePath"

$cards = @(
  # ── Major Arcana ──────────────────────────────────────────────────
  @{ file="major-0.jpg";  url="$base/RWS_Tarot_00_Fool.jpg" },
  @{ file="major-1.jpg";  url="$base/RWS_Tarot_01_Magician.jpg" },
  @{ file="major-2.jpg";  url="$base/RWS_Tarot_02_High_Priestess.jpg" },
  @{ file="major-3.jpg";  url="$base/RWS_Tarot_03_Empress.jpg" },
  @{ file="major-4.jpg";  url="$base/RWS_Tarot_04_Emperor.jpg" },
  @{ file="major-5.jpg";  url="$base/RWS_Tarot_05_Hierophant.jpg" },
  @{ file="major-6.jpg";  url="$base/RWS_Tarot_06_Lovers.jpg" },
  @{ file="major-7.jpg";  url="$base/RWS_Tarot_07_Chariot.jpg" },
  @{ file="major-8.jpg";  url="$base/RWS_Tarot_08_Strength.jpg" },
  @{ file="major-9.jpg";  url="$base/RWS_Tarot_09_Hermit.jpg" },
  @{ file="major-10.jpg"; url="$base/RWS_Tarot_10_Wheel_of_Fortune.jpg" },
  @{ file="major-11.jpg"; url="$base/RWS_Tarot_11_Justice.jpg" },
  @{ file="major-12.jpg"; url="$base/RWS_Tarot_12_Hanged_Man.jpg" },
  @{ file="major-13.jpg"; url="$base/RWS_Tarot_13_Death.jpg" },
  @{ file="major-14.jpg"; url="$base/RWS_Tarot_14_Temperance.jpg" },
  @{ file="major-15.jpg"; url="$base/RWS_Tarot_15_Devil.jpg" },
  @{ file="major-16.jpg"; url="$base/RWS_Tarot_16_Tower.jpg" },
  @{ file="major-17.jpg"; url="$base/RWS_Tarot_17_Star.jpg" },
  @{ file="major-18.jpg"; url="$base/RWS_Tarot_18_Moon.jpg" },
  @{ file="major-19.jpg"; url="$base/RWS_Tarot_19_Sun.jpg" },
  @{ file="major-20.jpg"; url="$base/RWS_Tarot_20_Judgement.jpg" },
  @{ file="major-21.jpg"; url="$base/RWS_Tarot_21_World.jpg" },
  # ── Wands ─────────────────────────────────────────────────────────
  @{ file="wands-1.jpg";      url="$base/Wands01.jpg" },
  @{ file="wands-2.jpg";      url="$base/Wands02.jpg" },
  @{ file="wands-3.jpg";      url="$base/Wands03.jpg" },
  @{ file="wands-4.jpg";      url="$base/Wands04.jpg" },
  @{ file="wands-5.jpg";      url="$base/Wands05.jpg" },
  @{ file="wands-6.jpg";      url="$base/Wands06.jpg" },
  @{ file="wands-7.jpg";      url="$base/Wands07.jpg" },
  @{ file="wands-8.jpg";      url="$base/Wands08.jpg" },
  @{ file="wands-9.jpg";      url="$base/Wands09.jpg" },
  @{ file="wands-10.jpg";     url="$base/Wands10.jpg" },
  @{ file="wands-page.jpg";   url="$base/Wands11.jpg" },
  @{ file="wands-knight.jpg"; url="$base/Wands12.jpg" },
  @{ file="wands-queen.jpg";  url="$base/Wands13.jpg" },
  @{ file="wands-king.jpg";   url="$base/Wands14.jpg" },
  # ── Cups ──────────────────────────────────────────────────────────
  @{ file="cups-1.jpg";      url="$base/Cups01.jpg" },
  @{ file="cups-2.jpg";      url="$base/Cups02.jpg" },
  @{ file="cups-3.jpg";      url="$base/Cups03.jpg" },
  @{ file="cups-4.jpg";      url="$base/Cups04.jpg" },
  @{ file="cups-5.jpg";      url="$base/Cups05.jpg" },
  @{ file="cups-6.jpg";      url="$base/Cups06.jpg" },
  @{ file="cups-7.jpg";      url="$base/Cups07.jpg" },
  @{ file="cups-8.jpg";      url="$base/Cups08.jpg" },
  @{ file="cups-9.jpg";      url="$base/Cups09.jpg" },
  @{ file="cups-10.jpg";     url="$base/Cups10.jpg" },
  @{ file="cups-page.jpg";   url="$base/Cups11.jpg" },
  @{ file="cups-knight.jpg"; url="$base/Cups12.jpg" },
  @{ file="cups-queen.jpg";  url="$base/Cups13.jpg" },
  @{ file="cups-king.jpg";   url="$base/Cups14.jpg" },
  # ── Swords ────────────────────────────────────────────────────────
  @{ file="swords-1.jpg";      url="$base/Swords01.jpg" },
  @{ file="swords-2.jpg";      url="$base/Swords02.jpg" },
  @{ file="swords-3.jpg";      url="$base/Swords03.jpg" },
  @{ file="swords-4.jpg";      url="$base/Swords04.jpg" },
  @{ file="swords-5.jpg";      url="$base/Swords05.jpg" },
  @{ file="swords-6.jpg";      url="$base/Swords06.jpg" },
  @{ file="swords-7.jpg";      url="$base/Swords07.jpg" },
  @{ file="swords-8.jpg";      url="$base/Swords08.jpg" },
  @{ file="swords-9.jpg";      url="$base/Swords09.jpg" },
  @{ file="swords-10.jpg";     url="$base/Swords10.jpg" },
  @{ file="swords-page.jpg";   url="$base/Swords11.jpg" },
  @{ file="swords-knight.jpg"; url="$base/Swords12.jpg" },
  @{ file="swords-queen.jpg";  url="$base/Swords13.jpg" },
  @{ file="swords-king.jpg";   url="$base/Swords14.jpg" },
  # ── Pentacles ─────────────────────────────────────────────────────
  @{ file="pents-1.jpg";      url="$base/Pents01.jpg" },
  @{ file="pents-2.jpg";      url="$base/Pents02.jpg" },
  @{ file="pents-3.jpg";      url="$base/Pents03.jpg" },
  @{ file="pents-4.jpg";      url="$base/Pents04.jpg" },
  @{ file="pents-5.jpg";      url="$base/Pents05.jpg" },
  @{ file="pents-6.jpg";      url="$base/Pents06.jpg" },
  @{ file="pents-7.jpg";      url="$base/Pents07.jpg" },
  @{ file="pents-8.jpg";      url="$base/Pents08.jpg" },
  @{ file="pents-9.jpg";      url="$base/Pents09.jpg" },
  @{ file="pents-10.jpg";     url="$base/Pents10.jpg" },
  @{ file="pents-page.jpg";   url="$base/Pents11.jpg" },
  @{ file="pents-knight.jpg"; url="$base/Pents12.jpg" },
  @{ file="pents-queen.jpg";  url="$base/Pents13.jpg" },
  @{ file="pents-king.jpg";   url="$base/Pents14.jpg" }
)

$ok = 0; $fail = 0
foreach ($c in $cards) {
  $dest = Join-Path $outDir $c.file
  if (Test-Path $dest) { Write-Host "SKIP $($c.file)" -ForegroundColor DarkGray; $ok++; continue }
  try {
    Invoke-WebRequest -Uri $c.url -OutFile $dest -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    Write-Host "OK   $($c.file)" -ForegroundColor Green
    $ok++
  } catch {
    Write-Host "FAIL $($c.file) — $($_.Exception.Message)" -ForegroundColor Red
    $fail++
  }
  Start-Sleep -Milliseconds 200
}

Write-Host "`nDownloaded: $ok  Failed: $fail" -ForegroundColor Cyan
if ($fail -gt 0) { Write-Host "Run again to retry failed files" -ForegroundColor Yellow }
