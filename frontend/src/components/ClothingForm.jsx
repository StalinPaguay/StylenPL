import { useState } from 'react'
import { clothingService } from '../services/clothingService'

const initialForm = {
  name: '',
  category: 'camiseta',
  color: '',
  size: '',
  description: '',
}

export default function ClothingForm({ token, onCreated }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const clothing = await clothingService.create(token, form)
      onCreated(clothing)
      setForm(initialForm)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agregar prenda</h2>

      <label htmlFor="name">Nombre</label>
      <input id="name" name="name" value={form.name} onChange={handleChange} required />

      <label htmlFor="category">Categoría</label>
      <select id="category" name="category" value={form.category} onChange={handleChange}>
        <option value="camiseta">Camiseta</option>
        <option value="pantalon">Pantalón</option>
        <option value="vestido">Vestido</option>
        <option value="chaqueta">Chaqueta</option>
        <option value="calzado">Calzado</option>
        <option value="accesorio">Accesorio</option>
        <option value="otro">Otro</option>
      </select>

      <label htmlFor="color">Color</label>
      <input id="color" name="color" value={form.color} onChange={handleChange} required />

      <label htmlFor="size">Talla</label>
      <input id="size" name="size" value={form.size} onChange={handleChange} required />

      <label htmlFor="description">Descripción</label>
      <textarea id="description" name="description" value={form.description} onChange={handleChange} />

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar prenda'}
      </button>
    </form>
  )
}
