// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Smoke: All scripts exist", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  for (const script of scripts) {
    await Deno.readTextFile(script);
  }
});

Deno.test("Smoke: All scripts have SPDX headers", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  for (const script of scripts) {
    const content = await Deno.readTextFile(script);
    assert(
      content.includes("SPDX-License-Identifier"),
      `${script} missing SPDX header`,
    );
  }
});

Deno.test("Smoke: Scripts have executable permission", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  for (const script of scripts) {
    const stat = await Deno.stat(script);
    const mode = stat.mode;
    // Check if owner execute bit is set (mode & 0o100)
    assert(
      mode !== null && (mode & 0o100) !== 0,
      `${script} is not executable`,
    );
  }
});

Deno.test("Smoke: Scripts don't contain eval injection vector", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  for (const script of scripts) {
    const content = await Deno.readTextFile(script);
    assert(
      !content.includes(" eval "),
      `${script} contains eval statement`,
    );
  }
});

Deno.test("Smoke: Scripts don't use unsafe command substitution", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  for (const script of scripts) {
    const content = await Deno.readTextFile(script);
    // Check for unsafe patterns like $(...) with user input
    // Safe pattern: $(...) with static commands is OK
    // Unsafe: $(...$...) nested with variables
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check for backtick eval pattern (older bash)
      if (line.includes("`") && line.includes("$")) {
        assert(
          !line.includes("`$"),
          `${script} line ${i + 1}: unsafe nested substitution`,
        );
      }
    }
  }
});

Deno.test("Smoke: init-node.sh has bash shebang", async () => {
  const content = await Deno.readTextFile("scripts/init-node.sh");
  assert(
    content.startsWith("#!/bin/bash"),
    "init-node.sh missing #!/bin/bash shebang",
  );
});

Deno.test("Smoke: All scripts use set -e (fail-fast)", async () => {
  const scripts = [
    "scripts/init-node.sh",
    "scripts/health-check.sh",
    "scripts/generate-swarm-key.sh",
    "scripts/connect-peers.sh",
  ];

  for (const script of scripts) {
    const content = await Deno.readTextFile(script);
    assert(
      content.includes("set -e"),
      `${script} missing "set -e" for error handling`,
    );
  }
});
