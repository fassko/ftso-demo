"use client";

import { useCallback, useEffect, useState } from "react";

import { nameToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { ethers } from "ethers";
import { FLARE_CONTRACT_REGISTRY_ADDRESS, FLARE_RCP } from "../Constants";
import { EpochData } from "../Interfaces";

export default function PriceReveal() {
  const [epochData, setEpochData] = useState<EpochData>();
  const [currentEpochPercentage, setCurrentEpochPercentage] = useState(0);

  function calculatePercentage(
    startTimestamp: number,
    endTimestamp: number,
    currentTimestamp: number
  ) {
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

    console.log("currentTimestamp: ftso", currentTimestamp);
    const timestampWithMilliseconds = Date.now();
    const currentTimestampJS = Math.floor(timestampWithMilliseconds / 1000);
    console.log("currentTimestampJS", currentTimestampJS);

    setEpochData({
      priceEpochId: Number(priceEpochId),
      priceEpochStartTimestamp: Number(priceEpochStartTimestamp),
      priceEpochEndTimestamp: Number(priceEpochEndTimestamp),
      priceEpochRevealEndTimestamp: Number(priceEpochRevealEndTimestamp),
      currentTimestamp: Number(currentTimestamp),
    });

    setCurrentEpochPercentage(
      calculatePercentage(
        Number(priceEpochStartTimestamp),
        Number(priceEpochEndTimestamp),
        Number(currentTimestamp)
      )
    );
  }, []);

  const onRefresh = useCallback(() => getPriceReveal(), [getPriceReveal]);

  useEffect(() => {
    getPriceReveal();
  }, [getPriceReveal, onRefresh]);

  useEffect(() => {
    const updatePercentage = () => {
      if (!epochData) return;

      const timestampWithMilliseconds = Date.now();
      const currentTimestamp = Math.floor(timestampWithMilliseconds / 1000);

      if (currentTimestamp > epochData.priceEpochEndTimestamp) {
        onRefresh();
      } else {
        setCurrentEpochPercentage(
          calculatePercentage(
            epochData.priceEpochStartTimestamp,
            epochData.priceEpochEndTimestamp,
            currentTimestamp
          )
        );
      }
    };

    const interval = setInterval(updatePercentage, 5 * 1000);

    return () => clearInterval(interval);
  }, [epochData, onRefresh]);

  function convertTodate(timestamp: number) {
    return new Date(timestamp * 1000);
  }

  return (
    <div onClick={onRefresh}>
      <div className="w-full bg-[#F4F4F4] rounded-full h-2.5 mb-4">
        <div
          className="bg-[#E62058] h-2.5 rounded-full shimmer"
          style={{ width: `${currentEpochPercentage}%` }}
        ></div>
      </div>

      {epochData && (
        <>
          <div>Price epoch ID: {epochData.priceEpochId}</div>
          <div>
            Price epoch start:{" "}
            {convertTodate(
              epochData.priceEpochStartTimestamp
            ).toLocaleDateString()}{" "}
            {convertTodate(
              epochData.priceEpochStartTimestamp
            ).toLocaleTimeString()}
          </div>
          <div>
            Price epoch end:{" "}
            {convertTodate(
              epochData.priceEpochEndTimestamp
            ).toLocaleDateString()}{" "}
            {convertTodate(
              epochData.priceEpochEndTimestamp
            ).toLocaleTimeString()}
          </div>
          <div>
            Price epoch reveal:{" "}
            {convertTodate(
              epochData.priceEpochRevealEndTimestamp
            ).toLocaleDateString()}{" "}
            {convertTodate(
              epochData.priceEpochRevealEndTimestamp
            ).toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
}
