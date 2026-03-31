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
        <View>
          <Text style={styles.cardTitle}>지갑 잔액</Text>
          <Text style={styles.networkLabel}>Sepolia 네트워크 · ZUSDC</Text>
        </View>
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

      <View style={styles.divider} />

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#3182f6" />
          <Text style={styles.loadingText}>잔액 불러오는 중...</Text>
        </View>
      ) : (
        <>
          <View style={styles.balanceRow}>
            <Text style={styles.balance}>
              {Number(balance).toLocaleString("ko-KR", { maximumFractionDigits: 4 })}
            </Text>
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
    padding: 22,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f5f5f5",
    marginBottom: 3,
  },
  networkLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(49, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonPressed: {
    backgroundColor: "rgba(49, 130, 246, 0.18)",
  },
  refreshIcon: {
    fontSize: 20,
    color: "#3182f6",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginVertical: 18,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  balance: {
    fontSize: 38,
    fontWeight: "700",
    color: "#f5f5f5",
    letterSpacing: -1,
  },
  symbol: {
    fontSize: 15,
    color: "#9ca3af",
    fontWeight: "600",
  },
  address: {
    marginTop: 10,
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: "#e11d48",
    fontWeight: "600",
  },
});
