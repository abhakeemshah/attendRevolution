# Upload Guide — Push this project to your private GitHub repo

This guide shows two secure ways to upload the local project to your private GitHub repository: using a Personal Access Token (PAT) or using SSH keys. Use the method you prefer.

Important: Do not share your PAT or private SSH keys.

Option A — Personal Access Token (recommended for one-off uploads)

1. Create a PAT on GitHub with `repo` scope.
2. Open PowerShell in the project root (where this README is).
3. Set the PAT for the current session (replace the token string):

```powershell
$env:GITHUB_PAT = 'ghp_...your_token_here'
```

4. Run the included push script:

```powershell
.\scripts\push-to-github.ps1 -RepoUrl 'https://github.com/abhakeemshah/attendRevolution.git'
```

5. After the push, remove the PAT from the session:

```powershell
Remove-Item Env:\GITHUB_PAT
```

Option B — SSH (preferred for repeated work)

1. Create an SSH key if you don't have one: `ssh-keygen -t ed25519 -C "your_email@example.com"`.
2. Add the public key (`~/.ssh/id_ed25519.pub`) to your GitHub account (Settings → SSH and GPG keys).
3. Ensure your SSH agent is running and key is loaded: `ssh-add ~/.ssh/id_ed25519`.
4. Use the SSH repo URL and run the script or push manually:

```powershell
git remote add origin git@github.com:abhakeemshah/attendRevolution.git
git push -u origin main
```

Manual push (if you prefer not to use the script)

```powershell
# Initialize repo (if not already)
git init
git add .
git commit -m "Initial commit: upload workspace"
# Add remote (HTTPS or SSH)
git remote add origin https://github.com/abhakeemshah/attendRevolution.git
# Then push (HTTPS will prompt for credentials or use PAT in env)
git push -u origin main
```

Verify on GitHub

- Visit https://github.com/abhakeemshah/attendRevolution to confirm files are uploaded.

If you want, you can grant me (or a CI user) access temporarily to complete the push; otherwise follow the steps above and paste output or errors here and I'll help troubleshoot.