// ==========================================================
// PANTALLA DE EMPLEADOS
// ----------------------------------------------------------
// Esta pantalla permite:
// - visualizar empleados registrados
// - buscar empleados
// - agregar nuevos empleados
// - eliminar empleados
// - mostrar métricas rápidas (activos / administradores)
// ==========================================================

// ----------------------------------------------------------
// IMPORTACIÓN DE ICONOS
// ----------------------------------------------------------
// Feather se usa para íconos visuales dentro de la interfaz
import { Feather } from "@expo/vector-icons";

// ----------------------------------------------------------
// IMPORTACIÓN DE HOOKS DE REACT
// ----------------------------------------------------------
// useContext: permite acceder al contexto global de empleados
// useMemo: optimiza el filtrado de empleados
// useState: controla inputs, modal y rol seleccionado
import { useContext, useMemo, useState } from "react";

// ----------------------------------------------------------
// COMPONENTES NATIVOS DE REACT NATIVE
// ----------------------------------------------------------
// FlatList: lista optimizada para mostrar empleados
// Modal: ventana emergente para agregar empleado
// Pressable / TouchableOpacity: botones táctiles
// TextInput: campos del formulario
// View / Text / StyleSheet: estructura visual
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ----------------------------------------------------------
// CONTEXTO DE EMPLEADOS
// ----------------------------------------------------------
// EmployeeContext contiene:
// - empleados: lista global de empleados
// - agregarEmpleado(): registra uno nuevo
// - eliminarEmpleado(): elimina uno existente
import { EmployeeContext } from "../context/EmployeeContext";

// ----------------------------------------------------------
// ROLES DISPONIBLES EN EL SISTEMA
// ----------------------------------------------------------
const ROLES = ["Empleado", "Administrador"];

// ==========================================================
// COMPONENTE PRINCIPAL: EmployeeScreen
// ==========================================================
export default function EmployeeScreen({ navigation }) {
  // --------------------------------------------------------
  // DATOS DEL CONTEXTO
  // --------------------------------------------------------
  const { empleados, agregarEmpleado, eliminarEmpleado } =
    useContext(EmployeeContext);

  // --------------------------------------------------------
  // ESTADOS LOCALES DE LA PANTALLA
  // --------------------------------------------------------

  // Texto escrito en la barra de búsqueda
  const [busqueda, setBusqueda] = useState("");

  // Controla si el modal está abierto o cerrado
  const [modalVisible, setModalVisible] = useState(false);

  // Rol seleccionado en el formulario
  const [rol, setRol] = useState("Empleado");

  // Datos del formulario para registrar empleado
  const [form, setForm] = useState({
    nombre: "",
    usuario: "",
    correo: "",
    telefono: "",
    password: "",
  });

  // --------------------------------------------------------
  // FILTRADO DE EMPLEADOS
  // --------------------------------------------------------
  // Se filtran empleados por:
  // - nombre
  // - correo
  // - teléfono
  //
  // useMemo evita recalcular el filtro en cada render
  const empleadosFiltrados = useMemo(() => {
    const filtro = busqueda.trim().toLowerCase();

    // Si no hay búsqueda, retorna todos
    if (!filtro) return empleados;

    return empleados.filter((e) => {
      const nombre = (e.nombre || e.usuario || "").toLowerCase();
      const correo = (e.correo || "").toLowerCase();
      const telefono = (e.telefono || "").toLowerCase();

      return (
        nombre.includes(filtro) ||
        correo.includes(filtro) ||
        telefono.includes(filtro)
      );
    });
  }, [busqueda, empleados]);

  // --------------------------------------------------------
  // MÉTRICAS SUPERIORES
  // --------------------------------------------------------

  // Total de empleados activos
  const activos = empleados.filter(
    (e) => (e.estado || "Activo") === "Activo"
  ).length;

  // Total de empleados con rol Administrador
  const administradores = empleados.filter(
    (e) => (e.rol || "Empleado") === "Administrador"
  ).length;

  // --------------------------------------------------------
  // RESETEAR FORMULARIO
  // --------------------------------------------------------
  // Limpia todos los campos y deja rol por defecto
  const resetForm = () => {
    setForm({
      nombre: "",
      usuario: "",
      correo: "",
      telefono: "",
      password: "",
    });
    setRol("Empleado");
  };

  // --------------------------------------------------------
  // GUARDAR NUEVO EMPLEADO
  // --------------------------------------------------------
  const guardarEmpleado = () => {
    // Validación mínima obligatoria
    if (!form.nombre.trim() || !form.usuario.trim() || !form.password.trim()) {
      alert("Completa nombre, usuario y contrasena");
      return;
    }

    // Obtener fecha actual para guardar fecha de ingreso
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, "0");
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const yyyy = hoy.getFullYear();

    // Agregar empleado al contexto
    agregarEmpleado({
      nombre: form.nombre.trim(),
      usuario: form.usuario.trim(),
      correo: form.correo.trim() || `${form.usuario.trim()}@empresa.com`,
      telefono: form.telefono.trim() || "555-0101",
      password: form.password,
      rol,
      estado: "Activo",
      fechaIngreso: `${dd}/${mm}/${yyyy}`,
    });

    // Cerrar modal y limpiar formulario
    setModalVisible(false);
    resetForm();
  };

  // ========================================================
  // RENDER DE LA INTERFAZ
  // ========================================================
  return (
    <View style={styles.screen}>
      {/* ====================================================
          HEADER SUPERIOR
      ==================================================== */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeftGroup}>
            <Text style={styles.title}>Empleados</Text>
          </View>

          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setModalVisible(true)}
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color="#8D98A6" />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar empleados..."
            placeholderTextColor="#8D98A6"
            style={styles.searchInput}
          />
        </View>

        {/* Tarjetas estadísticas */}
        <View style={styles.topStatsRow}>
          <View style={styles.topStatCard}>
            <Text style={styles.topStatLabel}>Activos</Text>
            <Text style={styles.topStatValue}>{activos}</Text>
          </View>

          <View style={styles.topStatCard}>
            <Text style={styles.topStatLabel}>Administradores</Text>
            <Text style={styles.topStatValue}>{administradores}</Text>
          </View>
        </View>
      </View>

      {/* ====================================================
          LISTA DE EMPLEADOS
      ==================================================== */}
      <FlatList
        data={empleadosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const nombre = item.nombre || item.usuario || "Empleado";
          const iniciales = obtenerIniciales(nombre);
          const rolEmpleado = item.rol || "Empleado";
          const estado = item.estado || "Activo";

          return (
            <View style={styles.employeeCard}>
              {/* Parte superior de la tarjeta */}
              <View style={styles.cardTop}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{iniciales}</Text>
                </View>

                <View style={styles.cardTitleWrap}>
                  <Text style={styles.employeeName}>{nombre}</Text>

                  <View style={styles.chipsRow}>
                    <View style={styles.roleChip}>
                      <Text style={styles.roleChipText}>{rolEmpleado}</Text>
                    </View>

                    <View style={styles.activeChip}>
                      <Text style={styles.activeChipText}>{estado}</Text>
                    </View>
                  </View>
                </View>

                {/* Botón eliminar */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => eliminarEmpleado(item.id)}
                >
                  <Feather name="trash-2" size={16} color="#FF3333" />
                </TouchableOpacity>
              </View>

              {/* Datos del empleado */}
              <View style={styles.lineRow}>
                <Feather name="mail" size={16} color="#5F7086" />
                <Text style={styles.lineText}>
                  {item.correo || `${item.usuario}@empresa.com`}
                </Text>
              </View>

              <View style={styles.lineRow}>
                <Feather name="phone" size={16} color="#5F7086" />
                <Text style={styles.lineText}>
                  {item.telefono || "555-0101"}
                </Text>
              </View>

              <View style={styles.lineRow}>
                <Feather name="user-check" size={16} color="#5F7086" />
                <Text style={styles.lineText}>
                  Desde: {item.fechaIngreso || "--/--/----"}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aun no hay empleados</Text>
            <Text style={styles.emptyText}>
              Pulsa + para registrar el primero.
            </Text>
          </View>
        }
      />
      {/* BOTÓN FLOTANTE DE VOLVER */}
      <TouchableOpacity
        style={styles.floatingBack}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      {/* ====================================================
          MODAL PARA AGREGAR EMPLEADO
      ==================================================== */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Empleado</Text>

              <Pressable
                style={styles.closeCircle}
                onPress={() => setModalVisible(false)}
              >
                <Feather name="x" size={20} color="#1C2430" />
              </Pressable>
            </View>

            {/* Campos del formulario */}
            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput
              value={form.nombre}
              onChangeText={(v) => setForm((p) => ({ ...p, nombre: v }))}
              placeholder="Ej: Maria Gonzalez"
              placeholderTextColor="#8D98A6"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Usuario</Text>
            <TextInput
              value={form.usuario}
              onChangeText={(v) => setForm((p) => ({ ...p, usuario: v }))}
              placeholder="usuario"
              placeholderTextColor="#8D98A6"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Correo</Text>
            <TextInput
              value={form.correo}
              onChangeText={(v) => setForm((p) => ({ ...p, correo: v }))}
              placeholder="correo@empresa.com"
              placeholderTextColor="#8D98A6"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Telefono</Text>
            <TextInput
              value={form.telefono}
              onChangeText={(v) => setForm((p) => ({ ...p, telefono: v }))}
              placeholder="555-0101"
              placeholderTextColor="#8D98A6"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Contrasena</Text>
            <TextInput
              value={form.password}
              onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
              secureTextEntry
              placeholder="********"
              placeholderTextColor="#8D98A6"
              style={styles.input}
            />

            {/* Selección de rol */}
            <Text style={styles.inputLabel}>Rol</Text>
            <View style={styles.rolesRow}>
              {ROLES.map((item) => {
                const activo = item === rol;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.rolePickerChip,
                      activo && styles.rolePickerChipActive,
                    ]}
                    onPress={() => setRol(item)}
                  >
                    <Text
                      style={[
                        styles.rolePickerText,
                        activo && styles.rolePickerTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Botón guardar */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={guardarEmpleado}
            >
              <Text style={styles.saveButtonText}>Guardar Empleado</Text>
            </TouchableOpacity>
          </View>

          {/* BOTÓN FLOTANTE PARA CERRAR EL MODAL */}
          <TouchableOpacity
            style={styles.floatingBackModal}
            onPress={() => setModalVisible(false)}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// ==========================================================
// FUNCIÓN AUXILIAR: OBTENER INICIALES
// ----------------------------------------------------------
// Convierte un nombre como "Maria Gonzalez" en "MG"
// ==========================================================
function obtenerIniciales(nombre) {
  const partes = nombre.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

// ==========================================================
// ESTILOS DE LA PANTALLA
// ==========================================================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ECEDEF",
  },
  header: {
    backgroundColor: "#FAA33E",
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F4F8",
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: "#2B3D54",
    fontSize: 16,
  },
  topStatsRow: {
    flexDirection: "row",
    gap: 10,
  },
  topStatCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 12,
  },
  topStatLabel: {
    color: "#FFF8F0",
    fontSize: 15,
    marginBottom: 2,
  },
  topStatValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  floatingBack: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#001A3D",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    zIndex: 999,
  },
  floatingBackModal: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#001A3D",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    zIndex: 999,
  },
  employeeCard: {
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#DEE2E7",
    borderRadius: 16,
    padding: 14,
    marginVertical: 7,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F8A13B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
  },
  cardTitleWrap: {
    flex: 1,
  },
  employeeName: {
    color: "#031A39",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 3,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  roleChip: {
    backgroundColor: "#ECF2FF",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  roleChipText: {
    color: "#1B5BFF",
    fontSize: 12,
  },
  activeChip: {
    backgroundColor: "#E7F7EE",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  activeChipText: {
    color: "#00A63E",
    fontSize: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FDEDEE",
    alignItems: "center",
    justifyContent: "center",
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 7,
  },
  lineText: {
    color: "#344A64",
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#112B4A",
    marginBottom: 5,
  },
  emptyText: {
    color: "#5C6F86",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#F6F7F9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 80,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#041B3A",
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8E9EC",
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    color: "#243548",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8D0DA",
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    color: "#001633",
  },
  rolesRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  rolePickerChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8D0DA",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  rolePickerChipActive: {
    borderColor: "#F8A13B",
    backgroundColor: "#FFF2E2",
  },
  rolePickerText: {
    color: "#3A506A",
    fontWeight: "600",
  },
  rolePickerTextActive: {
    color: "#E8841B",
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: "#FF6200",
    borderRadius: 14,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  floatingBackModal: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#001A3D",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    zIndex: 999,
  },
});