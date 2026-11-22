import { useState } from 'react'
import FeedbackMessage from './FeedbackMessage'
import { exchangeService } from '../services/exchangeService'

const STATUS_OPTIONS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'reservado', label: 'Reservado' },
  { value: 'intercambiado', label: 'Intercambiado' },
]

export default function ExchangeList({
  token,
  exchanges,
  onDeleted,
  onUpdated,
}) {
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleStatusChange(exchangeId, status) {
    setError('')
    setSuccess('')
    setBusyId(exchangeId)

    try {
      const updated = await exchangeService.updateStatus(
        exchangeId,
        status,
        token
      )
      onUpdated(updated)
      setSuccess('Estado actualizado correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(exchangeId) {
    if (!window.confirm('¿Deseas eliminar esta publicación?')) return

    setError('')
    setSuccess('')
    setBusyId(exchangeId)

    try {
      await exchangeService.remove(token, exchangeId)
      onDeleted(exchangeId)
      setSuccess('Publicación eliminada correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section>
      <h2>Mis publicaciones</h2>

      <FeedbackMessage type="error" message={error} />
      <FeedbackMessage type="success" message={success} />

      {exchanges.length === 0 ? (
        <p>No tienes intercambios publicados.</p>
      ) : (
        <ul>
          {exchanges.map((exchange) => (
            <li key={exchange.id}>
              <strong>{exchange.title}</strong>
              <p>{exchange.description}</p>

              <div className="exchange-status">
                <label htmlFor={`status-${exchange.id}`}>
                  Estado de la publicación
                </label>
                <select
                  id={`status-${exchange.id}`}
                  value={exchange.status}
                  disabled={busyId !== null}
                  onChange={(event) =>
                    handleStatusChange(exchange.id, event.target.value)
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => handleDelete(exchange.id)}
              >
                {busyId === exchange.id
                  ? 'Procesando...'
                  : 'Eliminar publicación'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
