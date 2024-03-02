#!/bin/bash

npx typechain --target ethers-v6 --out-dir app/contracts/ftso/implementation './node_modules/@flarenetwork/flare-periphery-contract-artifacts/flare/artifacts/contracts/ftso/implementation/**/*.json'

npx typechain --target ethers-v6 --out-dir app/contracts/utils/implementation './node_modules/@flarenetwork/flare-periphery-contract-artifacts/flare/artifacts/contracts/utils/implementation/**/*.json'