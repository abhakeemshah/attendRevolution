# GitHub Setup Guide

## Repository Information
- **GitHub Username:** abhakeemshah
- **Email:** abdulhakeemshah962@gmail.com
- **Repository Name:** attendRevolution (or your preferred name)

## Steps to Connect to GitHub

### Option 1: Create New Repository on GitHub (Recommended)

1. **Go to GitHub and create a new repository:**
   - Visit: https://github.com/new
   - Repository name: `attendRevolution` (or your preferred name)
   - Description: "QR-Based Proxy-Free Attendance System for Academic Institutions"
   - Choose: **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Connect your local repository to GitHub:**

   ```bash
   # Add GitHub remote (replace YOUR_USERNAME with abhakeemshah)
   git remote add origin https://github.com/abhakeemshah/attendRevolution.git
   
   # Or if you prefer SSH:
   git remote add origin git@github.com:abhakeemshah/attendRevolution.git
   
   # Rename branch to main (GitHub standard)
   git branch -M main
   
   # Push to GitHub
   git push -u origin main
   ```

### Option 2: Use Existing Repository

If you already have a repository on GitHub:

```bash
# Add your existing repository as remote
git remote add origin https://github.com/abhakeemshah/YOUR_REPO_NAME.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Verify Connection

After pushing, verify the connection:

```bash
# Check remote configuration
git remote -v

# Should show:
# origin  https://github.com/abhakeemshah/attendRevolution.git (fetch)
# origin  https://github.com/abhakeemshah/attendRevolution.git (push)
```

## Future Git Workflow

### Daily Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push
```

### Creating a New Branch

```bash
# Create and switch to new branch
git checkout -b feature/new-feature-name

# Make changes, commit, then push
git push -u origin feature/new-feature-name
```

### Pull Latest Changes

```bash
# Pull latest changes from GitHub
git pull origin main
```

## GitHub Repository Settings

After pushing, consider:

1. **Add repository description** on GitHub
2. **Add topics/tags:** attendance, qr-code, nodejs, express, academic
3. **Set up branch protection** (if needed)
4. **Add collaborators** (if working in a team)
5. **Enable GitHub Pages** (if you want to host documentation)

## Troubleshooting

### Authentication Issues

If you get authentication errors:

**Option 1: Use Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` permissions
3. Use token as password when pushing

**Option 2: Use SSH Keys**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "abdulhakeemshah962@gmail.com"`
2. Add SSH key to GitHub: Settings → SSH and GPG keys
3. Use SSH URL for remote: `git@github.com:abhakeemshah/attendRevolution.git`

### Push Rejected

If push is rejected:
```bash
# Pull and merge remote changes first
git pull origin main --rebase

# Then push again
git push origin main
```

## Quick Commands Reference

```bash
# Initialize repository (already done)
git init

# Configure user (already done)
git config user.name "Abdul Hakeem Shah"
git config user.email "abdulhakeemshah962@gmail.com"

# Add files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull from GitHub
git pull origin main

# Check status
git status

# View commit history
git log

# View remote repositories
git remote -v
```

## Next Steps

1. ✅ Git repository initialized
2. ✅ Initial commit created
3. ⏭️ Create GitHub repository
4. ⏭️ Connect local repo to GitHub
5. ⏭️ Push code to GitHub
6. ⏭️ Set up repository settings on GitHub

