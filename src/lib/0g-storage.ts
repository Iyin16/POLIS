import { Indexer } from "@0gfoundation/0g-storage-ts-sdk/browser";
import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const RPC_URL = "https://evmrpc-testnet.0g.ai";
const INDEXER_RPC = "https://indexer-storage-testnet-turbo.0g.ai";

export async function archiveGovernanceMemory(memory: any) {
  try {
    console.log("Uploading governance memory to 0G...", memory);

    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    const provider = new BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    const indexer = new Indexer(INDEXER_RPC);

    const memoryString = JSON.stringify(memory);

    const blob = new Blob([new TextEncoder().encode(memoryString)], { type: "application/json" });

    const [rootHash, uploadErr] = await indexer.upload(
      blob as any,
      RPC_URL,
      signer
    );

    if (uploadErr) {
      throw uploadErr;
    }

    console.log("0G ROOT HASH:", rootHash);

    return {
      success: true,
      rootHash,
    };
  } catch (error) {
    console.error("0G Storage Error:", error);

    return {
      success: false,
      error,
    };
  }
}