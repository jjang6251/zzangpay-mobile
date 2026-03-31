import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { hasWallet } from "../service/walletService";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const MIN_SPLASH_MS = 1500;

    const check = async () => {
      const start = Date.now();
      try {
        const has = await hasWallet();
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
        await new Promise((r) => setTimeout(r, remaining));
        navigation.replace(has ? "Home" : "Onboarding");
      } catch (e) {
        console.error(e);
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
        await new Promise((r) => setTimeout(r, remaining));
        navigation.replace("Onboarding");
      }
    };
    check();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.content}>
        <Text style={styles.title}>zzangpay</Text>
        <Text style={styles.subtitle}>블록체인 간편결제</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SEPOLIA TESTNET</Text>
        </View>
        <ActivityIndicator size="small" color="#3182f6" style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(49, 130, 246, 0.08)",
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#3182f6",
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
  badge: {
    marginTop: 16,
    backgroundColor: "rgba(49, 130, 246, 0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(49, 130, 246, 0.25)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3182f6",
    letterSpacing: 1,
  },
  spinner: {
    marginTop: 44,
  },
});
