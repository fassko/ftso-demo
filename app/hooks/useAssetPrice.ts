import { useCallback, useEffect, useState } from "react";

import { EpochData } from "../interfaces/EpochData";
import Flare from "../web3/flare";

interface TokenDetails {
  price: string;
  time: Date;
}

interface GetPriceFromBlockchainProps {
  symbol: string;
}

async function getPriceFromBlockchain(symbol: string) {
  const flare = Flare();

  const priceData = await flare.getPrice(symbol);

  const formattedPrice = priceData.price / 10 ** priceData.decimals;
  const time = new Date(priceData.timestamp * 1000);

  let USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: Number(priceData.decimals),
  });

  const assetPrice = {
    price: USDollar.format(Number(formattedPrice)),
    time,
  };

  const currentPriceEpoch = await flare.getCurrentPriceEpoch();

  const epochData = {
    priceEpochId: currentPriceEpoch.priceEpochId,
    priceEpochStartTimestamp: currentPriceEpoch.priceEpochStartTimestamp,
    priceEpochEndTimestamp: currentPriceEpoch.priceEpochEndTimestamp,
    priceEpochRevealEndTimestamp:
      currentPriceEpoch.priceEpochRevealEndTimestamp,
    currentTimestamp: currentPriceEpoch.currentTimestamp,
  };

  return { assetPrice, epochData };
}

function useAssetPrice(symbol: string) {
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
}

export default useAssetPrice;
