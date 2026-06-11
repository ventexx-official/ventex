# Scan for remaining corrupted chars using codepoint detection
$corruptEmDash = [string][char]195 + [string][char]162 + [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]8364 + [string][char]157
$corruptRSingle = [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]153
$corruptLSingle = [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]152
$corruptRDouble = [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]157
$corruptLDouble = [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]156
$corruptEllipsis = [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]166

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$fixCount = 0

$files = Get-ChildItem -Path "." -Recurse -Include *.tsx,*.ts,*.css -ErrorAction SilentlyContinue
foreach ($file in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $original = $content
        $content = $content.Replace($corruptEmDash, ' - ')
        $content = $content.Replace($corruptRSingle, "'")
        $content = $content.Replace($corruptLSingle, "'")
        $content = $content.Replace($corruptRDouble, '"')
        $content = $content.Replace($corruptLDouble, '"')
        $content = $content.Replace($corruptEllipsis, '...')
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            Write-Host "Fixed: $($file.FullName)"
            $fixCount++
        }
    } catch {
        Write-Host "Error: $($file.Name)"
    }
}
Write-Host "Total fixed: $fixCount"
