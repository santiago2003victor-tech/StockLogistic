// ==========================================================
// DASHBOARD PRINCIPAL
// ----------------------------------------------------------
// Esta pantalla muestra:
// - Bienvenida al usuario
// - Rol actual (Administrador / Empleado)
// - Métricas rápidas del sistema
// - Acciones rápidas
// - Acceso a alertas
// - Cierre de sesión con confirmación visual
// ==========================================================

// ----------------------------------------------------------
// IMPORTACIÓN DE ICONOS
// ----------------------------------------------------------
// Feather y MaterialCommunityIcons se usan para darle
// mejor presentación visual a la interfaz.
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// ----------------------------------------------------------
// IMPORTACIÓN DE HOOKS DE REACT
// ----------------------------------------------------------
// useContext: permite acceder a los datos globales
// useState: permite controlar el modal de cerrar sesión
import { useContext, useState } from "react";

// ----------------------------------------------------------
// COMPONENTES NATIVOS DE REACT NATIVE
// ----------------------------------------------------------
// Modal: ventana emergente dentro de la app
// ScrollView: permite desplazar la pantalla si el contenido crece
// TouchableOpacity: botones táctiles
// View / Text / StyleSheet: estructura y estilos
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// ----------------------------------------------------------
// IMPORTACIÓN DE CONSTANTES Y CONTEXTOS
// ----------------------------------------------------------
// COLORS: colores globales del proyecto
// AuthContext: maneja autenticación, rol y logout
// EmployeeContext: contiene lista de empleados
// ProductContext: contiene lista de productos
import { COLORS } from "../constants/colors";
import { AuthContext } from "../context/AuthContext";
import { EmployeeContext } from "../context/EmployeeContext";
import { ProductContext } from "../context/ProductContext";

// ==========================================================
// COMPONENTE PRINCIPAL: DashboardScreen
// ==========================================================
export default function DashboardScreen({ navigation }) {
  // --------------------------------------------------------
  // OBTENER DATOS DESDE LOS CONTEXTOS
  // --------------------------------------------------------
  // productos: lista de productos registrados
  // logout: función para cerrar sesión
  // rol: identifica si es admin o empleado
  // empleados: lista de empleados registrados
  const { productos } = useContext(ProductContext);
  const { logout, rol } = useContext(AuthContext);
  const { empleados } = useContext(EmployeeContext);

  // --------------------------------------------------------
  // ESTADO LOCAL DEL MODAL DE CERRAR SESIÓN
  // --------------------------------------------------------
  // false = oculto
  // true  = visible
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --------------------------------------------------------
  // CÁLCULOS DEL DASHBOARD
  // --------------------------------------------------------

  // Total de productos registrados
  const total = productos.length;

  // Fecha actual del sistema
  const hoy = new Date();

  // --------------------------------------------------------
  // PRODUCTOS POR VENCER
  // --------------------------------------------------------
  // Se consideran "por vencer" los productos cuya fecha
  // de vencimiento esté dentro de los próximos 30 días.
  const porVencer = productos.filter((p) => {
    // Si no tiene fecha de vencimiento, no cuenta
    if (!p.vencimiento) return false;

    const fecha = new Date(p.vencimiento);

    // Si la fecha no es válida, se descarta
    if (Number.isNaN(fecha.getTime())) return false;

    // Diferencia en días entre la fecha de vencimiento y hoy
    const diffDias = (fecha - hoy) / (1000 * 60 * 60 * 24);

    // Se considera válido si está entre hoy y 30 días
    return diffDias >= 0 && diffDias <= 30;
  }).length;

  // --------------------------------------------------------
  // PRODUCTOS CON STOCK BAJO
  // --------------------------------------------------------
  // Se consideran con stock bajo si la cantidad es <= 10
  const bajos = productos.filter((p) => p.cantidad <= 10).length;

  // Total de empleados registrados
  const totalEmpleados = empleados.length;

  // --------------------------------------------------------
  // NOMBRE A MOSTRAR EN PANTALLA SEGÚN ROL
  // --------------------------------------------------------
  const nombreUsuario = rol === "admin" ? "admin" : "empleado";

  // ========================================================
  // FUNCIONES DE CIERRE DE SESIÓN
  // ========================================================

  // --------------------------------------------------------
  // Mostrar modal de confirmación
  // --------------------------------------------------------
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // --------------------------------------------------------
  // Confirmar cierre de sesión
  // --------------------------------------------------------
  // Oculta el modal y ejecuta la función logout() del contexto
  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  // ========================================================
  // RENDER DE LA INTERFAZ
  // ========================================================
  return (
    <>
      {/* ====================================================
          CONTENIDO PRINCIPAL DESPLAZABLE
      ==================================================== */}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* ==================================================
            HEADER SUPERIOR
        ================================================== */}
        <View style={styles.header}>
          
          {/* ------------------------------------------------
              FILA SUPERIOR DEL HEADER
              - Ícono decorativo del sistema
              - Botón de cerrar sesión
          ------------------------------------------------ */}
          <View style={styles.headerTopRow}>
            <View style={styles.bubble}>
              <Feather name="package" size={20} color="#F6F8FB" />
            </View>

            {/* BOTÓN DE CERRAR SESIÓN */}
            <TouchableOpacity style={styles.bubble} onPress={handleLogout}>
              <Feather name="log-out" size={20} color="#F6F8FB" />
            </TouchableOpacity>
          </View>

          {/* Mensaje de bienvenida */}
          <Text style={styles.welcomeText}>Bienvenido,</Text>

          {/* Nombre del usuario */}
          <Text style={styles.userText}>{nombreUsuario}</Text>

          {/* Tarjeta que muestra el rol actual */}
          <View style={styles.roleCard}>
            <Text style={styles.roleLabel}>Rol actual</Text>
            <Text style={styles.roleValue}>
              {rol === "admin" ? "Administrador" : "Empleado"}
            </Text>
          </View>
        </View>

        {/* ==================================================
            SECCIÓN DE MÉTRICAS / TARJETAS ESTADÍSTICAS
        ================================================== */}
        <View style={styles.metricsGrid}>
  <TouchableOpacity
    style={styles.cardTouchable}
    onPress={() =>
      navigation.navigate("AddProduct", { filtroDashboard: "todos" })
    }
  >
    <StatCard
      icon={<Feather name="box" size={22} color="#1E66F5" />}
      iconBg="#E9EFFB"
      value={total}
      label="Total Productos"
    />
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.cardTouchable}
    onPress={() =>
      navigation.navigate("AddProduct", { filtroDashboard: "porVencer" })
    }
  >
    <StatCard
      icon={<Feather name="alert-triangle" size={22} color="#D78011" />}
      iconBg="#F3EFE4"
      value={porVencer}
      label="Por Vencer"
    />
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.cardTouchable}
    onPress={() =>
      navigation.navigate("AddProduct", { filtroDashboard: "stockBajo" })
    }
  >
    <StatCard
      icon={
        <MaterialCommunityIcons
          name="chart-line-variant"
          size={22}
          color="#E02020"
        />
      }
      iconBg="#F6EAEC"
      value={bajos}
      label="Stock Bajo"
    />
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.cardTouchable}
    onPress={() => navigation.navigate("Employees")}
  >
    <StatCard
      icon={<Feather name="users" size={22} color="#00A63E" />}
      iconBg="#EAF6F0"
      value={totalEmpleados}
      label="Empleados"
    />
  </TouchableOpacity>
</View>

        {/* ==================================================
            BLOQUE DE ACCIONES RÁPIDAS
        ================================================== */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Acciones Rapidas</Text>

          <View style={styles.actionRow}>
            
            {/* Botón para agregar productos */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("AddProduct")}
            >
              <Text style={styles.actionButtonText}>+ Producto</Text>
            </TouchableOpacity>

            {/* ----------------------------------------------
                Si el rol es admin:
                muestra botón de empleados

                Si el rol es empleado:
                muestra botón de cerrar sesión
            ---------------------------------------------- */}
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
                onPress={handleLogout}
              >
                <Text style={styles.actionButtonText}>Cerrar sesión</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ==================================================
            BLOQUE DE ALERTAS
        ================================================== */}
        <View style={styles.block}>
          <View style={styles.alertHeader}>
            <Text style={styles.blockTitle}>Alertas Recientes</Text>

            {/* Navega a la pantalla de alertas */}
            <TouchableOpacity onPress={() => navigation.navigate("Alerts")}>
              <Text style={styles.alertLink}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ====================================================
          MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN
      ==================================================== */}
      <Modal
        transparent={true}
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        {/* Fondo oscuro semitransparente */}
        <View style={styles.modalOverlay}>
          
          {/* Caja principal del modal */}
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Cerrar sesión</Text>
            <Text style={styles.modalText}>
              ¿Seguro que deseas salir de la cuenta?
            </Text>

            {/* Botones del modal */}
            <View style={styles.modalButtons}>
              
              {/* Botón cancelar */}
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              {/* Botón confirmar cierre */}
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutButtonText}>Sí, salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ==========================================================
// COMPONENTE REUTILIZABLE: TARJETA ESTADÍSTICA
// ----------------------------------------------------------
// Se usa para mostrar cada métrica del dashboard:
// - ícono
// - valor
// - descripción
// ==========================================================
function StatCard({ icon, iconBg, value, label }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ==========================================================
// ESTILOS
// ==========================================================
const styles = StyleSheet.create({
  // --------------------------------------------------------
  // CONTENEDOR PRINCIPAL
  // --------------------------------------------------------
  container: {
    flex: 1,
    backgroundColor: "#ECEDEF",
  },
  content: {
    paddingBottom: 26,
  },

  // --------------------------------------------------------
  // HEADER
  // --------------------------------------------------------
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
    fontSize: 12,
    color: "#F7F8FA",
    marginBottom: 2,
  },
  userText: {
    fontSize: 20,
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
    fontSize: 14,
    marginBottom: 4,
  },
  roleValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  // --------------------------------------------------------
  // TARJETAS DE MÉTRICAS
  // --------------------------------------------------------
  metricsGrid: {
  marginTop: -10,
  paddingHorizontal: 12,
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},

// --------------------------------------------------------
// CONTENEDOR TÁCTIL DE CADA TARJETA
// --------------------------------------------------------
// Ahora cada tarjeta es presionable, por eso el ancho
// debe vivir aquí y no dentro de statCard.
cardTouchable: {
  width: "48%",
},

statCard: {
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
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    color: "#2D4460",
    fontSize: 15,
  },

  // --------------------------------------------------------
  // BLOQUES GENERALES
  // --------------------------------------------------------
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

  // --------------------------------------------------------
  // BOTONES DE ACCIONES RÁPIDAS
  // --------------------------------------------------------
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
    fontSize: 14,
    fontWeight: "600",
  },

  // --------------------------------------------------------
  // SECCIÓN DE ALERTAS
  // --------------------------------------------------------
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  alertLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "500",
  },

  // --------------------------------------------------------
  // MODAL DE CERRAR SESIÓN
  // --------------------------------------------------------
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#031B3A",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    marginBottom: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  logoutButton: {
    backgroundColor: "#F07F33",
  },
  cancelButtonText: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 14,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});