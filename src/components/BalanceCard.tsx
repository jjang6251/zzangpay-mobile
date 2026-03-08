import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type BalanceCardProps = {
  balance: string;
  loading: boolean;
  error: string | null;
  walletAddress: string;
  onRefresh: () => void;
};

export default function BalanceCard({
  balance,
  loading,
  error,
  walletAddress,
  onRefresh,
}: BalanceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>지갑 잔액</Text>
        <Pressable
          onPress={onRefresh}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.refreshButtonPressed,
          ]}
          hitSlop={12}
        >
          <Text style={styles.refreshIcon}>↻</Text>
        </Pressable>
      </View>

      <Text style={styles.description}>
        Sepolia 네트워크 ZUSDC
      </Text>

      <View style={styles.divider} />

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#3182f6" />
          <Text style={styles.loadingText}>잔액 불러오는 중...</Text>
        </View>
      ) : (
        <>
          <View style={styles.balanceRow}>
            <Text style={styles.balance}>{balance}</Text>
            <Text style={styles.symbol}>ZUSDC</Text>
          </View>
          {walletAddress ? (
            <Text style={styles.address}>
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </Text>
          ) : null}
        </>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f5f5f5",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonPressed: {
    backgroundColor: "#333333",
  },
  refreshIcon: {
    fontSize: 22,
    color: "#3182f6",
    fontWeight: "600",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: "#333333",
    marginVertical: 18,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 15,
    color: "#9ca3af",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: "700",
    color: "#f5f5f5",
    letterSpacing: -1,
  },
  symbol: {
    fontSize: 16,
    color: "#9ca3af",
    fontWeight: "600",
  },
  address: {
    marginTop: 12,
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#e11d48",
    fontWeight: "600",
  },
});
