#!/bin/bash
# SPDX-License-Identifier: AGPL-3.0-or-later
# Initialize IPFS node with private swarm configuration

set -e

IPFS_PATH=${IPFS_PATH:-/data/ipfs}
SWARM_KEY_PATH=${SWARM_KEY_PATH:-/etc/ipfs/swarm.key}
CONFIG_PATH=${CONFIG_PATH:-/etc/ipfs/ipfs-config.json}

echo "Initializing IPFS node..."

# Check if already initialized
if [ ! -d "$IPFS_PATH" ]; then
  echo "Creating new IPFS repository..."
  ipfs init --profile server
else
  echo "IPFS repository already exists"
fi

# Install swarm key for private network
if [ -f "$SWARM_KEY_PATH" ]; then
  echo "Installing swarm key..."
  cp "$SWARM_KEY_PATH" "$IPFS_PATH/swarm.key"
  chmod 600 "$IPFS_PATH/swarm.key"
else
  echo "Warning: No swarm key found at $SWARM_KEY_PATH"
  echo "This node will NOT be able to connect to the private swarm"
fi

# Apply configuration
if [ -f "$CONFIG_PATH" ]; then
  echo "Applying IPFS configuration..."
  ipfs config replace "$CONFIG_PATH"
else
  echo "No custom config found, using defaults"
fi

# Clear bootstrap peers (private swarm)
echo "Clearing public bootstrap peers..."
ipfs bootstrap rm --all

# Get node ID
NODE_ID=$(ipfs id -f='<id>')
echo "IPFS node initialized with ID: $NODE_ID"

# Get ZeroTier IP if available
if command -v zerotier-cli &> /dev/null; then
  ZT_IP=$(zerotier-cli listnetworks | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1)
  if [ -n "$ZT_IP" ]; then
    echo "ZeroTier IP: $ZT_IP"
    echo "Announce address: /ip4/$ZT_IP/tcp/4001/p2p/$NODE_ID"
  fi
fi

echo "IPFS node ready"
