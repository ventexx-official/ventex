$files = Get-ChildItem -Path "." -Recurse -Include *.tsx,*.ts,*.css -ErrorAction SilentlyContinue

$fixCount = 0
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Identify remaining corruptions by their byte sequences
# Corrupted right arrow (→) Ã¢â€ â€™ : 195 162 226 128 160 226 128 153
$corruptRightArrow = [string][char]195 + [string][char]162 + [string][char]226 + [string][char]8224 + [string][char]226 + [string][char]8217

# Using simple string replacements for the rest as PowerShell can handle them if read/written as UTF8
foreach ($file in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $original = $content

        # Direct string replacements for what we saw in grep
        $content = $content.Replace("Ã¢â€ â€™", "→")
        $content = $content.Replace("Ã‚Â·", "·")
        $content = $content.Replace("Ã¢â‚¬â€œ", "–")
        $content = $content.Replace("Ã¢â€ â‚¬", "─")
        $content = $content.Replace("Ã°Å¸Å¡â‚¬", "🚀")
        $content = $content.Replace("Ã°Å¸â€™Â¬", "💬")
        $content = $content.Replace("Ã°Å¸Â¤Â ", "🤝")
        $content = $content.Replace("Ã¢Å“â€¦", "✅")
        $content = $content.Replace("Ã°Å¸Å½â€°", "🎉")
        $content = $content.Replace("Ã°Å¸â€œÂ¦", "📦")
        $content = $content.Replace("Ã°Å¸Â¤â€“", "🤖")
        $content = $content.Replace("Ã¢Â Å’", "❌")
        $content = $content.Replace("Ã¢â€šÂ¹", "₹")
        $content = $content.Replace("Ã¢Å¡Â Ã¯Â¸Â ", "⚠️")
        $content = $content.Replace("Ã¢Â Â³", "⏳")
        $content = $content.Replace("Ã°Å¸Å’Â ", "🌐")
        $content = $content.Replace("Ã¢Å“â€œ", "✓")
        $content = $content.Replace("Ã°Å¸Å’Å¸", "🌟")
        $content = $content.Replace("Ã¢â€ Â ", "←")
        $content = $content.Replace("Ã¢â€¢Â ", "═")

        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            Write-Host "Fixed: $($file.Name)"
            $fixCount++
        }
    } catch {
        Write-Host "Error: $($file.Name) - $_"
    }
}

Write-Host "Total files fixed: $fixCount"
