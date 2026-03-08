import * as SecureStore from "expo-secure-store";

const WALLET_KEY = "zzzzzzpay.private";

export async function saveWalletKey(key: string) {
    await SecureStore.setItemAsync(WALLET_KEY, key);
}

export async function getWalletKey(): Promise<string | null> {
    return SecureStore.getItemAsync(WALLET_KEY);
}

export async function clearWalletKey() {
    await SecureStore.deleteItemAsync(WALLET_KEY);
}