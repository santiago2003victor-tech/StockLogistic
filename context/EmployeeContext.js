import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [empleados, setEmpleados] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // ---------------------------------------------------
  // CARGAR EMPLEADOS GUARDADOS
  // ---------------------------------------------------
  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const data = await AsyncStorage.getItem("empleados");

        if (data) {
          setEmpleados(JSON.parse(data));
        }
      } catch (error) {
        console.log("Error cargando empleados:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    cargarEmpleados();
  }, []);

  // ---------------------------------------------------
  // GUARDAR EMPLEADOS CADA VEZ QUE CAMBIEN
  // ---------------------------------------------------
  useEffect(() => {
    if (!loadingEmployees) {
      AsyncStorage.setItem("empleados", JSON.stringify(empleados));
    }
  }, [empleados, loadingEmployees]);

  // ---------------------------------------------------
  // AGREGAR EMPLEADO
  // ---------------------------------------------------
  const agregarEmpleado = (nuevoEmpleado) => {
    const empleadoConId = {
      id: Date.now().toString(),
      ...nuevoEmpleado,
    };

    setEmpleados((prev) => [...prev, empleadoConId]);
  };

  // ---------------------------------------------------
  // ELIMINAR EMPLEADO
  // ---------------------------------------------------
  const eliminarEmpleado = (id) => {
    setEmpleados((prev) => prev.filter((emp) => emp.id !== id));
  };

  return (
    <EmployeeContext.Provider
      value={{
        empleados,
        agregarEmpleado,
        eliminarEmpleado,
        loadingEmployees,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};