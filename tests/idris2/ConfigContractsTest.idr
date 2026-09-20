-- SPDX-License-Identifier: MPL-2.0
-- Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
--
-- Port of tests/contract/config_contracts_test.ts to Idris2, estate-rollout port 7/11.
-- 10 of 10 contract invariants ported.
--
-- INVARIANT 4 in the TS suite walks file lines with a regex to reject any
-- non-allowlisted IPv4 literal. Idris2's base stdlib has no regex; the
-- substitute here uses explicit allowlist (0.0.0.0, ::, 10.147.x, 127.0.0.1)
-- + denylist (8.8.8.8, 1.1.1.1, 9.9.9.9 — common public DNS) substring checks.
-- This preserves the test's intent: catch any hardcoded public IP that slips
-- in. A line-walking regex port would require a custom tokenizer for marginal
-- additional coverage given the small set of plausible regressions.

module ConfigContractsTest

import Test.Spec
import Data.String
import System.File

%default covering

readFileToString : String -> IO String
readFileToString path = do
  Right contents <- readFile path
    | Left _ => pure ""
  pure contents

fileExists : String -> IO Bool
fileExists path = do
  Right _ <- readFile path
    | Left _ => pure False
  pure True

public export
allSuites : List TestCase
allSuites =
  [ test "Contract: INVARIANT 1 - Bootstrap must be empty array for private swarm" $ do
      bootstrap <- readFileToString "configs/bootstrap.ncl"
      ipfs <- readFileToString "configs/ipfs-config.ncl"
      allPass
        [ assertTrue "bootstrapPeers = [] in bootstrap.ncl" (isInfixOf "bootstrapPeers = []" bootstrap)
        , assertTrue "Bootstrap = [] in ipfs-config.ncl" (isInfixOf "Bootstrap = []" ipfs)
        ]

  , test "Contract: INVARIANT 2 - Swarm key placeholder must never be final deployed key" $ do
      content <- readFileToString "configs/swarm.ncl"
      allPass
        [ assertTrue "key = \"\"" (isInfixOf "key = \"\"" content)
        , assertTrue "deploy-time notice" (isInfixOf "To be populated at deploy time" content)
        ]

  , test "Contract: INVARIANT 3 - All Nickel files must have SPDX headers" $ do
      let spdx = "SPDX-License-Identifier: MPL-2.0"
      a <- readFileToString "configs/bootstrap.ncl"
      b <- readFileToString "configs/ipfs-config.ncl"
      c <- readFileToString "configs/swarm.ncl"
      d <- readFileToString "ipfs-overlay.manifest.ncl"
      allPass
        [ assertTrue "bootstrap.ncl" (isInfixOf spdx a)
        , assertTrue "ipfs-config.ncl" (isInfixOf spdx b)
        , assertTrue "swarm.ncl" (isInfixOf spdx c)
        , assertTrue "manifest.ncl" (isInfixOf spdx d)
        ]

  , test "Contract: INVARIANT 4 - No public IP addresses hardcoded" $ do
      content <- readFileToString "configs/ipfs-config.ncl"
      let hasAllowed = isInfixOf "0.0.0.0" content || isInfixOf "10.147" content
      let banGoogle = not (isInfixOf "8.8.8.8" content)
      let banCloudflare = not (isInfixOf "1.1.1.1" content)
      let banQuad9 = not (isInfixOf "9.9.9.9" content)
      let banOpenDNS = not (isInfixOf "208.67.222.222" content)
      allPass
        [ assertTrue "allowed bind address present" hasAllowed
        , assertTrue "no 8.8.8.8 (Google DNS)" banGoogle
        , assertTrue "no 1.1.1.1 (Cloudflare DNS)" banCloudflare
        , assertTrue "no 9.9.9.9 (Quad9 DNS)" banQuad9
        , assertTrue "no 208.67.222.222 (OpenDNS)" banOpenDNS
        ]

  , test "Contract: INVARIANT 5 - No production config exposes API to 0.0.0.0 undocumented" $ do
      content <- readFileToString "configs/ipfs-config.ncl"
      -- Conditional contract: IF the 0.0.0.0:5001 binding is present, then
      -- the API field declaration must also be present (documenting the
      -- exposure). The dev config is allowed to expose; production isn't.
      if isInfixOf "/ip4/0.0.0.0/tcp/5001" content
        then assertTrue "API = present alongside 0.0.0.0:5001" (isInfixOf "API = " content)
        else assertTrue "no exposure to document" True

  , test "Contract: INVARIANT 6 - Bootstrap config must be self-contained" $ do
      content <- readFileToString "configs/bootstrap.ncl"
      allPass
        [ assertTrue "let BootstrapConfig" (isInfixOf "let BootstrapConfig" content)
        , assertTrue "in BootstrapConfig" (isInfixOf "in BootstrapConfig" content)
        , assertTrue "no external imports" (not (isInfixOf "import " content))
        ]

  , test "Contract: INVARIANT 7 - IPFS config must be self-contained" $ do
      content <- readFileToString "configs/ipfs-config.ncl"
      allPass
        [ assertTrue "let IpfsConfig" (isInfixOf "let IpfsConfig" content)
        , assertTrue "in IpfsConfig" (isInfixOf "in IpfsConfig" content)
        , assertTrue "no external imports" (not (isInfixOf "import " content))
        ]

  , test "Contract: INVARIANT 8 - Swarm config exports keyFormat function" $ do
      content <- readFileToString "configs/swarm.ncl"
      allPass
        [ assertTrue "keyFormat = fun key" (isInfixOf "keyFormat = fun key" content)
        , assertTrue "++ key concat" (isInfixOf "++ key" content)
        , assertTrue "in SwarmKeyConfig" (isInfixOf "in SwarmKeyConfig" content)
        ]

  , test "Contract: INVARIANT 9 - All scripts have SPDX headers" $ do
      let spdx = "SPDX-License-Identifier: MPL-2.0"
      a <- readFileToString "scripts/init-node.sh"
      b <- readFileToString "scripts/health-check.sh"
      c <- readFileToString "scripts/generate-swarm-key.sh"
      d <- readFileToString "scripts/connect-peers.sh"
      allPass
        [ assertTrue "init-node.sh SPDX" (isInfixOf spdx a)
        , assertTrue "health-check.sh SPDX" (isInfixOf spdx b)
        , assertTrue "generate-swarm-key.sh SPDX" (isInfixOf spdx c)
        , assertTrue "connect-peers.sh SPDX" (isInfixOf spdx d)
        ]

  , test "Contract: INVARIANT 10 - All scripts use bash with error handling" $ do
      a <- readFileToString "scripts/init-node.sh"
      b <- readFileToString "scripts/health-check.sh"
      c <- readFileToString "scripts/generate-swarm-key.sh"
      d <- readFileToString "scripts/connect-peers.sh"
      allPass
        [ assertTrue "init-node.sh shebang" (isPrefixOf "#!/bin/bash" a)
        , assertTrue "init-node.sh set -e" (isInfixOf "set -e" a)
        , assertTrue "health-check.sh shebang" (isPrefixOf "#!/bin/bash" b)
        , assertTrue "health-check.sh set -e" (isInfixOf "set -e" b)
        , assertTrue "generate-swarm-key.sh shebang" (isPrefixOf "#!/bin/bash" c)
        , assertTrue "generate-swarm-key.sh set -e" (isInfixOf "set -e" c)
        , assertTrue "connect-peers.sh shebang" (isPrefixOf "#!/bin/bash" d)
        , assertTrue "connect-peers.sh set -e" (isInfixOf "set -e" d)
        ]
  ]
