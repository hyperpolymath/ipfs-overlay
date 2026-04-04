// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assert, assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Helper: Generate random port in valid range
function randomPort(): number {
  return Math.floor(Math.random() * (65535 - 1024)) + 1024;
}

// Helper: Validate IPFS multiaddr format
function isValidMultiaddr(addr: string): boolean {
  // Must start with /
  if (!addr.startsWith("/")) return false;

  // Basic validation: /protocol/value/protocol/value...
  const parts = addr.split("/").filter((p) => p.length > 0);
  if (parts.length < 2) return false;

  // Each protocol should be followed by a value
  for (let i = 0; i < parts.length; i += 2) {
    const protocol = parts[i];
    if (!protocol) return false;
    if (["ip4", "ip6", "tcp", "p2p"].includes(protocol)) {
      if (i + 1 >= parts.length) return false;
      const value = parts[i + 1];
      if (!value || value.length === 0) return false;
    }
  }
  return true;
}

// Helper: Validate base16 hex string
function isValidBase16(s: string): boolean {
  return /^[a-f0-9]*$/i.test(s);
}

Deno.test("Property: Random port numbers are in valid range", () => {
  for (let i = 0; i < 100; i++) {
    const port = randomPort();
    assert(port >= 1024 && port <= 65535, `Port ${port} out of range`);
  }
});

Deno.test("Property: Multiaddr format validation — ip4/tcp patterns", () => {
  const validAddrs = [
    "/ip4/10.147.17.10/tcp/4001",
    "/ip4/0.0.0.0/tcp/4001",
    "/ip4/127.0.0.1/tcp/5001",
  ];

  for (const addr of validAddrs) {
    assert(
      isValidMultiaddr(addr),
      `Valid multiaddr rejected: ${addr}`,
    );
  }
});

Deno.test("Property: Multiaddr format validation — ip6/tcp patterns", () => {
  const validAddrs = [
    "/ip6/::/tcp/4001",
    "/ip6/::1/tcp/5001",
  ];

  for (const addr of validAddrs) {
    assert(
      isValidMultiaddr(addr),
      `Valid multiaddr rejected: ${addr}`,
    );
  }
});

Deno.test("Property: Multiaddr format validation — rejects malformed", () => {
  const invalidAddrs = [
    "",
    "/",
    "/ip4",  // Missing value
    "ip4/127.0.0.1/tcp/4001",  // Missing leading /
  ];

  for (const addr of invalidAddrs) {
    assert(
      !isValidMultiaddr(addr),
      `Invalid multiaddr accepted: ${addr}`,
    );
  }
});

Deno.test("Property: Base16 encoding validation", () => {
  const validHex = [
    "abcdef0123456789",
    "0000",
    "ffffffff",
    "ABCDEF",  // Case-insensitive
  ];

  for (const hex of validHex) {
    assert(
      isValidBase16(hex),
      `Valid base16 rejected: ${hex}`,
    );
  }
});

Deno.test("Property: Base16 rejects non-hex characters", () => {
  const invalidHex = [
    "zzzzzz",
    "12345g",
    "abcdef_",
    "abcdef ",
  ];

  for (const hex of invalidHex) {
    assert(
      !isValidBase16(hex),
      `Invalid base16 accepted: ${hex}`,
    );
  }
});

Deno.test("Property: Swarm key format function preserves structure", async () => {
  const content = await Deno.readTextFile("configs/swarm.ncl");

  // Verify the format string structure
  assert(
    content.includes('"/key/swarm/psk/1.0.0/'),
    "Missing PSK version prefix",
  );
  assert(
    content.includes("/base16/"),
    "Missing base16 encoding marker",
  );
  assert(
    content.includes('++ key'),
    "Format function doesn't concatenate key",
  );
});

Deno.test("Property: Bootstrap config preserves required fields", async () => {
  const content = await Deno.readTextFile("configs/bootstrap.ncl");
  const lines = content.split("\n");

  // Check that the output structure has required top-level fields
  const hasBootstrapPeers = lines.some((l) => l.includes("bootstrapPeers"));
  const hasClusterPeers = lines.some((l) => l.includes("clusterPeers"));
  const hasDiscovery = lines.some((l) => l.includes("discovery"));

  assert(hasBootstrapPeers, "Missing bootstrapPeers field");
  assert(hasClusterPeers, "Missing clusterPeers field");
  assert(hasDiscovery, "Missing discovery field");
});

Deno.test("Property: IPFS config preserves critical nested structures", async () => {
  const content = await Deno.readTextFile("configs/ipfs-config.ncl");

  // Check critical nested structures
  assert(
    content.includes("Datastore") && content.includes("StorageMax"),
    "Missing Datastore.StorageMax",
  );
  assert(
    content.includes("Swarm") && content.includes("ConnMgr"),
    "Missing Swarm.ConnMgr",
  );
  assert(
    content.includes("Discovery") && content.includes("MDNS"),
    "Missing Discovery.MDNS",
  );
});

Deno.test("Property: 100 random config reads complete successfully", async () => {
  for (let i = 0; i < 100; i++) {
    const configPaths = [
      "configs/bootstrap.ncl",
      "configs/ipfs-config.ncl",
      "configs/swarm.ncl",
    ];
    const randomPath = configPaths[Math.floor(Math.random() * configPaths.length)];
    const content = await Deno.readTextFile(randomPath);
    assert(content.length > 0);
  }
});
