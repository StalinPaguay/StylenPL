import { useState } from 'react'
import FeedbackMessage from './FeedbackMessage'
import { exchangeService } from '../services/exchangeService'

export default function ExchangeList({ token, exchanges, onDeleted }) {
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleDelete(exchangeId) {
    if (!window.confirm('¿Deseas eliminar esta publicación?')) return

    setError('')
    setSuccess('')
    setDeletingId(exchangeId)

    try {
      await exchangeService.remove(token, exchangeId)
      onDeleted(exchangeId)
      setSuccess('Publicación eliminada correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
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
              <small>Estado: {exchange.status}</small>

              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => handleDelete(exchange.id)}
              >
                {deletingId === exchange.id
                  ? 'Eliminando...'
                  : 'Eliminar publicación'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
