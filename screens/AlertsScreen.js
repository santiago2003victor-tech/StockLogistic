import { Feather } from "@expo/vector-icons";
import { useContext, useMemo } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ProductContext } from "../context/ProductContext";

export default function AlertsScreen({ navigation }) {
  const { productos } = useContext(ProductContext);

  const alertas = useMemo(() => {
    return productos
      .map((producto) => {
        const dias = calcularDiasRestantes(producto.vencimiento);
        if (dias === null || dias > 30) return null;

        return {
          ...producto,
          dias,
          nivel: obtenerNivel(dias),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.dias - b.dias);
  }, [productos]);

  const urgente = alertas.filter((a) => a.nivel === "urgente").length;
  const advertencia = alertas.filter((a) => a.nivel === "advertencia").length;
  const info = alertas.filter((a) => a.nivel === "info").length;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertas de Vencimiento</Text>

        <View style={styles.summaryRow}>
          <SummaryCard value={urgente} label="Urgente" />
          <SummaryCard value={advertencia} label="Advertencia" />
          <SummaryCard value={info} label="Info" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Urgente (1-3 dias)</Text>

        {alertas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No hay alertas de vencimiento por ahora.
            </Text>
          </View>
        ) : (
          alertas.map((item) => (
            <View key={item.id} style={styles.alertCard}>
              <View style={styles.alertTopRow}>
                <View>
                  <Text style={styles.productName}>{item.nombre}</Text>
                  <Text style={styles.productCategory}>
                    {item.categoria || "General"}
                  </Text>
                </View>
                <Feather name="alert-triangle" size={20} color="#FF2A2A" />
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricInline}>
                  <Feather name="clock" size={15} color="#FF2A2A" />
                  <Text style={[styles.metricInlineText, styles.daysText]}>
                    {formatearDias(item.dias)}
                  </Text>
                </View>

                <View style={styles.metricInline}>
                  <Feather name="box" size={15} color="#6A7D93" />
                  <Text style={styles.metricInlineText}>
                    {Number(item.cantidad || 0)} unidades
                  </Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <Feather name="calendar" size={15} color="#8A99AB" />
                <Text style={styles.footerText}>
                  Vence: {formatearFecha(item.vencimiento)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

function SummaryCard({ value, label }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function obtenerNivel(dias) {
  if (dias <= 3) return "urgente";
  if (dias <= 7) return "advertencia";
  return "info";
}

function calcularDiasRestantes(vencimiento) {
  if (!vencimiento) return null;

  const fecha = parsearFecha(vencimiento);
  if (!fecha) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const objetivo = new Date(fecha);
  objetivo.setHours(0, 0, 0, 0);

  const diff = Math.ceil((objetivo - hoy) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 0;
  return diff;
}

function parsearFecha(valor) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [y, m, d] = valor.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    const [d, m, y] = valor.split("/").map(Number);
    return new Date(y, m - 1, d);
  }

  return null;
}

function formatearDias(dias) {
  if (dias <= 1) return "1 dia";
  return `${dias} dias`;
}

function formatearFecha(valor) {
  const fecha = parsearFecha(valor);
  if (!fecha) return "--/--/----";

  const dd = String(fecha.getDate()).padStart(2, "0");
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const yyyy = fecha.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ECEDEF",
  },
  header: {
    backgroundColor: "#FAA33E",
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 34 / 2,
    fontWeight: "800",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.17)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 34 / 2,
    fontWeight: "800",
    marginBottom: 2,
  },
  summaryLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 12,
    paddingBottom: 80,
  },
  sectionTitle: {
    color: "#071E3D",
    fontSize: 30 / 2,
    fontWeight: "700",
    marginBottom: 10,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: "#F0B3B3",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#FDF5F5",
  },
  emptyText: {
    color: "#52657C",
    fontSize: 14,
  },
  alertCard: {
    borderWidth: 1,
    borderColor: "#F4B2B2",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FBF3F3",
  },
  alertTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  productName: {
    color: "#031A39",
    fontWeight: "700",
    fontSize: 34 / 2,
    marginBottom: 2,
  },
  productCategory: {
    color: "#425973",
    fontSize: 14,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D9DFE6",
    marginBottom: 10,
  },
  metricInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricInlineText: {
    color: "#4A607A",
    fontSize: 15,
  },
  daysText: {
    color: "#FF2A2A",
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    color: "#6B7F95",
    fontSize: 15,
  },
  backButton: {
    position: "absolute",
    right: 14,
    bottom: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#001A3D",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
