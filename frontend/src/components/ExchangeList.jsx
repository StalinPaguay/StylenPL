import { useState } from 'react'
import FeedbackMessage from './FeedbackMessage'
import { exchangeService } from '../services/exchangeService'

export default function ExchangeList({
  token,
  exchanges,
  onDeleted,
  onUpdated,
  onEdit,
}) {
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleComplete(exchangeId) {
    if (!window.confirm('¿Confirmas que este intercambio se ha completado?')) {
      return
    }

    setError('')
    setSuccess('')
    setBusyId(exchangeId)

    try {
      const updated = await exchangeService.complete(token, exchangeId)

      try {
        await onUpdated(updated)
        setSuccess('Intercambio finalizado correctamente.')
      } catch {
        setError(
          'El intercambio se completó correctamente, pero no se pudo actualizar el historial. ' +
          'Utiliza "Actualizar solicitudes" para consultar su estado.'
        )
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }
  async function handleDelete(exchangeId) {
    if (!window.confirm('Â¿Deseas eliminar esta publicaciÃ³n?')) return

    setError('')
    setSuccess('')
    setBusyId(exchangeId)

    try {
      await exchangeService.remove(token, exchangeId)

      try {
        await onDeleted(exchangeId)
        setSuccess('Publicación eliminada correctamente.')
      } catch {
        setError(
          'La publicación fue eliminada, pero no se pudo actualizar el historial. ' +
          'Utiliza "Actualizar solicitudes" para consultar su estado.'
        )
      }
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
              <button
                type="button"
                disabled={busyId !== null || exchange.status !== 'disponible'}
                title={
                  exchange.status !== 'disponible'
                    ? 'Solo se pueden editar publicaciones disponibles'
                    : 'Editar publicación'
                }
                onClick={() => onEdit(exchange)}
              >
                Editar publicación
              </button>
              <strong>{exchange.title}</strong>
              <p>{exchange.description}</p>

              <p className="text-sm text-stone-600">
                Estado: {exchange.status === 'disponible'
                  ? 'Disponible'
                  : exchange.status === 'reservado'
                    ? 'Reservado'
                    : 'Intercambiado'}
              </p>

              {exchange.status === 'reservado' && (
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => handleComplete(exchange.id)}
                  className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {busyId === exchange.id
                    ? 'Finalizando...'
                    : 'Marcar como intercambiado'}
                </button>
              )}
              <button
                type="button"

                onClick={() => handleDelete(exchange.id)}
                disabled={busyId !== null || exchange.status !== 'disponible'}
                title={
                  exchange.status !== 'disponible'
                    ? 'Solo se pueden eliminar publicaciones disponibles'
                    : 'Eliminar publicación'
                }
              >
                {busyId === exchange.id
                  ? 'Procesando...'
                  : 'Eliminar publicaciÃ³n'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
