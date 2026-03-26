export const productosCriticos = (productos) => {
  const hoy = new Date();

  return productos.filter(p => {
    const vencimiento = new Date(p.vencimiento);
    const dias = (vencimiento - hoy) / (1000 * 60 * 60 * 24);

    return dias <= 3 || p.cantidad < 5;
  });
};
export const estadoProducto = (producto) => {
  if (producto.cantidad <= 3) return "CRITICO";
  if (producto.cantidad <= 10) return "BAJO";
  return "NORMAL";
};