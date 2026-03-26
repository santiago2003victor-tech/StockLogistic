import { createContext, useState } from "react";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);

  const normalizarProducto = (producto) => ({
    ...producto,
    cantidad: Number(producto.cantidad || 0),
    precio: Number(producto.precio || 0),
    categoria: producto.categoria || "General",
    vencimiento: producto.vencimiento || "",
  });

  // ✅ AGREGAR PRODUCTO (seguro)
  const agregarProducto = (producto) => {
    setProductos((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ...normalizarProducto(producto),
      },
    ]);
  };

  // ✏️ EDITAR PRODUCTO
  const editarProducto = (id, productoActualizado) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...normalizarProducto(productoActualizado),
              id,
            }
          : p,
      ),
    );
  };

  // 🔴 SALIDA DE PRODUCTO (controlada)
  const salidaProducto = (id, cantidadSalida) => {
    setProductos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nuevaCantidad = p.cantidad - cantidadSalida;

          return {
            ...p,
            cantidad: nuevaCantidad < 0 ? 0 : nuevaCantidad, // 🔥 evita negativos
          };
        }
        return p;
      }),
    );
  };

  // ❌ ELIMINAR PRODUCTO
  const eliminarProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ProductContext.Provider
      value={{
        productos,
        agregarProducto,
        editarProducto,
        salidaProducto,
        eliminarProducto,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
