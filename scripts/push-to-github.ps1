<#
Push the current workspace to a GitHub repository (PowerShell script).

Usage (recommended, sets PAT in environment for a single session):

# In PowerShell (set PAT for this session only):
$env:GITHUB_PAT = 'ghp_...your_token_here'
# Then run the script from the repository root:
.\scripts\push-to-github.ps1 -RepoUrl 'https://github.com/abhakeemshah/attendRevolution.git'

Notes:
- This script does not store your PAT on disk. It only uses the environment variable if present.
- Preferred flow: set an environment variable or use your local git credential helper / SSH key.
- If you prefer SSH, ensure your SSH key is loaded and use the SSH repo URL instead (git@github.com:owner/repo.git).
#>

param(
    [string]$RepoUrl = 'https://github.com/abhakeemshah/attendRevolution.git'
)

function Exec-Git {
    param([string]$Args)
    Write-Host "git $Args"
    $output = git $Args 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host $output -ForegroundColor Yellow
    }
    return $LASTEXITCODE
}

# Ensure we're in the repository root (script should be run from repo root)
$RepoRoot = Get-Location

Write-Host "Repository root: $RepoRoot"

# Initialize git repo if not already
if (Exec-Git 'rev-parse --is-inside-work-tree' -ne 0) {
    Write-Host 'No git repository found. Initializing new git repository.'
    Exec-Git 'init'
}

# Add all files and create initial commit if none exist
try {
    $status = git status --porcelain
} catch {
    $status = ''
}

if ($status.Trim().Length -gt 0) {
    Write-Host 'Staging files...'
    Exec-Git 'add .'
    # Create commit (allow amend if no changes)
    Exec-Git 'commit -m "Initial commit: upload workspace"' | Out-Null
} else {
    Write-Host 'No unstaged changes detected.'
}

# Configure remote
try {
    git remote remove origin 2>$null
} catch {}

Exec-Git "remote add origin $RepoUrl"

# Push using PAT if available, otherwise push using configured credentials
if ($env:GITHUB_PAT) {
    # Insert token into URL for this push only (do not save token to disk)
    $authUrl = $RepoUrl -replace '^https://', "https://$($env:GITHUB_PAT)@"
    Write-Host 'Pushing to remote using GITHUB_PAT environment variable. The token will not be saved to disk.'
    Exec-Git "push -u $authUrl main" | Out-Null
} else {
    Write-Host 'No GITHUB_PAT found in environment. Attempting standard push; ensure your credentials (credential helper or SSH) are configured.'
    Exec-Git 'push -u origin main' | Out-Null
}

Write-Host 'Push script finished. Verify the repository on GitHub to confirm upload.' -ForegroundColor Green
