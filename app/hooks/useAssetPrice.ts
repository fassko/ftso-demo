import { useCallback, useEffect, useState } from "react";
import { ethers, formatUnits } from "ethers";
import { nameToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { FLARE_CONTRACT_REGISTRY_ADDRESS, FLARE_RCP } from "../Constants";
import { EpochData } from "../interfaces/EpochData";

interface TokenDetails {
  price: string;
  time: Date;
}

const getPriceFromBlockchain = async (symbol: string) => {
  const provider = new ethers.JsonRpcProvider(FLARE_RCP);

  const flareContractRegistry = new ethers.Contract(
    FLARE_CONTRACT_REGISTRY_ADDRESS,
    nameToAbi("FlareContractRegistry", "flare").data,
    provider
  );

  const ftsoRegistryAddress =
    await flareContractRegistry.getContractAddressByName("FtsoRegistry");

  const ftsoManagerAddress =
    await flareContractRegistry.getContractAddressByName("FtsoManager");

  const ftsoManager = new ethers.Contract(
    ftsoManagerAddress,
    nameToAbi("FtsoManager", "flare").data,
    provider
  );

  const ftsoRegistry = new ethers.Contract(
    ftsoRegistryAddress,
    nameToAbi("FtsoRegistry", "flare").data,
    provider
  );

  const [price, timestamp, decimals] = await ftsoRegistry[
    "getCurrentPriceWithDecimals(string)"
  ](symbol);

  const assetPriceValue = formatUnits(price, decimals);
  const time = new Date(Number(timestamp) * 1000);

  let USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: Number(decimals),
  });

  const assetPrice = {
    price: USDollar.format(Number(assetPriceValue)),
    time,
  };

  const [
    priceEpochId,
    priceEpochStartTimestamp,
    priceEpochEndTimestamp,
    priceEpochRevealEndTimestamp,
    currentTimestamp,
  ] = await ftsoManager.getCurrentPriceEpochData();

  const epochData = {
    priceEpochId: Number(priceEpochId),
    priceEpochStartTimestamp: Number(priceEpochStartTimestamp),
    priceEpochEndTimestamp: Number(priceEpochEndTimestamp),
    priceEpochRevealEndTimestamp: Number(priceEpochRevealEndTimestamp),
    currentTimestamp: Number(currentTimestamp),
  };

  return { assetPrice, epochData };
};

const useAssetPrice = (symbol: string) => {
  const [assetPrice, setAssetPrice] = useState<TokenDetails>();
  const [epochData, setEpochData] = useState<EpochData>();

  const getAssetPrice = useCallback(async () => {
    setAssetPrice(undefined);

    const { assetPrice, epochData } = await getPriceFromBlockchain(symbol);
    setAssetPrice(assetPrice);
    setEpochData(epochData);
  }, [symbol]);

  useEffect(() => {
    getAssetPrice();
  }, [getAssetPrice]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (
        epochData &&
        currentTimestamp > epochData.priceEpochRevealEndTimestamp
      ) {
        await getAssetPrice();
      }
    }, 10 * 1000);
    return () => clearInterval(interval);
  }, [epochData, getAssetPrice]);

  return { assetPrice, epochData };
};

export default useAssetPrice;
