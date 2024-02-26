"use client";

import { useCallback, useEffect, useState } from "react";

import { nameToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { ethers } from "ethers";
import { FLARE_CONTRACT_REGISTRY_ADDRESS, FLARE_RCP } from "../Constants";
import { EpochData } from "../Interfaces";
import { BigNumber } from "bignumber.js";

interface PriceParams {
  symbol: string;
}

interface PriceDetails {
  price: string;
  time: Date;
}

export default function Price({ symbol }: PriceParams) {
  const [assetPrice, setAssetPrice] = useState<PriceDetails>();
  const [epochData, setEpochData] = useState<EpochData>();

  function onRefresh() {
    getAssetPrice(symbol);
  }

  const getAssetPrice = useCallback(async (symbol: string) => {
    setAssetPrice(undefined);

    console.log(`Getting ${symbol} price ...`);

    const provider = new ethers.JsonRpcProvider(FLARE_RCP);

    // get Flare contract registry
    // https://docs.flare.network/dev/getting-started/contract-addresses/
    const flareContractRegistry = new ethers.Contract(
      FLARE_CONTRACT_REGISTRY_ADDRESS,
      nameToAbi("FlareContractRegistry", "flare").data,
      provider
    );

    // get FTSO registry contract address
    // https://docs.flare.network/apis/smart-contracts/FlareContractRegistry/
    const ftsoRegistryAddress =
      await flareContractRegistry.getContractAddressByName("FtsoRegistry");

    const ftsoManagerAddress =
      await flareContractRegistry.getContractAddressByName("FtsoManager");

    const ftsoManager = new ethers.Contract(
      ftsoManagerAddress,
      nameToAbi("FtsoManager", "flare").data,
      provider
    );

    // convert to FTSO registry contract
    // https://docs.flare.network/apis/smart-contracts/FtsoRegistry/
    const ftsoRegistry = new ethers.Contract(
      ftsoRegistryAddress,
      nameToAbi("FtsoRegistry", "flare").data,
      provider
    );

    // Get current price from the FTSO
    // https://docs.flare.network/apis/smart-contracts/FtsoRegistry/#fn_getcurrentpricewithdecimals_a69afdc6
    const [price, timestamp, decimals] = await ftsoRegistry[
      "getCurrentPriceWithDecimals(string)"
    ](symbol);
    const assetPrice =
      new BigNumber(price).toNumber() /
      100 ** new BigNumber(decimals).toNumber();
    const time = new Date(Number(timestamp) * 1000);

    let USDollar = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: Number(decimals),
    });

    setAssetPrice({ price: USDollar.format(Number(assetPrice)), time: time });

    const [
      priceEpochId,
      priceEpochStartTimestamp,
      priceEpochEndTimestamp,
      priceEpochRevealEndTimestamp,
      currentTimestamp,
    ] = await ftsoManager.getCurrentPriceEpochData();
    console.log("priceEpochId", priceEpochId);
    console.log("priceEpochStartTimestamp", priceEpochStartTimestamp);
    console.log("priceEpochEndTimestamp", priceEpochEndTimestamp);
    console.log(
      "priceEpocpriceEpochRevealEndTimestamphId",
      priceEpochRevealEndTimestamp
    );
    console.log("currentTimestamp", currentTimestamp);

    setEpochData({
      priceEpochId: Number(priceEpochId),
      priceEpochStartTimestamp: Number(priceEpochStartTimestamp),
      priceEpochEndTimestamp: Number(priceEpochEndTimestamp),
      priceEpochRevealEndTimestamp: Number(priceEpochRevealEndTimestamp),
      currentTimestamp: Number(currentTimestamp),
    });
  }, []);

  useEffect(() => {
    getAssetPrice(symbol);
  }, [getAssetPrice, symbol]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTimestamp = Date.now() / 1000;
      if (
        epochData &&
        currentTimestamp > epochData.priceEpochRevealEndTimestamp
      ) {
        onRefresh();
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [epochData, onRefresh]);

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 block">{symbol}</h2>

      {assetPrice ? (
        <div>
          <div className="flex">{assetPrice.price}</div>
          <div>
            {`${assetPrice.time.toLocaleTimeString()} ${assetPrice.time.toLocaleDateString()}`}
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
