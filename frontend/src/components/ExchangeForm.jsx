import { useState } from 'react'
import FeedbackMessage from './FeedbackMessage'
import { exchangeService } from '../services/exchangeService'

export default function ExchangeForm({ token, clothes, onCreated }) {
  const [form, setForm] = useState({
    clothing_id: '',
    title: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const title = form.title.trim()
    const description = form.description.trim()

    if (!form.clothing_id) {
      setError('Selecciona una prenda.')
      return
    }

    if (title.length < 3) {
      setError('El título debe tener al menos 3 caracteres.')
      return
    }

    if (title.length > 100) {
      setError('El título no puede superar los 100 caracteres.')
      return
    }

    setLoading(true)

    try {
      const exchange = await exchangeService.create(token, { ...form, title, description })
      onCreated(exchange)
      setForm({ clothing_id: '', title: '', description: '' })
      setSuccess('Intercambio publicado correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  return (
    <section>
      <h2>Publicar intercambio</h2>

      <FeedbackMessage type="error" message={error} />
      <FeedbackMessage type="success" message={success} />

      <form onSubmit={handleSubmit}>
        <label htmlFor="exchange-clothing">Prenda</label>
        <select
          id="exchange-clothing"
          name="clothing_id"
          value={form.clothing_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una prenda</option>
          {clothes.map((clothing) => (
            <option key={clothing.id} value={clothing.id}>
              {clothing.name}
            </option>
          ))}
        </select>

        <label htmlFor="exchange-title">Título</label>
        <input
          id="exchange-title"
          name="title"
          minLength={3}
          maxLength={100}
          value={form.title}
          onChange={handleChange}
          required
        />
        <small>{form.title.length}/100 caracteres</small>

        <label htmlFor="exchange-description">Descripción</label>
        <textarea
          id="exchange-description"
          name="description"
          maxLength={500}
          value={form.description}
          onChange={handleChange}
        />
        <small>{form.description.length}/500 caracteres</small>

        <button type="submit" disabled={loading || clothes.length === 0}>
          {loading ? 'Publicando...' : 'Publicar intercambio'}
        </button>
      </form>

      {clothes.length === 0 && (
        <FeedbackMessage
          type="info"
          message="Agrega una prenda a tu armario antes de publicar."
        />
      )}
    </section>
  )
}



