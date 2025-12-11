# PowerShell script to fix Flutter warnings

$libPath = "C:\projects\trace-plus\lab\Flutter\trace_mobile_new\lib"

# Get all Dart files
$dartFiles = Get-ChildItem -Path $libPath -Filter *.dart -Recurse

foreach ($file in $dartFiles) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    # Fix super parameter warnings - more comprehensive patterns
    # Pattern 1: {Key? key} : super(key: key)
    $content = $content -replace '\{Key\?\s+key\}\s*:\s*super\(key:\s*key\)', '{super.key}'

    # Pattern 2: {required Key? key} : super(key: key)
    $content = $content -replace '\{required\s+Key\?\s+key\}\s*:\s*super\(key:\s*key\)', '{super.key}'

    # Pattern 3: Other parameters with key at start
    $content = $content -replace '\{Key\?\s+key,\s*([^}]+)\}\s*:\s*super\(key:\s*key\)', '{super.key, $1}'

    # Pattern 4: Other parameters with key at end
    $content = $content -replace '\{([^}]+),\s*Key\?\s+key\}\s*:\s*super\(key:\s*key\)', '{$1, super.key}'

    # Save if changed
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "Done fixing super parameters!"
