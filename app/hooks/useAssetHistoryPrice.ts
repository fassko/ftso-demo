import { useCallback, useEffect, useState } from "react";

import Flare from "../web3/flare";

interface AssetHistoryPriceData {
  epochId: number;
  price: number;
}

interface UseAssetHistoryProps {
  symbol: string;
}

function useAssetHistoryPrice({ symbol }: UseAssetHistoryProps) {
  const [chartData, setChartData] = useState<AssetHistoryPriceData[] | null>(
    null
  );

  const getAssetHistoryPrice = useCallback(async () => {
    const flare = Flare();

    const currentEpochId = await flare.getCurrentEpochId(symbol);
    const decimals = await flare.getDecimals(symbol);

    const prevPrices = await Promise.all(
      [...Array(10)].map(async (_, i) => {
        const epochId = currentEpochId - i;

        try {
          const price = await flare.getEpochPrice(symbol, epochId);
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
}

export default useAssetHistoryPrice;
