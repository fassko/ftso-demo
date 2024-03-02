import { ethers } from "ethers";
import { nameToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { FLARE_CONTRACT_REGISTRY_ADDRESS, FLARE_RCP } from "../Constants";
import {
  FlareContractRegistry,
  FtsoRegistry,
} from "../contracts/utils/implementation";
import { Ftso, FtsoManager } from "../contracts/ftso/implementation";

// Define the type for the provider more accurately
type JsonRpcProviderType = ethers.JsonRpcProvider;

export default function Flare() {
  const provider: JsonRpcProviderType = new ethers.JsonRpcProvider(FLARE_RCP);

  // Function to initialize the Flare Contract Registry
  function getFlareContractRegistry() {
    return new ethers.Contract(
      FLARE_CONTRACT_REGISTRY_ADDRESS,
      nameToAbi("FlareContractRegistry", "flare").data,
      provider
    ) as unknown as FlareContractRegistry;
  }

  // Function to get a contract address by name from the Flare Contract Registry
  const getContractAddressByName = async (contractName: string) => {
    const flareContractRegistry = getFlareContractRegistry();
    const contractAddress =
      await flareContractRegistry.getContractAddressByName(contractName);
    return contractAddress;
  };

  // Function to get an initialized contract instance by name
  async function getContract<T>(contractName: string): Promise<T> {
    const contractAddress = await getContractAddressByName(contractName);
    return new ethers.Contract(
      contractAddress,
      nameToAbi(contractName, "flare").data,
      provider
    ) as unknown as T;
  }

  // Get Ftso by symbol name, for instance BTC Ftso
  async function getFtso(symbol: string) {
    const ftsoRegistry = await getContract<FtsoRegistry>("FtsoRegistry");

    const ftsoAddress = await ftsoRegistry.getFtsoBySymbol(symbol);
    return new ethers.Contract(
      ftsoAddress,
      nameToAbi("Ftso", "flare").data,
      new ethers.JsonRpcProvider(FLARE_RCP)
    ) as unknown as Ftso;
  }

  // Get current price Eoch data
  async function getCurrentPriceEpoch() {
    const ftsoManager = await getContract<FtsoManager>("FtsoManager");

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
  }

  async function getPrice(symbol: string) {
    const ftsoRegistry = await getContract<FtsoRegistry>("FtsoRegistry");

    const [price, timestamp, decimals] = await ftsoRegistry[
      "getCurrentPriceWithDecimals(string)"
    ](symbol);

    return {
      price: Number(price),
      timestamp: Number(timestamp),
      decimals: Number(decimals),
    };
  }

  async function getCurrentEpochId(symbol: string) {
    const ftso = await getFtso(symbol);

    return Number(await ftso.getCurrentEpochId());
  }

  async function getDecimals(symbol: string) {
    const ftso = await getFtso(symbol);

    return Number(await ftso.ASSET_PRICE_USD_DECIMALS());
  }

  async function getEpochPrice(symbol: string, epochId: number) {
    const ftso = await getFtso(symbol);

    return Number(await ftso.getEpochPrice(epochId));
  }

  return {
    getPrice,
    getCurrentPriceEpoch,
    getCurrentEpochId,
    getDecimals,
    getEpochPrice,
  };
}
