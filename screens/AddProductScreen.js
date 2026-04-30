import { Feather } from "@expo/vector-icons";
import { useContext, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ProductContext } from "../context/ProductContext";

const CATEGORIAS = ["Lacteos", "Panaderia", "Granos", "Bebidas", "General"];
const CATEGORIAS_FILTRO = ["Todos", ...CATEGORIAS];

const MARCAS_POR_CATEGORIA = {
  Lacteos: ["Alpina", "Colanta", "Alquería"],
  Panaderia: ["Bimbo", "Ramo", "Tostao"],
  Granos: ["Diana", "Roa", "Florhuila"],
  Bebidas: ["Postobón", "Coca-Cola", "Pepsi"],
  General: [],
};

const TIPOS_LECHE = ["Entera", "Deslactosada", "Descremada"];

const FORM_INICIAL = {
  nombre: "",
  categoria: "General",
  marca: "",
  tipoLeche: "",
  stock: "",
  precio: "",
  vencimiento: "",
};

export default function AddProductScreen({ navigation, route }) {
  const {
    productos,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    registrarSalida,
  } = useContext(ProductContext);

  // --------------------------------------------------------
  // FILTRO RECIBIDO DESDE EL DASHBOARD
  // --------------------------------------------------------
  const filtroDashboard = route?.params?.filtroDashboard || "todos";

  const [busqueda, setBusqueda] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVentaVisible, setModalVentaVisible] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [productoVenta, setProductoVenta] = useState(null);
  const [cantidadVenta, setCantidadVenta] = useState("");

  const [form, setForm] = useState(FORM_INICIAL);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [mostrarMarcas, setMostrarMarcas] = useState(false);
  const [mostrarTipoLeche, setMostrarTipoLeche] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(new Date());
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  // --------------------------------------------------------
  // TÍTULO DINÁMICO
  // --------------------------------------------------------
  const tituloPantalla =
    filtroDashboard === "porVencer"
      ? "Por Vencer"
      : filtroDashboard === "stockBajo"
      ? "Stock Bajo"
      : "Productos";

  // --------------------------------------------------------
  // PRODUCTOS FILTRADOS
  // --------------------------------------------------------
  const productosFiltrados = useMemo(() => {
    const filtro = normalizarTexto(busqueda.trim());
    const hoy = new Date();

    return productos.filter((p) => {
      const nombre = normalizarTexto(p.nombre || "");
      const categoria = normalizarTexto(p.categoria || "General");

      const coincideBusqueda =
        !filtro || nombre.includes(filtro) || categoria.includes(filtro);

      const coincideCategoria =
        categoriaActiva === "Todos" ||
        categoria === normalizarTexto(categoriaActiva);

      let coincideDashboard = true;

      if (filtroDashboard === "porVencer") {
        if (!p.vencimiento) {
          coincideDashboard = false;
        } else {
          const fecha = new Date(p.vencimiento);
          if (Number.isNaN(fecha.getTime())) {
            coincideDashboard = false;
          } else {
            const diffDias = (fecha - hoy) / (1000 * 60 * 60 * 24);
            coincideDashboard = diffDias >= 0 && diffDias <= 30;
          }
        }
      }

      if (filtroDashboard === "stockBajo") {
        coincideDashboard = Number(p.cantidad || 0) <= 10;
      }

      return coincideBusqueda && coincideCategoria && coincideDashboard;
    });
  }, [busqueda, productos, categoriaActiva, filtroDashboard]);

  // --------------------------------------------------------
  // FORMULARIO PRODUCTOS
  // --------------------------------------------------------
  const resetFormulario = () => {
    setForm(FORM_INICIAL);
    setEditandoId(null);
  };

  const abrirNuevo = () => {
    resetFormulario();
    setModalVisible(true);
  };

  const abrirEditar = (producto) => {
    setEditandoId(producto.id);
    setForm({
      nombre: producto.nombre || "",
      categoria: producto.categoria || "General",
      marca: producto.marca || "",
      tipoLeche: producto.tipoLeche || "",
      stock: String(producto.cantidad ?? ""),
      precio: String(producto.precio ?? ""),
      vencimiento: formatearFechaParaInput(producto.vencimiento || ""),
    });
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setMostrarCategorias(false);
    setMostrarMarcas(false);
    setMostrarTipoLeche(false);
    setMostrarCalendario(false);
    resetFormulario();
  };

  const seleccionarCategoria = (categoria) => {
    setForm((prev) => ({
      ...prev,
      categoria,
      marca: "",
      tipoLeche: "",
    }));
    setMostrarCategorias(false);
  };

  const seleccionarMarca = (marca) => {
    setForm((prev) => ({ ...prev, marca }));
    setMostrarMarcas(false);
  };

  const seleccionarTipoLeche = (tipo) => {
    setForm((prev) => ({ ...prev, tipoLeche: tipo }));
    setMostrarTipoLeche(false);
  };

  const abrirCalendario = () => {
    setMesCalendario(parsearFecha(form.vencimiento));
    setMostrarCalendario(true);
  };

  const seleccionarFecha = (fecha) => {
    const dd = String(fecha.getDate()).padStart(2, "0");
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const yyyy = fecha.getFullYear();
    setForm((prev) => ({ ...prev, vencimiento: `${dd}/${mm}/${yyyy}` }));
    setMostrarCalendario(false);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) {
      alert("Ingresa el nombre del producto");
      return;
    }

    const stock = Number(form.stock || 0);
    const precio = Number(form.precio || 0);

    if (Number.isNaN(stock) || stock < 0) {
      alert("El stock debe ser un numero valido");
      return;
    }

    if (Number.isNaN(precio) || precio < 0) {
      alert("El precio debe ser un numero valido");
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      marca: form.marca,
      tipoLeche: form.tipoLeche,
      cantidad: stock,
      precio,
      vencimiento: normalizarFecha(form.vencimiento),
    };

    if (editandoId) {
      await editarProducto(editandoId, payload);
    } else {
      await agregarProducto(payload);
    }

    cerrarModal();
  };

  // --------------------------------------------------------
  // VENTAS / SALIDAS
  // --------------------------------------------------------
  const abrirVenta = (producto) => {
    setProductoVenta(producto);
    setCantidadVenta("");
    setModalVentaVisible(true);
  };

  const cerrarVenta = () => {
    setProductoVenta(null);
    setCantidadVenta("");
    setModalVentaVisible(false);
  };

  const confirmarVenta = async () => {
    if (!productoVenta) return;

    const cantidad = Number(cantidadVenta || 0);

    if (Number.isNaN(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad valida para vender");
      return;
    }

    const resultado = await registrarSalida(productoVenta.id, cantidad);

    if (!resultado.ok) {
      alert(resultado.mensaje);
      return;
    }

    cerrarVenta();

    if (resultado.advertencia) {
      alert(`⚠️ ${resultado.mensaje}`);
    } else {
      alert("Venta registrada correctamente");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>{tituloPantalla}</Text>
          <TouchableOpacity style={styles.addButton} onPress={abrirNuevo}>
            <Feather name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Feather name="search" size={22} color="#8D98A6" />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar productos..."
            placeholderTextColor="#8D98A6"
            style={styles.searchInput}
          />
          <TouchableOpacity
            style={[
              styles.filterToggle,
              mostrarFiltros && styles.filterToggleActive,
            ]}
            onPress={() => setMostrarFiltros((prev) => !prev)}
          >
            <Feather
              name="sliders"
              size={20}
              color={mostrarFiltros ? "#FF6200" : "#8D98A6"}
            />
          </TouchableOpacity>
        </View>

        {mostrarFiltros && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {CATEGORIAS_FILTRO.map((categoria) => {
              const activo = categoriaActiva === categoria;
              return (
                <TouchableOpacity
                  key={categoria}
                  style={[styles.filterChip, activo && styles.filterChipActive]}
                  onPress={() => setCategoriaActiva(categoria)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activo && styles.filterChipTextActive,
                    ]}
                  >
                    {categoria}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.productName}>{item.nombre}</Text>
                <Text style={styles.productCategory}>
                  {item.categoria || "General"}
                </Text>
              </View>

              <View style={styles.actionsWrap}>
                <TouchableOpacity
                  style={styles.iconButtonGreen}
                  onPress={() => abrirVenta(item)}
                >
                  <Feather name="shopping-cart" size={15} color="#00A63E" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButtonBlue}
                  onPress={() => abrirEditar(item)}
                >
                  <Feather name="edit-2" size={15} color="#1E66F5" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButtonRed}
                  onPress={() => eliminarProducto(item.id)}
                >
                  <Feather name="trash-2" size={15} color="#E43F3F" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>Stock</Text>
                <Text
                  style={[
                    styles.statValue,
                    (item.cantidad || 0) <= 10 && styles.lowStock,
                  ]}
                >
                  {Number(item.cantidad || 0)} unidades
                </Text>
              </View>

              <View>
                <Text style={styles.statLabel}>Precio</Text>
                <Text style={styles.statValue}>
                  ${Number(item.precio || 0).toFixed(1)}
                </Text>
              </View>

              <View
                style={[
                  styles.badge,
                  (item.cantidad || 0) <= 10 ? styles.badgeLow : styles.badgeOk,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    (item.cantidad || 0) <= 10
                      ? styles.badgeTextLow
                      : styles.badgeTextOk,
                  ]}
                >
                  {(item.cantidad || 0) <= 10 ? "Stock bajo" : "Disponible"}
                </Text>
              </View>
            </View>

            <Text style={styles.expiryText}>
              Vence: {formatearFechaParaVista(item.vencimiento)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No hay productos</Text>
            <Text style={styles.emptyText}>
              Toca el boton + para agregar el primero.
            </Text>
          </View>
        }
      />

      {/* MODAL AGREGAR / EDITAR */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editandoId ? "Editar Producto" : "Agregar Producto"}
              </Text>
              <Pressable style={styles.closeCircle} onPress={cerrarModal}>
                <Feather name="x" size={22} color="#20242B" />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Nombre del producto</Text>
            <TextInput
              value={form.nombre}
              onChangeText={(v) => setForm((prev) => ({ ...prev, nombre: v }))}
              placeholder="Ej: Leche Entera 1L"
              placeholderTextColor="#8D98A6"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Categoria</Text>
            <Pressable
              style={styles.selectInput}
              onPress={() => setMostrarCategorias((prev) => !prev)}
            >
              <Text style={styles.selectText}>
                {form.categoria || "Seleccionar categoria"}
              </Text>
              <Feather name="chevron-down" size={20} color="#222" />
            </Pressable>

            {mostrarCategorias && (
              <View style={styles.dropdown}>
                {CATEGORIAS.map((categoria) => (
                  <Pressable
                    key={categoria}
                    style={styles.dropdownItem}
                    onPress={() => seleccionarCategoria(categoria)}
                  >
                    <Text style={styles.dropdownItemText}>{categoria}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {form.categoria !== "General" && (
              <>
                <Text style={styles.inputLabel}>Marca</Text>
                <Pressable
                  style={styles.selectInput}
                  onPress={() => setMostrarMarcas((prev) => !prev)}
                >
                  <Text style={styles.selectText}>
                    {form.marca || "Seleccionar marca"}
                  </Text>
                  <Feather name="chevron-down" size={20} color="#222" />
                </Pressable>

                {mostrarMarcas && (
                  <View style={styles.dropdown}>
                    {MARCAS_POR_CATEGORIA[form.categoria]?.map((marca) => (
                      <Pressable
                        key={marca}
                        style={styles.dropdownItem}
                        onPress={() => seleccionarMarca(marca)}
                      >
                        <Text style={styles.dropdownItemText}>{marca}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            )}

            {form.categoria === "Lacteos" && (
              <>
                <Text style={styles.inputLabel}>Tipo de leche</Text>
                <Pressable
                  style={styles.selectInput}
                  onPress={() => setMostrarTipoLeche((prev) => !prev)}
                >
                  <Text style={styles.selectText}>
                    {form.tipoLeche || "Seleccionar tipo"}
                  </Text>
                  <Feather name="chevron-down" size={20} color="#222" />
                </Pressable>

                {mostrarTipoLeche && (
                  <View style={styles.dropdown}>
                    {TIPOS_LECHE.map((tipo) => (
                      <Pressable
                        key={tipo}
                        style={styles.dropdownItem}
                        onPress={() => seleccionarTipoLeche(tipo)}
                      >
                        <Text style={styles.dropdownItemText}>{tipo}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            )}

            <View style={styles.twoCols}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Stock</Text>
                <TextInput
                  value={form.stock}
                  onChangeText={(v) =>
                    setForm((prev) => ({ ...prev, stock: v }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#8D98A6"
                  style={styles.input}
                />
              </View>

              <View style={styles.col}>
                <Text style={styles.inputLabel}>Precio</Text>
                <TextInput
                  value={form.precio}
                  onChangeText={(v) =>
                    setForm((prev) => ({ ...prev, precio: v }))
                  }
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#8D98A6"
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Fecha de vencimiento</Text>
            <Pressable style={styles.selectInput} onPress={abrirCalendario}>
              <Text style={styles.selectText}>
                {form.vencimiento || "dd/mm/aaaa"}
              </Text>
              <Feather name="calendar" size={19} color="#222" />
            </Pressable>

            <TouchableOpacity style={styles.submitButton} onPress={guardar}>
              <Text style={styles.submitButtonText}>
                {editandoId ? "Guardar cambios" : "Agregar Producto"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL VENTA */}
      <Modal
        transparent
        visible={modalVentaVisible}
        animationType="slide"
        onRequestClose={cerrarVenta}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Venta</Text>
              <Pressable style={styles.closeCircle} onPress={cerrarVenta}>
                <Feather name="x" size={22} color="#20242B" />
              </Pressable>
            </View>

            <Text style={styles.saleTitle}>
              {productoVenta?.nombre || "Producto"}
            </Text>
            <Text style={styles.saleSubtext}>
              Categoria: {productoVenta?.categoria || "General"}
            </Text>
            <Text style={styles.saleSubtext}>
              Stock actual: {Number(productoVenta?.cantidad || 0)} unidades
            </Text>
            <Text style={styles.saleSubtext}>
              Vence: {formatearFechaParaVista(productoVenta?.vencimiento || "")}
            </Text>

            <Text style={styles.inputLabel}>Cantidad a vender</Text>
            <TextInput
              value={cantidadVenta}
              onChangeText={setCantidadVenta}
              keyboardType="numeric"
              placeholder="Ej: 5"
              placeholderTextColor="#8D98A6"
              style={styles.input}
            />

            <View style={styles.warningBox}>
              <Feather name="alert-triangle" size={18} color="#D78011" />
              <Text style={styles.warningText}>
                Si existe otro lote del mismo producto con vencimiento mas
                cercano, el sistema te avisara automaticamente.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.sellButton}
              onPress={confirmarVenta}
            >
              <Text style={styles.sellButtonText}>Confirmar Venta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL CALENDARIO */}
      <Modal
        transparent
        visible={mostrarCalendario}
        animationType="fade"
        onRequestClose={() => setMostrarCalendario(false)}
      >
        <Pressable
          style={styles.calendarOverlay}
          onPress={() => setMostrarCalendario(false)}
        >
          <Pressable style={styles.calendarCard} onPress={() => {}}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() =>
                  setMesCalendario(
                    (prev) =>
                      new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                  )
                }
              >
                <Feather name="chevron-left" size={18} color="#1E2F46" />
              </TouchableOpacity>

              <Text style={styles.calendarTitle}>
                {formatearMes(mesCalendario)}
              </Text>

              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() =>
                  setMesCalendario(
                    (prev) =>
                      new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                  )
                }
              >
                <Feather name="chevron-right" size={18} color="#1E2F46" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekDays}>
              {DIA_CORTO.map((dia) => (
                <Text key={dia} style={styles.calendarWeekDayText}>
                  {dia}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {construirDiasMes(mesCalendario).map((dia, idx) => {
                if (!dia) {
                  return (
                    <View
                      key={`empty-${idx}`}
                      style={styles.calendarDayEmpty}
                    />
                  );
                }

                const textoSeleccionado = form.vencimiento || "";
                const actual = `${String(dia.getDate()).padStart(
                  2,
                  "0"
                )}/${String(dia.getMonth() + 1).padStart(
                  2,
                  "0"
                )}/${dia.getFullYear()}`;
                const seleccionado = textoSeleccionado === actual;

                return (
                  <TouchableOpacity
                    key={`${dia.getFullYear()}-${dia.getMonth()}-${dia.getDate()}`}
                    style={[
                      styles.calendarDay,
                      seleccionado && styles.calendarDaySelected,
                    ]}
                    onPress={() => seleccionarFecha(dia)}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        seleccionado && styles.calendarDayTextSelected,
                      ]}
                    >
                      {dia.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <TouchableOpacity
        style={styles.floatingBack}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

// ==========================================================
// FUNCIONES AUXILIARES
// ==========================================================
function normalizarFecha(valor) {
  if (!valor) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";

  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function formatearFechaParaVista(valor) {
  if (!valor) return "--/--/----";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return valor;

  const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return valor;

  const [, yyyy, mm, dd] = match;
  return `${dd}/${mm}/${yyyy}`;
}

function formatearFechaParaInput(valor) {
  if (!valor) return "";
  return formatearFechaParaVista(valor);
}

function parsearFecha(valor) {
  if (!valor) return new Date();

  const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return new Date();

  const [, dd, mm, yyyy] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

function normalizarTexto(valor) {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const DIA_CORTO = ["D", "L", "M", "M", "J", "V", "S"];

function construirDiasMes(fechaBase) {
  const year = fechaBase.getFullYear();
  const month = fechaBase.getMonth();
  const primerDiaSemana = new Date(year, month, 1).getDay();
  const blanks = Array(primerDiaSemana).fill(null);
  const totalDias = new Date(year, month + 1, 0).getDate();

  const dias = Array.from(
    { length: totalDias },
    (_, i) => new Date(year, month, i + 1)
  );
  return [...blanks, ...dias];
}

function formatearMes(fecha) {
  return fecha.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

// ==========================================================
// ESTILOS
// ==========================================================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ECEDEF",
  },
  header: {
    backgroundColor: "#FF6200",
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F4F8",
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#243548",
    fontSize: 16,
  },
  filterToggle: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  filterToggleActive: {
    backgroundColor: "#FFF1E7",
  },
  filtersRow: {
    paddingTop: 10,
    paddingBottom: 2,
    paddingRight: 6,
    gap: 8,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#FF8A33",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: "#FFFFFF",
  },
  filterChipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FF6200",
    fontWeight: "700",
  },
  listContent: {
    padding: 10,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    padding: 14,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: "#DEE2E7",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  productName: {
    color: "#041B3A",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  productCategory: {
    color: "#495E76",
    fontSize: 14,
  },
  actionsWrap: {
    flexDirection: "row",
    gap: 8,
  },
  iconButtonGreen: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#E7F7EE",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonBlue: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#ECF1FB",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonRed: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#FDEDEE",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E8ED",
  },
  statLabel: {
    color: "#596E84",
    fontSize: 13,
  },
  statValue: {
    color: "#021A3A",
    fontSize: 17,
    fontWeight: "700",
  },
  lowStock: {
    color: "#E51A1A",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  badgeOk: {
    backgroundColor: "#E7F7EE",
  },
  badgeLow: {
    backgroundColor: "#FFF2DE",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeTextOk: {
    color: "#00A63E",
  },
  badgeTextLow: {
    color: "#D78011",
  },
  expiryText: {
    marginTop: 10,
    color: "#596E84",
    fontSize: 13,
  },
  emptyState: {
    marginTop: 24,
    alignItems: "center",
    paddingHorizontal: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#001633",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#5B6E84",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#F6F7F9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 28,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    color: "#041B3A",
    fontSize: 20,
    fontWeight: "700",
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
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C8D0DA",
    paddingHorizontal: 14,
    color: "#001633",
    fontSize: 16,
    backgroundColor: "#F6F7F9",
  },
  selectInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C8D0DA",
    paddingHorizontal: 14,
    backgroundColor: "#F6F7F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    color: "#001633",
    fontSize: 16,
  },
  dropdown: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8D0DA",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E6EBF0",
  },
  dropdownItemText: {
    color: "#001633",
    fontSize: 15,
  },
  twoCols: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FF6200",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  sellButton: {
    marginTop: 18,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#00A63E",
    alignItems: "center",
    justifyContent: "center",
  },
  sellButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  saleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#041B3A",
    marginBottom: 6,
  },
  saleSubtext: {
    fontSize: 14,
    color: "#5C6F86",
    marginBottom: 4,
  },
  warningBox: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFF6E8",
    borderRadius: 12,
    padding: 12,
    alignItems: "flex-start",
  },
  warningText: {
    flex: 1,
    color: "#8A5A13",
    fontSize: 13,
    lineHeight: 18,
  },
  floatingBack: {
    position: "absolute",
    right: 14,
    bottom: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#001A3D",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  calendarCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calendarNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E2F46",
    textTransform: "capitalize",
  },
  calendarWeekDays: {
    flexDirection: "row",
    marginBottom: 6,
  },
  calendarWeekDayText: {
    width: `${100 / 7}%`,
    textAlign: "center",
    color: "#70839B",
    fontWeight: "600",
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDayEmpty: {
    width: `${100 / 7}%`,
    height: 38,
  },
  calendarDay: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  calendarDaySelected: {
    backgroundColor: "#FF6200",
  },
  calendarDayText: {
    color: "#1E2F46",
    fontWeight: "600",
  },
  calendarDayTextSelected: {
    color: "#FFFFFF",
  },
});