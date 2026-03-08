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
    if(!pk) return null;
    return new ethers.Wallet(pk);
}

/**
 * 사용자 Wallet 삭제
 */
export async function resetWallet(): Promise<void> {
    await clearWalletKey();
}