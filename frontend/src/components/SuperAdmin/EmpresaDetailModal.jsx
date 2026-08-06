import { useEffect, useState } from 'react'
import { actualizarEmpresaSuperAdmin } from '../../services/api'
import './EmpresaDetailModal.css'

export default function EmpresaDetailModal({ empresa, onClose, onSaved }) {
  // El modal permanece montado aunque no haya empresa seleccionada. Empezar
  // con un objeto evita renderizar una pantalla en blanco entre el clic y la
  // respuesta del endpoint.
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (empresa) setForm(empresa)
  }, [empresa])
  if (!empresa) return null
  const update = ({ target: { name, value, checked, type } }) => setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const updated = await actualizarEmpresaSuperAdmin(empresa.id, form)
      onSaved(updated); onClose()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }
  return <div className="company-detail-overlay" role="dialog" aria-modal="true" aria-label="Ficha del negocio">
    <form className="company-detail-modal" onSubmit={save}>
      <header className="company-detail-header"><div><p className="manager-eyebrow">Ficha de negocio</p><h2>{empresa.nombre}</h2><span>/{empresa.slug}</span></div><button type="button" className="detail-close" onClick={onClose}><i className="fas fa-times"></i></button></header>
      {error && <div className="notice error">{error}</div>}
      <section className="company-detail-summary"><div><span>Estado</span><strong className={empresa.tiene_acceso ? 'detail-status ok' : 'detail-status'}>{empresa.tiene_acceso ? 'Con acceso' : 'Sin acceso'}</strong></div><div><span>Plan</span><strong>{empresa.licencia?.plan || 'Sin plan'}</strong></div><div><span>Propietaria</span><strong>{empresa.propietario?.username || 'Sin cuenta'}</strong></div></section>
      <div className="company-detail-grid">
        <label>Nombre comercial<input name="nombre" value={form.nombre || ''} onChange={update} required /></label>
        <label>Slug / URL<input name="slug" value={form.slug || ''} onChange={update} required /></label>
        <label>NIT<input name="nit" value={form.nit || ''} onChange={update} /></label>
        <label>Correo de contacto<input name="email_contacto" type="email" value={form.email_contacto || ''} onChange={update} /></label>
        <label>Teléfono<input name="telefono" value={form.telefono || ''} onChange={update} /></label>
        <label>WhatsApp<input name="whatsapp" value={form.whatsapp || ''} onChange={update} /></label>
        <label className="detail-full">Dirección<textarea name="direccion" value={form.direccion || ''} onChange={update} rows="2" /></label>
        <label>Moneda<input name="moneda" value={form.moneda || 'COP'} onChange={update} /></label>
        <label>Impuesto (%)<input name="porcentaje_impuesto" type="number" min="0" step="0.01" value={form.porcentaje_impuesto || '0'} onChange={update} /></label>
        <label className="detail-switch detail-full"><input name="activa" type="checkbox" checked={Boolean(form.activa)} onChange={update} /> Negocio habilitado en la plataforma</label>
      </div>
      <footer className="company-detail-footer"><span>Creado: {empresa.creada_en ? new Date(empresa.creada_en).toLocaleDateString('es-CO') : '—'}</span><div><button type="button" className="detail-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button></div></footer>
    </form>
  </div>
}
