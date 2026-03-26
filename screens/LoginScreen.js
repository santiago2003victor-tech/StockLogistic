import { Feather } from "@expo/vector-icons";
import { useContext, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen() {
  const { login, rol } = useContext(AuthContext);

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.page}
    >
      <View style={styles.headerArea}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Gestiona tu inventario facilmente</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.tabContainer}>
          <View style={[styles.tab, styles.tabActive]}>
            <Text style={styles.tabTextActive}>Iniciar Sesion</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText}>Registro</Text>
          </View>
        </View>

        <Text style={styles.label}>Correo electronico</Text>
        <View style={styles.inputContainer}>
          <Feather name="user" size={22} color="#8F99A7" />
          <TextInput
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#808A98"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setUsuario}
            value={usuario}
            style={styles.input}
          />
        </View>

        <Text style={styles.label}>Contrasena</Text>
        <View style={styles.inputContainer}>
          <Feather name="lock" size={22} color="#8F99A7" />
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#808A98"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            style={styles.input}
          />
        </View>

        <Pressable
          style={styles.loginButton}
          onPress={() => login(usuario.trim(), password)}
        >
          <Text style={styles.loginButtonText}>Iniciar sesion</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.forgotText}>Olvidaste tu contrasena?</Text>
        </Pressable>

        <Text style={styles.roleHint}>Rol actual: {rol}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F5ECDE",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerArea: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 260,
    height: 220,
    marginBottom: 10,
  },
  subtitle: {
    color: "#2D4968",
    fontSize: 33 / 2,
    textAlign: "center",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#ECECEC",
    borderRadius: 28,
    padding: 24,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    height: 60,
    backgroundColor: "#D9DBDE",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#F6A445",
  },
  tabText: {
    color: "#304760",
    fontWeight: "600",
    fontSize: 33 / 2,
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 33 / 2,
  },
  label: {
    color: "#213750",
    fontWeight: "700",
    fontSize: 32 / 2,
    marginBottom: 10,
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BCC3CE",
    borderRadius: 17,
    paddingHorizontal: 14,
    height: 62,
    marginBottom: 18,
    backgroundColor: "#ECECEC",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: "#2F445D",
    fontSize: 34 / 2,
  },
  loginButton: {
    marginTop: 14,
    backgroundColor: "#F6A445",
    borderRadius: 17,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 36 / 2,
  },
  forgotText: {
    marginTop: 26,
    textAlign: "center",
    color: "#F28F32",
    fontSize: 32 / 2,
  },
  roleHint: {
    marginTop: 16,
    textAlign: "center",
    color: "#8C9197",
    fontSize: 12,
  },
});