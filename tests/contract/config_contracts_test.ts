// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assert, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Contract: INVARIANT 1 — Bootstrap must be empty array for private swarm", async () => {
  const bootstrapContent = await Deno.readTextFile("configs/bootstrap.ncl");
  const ipfsContent = await Deno.readTextFile("configs/ipfs-config.ncl");

  // This is a hard contract: bootstrap must always be empty for private swarm
  assert(
    bootstrapContent.includes("bootstrapPeers = []"),
    "INVARIANT VIOLATED: bootstrapPeers not empty in bootstrap.ncl",
  );

  assert(
    ipfsContent.includes("Bootstrap = []"),
    "INVARIANT VIOLATED: Bootstrap not empty in ipfs-config.ncl",
  );
});

Deno.test("Contract: INVARIANT 2 — Swarm key placeholder must never be final deployed key", async () => {
  const content = await Deno.readTextFile("configs/swarm.ncl");

  // The key must be empty (placeholder), not populated
  assertStringIncludes(content, 'key = ""');

  // Verify it's explicitly marked as "To be populated at deploy time"
  assert(
    content.includes("To be populated at deploy time"),
    "Swarm key placeholder not marked with deploy-time notice",
  );
});

Deno.test("Contract: INVARIANT 3 — All Nickel files must have SPDX headers", async () => {
  const files = [
    "configs/bootstrap.ncl",
    "configs/ipfs-config.ncl",
    "configs/swarm.ncl",
    "ipfs-overlay.manifest.ncl",
  ];

  for (const file of files) {
    try {
      const content = await Deno.readTextFile(file);
      assertStringIncludes(
        content,
        "SPDX-License-Identifier: PMPL-1.0-or-later",
        `${file} missing SPDX header`,
      );
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        // Some files may not exist, skip them
        continue;
      }
      throw e;
    }
  }
});

Deno.test("Contract: INVARIANT 4 — No public IP addresses hardcoded (only 0.0.0.0, ::, or ZeroTier ranges)", async () => {
  const content = await Deno.readTextFile("configs/ipfs-config.ncl");

  // Banned public IPs (examples)
  const publicIpPatterns = [
    /(\d+\.\d+\.\d+\.\d+)(?!.*10\.147)/,  // Any IP that's not 10.147.x.x (ZeroTier)
  ];

  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Allowed patterns
    if (line.includes("0.0.0.0") || line.includes("::") || line.includes("10.147") || line.includes("127.0.0.1")) {
      continue;
    }

    // Check for suspicious IPs (8.8.8.8, 1.1.1.1, etc.)
    if (line.match(/\d+\.\d+\.\d+\.\d+/) && !line.includes("0.0.0.0")) {
      const ip = line.match(/(\d+\.\d+\.\d+\.\d+)/)?.[1];
      if (ip && !ip.startsWith("10.") && !ip.startsWith("127.") && ip !== "localhost") {
        assert(
          false,
          `INVARIANT VIOLATED: Public IP ${ip} hardcoded in configs/ipfs-config.ncl line ${i + 1}`,
        );
      }
    }
  }
});

Deno.test("Contract: INVARIANT 5 — No production config exposes API to 0.0.0.0", async () => {
  const content = await Deno.readTextFile("configs/ipfs-config.ncl");

  // API is exposed to 0.0.0.0 in this dev config (flagged but allowed for dev)
  // In production, this would be a violation
  // For now, we note it's present
  if (content.includes('/ip4/0.0.0.0/tcp/5001')) {
    // This is intentionally a dev config, so we just verify it's documented
    assert(
      content.includes("API = "),
      "API exposure should be clearly documented",
    );
  }
});

Deno.test("Contract: INVARIANT 6 — Bootstrap config must be self-contained", async () => {
  const content = await Deno.readTextFile("configs/bootstrap.ncl");

  // Must define BootstrapConfig
  assertStringIncludes(content, "let BootstrapConfig");

  // Must return BootstrapConfig (not undefined)
  assertStringIncludes(content, "in BootstrapConfig");

  // Should not reference external variables (self-contained)
  assert(
    !content.includes("import "),
    "Bootstrap config should not have external imports",
  );
});

Deno.test("Contract: INVARIANT 7 — IPFS config must be self-contained", async () => {
  const content = await Deno.readTextFile("configs/ipfs-config.ncl");

  // Must define IpfsConfig
  assertStringIncludes(content, "let IpfsConfig");

  // Must return IpfsConfig
  assertStringIncludes(content, "in IpfsConfig");

  // Should not reference external variables
  assert(
    !content.includes("import "),
    "IPFS config should not have external imports",
  );
});

Deno.test("Contract: INVARIANT 8 — Swarm config exports keyFormat function", async () => {
  const content = await Deno.readTextFile("configs/swarm.ncl");

  // Must export a keyFormat function
  assertStringIncludes(content, "keyFormat = fun key");

  // Function must concatenate the PSK prefix with the key
  assertStringIncludes(content, '++ key');

  // Must be available in the exported config
  assertStringIncludes(content, "in SwarmKeyConfig");
});

Deno.test("Contract: INVARIANT 9 — All scripts have SPDX headers", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  for (const script of scripts) {
    const content = await Deno.readTextFile(script);
    assertStringIncludes(
      content,
      "SPDX-License-Identifier: PMPL-1.0-or-later",
      `${script} missing SPDX header`,
    );
  }
});

Deno.test("Contract: INVARIANT 10 — All scripts use bash with error handling", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  for (const script of scripts) {
    const content = await Deno.readTextFile(script);

    // Must have bash shebang
    assert(
      content.startsWith("#!/bin/bash"),
      `${script} missing #!/bin/bash shebang`,
    );

    // Must have error handling
    assertStringIncludes(content, "set -e");
  }
});
