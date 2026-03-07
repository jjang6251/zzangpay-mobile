import { StyleSheet, Text, View } from "react-native";

type BalanceCardProps = {
  title: string;
  description: string;
  asset: string;
  network: string;
  balance: string;
};

export default function BalanceCard({
  title,
  description,
  asset,
  network,
  balance,
}: BalanceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.rowLabel}>자산</Text>
        <Text style={styles.rowValue}>{asset}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>네트워크</Text>
        <Text style={styles.rowValue}>{network}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>현재 잔액</Text>
        <Text style={styles.rowValue}>{balance}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});