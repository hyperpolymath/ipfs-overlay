// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assert, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Aspect: Security — No MD5/SHA1 references in configs", async () => {
  const files = [
    "configs/bootstrap.ncl",
    "configs/ipfs-config.ncl",
    "configs/swarm.ncl",
  ];

  for (const file of files) {
    const content = await Deno.readTextFile(file);

    assert(
      !content.toLowerCase().includes("md5"),
      `${file} contains MD5 reference`,
    );
    assert(
      !content.toLowerCase().includes("sha1"),
      `${file} contains SHA1 reference`,
    );
  }
});

Deno.test("Aspect: Security — No HTTP-only references (HTTPS required)", async () => {
  const files = [
    "configs/bootstrap.ncl",
    "configs/ipfs-config.ncl",
    "configs/swarm.ncl",
  ];

  for (const file of files) {
    const content = await Deno.readTextFile(file);

    // IPFS uses multiaddr format, not HTTP URLs, but check for plain http://
    const hasUnsafeHttp = content.includes("http://");

    assert(
      !hasUnsafeHttp,
      `${file} contains unencrypted HTTP reference`,
    );
  }
});

Deno.test("Aspect: Security — No hardcoded credentials in configs", async () => {
  const files = [
    "configs/bootstrap.ncl",
    "configs/ipfs-config.ncl",
    "configs/swarm.ncl",
  ];

  const suspiciousPatterns = [
    /password\s*=\s*['"]/i,
    /secret\s*=\s*['"]/i,
    /api_key\s*=\s*['"]/i,
    /token\s*=\s*['"]/i,
    /auth\s*=\s*['"]/i,
  ];

  for (const file of files) {
    const content = await Deno.readTextFile(file);

    for (const pattern of suspiciousPatterns) {
      assert(
        !pattern.test(content),
        `${file} contains potential hardcoded credential matching ${pattern}`,
      );
    }
  }
});

Deno.test("Aspect: Security — Swarm key encoding is base16 (not weaker base58)", async () => {
  const content = await Deno.readTextFile("configs/swarm.ncl");

  // Must use base16 encoding
  assertStringIncludes(content, 'encoding = "base16"');

  // Must NOT use base58
  assert(
    !content.includes('encoding = "base58"'),
    "Swarm key should not use weaker base58 encoding",
  );

  // Verify format string includes base16
  assertStringIncludes(content, "/base16/");
});

Deno.test("Aspect: Security — Scripts don't contain shell injection vectors", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  const injectionPatterns = [
    /\$\(.*\$\(/, // Nested command substitution
    /\s+eval\s+/, // eval keyword
    /`.*`/, // Backtick substitution (older, more dangerous)
  ];

  for (const script of scripts) {
    const content = await Deno.readTextFile(script);

    for (const pattern of injectionPatterns) {
      assert(
        !pattern.test(content),
        `${script} may contain shell injection vector matching ${pattern}`,
      );
    }
  }
});

Deno.test("Aspect: Security — No debugging flags left in production scripts", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  for (const script of scripts) {
    const content = await Deno.readTextFile(script);

    // Check for debugging indicators (but don't flag legitimate uses)
    // set -x enables debug output
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("set -x")) {
        assert(
          false,
          `${script} line ${i + 1}: set -x (debug mode) found in production code`,
        );
      }
    }
  }
});

Deno.test("Aspect: Security — Config files don't contain obvious sensitive patterns", async () => {
  const files = [
    "configs/bootstrap.ncl",
    "configs/ipfs-config.ncl",
    "configs/swarm.ncl",
  ];

  const sensitivePatterns = [
    /private[_-]?key/i,
    /secret[_-]?key/i,
    /aws[_-]?secret/i,
    /api[_-]?key/i,
  ];

  for (const file of files) {
    const content = await Deno.readTextFile(file);

    for (const pattern of sensitivePatterns) {
      // Allow "key" in swarm.ncl context, but not followed by sensitive assignment
      if (pattern.test(content)) {
        // Only flag if it looks like an actual assignment
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (pattern.test(line) && line.includes("=") && !line.includes("=\\s*['\"]\\s*['\"]")) {
            assert(
              false,
              `${file} line ${i + 1}: potential sensitive field pattern`,
            );
          }
        }
      }
    }
  }
});

Deno.test("Aspect: Security — Verify private swarm isolation (no external peers)", async () => {
  const bootstrapContent = await Deno.readTextFile("configs/bootstrap.ncl");

  // Should have empty bootstrap peers (verified)
  assertStringIncludes(bootstrapContent, "bootstrapPeers = []");

  // Should have empty or private-only cluster peers initially
  assert(
    bootstrapContent.includes("clusterPeers = [") &&
    bootstrapContent.includes("# Example:"),
    "Cluster peers should be empty or example-only initially",
  );
});

Deno.test("Aspect: Security — Verify MDNS is disabled (prevents network leakage)", async () => {
  const bootstrapContent = await Deno.readTextFile("configs/bootstrap.ncl");
  const ipfsContent = await Deno.readTextFile("configs/ipfs-config.ncl");

  // mDNS can leak node identity on network
  assertStringIncludes(bootstrapContent, "mdns = false");
  assertStringIncludes(ipfsContent, 'Enabled = false');
});

Deno.test("Aspect: Security — Verify DHT is disabled (no public peer discovery)", async () => {
  const bootstrapContent = await Deno.readTextFile("configs/bootstrap.ncl");
  const ipfsContent = await Deno.readTextFile("configs/ipfs-config.ncl");

  // DHT allows discovery by the public
  assertStringIncludes(bootstrapContent, "dht = false");
  assertStringIncludes(ipfsContent, 'Type = "none"');
});
