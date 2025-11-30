# GitHub Authentication Setup

## You Need to Authenticate

GitHub requires authentication to push code. Here are your options:

## Option 1: Personal Access Token (Recommended)

### Step 1: Create Personal Access Token

1. **Go to GitHub:**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Your Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Create New Token:**
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - Note: Give it a name like "Allo Bricolage"
   - Expiration: Choose duration (90 days, 1 year, or no expiration)
   - **Select scopes:**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (if using GitHub Actions)
   - Click **"Generate token"**

3. **Copy the Token:**
   - **IMPORTANT:** Copy the token immediately (you won't see it again!)
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Use Token to Push

When you run `git push`, it will ask for:
- **Username:** `mohammedilyasmoktary-droid`
- **Password:** Paste your **Personal Access Token** (not your GitHub password!)

## Option 2: Use SSH (Alternative)

### Step 1: Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

Press Enter to accept default location.

### Step 2: Add SSH Key to GitHub

1. **Copy your public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output.

2. **Add to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click **"New SSH key"**
   - Title: "My Mac"
   - Key: Paste your public key
   - Click **"Add SSH key"**

### Step 3: Change Remote to SSH

```bash
cd /Users/ilyasmoktary/Documents/foryou
git remote set-url origin git@github.com:mohammedilyasmoktary-droid/allo-bricolage.git
git push -u origin main
```

## Option 3: Use GitHub Desktop (Easiest)

1. **Download GitHub Desktop:**
   - https://desktop.github.com

2. **Login to GitHub:**
   - Open GitHub Desktop
   - Sign in with your GitHub account

3. **Add Repository:**
   - File → Add Local Repository
   - Select: `/Users/ilyasmoktary/Documents/foryou`
   - Click "Publish repository"
   - It will push automatically!

## Quick Push Command (After Authentication)

Once authenticated, run:

```bash
cd /Users/ilyasmoktary/Documents/foryou
git push -u origin main
```

## Which Option to Choose?

- **Personal Access Token:** Quick, works immediately
- **SSH:** More secure, no password needed later
- **GitHub Desktop:** Easiest, visual interface

Choose the one you prefer!

