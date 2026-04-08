import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";

// 🔥 CONTEXTOS
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { EmployeeProvider } from "./context/EmployeeContext";
import { ProductProvider } from "./context/ProductContext";

// 📱 PANTALLAS
import AddEmployeeScreen from "./screens/AddEmployeeScreen";
import AddProductScreen from "./screens/AddProductScreen";
import AlertsScreen from "./screens/AlertsScreen";
import DashboardScreen from "./screens/DashboardScreen";
import EmployeeScreen from "./screens/EmployeeScreen";
import LoginScreen from "./screens/LoginScreen";
import RoleScreen from "./screens/RoleScreen";
import SuccessScreen from "./screens/SuccessScreen";

const Stack = createNativeStackNavigator();

// 🔁 CONTROL DE FLUJO (ROL + LOGIN)
function Navigation() {
  const { rol, isAuth, loading } = useContext(AuthContext);

  // ⏳ ESPERAR A QUE CARGUE LA SESIÓN GUARDADA
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ECEDEF",
        }}
      >
        <ActivityIndicator size="large" color="#FF6200" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!rol ? (
        <Stack.Screen
          name="Role"
          component={RoleScreen}
          options={{ title: "Seleccionar Rol" }}
        />
      ) : !isAuth ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Iniciar Sesión" }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="AddProduct"
            component={AddProductScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Alerts"
            component={AlertsScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Success"
            component={SuccessScreen}
            options={{ title: "Éxito" }}
          />

          {/* 👥 EMPLEADOS */}
          <Stack.Screen
            name="Employees"
            component={EmployeeScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="AddEmployee"
            component={AddEmployeeScreen}
            options={{ title: "Agregar Empleado" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// 🚀 APP PRINCIPAL
export default function App() {
  return (
    <EmployeeProvider>
      <AuthProvider>
        <ProductProvider>
          <NavigationContainer>
            <Navigation />
          </NavigationContainer>
        </ProductProvider>
      </AuthProvider>
    </EmployeeProvider>
  );
}