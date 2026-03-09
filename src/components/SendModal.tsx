import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { sendToken, getUserTotalBalance } from "../service/tokenService";

type SendModalProps = {
  visible: boolean;
  onClose: () => void;
  onSendComplete: () => void;
};

type SendResult = {
  toAddress: string;
  amount: string;
  newBalance: string;
  elapsed: number;
  txHash: string;
};

export default function SendModal({
  visible,
  onClose,
  onSendComplete,
}: SendModalProps) {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);

  const reset = useCallback(() => {
    setToAddress("");
    setAmount("");
    setSending(false);
    setError(null);
    setResult(null);
  }, []);

  const handleClose = useCallback(() => {
    if (result) {
      onSendComplete();
    }
    reset();
    onClose();
  }, [onClose, onSendComplete, reset, result]);

  const handleSend = useCallback(async () => {
    setError(null);
    const trimmedAddress = toAddress.trim();
    const parsedAmount = parseFloat(amount.trim());

    if (!trimmedAddress) {
      setError("보낼 지갑 주소를 입력해 주세요.");
      return;
    }
    if (!amount.trim() || isNaN(parsedAmount)) {
      setError("전송할 금액을 입력해 주세요.");
      return;
    }

    setSending(true);
    const start = Date.now();
    try {
      const txHash = await sendToken(trimmedAddress, parsedAmount);
      const newBalance = await getUserTotalBalance();
      const elapsed = Date.now() - start;

      setResult({
        toAddress: trimmedAddress,
        amount: amount.trim(),
        newBalance,
        elapsed,
        txHash,
      });
    } catch (e: any) {
      setError(e.message || "전송에 실패했어요.");
    } finally {
      setSending(false);
    }
  }, [toAddress, amount]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {result ? "전송 완료" : "ZUSDC 전송"}
            </Text>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              hitSlop={12}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {result ? (
            <View style={styles.resultContainer}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>받는 주소</Text>
                <Text style={styles.resultValue}>
                  {`${result.toAddress.slice(0, 8)}...${result.toAddress.slice(-6)}`}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>전송 금액</Text>
                <Text style={styles.resultValue}>{result.amount} ZUSDC</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>네트워크</Text>
                <Text style={styles.resultValue}>Sepolia</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>남은 잔액</Text>
                <Text style={styles.resultValue}>{result.newBalance} ZUSDC</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>소요 시간</Text>
                <Text style={styles.resultValue}>
                  {(result.elapsed / 1000).toFixed(1)}초
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.confirmButtonPressed,
                ]}
                onPress={handleClose}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>받는 주소</Text>
              <TextInput
                style={styles.input}
                placeholder="0x..."
                placeholderTextColor="#6b7280"
                value={toAddress}
                onChangeText={(t) => {
                  setToAddress(t);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.inputLabel}>전송 금액 (ZUSDC)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.0"
                placeholderTextColor="#6b7280"
                value={amount}
                onChangeText={(t) => {
                  setAmount(t);
                  setError(null);
                }}
                keyboardType="decimal-pad"
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {sending ? (
                <View style={styles.sendingBox}>
                  <ActivityIndicator size="small" color="#3182f6" />
                  <Text style={styles.sendingText}>전송 중...</Text>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.sendButton,
                    pressed && styles.sendButtonPressed,
                  ]}
                  onPress={handleSend}
                >
                  <Text style={styles.sendButtonText}>전송하기</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  panel: {
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
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
  divider: {
    height: 1,
    backgroundColor: "#333333",
    marginVertical: 16,
  },
  formContainer: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#333333",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#e11d48",
    fontWeight: "600",
  },
  sendingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    paddingVertical: 18,
  },
  sendingText: {
    fontSize: 16,
    color: "#9ca3af",
    fontWeight: "600",
  },
  sendButton: {
    marginTop: 20,
    backgroundColor: "#3182f6",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonPressed: {
    opacity: 0.82,
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  resultContainer: {
    gap: 4,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  resultLabel: {
    fontSize: 15,
    color: "#9ca3af",
    fontWeight: "600",
  },
  resultValue: {
    fontSize: 15,
    color: "#f5f5f5",
    fontWeight: "700",
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: "#3182f6",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonPressed: {
    opacity: 0.82,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
});
