"use client";

import { Accordion } from "@mantine/core";
import History from "./History";
import useAssetPrice from "../hooks/useAssetPrice";

interface TokenParams {
  symbol: string;
  color: string;
}

export default function Token({ symbol, color }: TokenParams) {
  const { assetPrice } = useAssetPrice(symbol);

  return (
    <Accordion.Item key={symbol} value={symbol}>
      <Accordion.Control>
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
      </Accordion.Control>
      <Accordion.Panel>
        <History symbol={symbol} color={color} />
      </Accordion.Panel>
    </Accordion.Item>
  );
}
