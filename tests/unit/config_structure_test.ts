// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Unit: Config files exist at expected paths", async () => {
  const configPaths = [
    "configs/bootstrap.ncl",
    "configs/ipfs-config.ncl",
    "configs/swarm.ncl",
  ];

  for (const path of configPaths) {
    await Deno.readTextFile(path);
  }
});

Deno.test("Unit: All config files have SPDX headers", async () => {
  const configPaths = [
    "configs/bootstrap.ncl",
    "configs/ipfs-config.ncl",
    "configs/swarm.ncl",
  ];

  for (const path of configPaths) {
    const content = await Deno.readTextFile(path);
    assertStringIncludes(content, "SPDX-License-Identifier: PMPL-1.0-or-later");
  }
});

Deno.test("Unit: Swarm key placeholder is empty (not hardcoded)", async () => {
  const content = await Deno.readTextFile("configs/swarm.ncl");
  assertStringIncludes(content, 'key = ""');
});

Deno.test("Unit: Bootstrap config has expected structure", async () => {
  const content = await Deno.readTextFile("configs/bootstrap.ncl");
  assertStringIncludes(content, "bootstrapPeers");
  assertStringIncludes(content, "clusterPeers");
  assertStringIncludes(content, "discovery");
});

Deno.test("Unit: IPFS config has expected Addresses structure", async () => {
  const content = await Deno.readTextFile("configs/ipfs-config.ncl");
  assertStringIncludes(content, "Addresses");
  assertStringIncludes(content, "Swarm");
  assertStringIncludes(content, "API");
  assertStringIncludes(content, "Gateway");
});

Deno.test("Unit: Swarm config defines keyFormat function", async () => {
  const content = await Deno.readTextFile("configs/swarm.ncl");
  assertStringIncludes(content, "keyFormat");
  assertStringIncludes(content, "fun key");
});

Deno.test("Unit: Config field names follow conventions", async () => {
  const bootstrapContent = await Deno.readTextFile("configs/bootstrap.ncl");
  const ipfsContent = await Deno.readTextFile("configs/ipfs-config.ncl");

  // Nickel uses camelCase or PascalCase consistently
  assertStringIncludes(bootstrapContent, "bootstrapPeers");
  assertStringIncludes(ipfsContent, "Bootstrap");
});

Deno.test("Unit: Swarm addresses use expected format patterns", async () => {
  const content = await Deno.readTextFile("configs/ipfs-config.ncl");
  // Should have ip4 and ip6 patterns
  assertStringIncludes(content, "/ip4/");
  assertStringIncludes(content, "/ip6/");
  assertStringIncludes(content, "/tcp/");
});

Deno.test("Unit: Swarm key encoding is base16", async () => {
  const content = await Deno.readTextFile("configs/swarm.ncl");
  assertStringIncludes(content, 'encoding = "base16"');
  assertStringIncludes(content, "/base16/");
});
