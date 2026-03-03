$scriptPath = Get-ChildItem -LiteralPath "d:\myfolder\動画生成\台本作成" -Directory | Where-Object { $_.Name -like "*右脳*迷信*" } | Select-Object -First 1
$filePath = Join-Path $scriptPath.FullName "script.md"
Write-Host "Reading: $filePath"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
$lines = $content -split "`n" | Where-Object { $_ -match '^(ずんだもん|めたん)：' }
$totalChars = 0
$blockChars = @{}
$currentBlock = "Unknown"
foreach($rawLine in ($content -split "`n")) {
    if($rawLine -match '## 【Block (\d+)') { $currentBlock = "Block $($Matches[1])" }
    if($rawLine -match '^(ずんだもん|めたん)：') {
        $text = ($rawLine -replace '^(ずんだもん|めたん)：', '').Trim()
        $totalChars += $text.Length
        if(-not $blockChars.ContainsKey($currentBlock)) { $blockChars[$currentBlock] = 0 }
        $blockChars[$currentBlock] += $text.Length
    }
}
Write-Host "セリフ総行数: $($lines.Count)"
Write-Host "セリフ総文字数: $totalChars"
Write-Host "---"
foreach($key in ($blockChars.Keys | Sort-Object)) { Write-Host "$key : $($blockChars[$key])文字" }
Write-Host "---"
$longLines = @()
foreach($line in $lines) {
    $text = ($line -replace '^(ずんだもん|めたん)：', '').Trim()
    if($text.Length -gt 60) { $longLines += "$($text.Length)文字: $($line.Trim())" }
}
Write-Host "60文字超えセリフ数: $($longLines.Count)"
foreach($l in $longLines) { Write-Host $l }
