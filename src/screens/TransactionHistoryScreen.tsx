import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getTransactionHistory,
  TransactionRecord,
} from "../service/tokenService";
import { RootStackParamList } from "../types/navigation";

type NavProp = NativeStackNavigationProp<RootStackParamList, "TransactionHistory">;
type Filter = "all" | "sent" | "received";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortenHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function TransactionItem({ item }: { item: TransactionRecord }) {
  const isSent = item.type === "sent";
  const counterpart = isSent ? item.to : item.from;

  return (
    <View style={styles.item}>
      <View style={[styles.directionBadge, isSent ? styles.directionSent : styles.directionReceived]}>
        <Text style={styles.directionIcon}>{isSent ? "↑" : "↓"}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.counterpart}>
          {isSent ? "To " : "From "}
          <Text style={styles.address}>{shortenAddress(counterpart)}</Text>
        </Text>
        <Text style={styles.hash}>{shortenHash(item.hash)}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={[styles.amount, isSent ? styles.amountSent : styles.amountReceived]}>
          {isSent ? "-" : "+"}{Number(item.amount).toLocaleString("ko-KR", { maximumFractionDigits: 4 })}
        </Text>
        <Text style={styles.amountUnit}>ZUSDC</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>성공</Text>
        </View>
      </View>
    </View>
  );
}

export default function TransactionHistoryScreen() {
  const navigation = useNavigation<NavProp>();
  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const fetchHistory = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getTransactionHistory();
      setRecords(data);
    } catch (e) {
      console.error(e);
      setError("이체 내역을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = records.filter((r) => {
    if (filter === "all") return true;
    return r.type === filter;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          hitSlop={12}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>거래 내역</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {(["all", "sent", "received"] as Filter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, filter === f && styles.filterPillTextActive]}>
              {f === "all" ? "전체" : f === "sent" ? "송금" : "수신"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3182f6" />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={fetchHistory}
            style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>⏱</Text>
          <Text style={styles.emptyText}>
            {filter === "all" ? "이체 내역이 없어요." : `${filter === "sent" ? "송금" : "수신"} 내역이 없어요.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.hash}
          renderItem={({ item }) => <TransactionItem item={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#131313",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1c1b1b",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 18,
    color: "#e5e2e1",
    fontWeight: "600",
    lineHeight: 22,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e2e1",
  },
  headerSpacer: {
    width: 36,
  },

  // Filter pills
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#1c1b1b",
    borderWidth: 1,
    borderColor: "#353534",
  },
  filterPillActive: {
    backgroundColor: "rgba(172, 199, 255, 0.15)",
    borderColor: "#acc7ff",
  },
  filterPillText: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: "#acc7ff",
  },

  // States
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  errorText: {
    color: "#ffb4ab",
    fontSize: 15,
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: "#1c1b1b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#353534",
  },
  retryText: {
    color: "#acc7ff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 15,
  },

  // List
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: "#1c1b1b",
  },

  // Transaction item
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  directionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  directionSent: {
    backgroundColor: "rgba(255, 180, 171, 0.15)",
  },
  directionReceived: {
    backgroundColor: "rgba(172, 199, 255, 0.15)",
  },
  directionIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e2e1",
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  counterpart: {
    fontSize: 14,
    color: "#9ca3af",
  },
  address: {
    color: "#e5e2e1",
    fontWeight: "600",
  },
  hash: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
  amountSent: {
    color: "#ffb4ab",
  },
  amountReceived: {
    color: "#acc7ff",
  },
  amountUnit: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },
  statusBadge: {
    backgroundColor: "rgba(172, 199, 255, 0.12)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    color: "#acc7ff",
    fontWeight: "600",
  },
});
