<!-- SPDX-License-Identifier: PMPL-1.0-or-later -->
<!-- TOPOLOGY.md — Project architecture map and completion dashboard -->
<!-- Last updated: 2026-02-19 -->

# ipfs-overlay — Project Topology

## System Architecture

```
                        ┌─────────────────────────────────────────┐
                        │              PUBLIC IPFS                │
                        │        (Optional Bridge / Gateway)      │
                        └───────────────────┬─────────────────────┘
                                            │ (if enabled)
                                            ▼
                        ┌─────────────────────────────────────────┐
                        │           ZEROTIER OVERLAY MESH         │
                        │    (Encrypted private network layer)     │
                        └──────────┬───────────────────┬──────────┘
                                   │                   │
                                   ▼                   ▼
                        ┌───────────────────────┐  ┌────────────────────────────────┐
                        │  KUBERNETES CLUSTER   │  │  PRIVATE IPFS SWARM            │
                        │ - StatefulSets / PVCs │  │ - Kubo (private config)        │
                        │ - Internal Services   │  │ - Private Swarm Key (PSK)      │
                        └──────────┬────────────┘  └──────────┬─────────────────────┘
                                   │                          │
                                   └────────────┬─────────────┘
                                                ▼
                        ┌─────────────────────────────────────────┐
                        │           DISTRIBUTED STORAGE           │
                        │  ┌───────────┐  ┌───────────┐  ┌───────┐│
                        │  │ Node A    │◄─► Node B    │◄─► Node C││
                        │  │ (private) │  │ (private) │  │(priv) ││
                        │  └───────────┘  └───────────┘  └───────┘│
                        └───────────────────┬─────────────────────┘
                                            │
                                            ▼
                        ┌─────────────────────────────────────────┐
                        │          CONTENT ADDRESSING             │
                        │      (CID, Pinning, DHT-less)           │
                        └─────────────────────────────────────────┘

                        ┌─────────────────────────────────────────┐
                        │          REPO INFRASTRUCTURE            │
                        │  Justfile / Nickel  .machine_readable/  │
                        │  Kubernetes YAML    0-AI-MANIFEST.a2ml  │
                        └─────────────────────────────────────────┘
```

## Completion Dashboard

```
COMPONENT                          STATUS              NOTES
─────────────────────────────────  ──────────────────  ─────────────────────────────────
CORE INFRASTRUCTURE
  IPFS Daemon (Kubo) Config         ██████████ 100%    Private operation verified
  Kubernetes Manifests              ██████████ 100%    StatefulSet & PVC stable
  ZeroTier Binding                  ██████████ 100%    Exclusive interface verified
  Private Swarm Key (PSK)           ██████████ 100%    Encrypted mesh active

MANAGEMENT & TOOLS
  Nickel ipfs-config.ncl            ██████████ 100%    Type-safe config active
  Bootstrap & Peer Disc             ██████████ 100%    Swarm key generation verified
  Pinning Service                   ██████████ 100%    Persistent storage active

REPO INFRASTRUCTURE
  Justfile Automation               ██████████ 100%    Standard build/deploy tasks
  .machine_readable/                ██████████ 100%    STATE tracking active
  Health Check Scripts              ██████████ 100%    Metrics endpoints verified

─────────────────────────────────────────────────────────────────────────────
OVERALL:                            ██████████ 100%    Production-ready overlay
```

## Key Dependencies

```
ZeroTier Link ───► Private Swarm ───► Kubo Daemon ───► Pinning
     │                 │                 │               │
     ▼                 ▼                 ▼               ▼
 K8s Stateful ───► Persistent Vol ──► Service ───────► API v0
```

## Update Protocol

This file is maintained by both humans and AI agents. When updating:

1. **After completing a component**: Change its bar and percentage
2. **After adding a component**: Add a new row in the appropriate section
3. **After architectural changes**: Update the ASCII diagram
4. **Date**: Update the `Last updated` comment at the top of this file

Progress bars use: `█` (filled) and `░` (empty), 10 characters wide.
Percentages: 0%, 10%, 20%, ... 100% (in 10% increments).
