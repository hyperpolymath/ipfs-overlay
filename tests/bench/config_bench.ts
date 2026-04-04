// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

// Baseline performance benchmarks for config file reading
// Provides reference metrics for detecting performance regressions

Deno.bench("read bootstrap config", async () => {
  await Deno.readTextFile("configs/bootstrap.ncl");
});

Deno.bench("read IPFS config", async () => {
  await Deno.readTextFile("configs/ipfs-config.ncl");
});

Deno.bench("read swarm config", async () => {
  await Deno.readTextFile("configs/swarm.ncl");
});

Deno.bench("read all three configs sequentially", async () => {
  await Deno.readTextFile("configs/bootstrap.ncl");
  await Deno.readTextFile("configs/ipfs-config.ncl");
  await Deno.readTextFile("configs/swarm.ncl");
});

Deno.bench("read all three configs in parallel", async () => {
  await Promise.all([
    Deno.readTextFile("configs/bootstrap.ncl"),
    Deno.readTextFile("configs/ipfs-config.ncl"),
    Deno.readTextFile("configs/swarm.ncl"),
  ]);
});

Deno.bench("read and parse bootstrap structure", async () => {
  const content = await Deno.readTextFile("configs/bootstrap.ncl");
  // Simple structure check: count fields
  const bootstrapPeersMatch = content.match(/bootstrapPeers/g);
  const clusterPeersMatch = content.match(/clusterPeers/g);
  const discoveryMatch = content.match(/discovery/g);
  return {
    bootstrapPeers: bootstrapPeersMatch?.length ?? 0,
    clusterPeers: clusterPeersMatch?.length ?? 0,
    discovery: discoveryMatch?.length ?? 0,
  };
});

Deno.bench("read and validate SPDX headers", async () => {
  const configs = [
    "configs/bootstrap.ncl",
    "configs/ipfs-config.ncl",
    "configs/swarm.ncl",
  ];

  const validations = await Promise.all(
    configs.map(async (file) => {
      const content = await Deno.readTextFile(file);
      return content.includes("SPDX-License-Identifier: PMPL-1.0-or-later");
    }),
  );

  return validations.every((v) => v);
});

Deno.bench("read all scripts", async () => {
  await Promise.all([
    Deno.readTextFile("scripts/init-node.sh"),
    Deno.readTextFile("scripts/health-check.sh"),
    Deno.readTextFile("scripts/generate-swarm-key.sh"),
    Deno.readTextFile("scripts/connect-peers.sh"),
  ]);
});

Deno.bench("validate all script headers", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  const validations = await Promise.all(
    scripts.map(async (file) => {
      const content = await Deno.readTextFile(file);
      return content.includes("SPDX-License-Identifier");
    }),
  );

  return validations.every((v) => v);
});
