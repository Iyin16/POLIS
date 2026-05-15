import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";
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

    const file = new MemData(
      new TextEncoder().encode(memoryString)
    );

    const [uploadResult, uploadErr] = await indexer.upload(
      file,
      RPC_URL,
      signer
    );

    if (uploadErr) {
      throw uploadErr;
    }

    const rootHash = uploadResult
      ? "rootHash" in uploadResult
        ? uploadResult.rootHash
        : Array.isArray(uploadResult.rootHashes)
        ? uploadResult.rootHashes[0]
        : null
      : null;

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