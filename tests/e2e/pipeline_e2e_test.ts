// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assert, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Helper: Parse a simple Nickel-like config format
function parseNickelValue(content: string, key: string): string | null {
  // Look for pattern: key = value or key = [...]
  const pattern = new RegExp(`${key}\\s*=\\s*([^,}]+?)(?=[,}]|$)`, "s");
  const match = content.match(pattern);
  return match ? match[1].trim() : null;
}

Deno.test("E2E: Full pipeline reads all config files", async () => {
  const bootstrapContent = await Deno.readTextFile("configs/bootstrap.ncl");
  const ipfsContent = await Deno.readTextFile("configs/ipfs-config.ncl");
  const swarmContent = await Deno.readTextFile("configs/swarm.ncl");

  assert(bootstrapContent.length > 0, "Bootstrap config is empty");
  assert(ipfsContent.length > 0, "IPFS config is empty");
  assert(swarmContent.length > 0, "Swarm config is empty");
});

Deno.test("E2E: Pipeline validates structure in bootstrap config", async () => {
  const content = await Deno.readTextFile("configs/bootstrap.ncl");

  assertStringIncludes(content, "let BootstrapConfig");
  assertStringIncludes(content, "bootstrapPeers");
  assertStringIncludes(content, "discovery");
  assertStringIncludes(content, "BootstrapConfig");
});

Deno.test("E2E: Pipeline validates structure in IPFS config", async () => {
  const content = await Deno.readTextFile("configs/ipfs-config.ncl");

  assertStringIncludes(content, "let IpfsConfig");
  assertStringIncludes(content, "Bootstrap");
  assertStringIncludes(content, "Addresses");
  assertStringIncludes(content, "Swarm");
  assertStringIncludes(content, "IpfsConfig");
});

Deno.test("E2E: Pipeline validates structure in swarm config", async () => {
  const content = await Deno.readTextFile("configs/swarm.ncl");

  assertStringIncludes(content, "let SwarmKeyConfig");
  assertStringIncludes(content, "version");
  assertStringIncludes(content, "key");
  assertStringIncludes(content, "keyFormat");
  assertStringIncludes(content, "SwarmKeyConfig");
});

Deno.test("E2E: SECURITY INVARIANT - Bootstrap must be empty array for private swarm", async () => {
  const bootstrapContent = await Deno.readTextFile("configs/bootstrap.ncl");

  // Private swarm MUST have empty bootstrap peers
  assertStringIncludes(
    bootstrapContent,
    "bootstrapPeers = []",
    "Private swarm should have empty bootstrapPeers",
  );

  // Secondary check in IPFS config
  const ipfsContent = await Deno.readTextFile("configs/ipfs-config.ncl");
  assertStringIncludes(ipfsContent, "Bootstrap = []");
});

Deno.test("E2E: SECURITY INVARIANT - MDNS must be disabled for private swarm", async () => {
  const bootstrapContent = await Deno.readTextFile("configs/bootstrap.ncl");
  const ipfsContent = await Deno.readTextFile("configs/ipfs-config.ncl");

  // Both configs should disable MDNS
  assertStringIncludes(bootstrapContent, "mdns = false");
  assertStringIncludes(ipfsContent, "Enabled = false");
});

Deno.test("E2E: SECURITY INVARIANT - DHT routing must be disabled", async () => {
  const bootstrapContent = await Deno.readTextFile("configs/bootstrap.ncl");
  const ipfsContent = await Deno.readTextFile("configs/ipfs-config.ncl");

  // Bootstrap config should disable DHT
  assertStringIncludes(bootstrapContent, "dht = false");

  // IPFS config should use "none" routing
  assertStringIncludes(ipfsContent, 'Type = "none"');
});

Deno.test("E2E: Pipeline verifies no conflicts between bootstrap and IPFS configs", async () => {
  const bootstrapContent = await Deno.readTextFile("configs/bootstrap.ncl");
  const ipfsContent = await Deno.readTextFile("configs/ipfs-config.ncl");

  // Both should have empty bootstrap
  assert(bootstrapContent.includes("bootstrapPeers = []"));
  assert(ipfsContent.includes("Bootstrap = []"));

  // MDNS disabled in both
  assert(bootstrapContent.includes("mdns = false"));
  assert(ipfsContent.includes("Enabled = false"));
});

Deno.test("E2E: Pipeline verifies swarm key format is declared", async () => {
  const content = await Deno.readTextFile("configs/swarm.ncl");

  // Swarm key version should be declared
  assertStringIncludes(content, 'version = "1.0.0"');

  // Key type should be PSK
  assertStringIncludes(content, 'keyType = "psk"');

  // Encoding should be base16
  assertStringIncludes(content, 'encoding = "base16"');

  // Key format function should exist
  assertStringIncludes(content, "keyFormat = fun key");
});

Deno.test("E2E: Full configuration pipeline validates end-to-end", async () => {
  // Read all configs
  const bootstrap = await Deno.readTextFile("configs/bootstrap.ncl");
  const ipfs = await Deno.readTextFile("configs/ipfs-config.ncl");
  const swarm = await Deno.readTextFile("configs/swarm.ncl");

  // Verify SPDX headers present everywhere
  assert(bootstrap.includes("SPDX-License-Identifier"));
  assert(ipfs.includes("SPDX-License-Identifier"));
  assert(swarm.includes("SPDX-License-Identifier"));

  // Verify no empty configs
  assert(bootstrap.length > 100, "Bootstrap config too minimal");
  assert(ipfs.length > 100, "IPFS config too minimal");
  assert(swarm.length > 50, "Swarm config too minimal");

  // Verify core exports exist
  assert(bootstrap.includes("in BootstrapConfig"));
  assert(ipfs.includes("in IpfsConfig"));
  assert(swarm.includes("in SwarmKeyConfig"));
});
