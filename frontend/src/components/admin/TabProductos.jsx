import { formatMoney } from '../../utils/adminConstants'

export default function TabProductos({
  productos, productoForm, updateProducto, submitProducto,
  productoError, productoSaving
}) {
  return (
    <div className="admin-card">
      <h2 className="section-title">Gestión de Productos</h2>
      {productoError && <div className="notice error">{productoError}</div>}

      <form className="admin-card-inner" onSubmit={submitProducto}>
        <h3>Nuevo producto</h3>
        <div className="settings-grid">
          <label className="full">Nombre<input name="nombre" value={productoForm.nombre} onChange={updateProducto} required /></label>
          <label className="full">Descripción<textarea name="descripcion" value={productoForm.descripcion} onChange={updateProducto} /></label>
          <label>Precio de venta (COP)<input name="precio_venta" type="number" step="0.01" min="0" value={productoForm.precio_venta} onChange={updateProducto} required /></label>
          <label>Costo (COP)<input name="costo" type="number" step="0.01" min="0" value={productoForm.costo} onChange={updateProducto} /></label>
          <label>Stock<input name="stock_actual" type="number" min="0" value={productoForm.stock_actual} onChange={updateProducto} required /></label>
          <label>Código de barras<input name="codigo_barras" value={productoForm.codigo_barras} onChange={updateProducto} /></label>
        </div>
        <div className="form-actions">
          <button className="tenant-button" type="submit" disabled={productoSaving}>
            {productoSaving ? 'Guardando...' : 'Agregar producto'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3>Productos actuales</h3>
        {productos.length === 0 ? (
          <p className="tenant-muted">Aún no tienes productos. Agrega el primero.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Precio venta</th>
                  <th>Costo</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <div className="table-cell-title">{producto.nombre}</div>
                      {producto.descripcion && <div className="table-note">{producto.descripcion}</div>}
                    </td>
                    <td>{producto.codigo_barras || '—'}</td>
                    <td>{formatMoney(producto.precio_venta)}</td>
                    <td>{formatMoney(producto.costo)}</td>
                    <td>{producto.stock_actual}</td>
                    <td>
                      <span className={`status-pill ${producto.activo ? 'active' : 'inactive'}`}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
