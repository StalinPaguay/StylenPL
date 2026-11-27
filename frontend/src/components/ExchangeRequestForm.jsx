import { useRef, useState } from 'react'
import FeedbackMessage from './FeedbackMessage'
import { exchangeRequestService } from '../services/exchangeRequestService'

export default function ExchangeRequestForm({ token, exchange, onCreated, onUnavailable }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    if (submittingRef.current) return
    submittingRef.current = true

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const request = await exchangeRequestService.create(token, {
        exchange_id: exchange.id,
        message: message.trim(),
      })

      setMessage('')
      setSuccess('Solicitud enviada correctamente.')
      onCreated?.(request)
    } catch (err) {
      setError(err.message)

      const availabilityConflict =
        err.message?.includes('ya no está disponible') ||
        err.message?.includes('está siendo modificada')

      if (availabilityConflict) {
        onUnavailable?.()
      }
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="exchange-request-form">
      <h3>Solicitar intercambio</h3>
      <p>Publicación: {exchange.title}</p>

      <label htmlFor={`request-message-${exchange.id}`}>
        Mensaje para el propietario (opcional)
      </label>

      <textarea
        id={`request-message-${exchange.id}`}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        maxLength={500}
        placeholder="Hola, me interesa intercambiar esta prenda..."
        disabled={loading}
      />

      <small>{message.length}/500 caracteres</small>

      <FeedbackMessage type="error" message={error} />
      <FeedbackMessage type="success" message={success} />

      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  )
}
