import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const ProductContext = createContext();

const STORAGE_KEY = "@stocklogistic_productos";

// ==========================================================
// PRODUCT PROVIDER
// ==========================================================
export const ProductProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);

  // ========================================================
  // CARGAR PRODUCTOS DESDE ASYNCSTORAGE
  // ========================================================
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const guardados = await AsyncStorage.getItem(STORAGE_KEY);

      if (guardados) {
        setProductos(JSON.parse(guardados));
      }
    } catch (error) {
      console.log("Error cargando productos:", error);
    } finally {
      setCargandoProductos(false);
    }
  };

  // ========================================================
  // GUARDAR PRODUCTOS EN ASYNCSTORAGE
  // ========================================================
  const guardarEnStorage = async (lista) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
      setProductos(lista);
    } catch (error) {
      console.log("Error guardando productos:", error);
    }
  };

  // ========================================================
  // AGREGAR PRODUCTO
  // REGLA:
  // mismo nombre + misma categoría + mismo vencimiento = mismo lote
  // ========================================================
  const agregarProducto = async (nuevoProducto) => {
    const nombreNormalizado = normalizarTexto(nuevoProducto.nombre || "");
    const categoriaNormalizada = normalizarTexto(
      nuevoProducto.categoria || "General"
    );
    const vencimientoNormalizado = normalizarFecha(
      nuevoProducto.vencimiento || ""
    );

    const cantidadNueva = Number(nuevoProducto.cantidad || 0);
    const precioNuevo = Number(nuevoProducto.precio || 0);

    const productoExistente = productos.find((p) => {
      return (
        normalizarTexto(p.nombre || "") === nombreNormalizado &&
        normalizarTexto(p.categoria || "General") === categoriaNormalizada &&
        normalizarFecha(p.vencimiento || "") === vencimientoNormalizado
      );
    });

    let nuevaLista = [];

    if (productoExistente) {
      nuevaLista = productos.map((p) => {
        if (p.id === productoExistente.id) {
          return {
            ...p,
            cantidad: Number(p.cantidad || 0) + cantidadNueva,
            precio: precioNuevo || Number(p.precio || 0),
            movimientos: [
              ...(p.movimientos || []),
              {
                id: generarId(),
                tipo: "entrada",
                cantidad: cantidadNueva,
                fecha: new Date().toISOString(),
              },
            ],
          };
        }
        return p;
      });
    } else {
      const nuevo = {
        id: generarId(),
        nombre: nuevoProducto.nombre || "",
        categoria: nuevoProducto.categoria || "General",
        cantidad: cantidadNueva,
        precio: precioNuevo,
        vencimiento: vencimientoNormalizado,
        movimientos: [
          {
            id: generarId(),
            tipo: "entrada",
            cantidad: cantidadNueva,
            fecha: new Date().toISOString(),
          },
        ],
      };

      nuevaLista = [...productos, nuevo];
    }

    await guardarEnStorage(nuevaLista);
  };

  // ========================================================
  // EDITAR PRODUCTO
  // ========================================================
  const editarProducto = async (id, datosActualizados) => {
    const nuevaLista = productos.map((p) => {
      if (p.id !== id) return p;

      return {
        ...p,
        nombre: datosActualizados.nombre ?? p.nombre,
        categoria: datosActualizados.categoria ?? p.categoria,
        cantidad: Number(datosActualizados.cantidad ?? p.cantidad),
        precio: Number(datosActualizados.precio ?? p.precio),
        vencimiento: normalizarFecha(
          datosActualizados.vencimiento ?? p.vencimiento
        ),
      };
    });

    await guardarEnStorage(nuevaLista);
  };

  // ========================================================
  // ELIMINAR PRODUCTO
  // ========================================================
  const eliminarProducto = async (id) => {
    const nuevaLista = productos.filter((p) => p.id !== id);
    await guardarEnStorage(nuevaLista);
  };

  // ========================================================
  // VALIDAR FEFO
  // --------------------------------------------------------
  // Devuelve advertencia si el usuario intenta vender un lote
  // que NO es el que vence primero
  // ========================================================
  const validarVentaFEFO = (idLoteSeleccionado) => {
    const loteSeleccionado = productos.find((p) => p.id === idLoteSeleccionado);

    if (!loteSeleccionado) {
      return {
        permitido: false,
        advertencia: false,
        mensaje: "Producto no encontrado",
        loteCorrecto: null,
      };
    }

    const mismoProducto = productos.filter((p) => {
      return (
        normalizarTexto(p.nombre || "") ===
          normalizarTexto(loteSeleccionado.nombre || "") &&
        normalizarTexto(p.categoria || "General") ===
          normalizarTexto(loteSeleccionado.categoria || "General") &&
        Number(p.cantidad || 0) > 0 &&
        p.vencimiento
      );
    });

    if (mismoProducto.length <= 1) {
      return {
        permitido: true,
        advertencia: false,
        mensaje: "",
        loteCorrecto: null,
      };
    }

    const lotesOrdenados = [...mismoProducto].sort(
      (a, b) => new Date(a.vencimiento) - new Date(b.vencimiento)
    );

    const loteCorrecto = lotesOrdenados[0];

    if (loteCorrecto.id !== idLoteSeleccionado) {
      return {
        permitido: true,
        advertencia: true,
        mensaje: `Recomendacion: vende primero el lote que vence el ${formatearFechaVista(
          loteCorrecto.vencimiento
        )}`,
        loteCorrecto,
      };
    }

    return {
      permitido: true,
      advertencia: false,
      mensaje: "",
      loteCorrecto,
    };
  };

  // ========================================================
  // REGISTRAR SALIDA / VENTA
  // ========================================================
  const registrarSalida = async (id, cantidadSalida) => {
    const cantidad = Number(cantidadSalida || 0);

    if (cantidad <= 0) {
      return {
        ok: false,
        advertencia: false,
        mensaje: "La cantidad de salida debe ser mayor que 0",
      };
    }

    const producto = productos.find((p) => p.id === id);

    if (!producto) {
      return {
        ok: false,
        advertencia: false,
        mensaje: "Producto no encontrado",
      };
    }

    const stockActual = Number(producto.cantidad || 0);

    if (cantidad > stockActual) {
      return {
        ok: false,
        advertencia: false,
        mensaje: "No hay suficiente stock disponible",
      };
    }

    const fefo = validarVentaFEFO(id);

    const nuevaLista = productos.map((p) => {
      if (p.id !== id) return p;

      return {
        ...p,
        cantidad: stockActual - cantidad,
        movimientos: [
          ...(p.movimientos || []),
          {
            id: generarId(),
            tipo: "salida",
            cantidad: cantidad,
            fecha: new Date().toISOString(),
          },
        ],
      };
    });

    await guardarEnStorage(nuevaLista);

    return {
      ok: true,
      advertencia: fefo.advertencia,
      mensaje: fefo.advertencia
        ? fefo.mensaje
        : "Salida registrada correctamente",
      loteCorrecto: fefo.loteCorrecto || null,
    };
  };

  // ========================================================
  // LIMPIAR TODO (opcional)
  // ========================================================
  const limpiarProductos = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setProductos([]);
    } catch (error) {
      console.log("Error limpiando productos:", error);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        productos,
        cargandoProductos,
        agregarProducto,
        editarProducto,
        eliminarProducto,
        registrarSalida,
        validarVentaFEFO,
        limpiarProductos,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// ==========================================================
// FUNCIONES AUXILIARES
// ==========================================================
function normalizarTexto(valor) {
  return String(valor)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarFecha(valor) {
  if (!valor) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  const match = String(valor).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";

  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function formatearFechaVista(valor) {
  if (!valor) return "--/--/----";

  const match = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return valor;

  const [, yyyy, mm, dd] = match;
  return `${dd}/${mm}/${yyyy}`;
}

function generarId() {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}