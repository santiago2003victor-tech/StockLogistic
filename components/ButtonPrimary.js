import { Text, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/colors";

export default function ButtonPrimary({ title, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        marginVertical: 10
      }}
    >
      <Text style={{ color: COLORS.white, textAlign: "center" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}