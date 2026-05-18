#!/usr/bin/env bash
# oo-setup-debian.sh — Install colony-server + oo-host on Debian 12
# Run on the second PC (server) as root.
#
# Usage:
#   sudo bash oo-setup-debian.sh --colony-ip 192.168.1.100 --port 8080
#
# What this does:
#   1. Install Rust toolchain
#   2. Create 'oo' system user
#   3. Clone and build colony-server
#   4. Clone and build oo-host
#   5. Install both as systemd services
#   6. Open firewall port (ufw)
#   7. Print connection info

set -euo pipefail

COLONY_IP="$(hostname -I | awk '{print $1}')"
COLONY_PORT="8080"
OO_USER="oo"
OO_GROUP="oo"
INSTALL_BASE="/opt/oo"
COLONY_REPO="https://github.com/Djiby-diop/colony-server"
HOST_REPO="https://github.com/Djiby-diop/oo-host"
GOSSIP_SECRET="oo-colony-$(cat /proc/sys/kernel/random/uuid 2>/dev/null || date +%s)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --colony-ip)  COLONY_IP="$2";   shift 2 ;;
    --port)       COLONY_PORT="$2"; shift 2 ;;
    --user)       OO_USER="$2";     shift 2 ;;
    --secret)     GOSSIP_SECRET="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

COLONY_URL="http://${COLONY_IP}:${COLONY_PORT}"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  OO Colony Setup — Debian 12"
echo "  Colony URL : $COLONY_URL"
echo "  Install dir: $INSTALL_BASE"
echo "═══════════════════════════════════════════════════════"
echo ""

if [[ $EUID -ne 0 ]]; then
  echo "ERROR: Run as root (sudo bash oo-setup-debian.sh)" >&2
  exit 1
fi

# ── 1. Dependencies ────────────────────────────────────────────────────────────
echo "[1/7] Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq git curl build-essential pkg-config libssl-dev ufw

# ── 2. Rust toolchain ─────────────────────────────────────────────────────────
echo "[2/7] Installing Rust toolchain..."
if ! command -v rustup &>/dev/null; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
fi
export PATH="$HOME/.cargo/bin:$PATH"
rustup default stable
cargo --version

# ── 3. OO system user ─────────────────────────────────────────────────────────
echo "[3/7] Creating system user '$OO_USER'..."
if ! id "$OO_USER" &>/dev/null; then
  useradd -r -s /bin/false -d "$INSTALL_BASE" -m "$OO_USER"
fi
mkdir -p "$INSTALL_BASE"

# ── 4. colony-server ──────────────────────────────────────────────────────────
echo "[4/7] Cloning and building colony-server..."
if [[ -d "$INSTALL_BASE/colony-server" ]]; then
  git -C "$INSTALL_BASE/colony-server" pull --ff-only
else
  git clone "$COLONY_REPO" "$INSTALL_BASE/colony-server"
fi
mkdir -p "$INSTALL_BASE/colony-server/fossil"
chown -R "$OO_USER:$OO_GROUP" "$INSTALL_BASE/colony-server"
cd "$INSTALL_BASE/colony-server"
cargo build --release 2>&1 | tail -3

# Install colony-server systemd service
cat > /etc/systemd/system/colony-server.service <<EOF
[Unit]
Description=OO Colony Server (Distributed Organism Coordinator)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$OO_USER
Group=$OO_GROUP
WorkingDirectory=$INSTALL_BASE/colony-server
Environment=RUST_LOG=info
Environment=COLONY_BIND=0.0.0.0:$COLONY_PORT
Environment=COLONY_DATA_DIR=$INSTALL_BASE/colony-server/fossil
Environment=COLONY_GOSSIP_HMAC_KEY=$GOSSIP_SECRET
Environment=COLONY_GOSSIP_INTERVAL_S=15
Environment=COLONY_GOSSIP_MAX_HOPS=3
ExecStart=$INSTALL_BASE/colony-server/target/release/colony-server
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=$INSTALL_BASE/colony-server/fossil

[Install]
WantedBy=multi-user.target
EOF

# ── 5. oo-host ────────────────────────────────────────────────────────────────
echo "[5/7] Cloning and building oo-host..."
if [[ -d "$INSTALL_BASE/oo-host" ]]; then
  git -C "$INSTALL_BASE/oo-host" pull --ff-only
else
  git clone "$HOST_REPO" "$INSTALL_BASE/oo-host"
fi
mkdir -p "$INSTALL_BASE/oo-host/data"
chown -R "$OO_USER:$OO_GROUP" "$INSTALL_BASE/oo-host"
cd "$INSTALL_BASE/oo-host"
cargo build --release --bin oo-host 2>&1 | tail -3

# Save colony URL for oo-host
echo "$COLONY_URL" > "$INSTALL_BASE/oo-host/colony_url.txt"
chown "$OO_USER:$OO_GROUP" "$INSTALL_BASE/oo-host/colony_url.txt"

# Install oo-host heartbeat service
cat > /etc/systemd/system/oo-host-heartbeat-watch.service <<EOF
[Unit]
Description=OO Host Heartbeat Watch (Colony Coordinator Link)
After=network-online.target colony-server.service
Wants=network-online.target

[Service]
Type=simple
User=$OO_USER
Group=$OO_GROUP
WorkingDirectory=$INSTALL_BASE/oo-host
ExecStart=$INSTALL_BASE/oo-host/target/release/oo-host \
  --data-dir $INSTALL_BASE/oo-host/data \
  heartbeat watch \
  --colony $COLONY_URL \
  --interval-s 15 \
  --cycles 0 \
  --max-retries 5 \
  --backoff-ms 500 \
  --continue-on-error
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=$INSTALL_BASE/oo-host/data

[Install]
WantedBy=multi-user.target
EOF

# ── 6. Firewall ───────────────────────────────────────────────────────────────
echo "[6/7] Configuring ufw firewall..."
ufw allow ssh
ufw allow "$COLONY_PORT/tcp" comment "OO Colony Server"
ufw --force enable

# ── 7. Enable and start services ──────────────────────────────────────────────
echo "[7/7] Starting services..."
systemctl daemon-reload
systemctl enable colony-server.service
systemctl restart colony-server.service
sleep 2
systemctl enable oo-host-heartbeat-watch.service
systemctl restart oo-host-heartbeat-watch.service

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  OO Colony Setup Complete!"
echo ""
echo "  Colony URL     : $COLONY_URL"
echo "  Gossip secret  : $GOSSIP_SECRET"
echo ""
echo "  Test colony:"
echo "    curl $COLONY_URL/status"
echo "    curl $COLONY_URL/mesh/status"
echo ""
echo "  Service logs:"
echo "    journalctl -u colony-server.service -f"
echo "    journalctl -u oo-host-heartbeat-watch.service -f"
echo ""
echo "  On your main PC, update colony_url.txt:"
echo "    echo '$COLONY_URL' > oo-host/colony_url.txt"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  HMAC key for peers: $GOSSIP_SECRET"
echo "  Add to other nodes: COLONY_GOSSIP_HMAC_KEY=$GOSSIP_SECRET"
echo ""
