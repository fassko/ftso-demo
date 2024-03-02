import { useCallback, useEffect, useState } from "react";
import { EpochData } from "../interfaces/EpochData";
import Flare from "../web3/flare";

const getPriceRevealFromBlockchain = async () => {
  const flare = Flare();
  const ftsoManager = await flare.getContract("FtsoManager");

  const [
    priceEpochId,
    priceEpochStartTimestamp,
    priceEpochEndTimestamp,
    priceEpochRevealEndTimestamp,
    currentTimestamp,
  ] = await ftsoManager.getCurrentPriceEpochData();

  return {
    priceEpochId: Number(priceEpochId),
    priceEpochStartTimestamp: Number(priceEpochStartTimestamp),
    priceEpochEndTimestamp: Number(priceEpochEndTimestamp),
    priceEpochRevealEndTimestamp: Number(priceEpochRevealEndTimestamp),
    currentTimestamp: Number(currentTimestamp),
  };
};

const fetchEpochData = async () => {
  try {
    const data = await getPriceRevealFromBlockchain();
    return data;
  } catch (error) {
    console.error("Error fetching epoch data:", error);
    return null;
  }
};

const useEpochInfo = () => {
  const [epochData, setEpochData] = useState<EpochData>();
  const [currentEpochPercentage, setCurrentEpochPercentage] =
    useState<number>(0);

  const calculatePercentage = (
    startTimestamp: number,
    endTimestamp: number,
    currentTimestamp: number
  ): number => {
    let percentage =
      ((currentTimestamp - startTimestamp) / (endTimestamp - startTimestamp)) *
      100;
    percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0 and 100
    return percentage;
  };

  const getPriceReveal = useCallback(async () => {
    const data = await fetchEpochData();
    if (data) {
      setEpochData(data);
      setCurrentEpochPercentage(
        calculatePercentage(
          data.priceEpochStartTimestamp,
          data.priceEpochEndTimestamp,
          data.currentTimestamp
        )
      );
    }
  }, []);

  const onRefresh = useCallback(() => {
    getPriceReveal();
  }, [getPriceReveal]);

  useEffect(() => {
    getPriceReveal();
  }, [getPriceReveal]);

  useEffect(() => {
    const updatePercentage = () => {
      if (!epochData) return;

      const currentTimestamp = Math.floor(Date.now() / 1000);

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

  const convertToDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return {
    epochData,
    currentEpochPercentage,
    convertToDate,
    onRefresh,
  };
};

export default useEpochInfo;
