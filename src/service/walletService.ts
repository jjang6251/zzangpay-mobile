import { ethers } from "ethers";
import {saveWalletKey, getWalletKey, clearWalletKey} from "./keyStorage";

export type WalletInfo = {
    address: string;
};

/**
 * 사용자의 지갑 존재 여부 확인
 * @returns pk 존재 여부 boolean 값
 */
export async function hasWallet(): Promise<boolean> {
    const pk = await getWalletKey();
    // !! boolean 값만 리턴
    return !!pk;
}

/**
 * 기존 private key 가져와서 저장
 * @throws 유효하지 않은 키일 경우
 */
export async function importAndSaveWallet(pk: string): Promise<WalletInfo> {
    if (!isValidKey(pk)) throw new Error("유효하지 않은 private key예요.");
    const wallet = new ethers.Wallet(pk);
    await saveWalletKey(pk);
    return { address: wallet.address };
}

/**
 * wallet 생성과 저장
 * @returns WalletInfo 반환
 */
export async function createAndSaveWallet(): Promise<WalletInfo> {
    const wallet = ethers.Wallet.createRandom();
    await saveWalletKey(wallet.privateKey);
    return { address: wallet.address }
}

/**
 * 사용자 Wallet 정보 load
 */
export async function loadWallet(): Promise<ethers.Wallet | null> {
    const pk = await getWalletKey();
    const rpcUrl = process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL;
    if (!pk || !rpcUrl) return null;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Wallet(pk, provider);
}

/**
 * 사용자 Wallet 삭제
 */
export async function resetWallet(): Promise<void> {
    await clearWalletKey();
}

/**
 * 입력 받은 private 키가 유효한 키인지 판별
 */
export function isValidKey(pk: string): boolean {
    try {
        new ethers.Wallet(pk);
        return true;
    } catch {
        return false;
    }
}