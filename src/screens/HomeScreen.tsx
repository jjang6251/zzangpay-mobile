import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import BalanceCard from "../components/BalanceCard";
import SendModal from "../components/SendModal";
import { getUserTotalBalance } from "../service/tokenService";
import { loadWallet, resetWallet } from "../service/walletService";
import { RootStackParamList } from "../types/navigation";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [balance, setBalance] = useState<string>("0");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sendVisible, setSendVisible] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      setError(null);
      const currentBalance = await getUserTotalBalance();
      setBalance(currentBalance);
    } catch (e) {
      console.error(e);
      setError("잔액을 불러오지 못했어요.");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [_, wallet] = await Promise.all([
        fetchBalance(),
        loadWallet(),
      ]);
      if (wallet) {
        setWalletAddress(wallet.address);
      }
      setLoading(false);
    };

    init();
  }, [fetchBalance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBalance();
    setRefreshing(false);
  }, [fetchBalance]);

  const handleMenuOpen = useCallback(() => setMenuVisible(true), []);
  const handleMenuClose = useCallback(() => setMenuVisible(false), []);

  const handleDeleteKeyPress = useCallback(() => {
    setMenuVisible(false);
    Alert.alert(
      "개인키 삭제",
      "개인키를 기기에서 삭제합니다. 키 분실 시 복구가 불가능합니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          style: "destructive",
          onPress: async () => {
            await resetWallet();
            navigation.reset({ index: 0, routes: [{ name: "Splash" }] });
          },
        },
      ]
    );
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={handleMenuOpen}
          style={({ pressed }) => [styles.menuButton, pressed && { opacity: 0.7 }]}
          hitSlop={12}
        >
          <Text style={styles.menuIcon}>≡</Text>
        </Pressable>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={handleMenuClose}
      >
        <Pressable style={styles.overlay} onPress={handleMenuClose}>
          <Pressable
            style={styles.menuPanel}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>메뉴</Text>
              <Pressable
                onPress={handleMenuClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
                hitSlop={12}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.menuDivider} />
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              onPress={handleDeleteKeyPress}
            >
              <Text style={styles.menuItemTextDanger}>개인키 삭제</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9ca3af"
          />
        }
      >
        <BalanceCard
          balance={balance}
          loading={loading}
          error={error}
          walletAddress={walletAddress}
          onRefresh={onRefresh}
        />

        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            pressed && styles.sendButtonPressed,
          ]}
          onPress={() => setSendVisible(true)}
        >
          <Text style={styles.sendButtonText}>송금</Text>
        </Pressable>
      </ScrollView>

      <SendModal
        visible={sendVisible}
        onClose={() => setSendVisible(false)}
        onSendComplete={onRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: "#f5f5f5",
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "flex-end",
    paddingTop: 56,
    paddingRight: 20,
    paddingLeft: 20,
  },
  menuPanel: {
    width: 220,
    height: SCREEN_HEIGHT * 0.22,
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#f5f5f5",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    backgroundColor: "#404040",
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#333333",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  menuItemPressed: {
    backgroundColor: "#252525",
  },
  menuItemTextDanger: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e11d48",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sendButton: {
    marginTop: 20,
    backgroundColor: "#3182f6",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sendButtonPressed: {
    opacity: 0.82,
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700" as const,
  },
});