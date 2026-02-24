$content = Get-Content 'd:\myfolder\動画生成\台本作成\マシュマロ実験\script.md' -Encoding UTF8
$total = 0
foreach ($line in $content) {
    if ($line -match '^(ずんだもん|めたん)：(.+)$') {
        $total += $Matches[2].Length
    }
}
Write-Output "Total: $total"
