import "react-native-get-random-values";
import { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createAndSaveWallet, loadWallet, resetWallet } from "./src/service/walletService";

export default function App() {
  const [address, setAddress] = useState<string | null>(null);

  const refresh = async () => {
    const w = await loadWallet();

    /**
     * Optional Chaining
     * w?.address -> w가 존재하면 address를 가져오고, 없으면 undefined
     * 
     * Nullish Coalescing
     * a ?? b -> a가 null 또는 undefined면 b 사용
     */
    setAddress(w?.address ?? null);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onCreate = async () => {
    const info = await createAndSaveWallet();
    setAddress(info.address);
    Alert.alert("wallet create", info.address);
  };

  const onReset = async () => {
    await resetWallet();
    setAddress(null);
    Alert.alert("Wallet reset");
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>ZZANGPAY!!!</Text>
        <Text style={{ fontSize: 14, opacity: 0.7 }}>Local wallet (Keychain/Keystore)</Text>

        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontWeight: "600" }}>Address</Text>
          <Text selectable style={{ marginTop: 6 }}>
            {address ?? "No wallet yet"}
          </Text>
        </View>

        <Button title="Create Wallet" onPress={onCreate} />
        <Button title="Reload Wallet" onPress={refresh} />
        <Button title="Reset Wallet" onPress={onReset} color="#b00020" />
      </View>
    </SafeAreaView>
  );
}
