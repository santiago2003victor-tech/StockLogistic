import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";
import { AuthContext } from "../context/AuthContext";
import { EmployeeContext } from "../context/EmployeeContext";
import { ProductContext } from "../context/ProductContext";

export default function DashboardScreen({ navigation }) {
  const { productos } = useContext(ProductContext);
  const { logout, rol } = useContext(AuthContext);
  const { empleados } = useContext(EmployeeContext);

  const total = productos.length;
  const hoy = new Date();
  const porVencer = productos.filter((p) => {
    if (!p.vencimiento) return false;
    const fecha = new Date(p.vencimiento);
    if (Number.isNaN(fecha.getTime())) return false;
    const diffDias = (fecha - hoy) / (1000 * 60 * 60 * 24);
    return diffDias >= 0 && diffDias <= 30;
  }).length;
  const bajos = productos.filter(p => p.cantidad <= 10).length;
  const totalEmpleados = empleados.length;
  const nombreUsuario = rol === "admin" ? "admin" : "empleado";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.bubble}>
            <Feather name="package" size={20} color="#F6F8FB" />
          </View>

          <View style={styles.bubble}>
            <Feather name="menu" size={20} color="#F6F8FB" />
          </View>
        </View>

        <Text style={styles.welcomeText}>Bienvenido,</Text>
        <Text style={styles.userText}>{nombreUsuario}</Text>

        <View style={styles.roleCard}>
          <Text style={styles.roleLabel}>Rol actual</Text>
          <Text style={styles.roleValue}>{rol === "admin" ? "Administrador" : "Empleado"}</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <StatCard
          icon={<Feather name="box" size={22} color="#1E66F5" />}
          iconBg="#E9EFFB"
          value={total}
          label="Total Productos"
        />
        <StatCard
          icon={<Feather name="alert-triangle" size={22} color="#D78011" />}
          iconBg="#F3EFE4"
          value={porVencer}
          label="Por Vencer"
        />
        <StatCard
          icon={<MaterialCommunityIcons name="chart-line-variant" size={22} color="#E02020" />}
          iconBg="#F6EAEC"
          value={bajos}
          label="Stock Bajo"
        />
        <StatCard
          icon={<Feather name="users" size={22} color="#00A63E" />}
          iconBg="#EAF6F0"
          value={totalEmpleados}
          label="Empleados"
        />
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Acciones Rapidas</Text>

        <TouchableOpacity
          style={styles.actionRow}
          activeOpacity={0.85}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("AddProduct")}
          >
            <Text style={styles.actionButtonText}>+ Producto</Text>
          </TouchableOpacity>

          {rol === "admin" ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Employees")}
            >
              <Text style={styles.actionButtonText}>+ Empleado</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonMuted]}
              onPress={logout}
            >
              <Text style={styles.actionButtonText}>Cerrar sesion</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.block}>
        <View style={styles.alertHeader}>
          <Text style={styles.blockTitle}>Alertas Recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Alerts")}>
            <Text style={styles.alertLink}>Ver detalles</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, iconBg, value, label }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECEDEF",
  },
  content: {
    paddingBottom: 26,
  },
  header: {
    backgroundColor: "#F8A13B",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 24 / 2,
    color: "#F7F8FA",
    marginBottom: 2,
  },
  userText: {
    fontSize: 40 / 2,
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 12,
  },
  roleCard: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    padding: 14,
  },
  roleLabel: {
    color: "#FDF2E6",
    fontSize: 28 / 2,
    marginBottom: 4,
  },
  roleValue: {
    color: "#FFFFFF",
    fontSize: 36 / 2,
    fontWeight: "700",
  },
  metricsGrid: {
    marginTop: -10,
    paddingHorizontal: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statValue: {
    color: "#08213F",
    fontWeight: "800",
    fontSize: 36 / 2,
    marginBottom: 2,
  },
  statLabel: {
    color: "#2D4460",
    fontSize: 30 / 2,
  },
  block: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  blockTitle: {
    fontSize: 22,
    color: "#031B3A",
    fontWeight: "700",
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonMuted: {
    backgroundColor: "#F07F33",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 28 / 2,
    fontWeight: "600",
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  alertLink: {
    color: COLORS.primary,
    fontSize: 26 / 2,
    fontWeight: "500",
  },
});