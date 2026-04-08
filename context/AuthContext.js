import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { EmployeeContext } from "./EmployeeContext";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [rol, setRol] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const { empleados } = useContext(EmployeeContext);

  // ---------------------------------------------------
  // CARGAR SESIÓN GUARDADA AL ABRIR LA APP
  // ---------------------------------------------------
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const authGuardado = await AsyncStorage.getItem("isAuth");
        const rolGuardado = await AsyncStorage.getItem("rol");

        if (authGuardado === "true") {
          setIsAuth(true);
        }

        if (rolGuardado) {
          setRol(rolGuardado);
        }
      } catch (error) {
        console.log("Error cargando sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarSesion();
  }, []);

  // ---------------------------------------------------
  // SELECCIONAR ROL
  // ---------------------------------------------------
  const seleccionarRol = async (tipo) => {
    try {
      setRol(tipo);
      await AsyncStorage.setItem("rol", tipo);
    } catch (error) {
      console.log("Error guardando rol:", error);
    }
  };

  // ---------------------------------------------------
  // LOGIN
  // ---------------------------------------------------
  const login = async (usuario, password) => {
    // 🔐 ADMIN (fijo)
    if (rol === "admin") {
      if (usuario === "admin" && password === "1234") {
        setIsAuth(true);
        await AsyncStorage.setItem("isAuth", "true");
        await AsyncStorage.setItem("rol", "admin");
        return;
      }
    }

    // 👤 EMPLEADOS (dinámico)
    if (rol === "empleado") {
      const emp = empleados.find(
        (e) => e.usuario === usuario && e.password === password
      );

      if (emp) {
        setIsAuth(true);
        await AsyncStorage.setItem("isAuth", "true");
        await AsyncStorage.setItem("rol", "empleado");
        return;
      }
    }

    alert("Credenciales incorrectas");
  };

  // ---------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------
  const logout = async () => {
    try {
      setRol(null);
      setIsAuth(false);

      await AsyncStorage.removeItem("isAuth");
      await AsyncStorage.removeItem("rol");
    } catch (error) {
      console.log("Error cerrando sesión:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        rol,
        isAuth,
        loading,
        seleccionarRol,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};