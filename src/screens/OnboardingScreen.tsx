import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  createAndSaveWallet,
  importAndSaveWallet,
  isValidKey,
} from "../service/walletService";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState<"choice" | "import">("choice");
  const [pk, setPk] = useState("");
  const [pkVisible, setPkVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await createAndSaveWallet();
      navigation.replace("Home");
    } catch (e) {
      console.error(e);
      setError("지갑 생성에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  const handleImportWallet = useCallback(async () => {
    setError(null);
    const trimmed = pk.trim();
    if (!trimmed) {
      setError("private key를 입력해 주세요.");
      return;
    }
    if (!isValidKey(trimmed)) {
      setError("유효하지 않은 private key예요.");
      return;
    }
    setLoading(true);
    try {
      await importAndSaveWallet(trimmed);
      navigation.replace("Home");
    } catch (e) {
      console.error(e);
      setError("지갑 가져오기에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [pk, navigation]);

  if (step === "choice") {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Background glow decorations */}
        <View style={styles.bgGlowTopRight} />
        <View style={styles.bgGlowBottomLeft} />

        <View style={styles.choiceContainer}>
          {/* Top: Heading */}
          <View style={styles.choiceHeader}>
            <Text style={styles.choiceTitle}>시작하기</Text>
            <Text style={styles.choiceSubtitle}>
              기존 지갑을 가져오거나,{"\n"}새 지갑을 만들어 시작하세요.
            </Text>
          </View>

          {/* Middle: Wallet visual */}
          <View style={styles.visualArea}>
            <View style={styles.glowCircle} />
            {/* Main glass card */}
            <View style={styles.walletCard}>
              <View style={styles.walletCardInner}>
                <View style={styles.walletIconBg} />
                <View style={styles.walletIconCard} />
                <Text style={styles.walletEmoji}>💳</Text>
              </View>
            </View>
            {/* Floating accent: key */}
            <View style={[styles.floatingAccent, styles.floatingAccentTopRight]}>
              <Text style={styles.floatingAccentIcon}>🔑</Text>
            </View>
            {/* Floating accent: shield */}
            <View style={[styles.floatingAccent, styles.floatingAccentBottomLeft]}>
              <Text style={styles.floatingAccentIcon}>🛡</Text>
            </View>
            <Text style={styles.visualBranding}>zzangpay</Text>
          </View>

          {/* Bottom: Action buttons */}
          <View style={styles.footerButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleCreateWallet}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonIcon}>⊕</Text>
                  <Text style={styles.primaryButtonText}>새 지갑 만들기</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
              onPress={() => setStep("import")}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonIcon}>↓</Text>
              <Text style={styles.secondaryButtonText}>기존 지갑 가져오기</Text>
            </Pressable>

            <Text style={styles.termsText}>
              계속함으로써 zzangpay의{" "}
              <Text style={styles.termsLink}>이용약관</Text> 및{" "}
              <Text style={styles.termsLink}>개인정보처리방침</Text>에 동의하게 됩니다.
            </Text>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.importHeader}>
            <Text style={styles.importHeaderTitle}>zzangpay</Text>
            <Pressable
              onPress={() => {
                setStep("choice");
                setPk("");
                setError(null);
              }}
              style={({ pressed }) => [
                styles.importCloseBtn,
                pressed && { opacity: 0.6 },
              ]}
              hitSlop={12}
            >
              <Text style={styles.importCloseIcon}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.importTitle}>지갑 가져오기</Text>

          <View style={styles.securityNotice}>
            <Text style={styles.securityNoticeText}>
              🔒 보안을 위해 기기에서만 저장됩니다
            </Text>
          </View>

          <Text style={styles.inputLabel}>Private Key</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.importInput}
              placeholder="0x로 시작하는 private key"
              placeholderTextColor="#6b7280"
              value={pk}
              onChangeText={(t) => {
                setPk(t);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!pkVisible}
            />
            <Pressable
              onPress={() => setPkVisible((v) => !v)}
              style={styles.visibilityToggle}
              hitSlop={8}
            >
              <Text style={styles.visibilityToggleText}>
                {pkVisible ? "숨기기" : "보기"}
              </Text>
            </Pressable>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxIcon}>🛡</Text>
            <Text style={styles.infoBoxText}>
              입력된 키는 AES-256 암호화 후 기기의 Secure Enclave에만 저장됩니다.
            </Text>
          </View>

          <View style={styles.importButtonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                setStep("choice");
                setPk("");
                setError(null);
              }}
            >
              <Text style={styles.backButtonText}>뒤로</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.importButton,
                pressed && { opacity: 0.82 },
              ]}
              onPress={handleImportWallet}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.importButtonText}>가져오기</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#121212" },
  flex: { flex: 1 },
  scrollContainer: { flex: 1, backgroundColor: "#121212" },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Choice step
  choiceContainer: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 24,
  },
  logoRow: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3182f6",
  },
  choiceContent: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  choiceTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f5f5f5",
    marginBottom: 10,
  },
  choiceSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#9ca3af",
    marginBottom: 40,
  },
  buttonGroup: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    gap: 14,
  },
  optionButtonPressed: {
    backgroundColor: "#252525",
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(49, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconText: {
    fontSize: 22,
    color: "#3182f6",
    fontWeight: "700",
    lineHeight: 28,
  },
  optionTextBlock: {
    flex: 1,
    gap: 3,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f5f5f5",
  },
  optionDesc: {
    fontSize: 13,
    color: "#9ca3af",
  },
  chevron: {
    fontSize: 22,
    color: "#6b7280",
    fontWeight: "300",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#9ca3af",
  },

  // Import step
  importHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  importHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3182f6",
  },
  importCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
  },
  importCloseIcon: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "600",
  },
  importTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#f5f5f5",
    marginBottom: 10,
  },
  securityNotice: {
    marginBottom: 28,
  },
  securityNoticeText: {
    fontSize: 13,
    color: "#3182f6",
    fontWeight: "500",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 8,
  },
  importInput: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    color: "#f5f5f5",
  },
  visibilityToggle: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  visibilityToggleText: {
    fontSize: 13,
    color: "#3182f6",
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(49, 130, 246, 0.08)",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(49, 130, 246, 0.15)",
  },
  infoBoxIcon: {
    fontSize: 16,
    lineHeight: 20,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 19,
  },
  importButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
  },
  importButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#3182f6",
    alignItems: "center",
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  errorText: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 13,
    color: "#e11d48",
    fontWeight: "600",
  },
});
