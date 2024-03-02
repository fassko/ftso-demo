"use client";

import Chart from "./Chart";
import useAssetHistoryPrice from "../hooks/useAssetHistoryPrice";

interface HistoryParams {
  symbol: string;
  color: string;
}

export default function History({ symbol, color }: HistoryParams) {
  const chartData = useAssetHistoryPrice({ symbol });

  return (
    <div className="max-h-80 mx-auto">
      {chartData && (
        <Chart color={color} symbol={symbol} chartData={chartData} />
      )}
    </div>
  );
}
