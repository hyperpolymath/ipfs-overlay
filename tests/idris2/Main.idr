-- SPDX-License-Identifier: PMPL-1.0-or-later
-- Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

module Main

import Test.Spec
import ConfigStructureTest
import ConfigContractsTest
import System

%default covering

main : IO ()
main = do
  (p1, f1) <- runTestSuite "ConfigStructureTest" ConfigStructureTest.allSuites
  (p2, f2) <- runTestSuite "ConfigContractsTest" ConfigContractsTest.allSuites
  let totalPassed = p1 + p2
  let totalFailed = f1 + f2
  putStrLn ""
  putStrLn $ "=== Total: " ++ show totalPassed ++ " passed, " ++ show totalFailed ++ " failed ==="
  if totalFailed > 0
    then exitWith (ExitFailure 1)
    else pure ()
