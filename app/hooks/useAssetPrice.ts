import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "ethers";
import { EpochData } from "../interfaces/EpochData";
import Flare from "../web3/flare";

interface TokenDetails {
  price: string;
  time: Date;
}

const getPriceFromBlockchain = async (symbol: string) => {
  const flare = Flare();

  const ftsoManager = await flare.getContract("FtsoManager");
  const ftsoRegistry = await flare.getContract("FtsoRegistry");

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
