# SPDX-License-Identifier: AGPL-3.0-or-later
# Nickel configuration for IPFS swarm key

let SwarmKeyConfig = {
  version = "1.0.0",
  keyType = "psk",
  encoding = "base16",
  # Generate with: tr -dc 'a-f0-9' < /dev/urandom | head -c 64
  key = "",  # To be populated at deploy time

  keyFormat = fun key =>
    "/key/swarm/psk/1.0.0/\n/base16/\n" ++ key
} in SwarmKeyConfig
