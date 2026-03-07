import { useEffect, useState } from "react";
import { Alert, Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createAndSaveWallet,
  loadWallet,
  resetWallet,
} from "./src/service/walletService";
import { getUserTotalBalance } from "./src/service/tokenService";

export default function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const refresh = async () => {
    try {
      const w = await loadWallet();
      setAddress(w?.address ?? null);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "지갑 정보를 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onCreate = async () => {
    try {
      const info = await createAndSaveWallet();
      setAddress(info.address);
      setBalance(null);
      Alert.alert("wallet create", info.address);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "지갑 생성에 실패했습니다.");
    }
  };

  const onReset = async () => {
    try {
      await resetWallet();
      setAddress(null);
      setBalance(null);
      Alert.alert("Wallet reset");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "지갑 초기화에 실패했습니다.");
    }
  };

  const onCheckBalance = async () => {
    try {
      setLoadingBalance(true);
      const value = await getUserTotalBalance();
      setBalance(value);
      Alert.alert("ZUSDC Balance", value);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "잔액 조회에 실패했습니다.");
    } finally {
      setLoadingBalance(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>ZZANGPAY!!!</Text>
        <Text style={{ fontSize: 14, opacity: 0.7 }}>
          Local wallet (Keychain/Keystore)
        </Text>

        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontWeight: "600" }}>Address</Text>
          <Text selectable style={{ marginTop: 6 }}>
            {address ?? "No wallet yet"}
          </Text>
        </View>

        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontWeight: "600" }}>ZUSDC Balance</Text>
          <Text selectable style={{ marginTop: 6 }}>
            {balance ?? "Not loaded"}
          </Text>
        </View>

        <Button title="Create Wallet" onPress={onCreate} />
        <Button title="Reload Wallet" onPress={refresh} />
        <Button
          title={loadingBalance ? "Loading Balance..." : "Check ZUSDC Balance"}
          onPress={onCheckBalance}
          disabled={loadingBalance}
        />
        <Button title="Reset Wallet" onPress={onReset} color="#b00020" />
      </View>
    </SafeAreaView>
  );
}