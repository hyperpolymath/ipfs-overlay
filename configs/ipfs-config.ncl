# SPDX-License-Identifier: AGPL-3.0-or-later
# Nickel configuration for IPFS private swarm

let IpfsConfig = {
  Bootstrap = [],
  Addresses = {
    Swarm = [
      "/ip4/0.0.0.0/tcp/4001",
      "/ip6/::/tcp/4001"
    ],
    API = "/ip4/0.0.0.0/tcp/5001",
    Gateway = "/ip4/0.0.0.0/tcp/8080"
  },
  Swarm = {
    AddrFilters = null,
    DisableBandwidthMetrics = false,
    DisableNatPortMap = true,
    ConnMgr = {
      Type = "basic",
      LowWater = 50,
      HighWater = 200,
      GracePeriod = "20s"
    }
  },
  Discovery = {
    MDNS = {
      Enabled = false
    }
  },
  Routing = {
    Type = "none"
  },
  Datastore = {
    StorageMax = "10GB",
    StorageGCWatermark = 90,
    GCPeriod = "1h"
  },
  Experimental = {
    FilestoreEnabled = true,
    UrlstoreEnabled = true,
    ShardingEnabled = true
  }
} in IpfsConfig
