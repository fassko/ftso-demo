"use client";

import useEpochInfo from "../hooks/useEpochInfo";

export default function EpochInfo() {
  const { epochData, currentEpochPercentage } = useEpochInfo();

  function convertTodate(timestamp: number) {
    return new Date(timestamp * 1000);
  }

  return (
    <div>
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
