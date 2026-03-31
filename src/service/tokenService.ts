import { ethers } from "ethers";
import artifact from "../../artifacts/Zusdc.json";
import { loadWallet } from "./walletService";

const ZUSDC_CONTRACT_ADDRESS = "0x6fe89141175341e5C27B7a4C458d28781c52208a";

const abi = artifact.abi;

const rpcUrl = process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL;
if (!rpcUrl) {
    throw new Error("Missing EXPO_PUBLIC_SEPOLIA_RPC_URL in env");
}

const provider = new ethers.JsonRpcProvider(rpcUrl);

type WalletAndContractInfo = {
    wallet: ethers.Wallet,
    contract: ethers.Contract
}


async function getUserWalletContract(): Promise<WalletAndContractInfo> {
    const wallet = await loadWallet();
    if (!wallet) throw new Error("No wallet found");

    return {
        wallet: wallet,
        contract: new ethers.Contract(ZUSDC_CONTRACT_ADDRESS, abi, wallet)
    };
}

async function getTestWalletContract(): Promise<WalletAndContractInfo> {
    const privateKey = process.env.EXPO_PUBLIC_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("Missing EXPO_PUBLIC_PRIVATE_KEY in env");
    }

    const wallet = new ethers.Wallet(privateKey, provider);

    return {
        wallet: wallet,
        contract: new ethers.Contract(ZUSDC_CONTRACT_ADDRESS, abi, wallet)
    }
}

export async function getUserTotalBalance(): Promise<string> {
    const { contract, wallet } = await getUserWalletContract();

    const balance = await contract.balanceOf(wallet.address);
    const decimals = await contract.decimals();

    return ethers.formatUnits(balance, decimals);
}

export type TransactionRecord = {
  hash: string;
  from: string;
  to: string;
  amount: string;
  blockNumber: number;
  type: "sent" | "received";
};

export async function getTransactionHistory(): Promise<TransactionRecord[]> {
  const { contract, wallet } = await getUserWalletContract();
  const decimals = await contract.decimals();

  const [sentEvents, receivedEvents] = await Promise.all([
    contract.queryFilter(contract.filters.Transfer(wallet.address, null), -50000),
    contract.queryFilter(contract.filters.Transfer(null, wallet.address), -50000),
  ]);

  const seen = new Set<string>();
  const allEvents = [...sentEvents, ...receivedEvents]
    .filter((e) => {
      if (seen.has(e.transactionHash)) return false;
      seen.add(e.transactionHash);
      return true;
    })
    .sort((a, b) => b.blockNumber - a.blockNumber);

  return allEvents.map((event) => {
    const log = event as ethers.EventLog;
    const isSent = log.args[0].toLowerCase() === wallet.address.toLowerCase();
    return {
      hash: log.transactionHash,
      from: log.args[0],
      to: log.args[1],
      amount: ethers.formatUnits(log.args[2], decimals),
      blockNumber: log.blockNumber,
      type: isSent ? "sent" : "received",
    };
  });
}

export async function sendToken(toAddress: string, amount: number): Promise<string> {
    if (!ethers.isAddress(toAddress)) {
        throw new Error("유효하지 않은 주소예요.");
    }
    if (amount <= 0) {
        throw new Error("전송 금액은 0보다 커야 해요.");
    }

    const { contract, wallet } = await getUserWalletContract();
    const decimals = await contract.decimals();
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

    const balance = await contract.balanceOf(wallet.address);
    if (balance < parsedAmount) {
        throw new Error("ZUSDC 잔액이 부족해요.");
    }

    const ethBalance = await wallet.provider!.getBalance(wallet.address);
    if (ethBalance === 0n) {
        throw new Error("가스비로 사용할 ETH가 없어요.");
    }

    const tx = await contract.transfer(toAddress, parsedAmount);
    const receipt = await tx.wait();

    return receipt.hash;
}