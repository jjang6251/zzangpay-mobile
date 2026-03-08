import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";
import artifact from "../../artifacts/Zusdc.json";
import {loadWallet} from "./walletService";

const PRIVATE_KEY = "zzzzzzpay.private";
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
    const {contract, wallet} = await getTestWalletContract();

    const balance = await contract.balanceOf(wallet.address);
    const decimals = await contract.decimals();

    return ethers.formatUnits(balance, decimals);
}