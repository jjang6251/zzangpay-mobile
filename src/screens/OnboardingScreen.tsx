import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import PrimaryButton from "../components/PrimaryButton";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState<"choice" | "import">("choice");
  const [pk, setPk] = useState("");
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
        <View style={styles.container}>
          <Text style={styles.title}>zzangpay 시작하기</Text>
          <Text style={styles.subtitle}>
            기존 지갑이 있으시면 가져오거나,{`\n`}
            새 지갑을 만들어 주세요.
          </Text>

          <View style={styles.buttonGroup}>
            <PrimaryButton
              title="기존 지갑 가져오기"
              onPress={() => setStep("import")}
            />
            <PrimaryButton
              title="새 지갑 만들기"
              onPress={handleCreateWallet}
            />
          </View>

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#3182f6" />
              <Text style={styles.loadingText}>처리 중...</Text>
            </View>
          )}

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
          <Text style={styles.title}>지갑 가져오기</Text>
          <Text style={styles.subtitle}>
            기존 지갑의 private key를 입력해 주세요.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="0x로 시작하는 private key"
            placeholderTextColor="#6b7280"
            value={pk}
            onChangeText={(t) => {
              setPk(t);
              setError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          <View style={styles.buttonRow}>
            <View style={styles.backButton}>
              <PrimaryButton
                title="뒤로"
                onPress={() => {
                  setStep("choice");
                  setPk("");
                  setError(null);
                }}
              />
            </View>
            <View style={styles.importButton}>
              <PrimaryButton
                title="가져오기"
                onPress={handleImportWallet}
              />
            </View>
          </View>

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#3182f6" />
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f5f5f5",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#9ca3af",
    marginBottom: 32,
  },
  buttonGroup: {
    gap: 12,
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#333333",
    minHeight: 52,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  importButton: {
    flex: 1,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 15,
    color: "#9ca3af",
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: "#e11d48",
    fontWeight: "600",
  },
});
