# StageGrid AI - Event Anchor Mystery Matrix & Twist Game

An interactive stage quiz and mystery grid game built for event anchors, MCs, and organizers to run high-energy team competitions on large LED screens and projectors. Features 16 numbered mystery tiles, live scoreboard management, synthesized gameshow audio, and dramatic game-modifying **"AI Twist"** cards.

---

## How to Host on GitHub Pages (Step-by-Step)

This repository is pre-configured with:
- **Relative asset paths** (`base: './'` in `vite.config.ts`) so scripts and styles load properly on any repository name or custom domain.
- **Automated GitHub Actions CI/CD** (`.github/workflows/deploy.yml`) that builds and publishes the site whenever you push to `main`.

### Step 1: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Enter a repository name (e.g., `stagegrid-game` or `anchor-matrix`).
3. Set the repository to **Public** (GitHub Pages is free for public repositories).
4. Do **not** initialize with a README (this project already has files).
5. Click **Create repository**.

### Step 2: Push Your Project to GitHub
In your local terminal (inside this project folder), run:

```bash
# Initialize git if not already initialized
git init

# Add all project files
git add .

# Create your initial commit
git commit -m "Initial commit of StageGrid AI game"

# Rename default branch to main
git branch -M main

# Link to your new GitHub repository (replace with your GitHub username & repo name)
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages in Repository Settings
1. Open your repository on GitHub.
2. Click **Settings** (top navigation tab).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Source**, select:
   - **GitHub Actions** (do NOT choose "Deploy from a branch").
5. That's it!

### Step 4: Access Your Live Game URL
- Within 1–2 minutes, the GitHub Actions workflow will finish building and deploying.
- You can watch the deployment progress under the **Actions** tab of your repository.
- Once complete, your live stage game will be available at:
  ```
  https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/
  ```

---

## Stage Controls & Keyboard Hotkeys

Designed for quick anchor/technician operation during live events:

| Hotkey | Action | Description |
| :--- | :--- | :--- |
| **F** | **Fullscreen** | Toggles full-screen projection for LED walls / projectors |
| **Space** | **Timer / Play** | Starts or pauses the 30-second countdown timer |
| **C** | **Correct Chime** | Plays upbeat gameshow success chime |
| **W** | **Wrong Buzzer** | Plays gameshow penalty buzzer |
| **T** | **Twist Sting** | Plays dramatic high-voltage suspense chord |
| **V** | **Victory Fanfare** | Plays champion fanfare for the podium ceremony |
| **Esc** | **Close Modal** | Closes any open question, twist, or settings modal |

---

## Local Development & Testing

```bash
# Install dependencies
npm install

# Start local dev server (port 3000)
npm run dev

# Run pure logic unit tests
npm test

# Build production bundle
npm run build
```
