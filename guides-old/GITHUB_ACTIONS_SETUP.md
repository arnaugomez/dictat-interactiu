# GitHub Actions Setup Guide

This guide explains how to configure the GitHub Actions deploy workflow. After following these steps, every push to `main` will automatically deploy to your Hetzner VPS.

**Prerequisites:** The VPS must already be set up following `DEPLOYMENT.md`.

---

## 1. Generate a dedicated deploy keypair

From the **project root** on your local machine, create an SSH keypair exclusively for GitHub Actions:

```bash
mkdir -p .tmp
ssh-keygen -t ed25519 -f .tmp/dictteasy-github-actions -C "github-actions-deploy" -N ""
```

The `.tmp/` directory is git-ignored, so the keys will never be committed.

This creates two files:

- `.tmp/dictteasy-github-actions` — private key (goes into GitHub)
- `.tmp/dictteasy-github-actions.pub` — public key (goes onto the VPS)

---

## 2. Add the public key to the VPS

Copy the public key to the `deploy` user's authorized keys on the VPS:

```bash
ssh-copy-id -i .tmp/dictteasy-github-actions.pub deploy@YOUR_SERVER_IP
```

Or manually:

```bash
cat .tmp/dictteasy-github-actions.pub | ssh deploy@YOUR_SERVER_IP \
  "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

Test that it works:

```bash
ssh -i .tmp/dictteasy-github-actions deploy@YOUR_SERVER_IP "echo ok"
```

---

## 3. Allow passwordless sudo for systemctl restart

The deploy workflow needs to restart the `dictteasy` systemd service. To allow this without a password prompt, SSH into the VPS and run:

```bash
sudo visudo -f /etc/sudoers.d/dictteasy-deploy
```

Add this single line:

```
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart dictteasy
```

Save and exit. Verify it works without asking for a password:

```bash
sudo systemctl restart dictteasy
```

---

## 4. Add secrets to GitHub

1. Go to your repository on GitHub.
2. Navigate to **Settings > Secrets and variables > Actions**.
3. Click **New repository secret** and add:

| Secret name    | Value                                              |
|----------------|----------------------------------------------------|
| `VPS_HOST`     | Your server IP address (e.g. `203.0.113.42`)       |
| `VPS_SSH_KEY`  | Contents of `.tmp/dictteasy-github-actions`        |

To copy the private key:

```bash
cat .tmp/dictteasy-github-actions
```

Copy the **entire** output, including the `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines.

---

## 5. Verify the setup

Push a commit to `main` (or merge a PR into `main`). Then:

1. Go to the **Actions** tab in your GitHub repository.
2. You should see a "Deploy" workflow run.
3. Click into it and check that each step completes successfully.
4. Visit `https://www.dictteasy.com` and confirm the site is working.

---

## 6. Clean up the local key (optional)

The private key on your local machine is no longer needed since GitHub has it stored as a secret. You can delete the `.tmp/` directory:

```bash
rm -rf .tmp
```

---

## Troubleshooting

### Deploy fails with "Permission denied (publickey)"

- Verify the public key is in `/home/deploy/.ssh/authorized_keys` on the VPS.
- Verify the private key in the GitHub secret has no trailing whitespace or missing lines.
- Test manually: `ssh -i .tmp/dictteasy-github-actions deploy@YOUR_SERVER_IP`

### Deploy fails at "sudo systemctl restart dictteasy"

- Verify the sudoers rule exists: `sudo cat /etc/sudoers.d/dictteasy-deploy`
- It must contain exactly: `deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart dictteasy`
- Make sure there are no syntax errors: `sudo visudo -c`

### Health check fails after deploy

- SSH into the VPS and check logs: `sudo journalctl -u dictteasy -n 50`
- Verify the `.env` file exists: `ls -la /home/deploy/app/packages/server/.env`
- Try starting manually: `cd /home/deploy/app/packages/server && bun run src/index.ts`

### Deploy triggers but does nothing (skipped)

- The workflow only runs on pushes to `main`. PRs and other branches are ignored by design.
