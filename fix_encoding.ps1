# Fix corrupted encoding using exact Unicode codepoints identified from debug
# Corrupted em-dash sequence: chars 195,162,226,8218,172,226,8364,157

# Build the corrupted em-dash string from exact codepoints
$corruptEmDash = [string][char]195 + [string][char]162 + [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]8364 + [string][char]157

# Build the corrupted en-dash (if exists): similar pattern but different ending
# Also handle 195,162,226,8218,172,226,128,147 for en-dash
$corruptEnDash = [string][char]195 + [string][char]162 + [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]147

# Corrupted right single quote: 226, 8218, 172, 226, 128, 153 (â€™)
$corruptRSingle = [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]153

# Corrupted left single quote: 226, 8218, 172, 226, 128, 152
$corruptLSingle = [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]152

# Corrupted right double quote: 226, 8218, 172, 226, 128, 157 
$corruptRDouble = [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]157

# Corrupted left double quote: 226, 8218, 172, 226, 128, 156
$corruptLDouble = [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]156

# Corrupted ellipsis: 226, 8218, 172, 226, 128, 166
$corruptEllipsis = [string][char]226 + [string][char]8218 + [string][char]172 + [string][char]226 + [string][char]128 + [string][char]166

Write-Host "Corrupted em-dash string length: $($corruptEmDash.Length)"
Write-Host "Searching for corrupted text..."

$files = Get-ChildItem -Path "." -Recurse -Include *.tsx,*.ts,*.css -ErrorAction SilentlyContinue

$fixCount = 0
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

foreach ($file in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $original = $content

        $content = $content.Replace($corruptEmDash, ' - ')
        $content = $content.Replace($corruptEnDash, ' - ')
        $content = $content.Replace($corruptRSingle, "'")
        $content = $content.Replace($corruptLSingle, "'")
        $content = $content.Replace($corruptRDouble, '"')
        $content = $content.Replace($corruptLDouble, '"')
        $content = $content.Replace($corruptEllipsis, '...')

        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            Write-Host "Fixed: $($file.Name)"
            $fixCount++
        }
    } catch {
        Write-Host "Error: $($file.Name) - $_"
    }
}

Write-Host ""
Write-Host "Total files fixed: $fixCount"
