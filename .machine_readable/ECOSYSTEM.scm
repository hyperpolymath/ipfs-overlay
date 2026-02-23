;; SPDX-License-Identifier: PMPL-1.0-or-later
(ecosystem (metadata (version "0.2.0") (last-updated "2026-02-08"))
  (project (name "ipfs-overlay") (purpose "IPFS distributed storage overlay on K8s") (role storage-layer))
  (flatracoon-integration
    (parent "flatracoon/netstack")
    (layer storage)
    (depended-on-by ())
    (depends-on ("zerotier-k8s-link"))))
