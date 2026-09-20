-- SPDX-License-Identifier: MPL-2.0
-- Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
--
-- Port of tests/unit/config_structure_test.ts to Idris2, estate-rollout port 7/11.
-- 9 of 9 tests ported. All assertions are file-read + substring matching, so
-- the Idris2 port is structurally identical to the Deno original.

module ConfigStructureTest

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
  [ test "Unit: Config files exist at expected paths" $ do
      a <- fileExists "configs/bootstrap.ncl"
      b <- fileExists "configs/ipfs-config.ncl"
      c <- fileExists "configs/swarm.ncl"
      assertTrue "all 3 config files present" (a && b && c)

  , test "Unit: All config files have SPDX headers" $ do
      a <- readFileToString "configs/bootstrap.ncl"
      b <- readFileToString "configs/ipfs-config.ncl"
      c <- readFileToString "configs/swarm.ncl"
      let spdx = "SPDX-License-Identifier: MPL-2.0"
      allPass
        [ assertTrue "bootstrap.ncl SPDX" (isInfixOf spdx a)
        , assertTrue "ipfs-config.ncl SPDX" (isInfixOf spdx b)
        , assertTrue "swarm.ncl SPDX" (isInfixOf spdx c)
        ]

  , test "Unit: Swarm key placeholder is empty (not hardcoded)" $ do
      content <- readFileToString "configs/swarm.ncl"
      assertTrue "key = \"\" present" (isInfixOf "key = \"\"" content)

  , test "Unit: Bootstrap config has expected structure" $ do
      content <- readFileToString "configs/bootstrap.ncl"
      allPass
        [ assertTrue "bootstrapPeers" (isInfixOf "bootstrapPeers" content)
        , assertTrue "clusterPeers" (isInfixOf "clusterPeers" content)
        , assertTrue "discovery" (isInfixOf "discovery" content)
        ]

  , test "Unit: IPFS config has expected Addresses structure" $ do
      content <- readFileToString "configs/ipfs-config.ncl"
      allPass
        [ assertTrue "Addresses" (isInfixOf "Addresses" content)
        , assertTrue "Swarm" (isInfixOf "Swarm" content)
        , assertTrue "API" (isInfixOf "API" content)
        , assertTrue "Gateway" (isInfixOf "Gateway" content)
        ]

  , test "Unit: Swarm config defines keyFormat function" $ do
      content <- readFileToString "configs/swarm.ncl"
      allPass
        [ assertTrue "keyFormat" (isInfixOf "keyFormat" content)
        , assertTrue "fun key" (isInfixOf "fun key" content)
        ]

  , test "Unit: Config field names follow conventions" $ do
      bootstrap <- readFileToString "configs/bootstrap.ncl"
      ipfs <- readFileToString "configs/ipfs-config.ncl"
      allPass
        [ assertTrue "bootstrap camelCase" (isInfixOf "bootstrapPeers" bootstrap)
        , assertTrue "ipfs PascalCase" (isInfixOf "Bootstrap" ipfs)
        ]

  , test "Unit: Swarm addresses use expected format patterns" $ do
      content <- readFileToString "configs/ipfs-config.ncl"
      allPass
        [ assertTrue "ip4" (isInfixOf "/ip4/" content)
        , assertTrue "ip6" (isInfixOf "/ip6/" content)
        , assertTrue "tcp" (isInfixOf "/tcp/" content)
        ]

  , test "Unit: Swarm key encoding is base16" $ do
      content <- readFileToString "configs/swarm.ncl"
      allPass
        [ assertTrue "encoding = base16" (isInfixOf "encoding = \"base16\"" content)
        , assertTrue "/base16/ in keyFormat" (isInfixOf "/base16/" content)
        ]
  ]
