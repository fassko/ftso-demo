"use client";

import { useEffect, useState } from "react";

import { nameToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { ethers, formatUnits } from "ethers";

interface PriceParams {
  symbol: string;
}

export default function AssetPrice({symbol}: PriceParams) {
  const [assetPrice, setAssetPrice] = useState("");

  const FLARE_RCP = "https://flare-api.flare.network/ext/bc/C/rpc";
  const FLARE_CONTRACT_REGISTRY_ADDRESS = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019";

  useEffect(() => {
    getAssetPrice(symbol);
  }, [assetPrice]);

  function getContractAbi(contractName: string) {
    return nameToAbi(contractName, "flare").data
  }

  async function getAssetPrice(symbol: string) {
    console.log(`Getting ${symbol} price ...`);

    const provider = new ethers.JsonRpcProvider(FLARE_RCP);

    // get Flare contract registry
    // // https://docs.flare.network/dev/getting-started/contract-addresses/
    const flareContractRegistry = new ethers.Contract(
      FLARE_CONTRACT_REGISTRY_ADDRESS,
      getContractAbi("FlareContractRegistry"),
      provider
    );

    // get FTSO registry contract address
    // https://docs.flare.network/apis/smart-contracts/FlareContractRegistry/
    const ftsoRegistryAddress = await flareContractRegistry.getContractAddressByName("FtsoRegistry");

    // convert to FTSO registry contract
    // https://docs.flare.network/apis/smart-contracts/FtsoRegistry/
    const ftsoRegistry = new ethers.Contract(
      ftsoRegistryAddress,
      getContractAbi("FtsoRegistry"),
      provider
    );

    // Get current price from the FTSO
    // https://docs.flare.network/apis/smart-contracts/FtsoRegistry/#fn_getcurrentpricewithdecimals_a69afdc6
    const [price, timestamp, decimals] = await ftsoRegistry["getCurrentPriceWithDecimals(string)"](symbol);
    const assetPrice = formatUnits(price,decimals);

    console.log(`Calculated at ${new Date(Number(timestamp) * 1000)}`);
    console.log(`${Number(price) / Math.pow(10, Number(decimals))} USD`);
    console.log(`${formatUnits(price,decimals)} USD`);

    setAssetPrice(assetPrice);
  }

  return (
    <div onClick={() => {getAssetPrice(symbol)}} className="p-4 w-[300px] mx-auto rounded-xl shadow-md overflow-hidden md:max-w-2xl cursor-pointe bg-gray-50 hover:bg-gray-100 cursor-pointer gap-12">
      <h2 className="text-xl font-bold text-gray-900 block">{symbol}</h2>

      {!assetPrice && <div>Loading...</div>}
      {assetPrice && <div className="text-gray-600">$ {assetPrice}</div>}
    </div>
  )
}