#!/bin/bash
# SPDX-License-Identifier: PMPL-1.0-or-later
# Health check for IPFS cluster

set -e

NAMESPACE=${NAMESPACE:-ipfs-system}

echo "IPFS Cluster Health Check"
echo "=========================="

# Check pods
echo ""
echo "Pod Status:"
kubectl get pods -n $NAMESPACE -l app=ipfs

# Check services
echo ""
echo "Services:"
kubectl get svc -n $NAMESPACE

# Check each pod's IPFS daemon
echo ""
echo "IPFS Node Status:"
for pod in $(kubectl get pods -n $NAMESPACE -l app=ipfs -o name); do
  echo ""
  echo "Checking $pod..."

  # Get node ID
  NODE_ID=$(kubectl exec -n $NAMESPACE $pod -- ipfs id -f='<id>' 2>/dev/null || echo "N/A")
  echo "  Node ID: $NODE_ID"

  # Get peer count
  PEER_COUNT=$(kubectl exec -n $NAMESPACE $pod -- ipfs swarm peers 2>/dev/null | wc -l)
  echo "  Connected peers: $PEER_COUNT"

  # Get repo stats
  REPO_SIZE=$(kubectl exec -n $NAMESPACE $pod -- ipfs repo stat -s 2>/dev/null || echo "N/A")
  echo "  Repo size: $REPO_SIZE"
done

echo ""
echo "Health check complete"
