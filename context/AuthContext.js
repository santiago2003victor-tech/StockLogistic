import { createContext, useContext, useState } from "react";
import { EmployeeContext } from "./EmployeeContext";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [rol, setRol] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  const { empleados } = useContext(EmployeeContext);

  const seleccionarRol = (tipo) => {
    setRol(tipo);
  };

  const login = (usuario, password) => {

    // 🔐 ADMIN (fijo)
    if (rol === "admin") {
      if (usuario === "admin" && password === "1234") {
        setIsAuth(true);
        return;
      }
    }

    // 👤 EMPLEADOS (dinámico)
    if (rol === "empleado") {
      const emp = empleados.find(
        e => e.usuario === usuario && e.password === password
      );

      if (emp) {
        setIsAuth(true);
        return;
      }
    }

    alert("Credenciales incorrectas");
  };

  const logout = () => {
    setRol(null);
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{
      rol,
      isAuth,
      seleccionarRol,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};