# Deployment Guide — dictteasy.com

This guide walks you through deploying the app to a Hetzner VPS from scratch. It is written for someone who has never deployed a web app before, so every step is explained and every command is ready to copy-paste.

The final result will be:

- **https://www.dictteasy.com** — the React frontend (static files served by Caddy)
- **https://www.dictteasy.com/api/...** — the Bun backend (proxied by Caddy)
- Automatic HTTPS via Let's Encrypt (handled by Caddy)
- The Bun server running as a systemd service that restarts automatically on crash or reboot

---

## Table of contents

1. [Buy and access the VPS](#1-buy-and-access-the-vps)
2. [Initial server setup](#2-initial-server-setup)
3. [Install dependencies](#3-install-dependencies)
4. [Set up DNS](#4-set-up-dns)
5. [Clone and build the app](#5-clone-and-build-the-app)
6. [Set up environment variables](#6-set-up-environment-variables)
7. [Set up Resend for email](#7-set-up-resend-for-email)
8. [Run database migrations](#8-run-database-migrations)
9. [Set up Caddy (web server + HTTPS)](#9-set-up-caddy-web-server--https)
10. [Create a systemd service for the Bun server](#10-create-a-systemd-service-for-the-bun-server)
11. [Verify everything works](#11-verify-everything-works)
12. [Maintenance](#12-maintenance)

---

## 1. Buy and access the VPS

### 1.1 Buy a Hetzner VPS

1. Go to [https://www.hetzner.com/cloud](https://www.hetzner.com/cloud) and create an account.
2. Click **New Project**, name it `dictteasy`, and open it.
3. Click **Add Server** and choose:
   - **Location**: any EU or US location close to your users.
   - **Image**: **Ubuntu 24.04** (LTS, recommended).
   - **Type**: **CX22** (2 vCPU, 4 GB RAM, 40 GB disk). This is more than enough to start.
   - **SSH keys**: click **Add SSH key** and paste your public key (see below if you don't have one).
   - Leave everything else as default.
4. Click **Create & Buy**. The server will be ready in about 30 seconds. Note the **IPv4 address** shown in the dashboard (e.g. `203.0.113.42`). You will use it throughout this guide.

### 1.2 Generate an SSH key (skip if you already have one)

On your **local machine**, run:

```bash
ssh-keygen -t ed25519 -C "dictteasy-deploy"
```

Press Enter to accept the default location (`~/.ssh/id_ed25519`). When asked for a passphrase you can leave it empty or set one.

Then display your public key so you can paste it into Hetzner:

```bash
cat ~/.ssh/id_ed25519.pub
```

### 1.3 Connect to the server

Replace `YOUR_SERVER_IP` with the IP shown in the Hetzner dashboard.

```bash
ssh root@YOUR_SERVER_IP
```

Type `yes` when asked about the host fingerprint. You are now inside the server.

---

## 2. Initial server setup

You should never run the app as `root`. This section creates a non-root user, hardens the firewall, and keeps the system up to date.

### 2.1 Update the system

```bash
apt update && apt upgrade -y
```

### 2.2 Create a non-root user

```bash
adduser deploy
```

Follow the prompts. Set a strong password. The other fields (Full Name, etc.) can be left blank.

Grant the user `sudo` privileges:

```bash
usermod -aG sudo deploy
```

Copy your SSH key to the new user so you can log in without a password:

```bash
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

### 2.3 Configure the firewall

Allow only SSH, HTTP, and HTTPS traffic:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

Type `y` when prompted. Verify the rules:

```bash
ufw status
```

### 2.4 Switch to the deploy user

From now on, use the `deploy` user for everything:

```bash
su - deploy
```

Or log out and reconnect as `deploy`:

```bash
ssh deploy@YOUR_SERVER_IP
```

---

## 3. Install dependencies

### 3.1 Install Git

```bash
sudo apt install -y git
```

### 3.2 Install Bun

Bun is the JavaScript runtime used by the backend.

```bash
curl -fsSL https://bun.sh/install | bash
```

After installation, reload your shell so `bun` is available:

```bash
source ~/.bashrc
```

Verify Bun is installed:

```bash
bun --version
```

---

## 4. Set up DNS

Before Caddy can issue an HTTPS certificate, the domain must point to your server.

1. Log in to the registrar where you bought `dictteasy.com`.
2. Open the DNS settings for the domain.
3. Add or update the following **A records**:

   | Type | Name | Value            | TTL  |
   |------|------|------------------|------|
   | A    | @    | YOUR_SERVER_IP   | 3600 |
   | A    | www  | YOUR_SERVER_IP   | 3600 |

   `@` means the root domain (`dictteasy.com`). `www` is the `www` subdomain.

4. Save the records. DNS propagation can take a few minutes up to a couple of hours. You can check propagation with:

   ```bash
   dig +short www.dictteasy.com
   ```

   When it shows your server IP, you are ready to continue.

---

## 5. Clone and build the app

### 5.1 Clone the repository

```bash
cd /home/deploy
git clone https://github.com/YOUR_ORG/dictat-interactiu.git app
cd app
```

Replace `YOUR_ORG/dictat-interactiu` with your actual GitHub repository path.

### 5.2 Install all dependencies

From the repo root (the monorepo root), install everything:

```bash
bun install
```

### 5.3 Build the frontend

The Vite build produces static files in `packages/client/dist/`. Caddy will serve these files directly.

```bash
cd packages/client
bun run build
cd ../..
```

The output will be at `/home/deploy/app/packages/client/dist/`.

---

## 6. Set up environment variables

The server reads its configuration from a `.env` file. Create it in the server package:

```bash
nano /home/deploy/app/packages/server/.env
```

Paste the following, replacing each placeholder with your real values:

```dotenv
# Path to the SQLite database file.
# This file will be created automatically on first run.
DATABASE_URL=/home/deploy/data/dictteasy.db

# Resend API key for sending emails.
# Get this from https://resend.com (see Section 7).
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXX

# The "from" address used for outgoing emails.
EMAIL_FROM=noreply@dictteasy.com

# The public URL of the app.
BASE_URL=https://www.dictteasy.com

# Port the Bun server listens on.
PORT=3000

# Allowed CORS origin. Must match BASE_URL in production.
CORS_ORIGIN=https://www.dictteasy.com
```

Save and close the file (`Ctrl+O`, Enter, `Ctrl+X` in nano).

Secure the file so only the `deploy` user can read it:

```bash
chmod 600 /home/deploy/app/packages/server/.env
```

Create the directory where the database file will live:

```bash
mkdir -p /home/deploy/data
```

---

## 7. Set up Resend for email

The app uses [Resend](https://resend.com) to send transactional emails.

1. Go to [https://resend.com](https://resend.com) and create a free account.
2. In the dashboard, go to **Domains** and add `dictteasy.com`. Resend will give you DNS records (TXT, MX, DKIM) to add to your domain registrar. Add them.
3. Once the domain is verified, go to **API Keys**, create a new key, and copy it.
4. Paste the key as the value of `RESEND_API_KEY` in the `.env` file you created in the previous step.

> The free Resend plan allows 3,000 emails/month and 100 emails/day, which is enough to get started.

---

## 8. Run database migrations

This creates the SQLite database file and sets up all the tables.

```bash
cd /home/deploy/app/packages/server
bun run db:migrate
```

You should see output indicating that the migrations ran successfully. Verify the database file was created:

```bash
ls -lh /home/deploy/data/dictteasy.db
```

---

## 9. Set up Caddy (web server + HTTPS)

Caddy is a modern web server that automatically obtains and renews HTTPS certificates from Let's Encrypt — no manual configuration needed.

### 9.1 Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### 9.2 Write the Caddyfile

Open the Caddy configuration file:

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace all existing contents with the following:

```
www.dictteasy.com {
    # Serve the built React frontend from the dist folder
    root * /home/deploy/app/packages/client/dist
    file_server

    # Proxy all /api requests to the Bun backend
    reverse_proxy /api/* localhost:3000

    # For single-page app routing: if a file is not found, serve index.html
    handle_errors {
        rewrite * /index.html
        file_server
    }
}

# Redirect the bare domain to www
dictteasy.com {
    redir https://www.dictteasy.com{uri} permanent
}
```

Save and close the file (`Ctrl+O`, Enter, `Ctrl+X`).

### 9.3 Validate and reload Caddy

Check the configuration for syntax errors:

```bash
caddy validate --config /etc/caddy/Caddyfile
```

Reload Caddy to apply the new configuration:

```bash
sudo systemctl reload caddy
```

Caddy will now automatically obtain HTTPS certificates for both `dictteasy.com` and `www.dictteasy.com` the first time a request comes in.

---

## 10. Create a systemd service for the Bun server

A systemd service ensures the Bun backend starts automatically when the server boots and restarts automatically if it crashes.

### 10.1 Create the service file

```bash
sudo nano /etc/systemd/system/dictteasy.service
```

Paste the following:

```ini
[Unit]
Description=dictteasy Bun server
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/home/deploy/app/packages/server
EnvironmentFile=/home/deploy/app/packages/server/.env
ExecStart=/home/deploy/.bun/bin/bun run src/index.ts
Restart=always
RestartSec=5

# Send stdout and stderr to the systemd journal
StandardOutput=journal
StandardError=journal
SyslogIdentifier=dictteasy

[Install]
WantedBy=multi-user.target
```

Save and close the file.

### 10.2 Enable and start the service

Tell systemd about the new service file:

```bash
sudo systemctl daemon-reload
```

Enable the service to start on boot:

```bash
sudo systemctl enable dictteasy
```

Start it now:

```bash
sudo systemctl start dictteasy
```

### 10.3 Check the service is running

```bash
sudo systemctl status dictteasy
```

You should see `Active: active (running)`. If it shows `failed`, check the logs:

```bash
sudo journalctl -u dictteasy -n 50
```

---

## 11. Verify everything works

Run through this checklist to confirm the deployment is healthy.

**Backend health check** — confirm the Bun server is listening on port 3000:

```bash
curl http://localhost:3000/api/health
```

You should get a `200` response (the exact body depends on your app's health endpoint).

**Caddy is running:**

```bash
sudo systemctl status caddy
```

**Open the app in a browser:**

- Go to `https://www.dictteasy.com` — you should see the React app with a valid HTTPS certificate (padlock icon).
- Go to `http://dictteasy.com` — it should redirect to `https://www.dictteasy.com`.

**Test an API call from the browser** — open the browser developer tools (F12), go to the Network tab, and look for any `/api/` request. It should return a `2xx` status.

**Test email sending** — trigger an action in the app that sends an email (e.g., sign up or request a password reset) and confirm the email arrives.

---

## 12. Maintenance

### Deploying an update

When you push new code to the repository, follow these steps on the server to deploy the update:

```bash
cd /home/deploy/app

# Pull the latest code
git pull

# Install any new dependencies
bun install

# Rebuild the frontend
cd packages/client
bun run build
cd ../..

# Run any new database migrations
cd packages/server
bun run db:migrate
cd ../..

# Restart the backend service
sudo systemctl restart dictteasy
```

Caddy does not need to be restarted — it reads the static files from disk on every request.

### Viewing logs

Stream live logs from the Bun server:

```bash
sudo journalctl -u dictteasy -f
```

View the last 100 lines:

```bash
sudo journalctl -u dictteasy -n 100
```

View Caddy access logs:

```bash
sudo journalctl -u caddy -f
```

### Restarting services

Restart the Bun server:

```bash
sudo systemctl restart dictteasy
```

Restart Caddy (rarely needed):

```bash
sudo systemctl restart caddy
```

### Checking disk usage

The SQLite database and logs will grow over time. Keep an eye on disk usage:

```bash
df -h /
du -sh /home/deploy/data/
```

### Renewing HTTPS certificates

Caddy renews certificates automatically. You do not need to do anything.

### Keeping the system up to date

Run system updates periodically:

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Quick reference

| Thing               | Location                                          |
|---------------------|---------------------------------------------------|
| App source code     | `/home/deploy/app/`                               |
| Client static files | `/home/deploy/app/packages/client/dist/`          |
| Server entry point  | `/home/deploy/app/packages/server/src/index.ts`   |
| Environment file    | `/home/deploy/app/packages/server/.env`           |
| Database file       | `/home/deploy/data/dictteasy.db`                  |
| Caddy config        | `/etc/caddy/Caddyfile`                            |
| systemd service     | `/etc/systemd/system/dictteasy.service`           |
| Server logs         | `sudo journalctl -u dictteasy -f`                 |
| Caddy logs          | `sudo journalctl -u caddy -f`                     |
