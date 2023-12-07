"use client";

import { useCallback, useEffect, useState } from "react";

import { nameToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { ethers } from "ethers";
import { FLARE_CONTRACT_REGISTRY_ADDRESS, FLARE_RCP } from "../Constants";

interface EpochData {
  priceEpochId: number;
  priceEpochStart: Date;
  priceEpochEnd: Date;
  priceEpochRevealEnd: Date;
  current: Date;
}

export default function PriceReveal() {
  const [epochData, setEpochData] = useState<EpochData>();
  const [currentEpochPercentage, setCurrentEpochPercentage] = useState(0);

  function onRefresh() {
    getPriceReveal();
  }

  function calculatePercentage(
    startTimestamp: number,
    endTimestamp: number,
    currentTimestamp: number
  ) {
    // Convert timestamps to milliseconds if they are in seconds
    startTimestamp = startTimestamp * 1000;
    endTimestamp = endTimestamp * 1000;
    currentTimestamp = currentTimestamp * 1000;

    // Calculate total duration and elapsed time
    var totalDuration = endTimestamp - startTimestamp;
    var elapsedTime = currentTimestamp - startTimestamp;

    // Calculate the percentage
    var percentage = (elapsedTime / totalDuration) * 100;

    // Ensure the percentage is within 0 to 100
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    return percentage; // Round to two decimal places
  }

  const getPriceReveal = useCallback(async () => {
    console.log("Getting epoch information");
    const provider = new ethers.JsonRpcProvider(FLARE_RCP);
    // get Flare contract registry
    // https://docs.flare.network/dev/getting-started/contract-addresses/
    const flareContractRegistry = new ethers.Contract(
      FLARE_CONTRACT_REGISTRY_ADDRESS,
      nameToAbi("FlareContractRegistry", "flare").data,
      provider
    );
    const ftsoManagerAddress =
      await flareContractRegistry.getContractAddressByName("FtsoManager");
    const ftsoManager = new ethers.Contract(
      ftsoManagerAddress,
      nameToAbi("FtsoManager", "flare").data,
      provider
    );
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
      priceEpochStart: new Date(Number(priceEpochStartTimestamp) * 1000),
      priceEpochEnd: new Date(Number(priceEpochEndTimestamp) * 1000),
      priceEpochRevealEnd: new Date(
        Number(priceEpochRevealEndTimestamp) * 1000
      ),
      current: new Date(Number(currentTimestamp) * 1000),
    });

    setCurrentEpochPercentage(
      calculatePercentage(
        Number(priceEpochStartTimestamp),
        Number(priceEpochRevealEndTimestamp),
        Number(currentTimestamp)
      )
    );
  }, []);

  useEffect(() => {
    getPriceReveal();

    const timerID = setInterval(onRefresh, 5 * 1000);

    // const timerID = setInterval(() => onRefresh, 60000);
    // return () => {
    //   clearInterval(timerID);
    // };

    return () => {
      clearInterval(timerID);
    };
  }, [getPriceReveal]);

  return (
    <div onClick={onRefresh}>
      <div className="w-full bg-[#F4F4F4] rounded-full h-2.5 mb-4">
        <div
          className="bg-[#E62058] h-2.5 rounded-full"
          style={{ width: `${currentEpochPercentage}%` }}
        ></div>
      </div>

      {epochData && (
        <>
          <div>Price epoch ID: {epochData.priceEpochId}</div>
          <div>
            Price epoch start: {epochData.priceEpochStart.toLocaleDateString()}{" "}
            {epochData.priceEpochStart.toLocaleTimeString()}
          </div>
          <div>
            Price epoch end: {epochData.priceEpochEnd.toLocaleDateString()}{" "}
            {epochData.priceEpochEnd.toLocaleTimeString()}
          </div>
          <div>
            Price epoch reveal:{" "}
            {epochData.priceEpochRevealEnd.toLocaleDateString()}{" "}
            {epochData.priceEpochRevealEnd.toLocaleTimeString()}
          </div>
          <div>
            Current time: {epochData.current.toLocaleDateString()}{" "}
            {epochData.current.toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
}
