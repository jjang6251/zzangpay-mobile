import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
      <Text style={styles.title}>zzangpay</Text>
      <ActivityIndicator
        size="small"
        color="#3182f6"
        style={styles.spinner}
      />
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3182f6",
    letterSpacing: -0.5,
  },
  spinner: {
    marginTop: 20,
  },
});
