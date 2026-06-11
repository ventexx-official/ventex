$files = Get-ChildItem -Path "c:\Users\HP\Ventex\app" -Recurse -Include *.tsx,*.ts
foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName
    $changed = $false
    
    $newContent = $content -replace '\bbg-white\b', 'bg-[var(--card-bg)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }

    $newContent = $content -replace '\bbg-gray-50\b', 'bg-[var(--bg2)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }

    $newContent = $content -replace '\bbg-gray-100\b', 'bg-[var(--bg3)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }
    
    $newContent = $content -replace '\bbg-gray-900\b', 'bg-[var(--card-bg)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }

    $newContent = $content -replace '\bbg-zinc-900\b', 'bg-[var(--card-bg)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }
    
    $newContent = $content -replace '\bbg-gray-800\b', 'bg-[var(--bg2)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }
    
    $newContent = $content -replace '\bbg-zinc-950\b', 'bg-[var(--bg)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }

    $newContent = $content -replace '\btext-gray-900\b', 'text-[var(--text)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }

    $newContent = $content -replace '\btext-gray-800\b', 'text-[var(--text)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }

    $newContent = $content -replace '\btext-gray-700\b', 'text-[var(--text2)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }

    $newContent = $content -replace '\btext-gray-600\b', 'text-[var(--text2)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }
    
    $newContent = $content -replace '\btext-gray-500\b', 'text-[var(--text3)]'
    if ($newContent -cne $content) { $changed = $true; $content = $newContent }

    if ($changed) {
        [System.IO.File]::WriteAllText($file.FullName, ($content -join "`r`n"))
    }
}
