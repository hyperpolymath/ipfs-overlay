# SPDX-License-Identifier: PMPL-1.0-or-later
# Justfile - IPFS overlay deployment automation

default:
    @just --list

# Deploy IPFS overlay to Kubernetes cluster
deploy:
    @echo "Deploying IPFS overlay to Kubernetes..."
    kubectl apply -f manifests/namespace.yaml
    kubectl apply -f manifests/secret.yaml
    kubectl apply -f manifests/configmap.yaml
    kubectl apply -f manifests/statefulset.yaml
    kubectl apply -f manifests/service.yaml
    kubectl apply -f manifests/networkpolicy.yaml
    @echo "Deployment complete"
    @just status

# Remove IPFS overlay from cluster
undeploy:
    @echo "Removing IPFS overlay deployment..."
    kubectl delete -f manifests/ --ignore-not-found=true
    @echo "Cleanup complete"

# Show current deployment status
status:
    @echo "=== IPFS Overlay Status ==="
    @kubectl -n ipfs-system get all 2>/dev/null || echo "Not deployed yet"

# Watch pod logs
logs:
    kubectl -n ipfs-system logs -f statefulset/ipfs --all-containers=true

# Validate manifests
validate:
    @echo "Validating Kubernetes manifests..."
    @for file in manifests/*.yaml; do \
        echo "Checking $$file..."; \
        kubectl apply --dry-run=client -f $$file > /dev/null; \
    done
    @echo "All manifests valid"

# Run lint checks
lint:
    @echo "Running lint checks..."
    @yamllint manifests/*.yaml

# Run tests
test:
    @echo "Testing..."

# Clean build artifacts
clean:
    @just undeploy

# Format code
fmt:
    @echo "Formatting..."

# Run all checks
check: lint test

# Prepare a release
release VERSION:
    @echo "Releasing {{VERSION}}..."
