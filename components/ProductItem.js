import { useContext } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { ProductContext } from "../context/ProductContext";
import { estadoProducto } from "../services/productService";
import { COLORS } from "../constants/colors";

export default function ProductItem({ producto }) {
  const { salidaProducto, eliminarProducto } = useContext(ProductContext);

  const estado = estadoProducto(producto);

  // 🎨 COLOR SEGÚN ESTADO
  const getColorEstado = () => {
    if (estado === "CRITICO") return COLORS.danger;
    if (estado === "BAJO") return COLORS.warning;
    return COLORS.success;
  };

  return (
    <View style={{
      backgroundColor: COLORS.white,
      padding: 15,
      borderRadius: 15,
      marginVertical: 8,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3
    }}>

      {/* 🔝 HEADER */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {producto.nombre}
        </Text>

        {/* ❌ ELIMINAR (icon style) */}
        <TouchableOpacity
          onPress={() => eliminarProducto(producto.id)}
          style={{
            backgroundColor: "#fdecea",
            padding: 6,
            borderRadius: 8
          }}
        >
          <Text style={{ color: COLORS.danger }}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* 📦 INFO */}
      <View style={{ marginTop: 8 }}>
        <Text>Stock: {producto.cantidad}</Text>

        <Text style={{
          color: getColorEstado(),
          fontWeight: "bold",
          marginTop: 3
        }}>
          {estado}
        </Text>
      </View>

      {/* 🔻 ACCIONES */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12
      }}>

        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 8,
            paddingHorizontal: 15,
            borderRadius: 10
          }}
          disabled={producto.cantidad === 0}
          onPress={() => salidaProducto(producto.id, 1)}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Vender
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}