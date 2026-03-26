import { useContext, useState } from "react";
import { TextInput, View } from "react-native";
import ButtonPrimary from "../components/ButtonPrimary";
import { EmployeeContext } from "../context/EmployeeContext";

export default function AddEmployeeScreen({ navigation }) {
  const { agregarEmpleado } = useContext(EmployeeContext);

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const guardar = () => {
    agregarEmpleado({ usuario, password });
    navigation.goBack();
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Usuario"
        onChangeText={setUsuario}
        style={{ borderWidth: 1, marginVertical: 10 }}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginVertical: 10 }}
      />

      <ButtonPrimary title="Guardar" onPress={guardar} />
    </View>
  );
}