import { createContext, useState } from "react";

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [empleados, setEmpleados] = useState([]);

  // ➕ AGREGAR
  const agregarEmpleado = (empleado) => {
    setEmpleados(prev => [
      ...prev,
      { ...empleado, id: Date.now().toString() }
    ]);
  };

  // ❌ ELIMINAR
  const eliminarEmpleado = (id) => {
    setEmpleados(prev => prev.filter(e => e.id !== id));
  };

  return (
    <EmployeeContext.Provider value={{
      empleados,
      agregarEmpleado,
      eliminarEmpleado
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};