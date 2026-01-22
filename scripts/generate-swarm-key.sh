#!/bin/bash
# SPDX-License-Identifier: PMPL-1.0-or-later
# Generate IPFS swarm key for private network

set -e

OUTPUT_FILE=${1:-swarm.key}

echo "Generating IPFS swarm key..."

# Generate random 64-character hex key
SWARM_KEY=$(tr -dc 'a-f0-9' < /dev/urandom | head -c 64)

# Write swarm key with proper format
cat > "$OUTPUT_FILE" <<EOF
/key/swarm/psk/1.0.0/
/base16/
$SWARM_KEY
EOF

chmod 600 "$OUTPUT_FILE"

echo "Swarm key generated: $OUTPUT_FILE"
echo "Key (base16): $SWARM_KEY"
echo ""
echo "To deploy as Kubernetes secret:"
echo "kubectl create secret generic ipfs-swarm-key \\"
echo "  --from-file=swarm.key=$OUTPUT_FILE \\"
echo "  -n ipfs-system"
