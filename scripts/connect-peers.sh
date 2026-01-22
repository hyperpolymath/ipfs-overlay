#!/bin/bash
# SPDX-License-Identifier: PMPL-1.0-or-later
# Connect IPFS nodes in the cluster

set -e

NAMESPACE=${NAMESPACE:-ipfs-system}

echo "Connecting IPFS peers..."

# Get all pod IPs and IDs
PODS=$(kubectl get pods -n $NAMESPACE -l app=ipfs -o name)
PEER_ADDRS=()

for pod in $PODS; do
  # Get pod IP (ZeroTier or cluster IP)
  POD_IP=$(kubectl get -n $NAMESPACE $pod -o jsonpath='{.status.podIP}')

  # Get IPFS peer ID
  PEER_ID=$(kubectl exec -n $NAMESPACE $pod -- ipfs id -f='<id>' 2>/dev/null || continue)

  # Build multiaddr
  MULTIADDR="/ip4/$POD_IP/tcp/4001/p2p/$PEER_ID"
  PEER_ADDRS+=("$MULTIADDR")

  echo "Found peer: $MULTIADDR"
done

# Connect each pod to all other pods
for pod in $PODS; do
  echo ""
  echo "Connecting $pod to peers..."

  for addr in "${PEER_ADDRS[@]}"; do
    # Skip connecting to self
    PEER_ID=$(echo "$addr" | grep -oP 'p2p/\K[^/]+$')
    SELF_ID=$(kubectl exec -n $NAMESPACE $pod -- ipfs id -f='<id>' 2>/dev/null)

    if [ "$PEER_ID" != "$SELF_ID" ]; then
      kubectl exec -n $NAMESPACE $pod -- ipfs swarm connect "$addr" 2>/dev/null || echo "  Failed to connect to $addr"
    fi
  done
done

echo ""
echo "Peer connection complete"
