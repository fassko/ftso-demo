"use client";

import { useCallback, useEffect, useState } from "react";

import { nameToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { ethers, formatUnits, toNumber } from "ethers";

interface PriceParams {
  symbol: string;
}

interface PriceDetails {
  price: string;
  time: Date;
}

const FLARE_RCP = "https://flare-api.flare.network/ext/bc/C/rpc";
const FLARE_CONTRACT_REGISTRY_ADDRESS =
  "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019";

export default function Price({ symbol }: PriceParams) {
  const [assetPrice, setAssetPrice] = useState<PriceDetails>();

  function onRefresh() {
    getAssetPrice(symbol);
  }

  const getAssetPrice = useCallback(async (symbol: string) => {
    setAssetPrice(undefined);

    console.log(`Getting ${symbol} price ...`);

    const provider = new ethers.JsonRpcProvider(FLARE_RCP);

    // get Flare contract registry
    // // https://docs.flare.network/dev/getting-started/contract-addresses/
    const flareContractRegistry = new ethers.Contract(
      FLARE_CONTRACT_REGISTRY_ADDRESS,
      nameToAbi("FlareContractRegistry", "flare").data,
      provider
    );

    // get FTSO registry contract address
    // https://docs.flare.network/apis/smart-contracts/FlareContractRegistry/
    const ftsoRegistryAddress =
      await flareContractRegistry.getContractAddressByName("FtsoRegistry");

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
    const assetPrice = formatUnits(price, decimals);
    const time = new Date(Number(timestamp) * 1000);

    console.log(`Calculated at ${time}`);
    // console.log(`${Number(price) / Math.pow(10, Number(decimals))} USD`);
    console.log(`${formatUnits(price, decimals)} USD`);

    let USDollar = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: Number(decimals),
    });

    setAssetPrice({ price: USDollar.format(Number(assetPrice)), time: time });
  }, []);

  useEffect(() => {
    getAssetPrice(symbol);
  }, [getAssetPrice, symbol]);

  return (
    <div
      onClick={onRefresh}
      className="py-2 px-4 mx-auto rounded-xl shadow-md overflow-hidden md:max-w-2xl bg-[#F4F4F4] hover:bg-opacity-50 cursor-pointer gap-8 w-[320px]"
    >
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
    </div>
  );
}
