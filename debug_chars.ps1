$content = [System.IO.File]::ReadAllText("app\page.tsx", [System.Text.Encoding]::UTF8)
# Find the corrupted sequence - look for the em dash area
$idx = $content.IndexOf("summaries")
if ($idx -ge 0) {
    $snippet = $content.Substring($idx + 9, 20)
    Write-Host "Snippet after 'summaries': [$snippet]"
    foreach ($c in $snippet.ToCharArray()) {
        Write-Host "Char: $([int]$c) -> '$c'"
    }
}
