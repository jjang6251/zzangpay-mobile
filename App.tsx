import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserTotalBalance } from "./src/service/tokenService";

export default function App() {
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await fetchBalance();
      setLoading(false);
    };

    init();
  }, [fetchBalance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBalance();
    setRefreshing(false);
  }, [fetchBalance]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.topSection}>
          <Text style={styles.label}>현재 잔액</Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>잔액 불러오는 중...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.balance}>{balance}</Text>
              <Text style={styles.symbol}>ZUSDC</Text>
            </>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>테스트 지갑 잔액</Text>
          <Text style={styles.cardDescription}>
            Sepolia 네트워크에 배포된 ZUSDC 컨트랙트 기준 잔액이에요.
          </Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>자산</Text>
            <Text style={styles.rowValue}>ZUSDC</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>네트워크</Text>
            <Text style={styles.rowValue}>Sepolia</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>현재 잔액</Text>
            <Text style={styles.rowValue}>{loading ? "-" : balance}</Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={onRefresh}>
          <Text style={styles.buttonText}>새로고침</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  topSection: {
    marginTop: 16,
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    color: "#6b7684",
    marginBottom: 12,
    fontWeight: "600",
  },
  balance: {
    fontSize: 42,
    fontWeight: "700",
    color: "#191f28",
    letterSpacing: -1,
  },
  symbol: {
    marginTop: 8,
    fontSize: 18,
    color: "#4e5968",
    fontWeight: "600",
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 15,
    color: "#6b7684",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#e11d48",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#191f28",
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#8b95a1",
  },
  divider: {
    height: 1,
    backgroundColor: "#f2f4f6",
    marginVertical: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowLabel: {
    fontSize: 15,
    color: "#8b95a1",
    fontWeight: "600",
  },
  rowValue: {
    fontSize: 16,
    color: "#191f28",
    fontWeight: "700",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#3182f6",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
});