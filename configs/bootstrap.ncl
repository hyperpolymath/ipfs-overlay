# SPDX-License-Identifier: AGPL-3.0-or-later
# Nickel configuration for IPFS bootstrap peers (private swarm)

let BootstrapConfig = {
  # Private swarm - no public bootstrap nodes
  bootstrapPeers = [],

  # Internal cluster peers (populated at runtime)
  clusterPeers = [
    # Format: "/ip4/<zerotier-ip>/tcp/4001/p2p/<peer-id>"
    # Example: "/ip4/10.147.17.10/tcp/4001/p2p/Qm..."
  ],

  # Discovery settings
  discovery = {
    mdns = false,  # Disabled for private swarm
    dht = false,   # No public DHT
    pubsub = true  # Internal pubsub for cluster coordination
  }
} in BootstrapConfig
