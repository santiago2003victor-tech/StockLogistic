import { Text, View } from "react-native";
import ButtonPrimary from "../components/ButtonPrimary";

export default function SuccessScreen({ navigation }) {
  return (
    <View style={{ padding: 20 }}>
      <Text>✅ Producto registrado correctamente</Text>

      <ButtonPrimary
        title="Volver al inventario"
        onPress={() => navigation.navigate("Dashboard")}
      />
    </View>
  );
}