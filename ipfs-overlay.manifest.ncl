# SPDX-License-Identifier: PMPL-1.0-or-later
# ipfs-overlay module manifest for FlatRacoon orchestrator

{
  name = "ipfs-overlay",
  version = "0.1.0",
  layer = 'storage,
  description = "IPFS content-addressed storage overlay with persistent StatefulSet deployment",
  repo = "github.com/hyperpolymath/ipfs-overlay",
  requires = ["kubernetes", "zerotier-k8s-link"],
  provides = ["content-addressed-storage", "ipfs-gateway", "pinning-service"],
  config_schema = "configs/schema.ncl",
  health_endpoint = "/health",
  metrics_endpoint = "/metrics",
  deployment_mode = "statefulset",
  namespace = "ipfs-system",
}
