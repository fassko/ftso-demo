import { useCallback, useEffect, useState } from "react";

import { nameToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { ethers } from "ethers";
import { FLARE_CONTRACT_REGISTRY_ADDRESS, FLARE_RCP } from "../Constants";
import Flare from "../web3/flare";

interface AssetHistoryPriceData {
  epochId: number;
  price: number;
}

const useAssetHistoryPrice = (symbol: string) => {
  const [chartData, setChartData] = useState<AssetHistoryPriceData[] | null>(
    null
  );

  const getAssetHistoryPrice = useCallback(async () => {
    const flare = Flare();
    const ftso = await flare.getFtso(symbol);

    const currentEpochId = Number(BigInt(await ftso.getCurrentEpochId()));
    const decimals = Number(BigInt(await ftso.ASSET_PRICE_USD_DECIMALS()));

    const prevPrices = await Promise.all(
      [...Array(10)].map(async (_, i) => {
        const epochId = currentEpochId - i;

        try {
          const price = Number(BigInt(await ftso.getEpochPrice(epochId)));
          return {
            epochId: epochId,
            price: price / 10 ** decimals,
          };
        } catch (error) {
          return null;
        }
      })
    );

    setChartData(
      prevPrices.filter((item) => item !== null) as AssetHistoryPriceData[]
    );
  }, [symbol]);

  useEffect(() => {
    getAssetHistoryPrice();
  }, [getAssetHistoryPrice]);

  return chartData;
};

export default useAssetHistoryPrice;
