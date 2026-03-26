import { useContext } from "react";
import { Text, View } from "react-native";
import ButtonPrimary from "../components/ButtonPrimary";
import { AuthContext } from "../context/AuthContext";

export default function RoleScreen() {
  const { seleccionarRol } = useContext(AuthContext);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Selecciona Rol</Text>

      <ButtonPrimary
        title="Administrador"
        onPress={() => seleccionarRol("admin")}
      />

      <ButtonPrimary
        title="Empleado"
        onPress={() => seleccionarRol("empleado")}
      />
    </View>
  );
}