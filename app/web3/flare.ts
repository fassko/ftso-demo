import { ethers } from "ethers";
import { nameToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { FLARE_CONTRACT_REGISTRY_ADDRESS, FLARE_RCP } from "../Constants";

// Define the type for the provider more accurately
type JsonRpcProviderType = ethers.JsonRpcProvider;

export default function Flare() {
  const provider: JsonRpcProviderType = new ethers.JsonRpcProvider(FLARE_RCP);

  // Function to initialize the Flare Contract Registry
  const getFlareContractRegistry = () => {
    return new ethers.Contract(
      FLARE_CONTRACT_REGISTRY_ADDRESS,
      nameToAbi("FlareContractRegistry", "flare").data,
      provider
    );
  };

  // Function to get a contract address by name from the Flare Contract Registry
  const getContractAddressByName = async (contractName: string) => {
    const flareContractRegistry = getFlareContractRegistry();
    const contractAddress =
      await flareContractRegistry.getContractAddressByName(contractName);
    return contractAddress;
  };

  // Function to get an initialized contract instance by name
  const getContract = async (contractName: string) => {
    const contractAddress = await getContractAddressByName(contractName);
    return new ethers.Contract(
      contractAddress,
      nameToAbi(contractName, "flare").data,
      provider
    );
  };

  return {
    getFlareContractRegistry,
    getContractAddressByName,
    getContract,
  };
}
