import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ---------------------------------------------------
  // CARGAR PRODUCTOS GUARDADOS
  // ---------------------------------------------------
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await AsyncStorage.getItem("productos");

        if (data) {
          setProductos(JSON.parse(data));
        }
      } catch (error) {
        console.log("Error cargando productos:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    cargarProductos();
  }, []);

  // ---------------------------------------------------
  // GUARDAR PRODUCTOS CADA VEZ QUE CAMBIEN
  // ---------------------------------------------------
  useEffect(() => {
    if (!loadingProducts) {
      AsyncStorage.setItem("productos", JSON.stringify(productos));
    }
  }, [productos, loadingProducts]);

  // ---------------------------------------------------
  // AGREGAR PRODUCTO
  // ---------------------------------------------------
  const agregarProducto = (nuevoProducto) => {
    const productoConId = {
      id: Date.now().toString(),
      ...nuevoProducto,
    };

    setProductos((prev) => [...prev, productoConId]);
  };

  // ---------------------------------------------------
  // EDITAR PRODUCTO
  // ---------------------------------------------------
  const editarProducto = (id, datosActualizados) => {
    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, ...datosActualizados } : prod
      )
    );
  };

  // ---------------------------------------------------
  // ELIMINAR PRODUCTO
  // ---------------------------------------------------
  const eliminarProducto = (id) => {
    setProductos((prev) => prev.filter((prod) => prod.id !== id));
  };

  return (
    <ProductContext.Provider
      value={{
        productos,
        agregarProducto,
        editarProducto,
        eliminarProducto,
        loadingProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
