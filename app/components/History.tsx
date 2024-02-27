"use client";

import { useCallback, useEffect, useState } from "react";

import { nameToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { ethers } from "ethers";
import { FLARE_CONTRACT_REGISTRY_ADDRESS, FLARE_RCP } from "../Constants";
import { BigNumber } from "bignumber.js";
import Chart from "./Chart";

interface HistoryParams {
  symbol: string;
  color: string;
}

export default function History({ symbol, color }: HistoryParams) {
  const [chartData, setChartData] =
    useState<{ epochId: number; price: number }[]>();

  const getAssetHistoryPrice = useCallback(async (symbol: string) => {
    const provider = new ethers.JsonRpcProvider(FLARE_RCP);

    // get Flare contract registry
    // https://docs.flare.network/dev/getting-started/contract-addresses/
    const flareContractRegistry = new ethers.Contract(
      FLARE_CONTRACT_REGISTRY_ADDRESS,
      nameToAbi("FlareContractRegistry", "flare").data,
      provider
    );

    const ftsoRegistryAddress =
      await flareContractRegistry.getContractAddressByName("FtsoRegistry");

    // convert to FTSO registry contract
    // https://docs.flare.network/apis/smart-contracts/FtsoRegistry/
    const ftsoRegistry = new ethers.Contract(
      ftsoRegistryAddress,
      nameToAbi("FtsoRegistry", "flare").data,
      provider
    );

    const [address] = await ftsoRegistry["getFtsoBySymbol(string)"](symbol);

    const ftsoAddress = await ftsoRegistry["getFtsoBySymbol(string)"](symbol);

    const ftso = new ethers.Contract(
      ftsoAddress,
      nameToAbi("Ftso", "flare").data,
      provider
    );

    const currentEpochId = new BigNumber(
      await ftso["getCurrentEpochId()"]()
    ).toNumber();

    const prevPrice = new BigNumber(
      await ftso["getEpochPrice(uint256)"](currentEpochId - 1)
    ).toNumber();

    const decimals = new BigNumber(
      await ftso["ASSET_PRICE_USD_DECIMALS()"]()
    ).toNumber();

    const prevPrices = (
      await Promise.all(
        [...Array(10)].map(async (_, i) => {
          const epochId = currentEpochId - i;

          try {
            const price = new BigNumber(
              await ftso["getEpochPrice(uint256)"](epochId)
            ).toNumber();

            return {
              epochId: epochId,
              price: price / 10 ** decimals,
            };
          } catch (error) {
            return null;
          }
        })
      )
    ).filter((item) => item !== null) as { epochId: number; price: number }[];

    setChartData(prevPrices);
  }, []);

  useEffect(() => {
    getAssetHistoryPrice(symbol);
  }, [getAssetHistoryPrice, symbol]);

  return (
    <div className="max-h-80 mx-auto">
      {chartData && (
        <Chart color={color} symbol={symbol} chartData={chartData} />
      )}
    </div>
  );
}
