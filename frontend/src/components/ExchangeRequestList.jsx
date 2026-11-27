import { useState } from 'react'
import FeedbackMessage from './FeedbackMessage'
import { exchangeRequestService } from '../services/exchangeRequestService'

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
}

export default function ExchangeRequestList({
  token,
  sentRequests = [],
  receivedRequests = [],
  exchanges = [],
  onUpdated,
  onRefresh,
  refreshing = false,
}) {
  const [statusFilter, setStatusFilter] = useState('todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('recientes')
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleAction(request, action) {
    const actionLabels = {
      aceptada: 'aceptar',
      rechazada: 'rechazar',
      cancelada: 'cancelar',
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas ${actionLabels[action]} esta solicitud?`
    )

    if (!confirmed) return

    setBusyId(request.id)
    setError('')
    setSuccess('')

    try {
      const updated = action === 'cancelada'
        ? await exchangeRequestService.cancel(token, request.id)
        : await exchangeRequestService.updateStatus(token, request.id, action)

      await onUpdated(updated)
      const successMessages = {
        aceptada: 'Solicitud aceptada. La publicación ha sido reservada.',
        rechazada: 'Solicitud rechazada correctamente.',
        cancelada: 'Solicitud cancelada correctamente.',
      }

      setSuccess(successMessages[action] || 'Solicitud actualizada correctamente.')
    } catch (err) {
      setError(
        err.message +
          ' Si la solicitud ya fue procesada, utiliza "Actualizar solicitudes" para consultar su estado.'
      )
    } finally {
      setBusyId(null)
    }
  }

  const allRequests = [...sentRequests, ...receivedRequests]

  const requestSummary = {
    pendientes: allRequests.filter(
      (request) => request.status === 'pendiente'
    ).length,
    aceptadas: allRequests.filter(
      (request) => request.status === 'aceptada'
    ).length,
    rechazadas: allRequests.filter(
      (request) => request.status === 'rechazada'
    ).length,
    canceladas: allRequests.filter(
      (request) => request.status === 'cancelada'
    ).length,
  }
  const pendingSent = sentRequests.filter(
    (request) => request.status === 'pendiente'
  ).length

  const pendingReceived = receivedRequests.filter(
    (request) => request.status === 'pendiente'
  ).length

  function getEmptyMessage(requests) {
    if (requests.length === 0) {
      return 'Todavía no tienes solicitudes en esta sección.'
    }

    if (searchQuery.trim()) {
      return 'No se encontraron solicitudes que coincidan con tu búsqueda y filtros.'
    }

    if (statusFilter !== 'todas') {
      return 'No hay solicitudes con el estado seleccionado.'
    }

    return 'No hay solicitudes para mostrar.'
  }
  function filterRequests(requests) {
    const query = searchQuery.trim().toLocaleLowerCase('es')

    requests = requests.filter((request) => {
      if (!query) return true

      const publication = exchanges.find(
        (exchange) => exchange.id === request.exchange_id
      )

      const searchableText = [
        request.exchange_title,
        publication?.title,
        request.message,
        request.status,
        request.id,
        request.exchange_id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es')

      return searchableText.includes(query)
    })

    const filtered = statusFilter === 'todas'
      ? requests
      : requests.filter((request) => request.status === statusFilter)

    return [...filtered].sort((a, b) => {
      const difference =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

      return sortOrder === 'recientes' ? difference : -difference
    })
  }

  function renderRequest(request, received) {
    return (
      <li key={request.id} className="exchange-request-item">
        <p>
          <strong>Publicación:</strong>{' '}
          {request.exchange_title || exchanges.find((exchange) => exchange.id === request.exchange_id)?.title
            || `Publicación ${request.exchange_id.slice(-6)}`}
        </p>
        <p><strong>Mensaje:</strong> {request.message || 'Sin mensaje'}</p>
        <p><strong>Estado:</strong> {STATUS_LABELS[request.status] || request.status}</p>

        {request.status === 'rechazada' &&
          request.exchange_status === null && (
            <p className="mt-2 text-sm text-stone-600">
              La publicación asociada ya no está disponible.
            </p>
          )}

        {request.status === 'aceptada' &&
          (request.exchange_status === 'intercambiado' ||
            exchanges.some(
              (exchange) =>
                exchange.id === request.exchange_id &&
                exchange.status === 'intercambiado'
            )) && (
            <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
              Intercambio completado
            </p>
          )}
        <p>
          <strong>Fecha:</strong>{' '}
          {new Date(request.created_at).toLocaleString('es-EC', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>

        {request.status === 'pendiente' && (
          <div className="exchange-request-actions">
            {received ? (
              <>
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => handleAction(request, 'aceptada')}
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => handleAction(request, 'rechazada')}
                >
                  Rechazar
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => handleAction(request, 'cancelada')}
              >
                Cancelar solicitud
              </button>
            )}
          </div>
        )}
      </li>
    )
  }

  return (
    <section className="exchange-requests-panel">
      <h2>Mis solicitudes de intercambio</h2>

      <button
        type="button"
        className="exchange-refresh-button"
        onClick={onRefresh}
        disabled={busyId !== null || refreshing}
        aria-busy={refreshing}
      >
        {refreshing ? 'Actualizando solicitudes...' : 'Actualizar solicitudes'}
      </button>

      <label htmlFor="exchange-request-filter">
        Filtrar solicitudes por estado
      </label>
      <select
        id="exchange-request-filter"
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
      >
        <option value="todas">Todas</option>
        <option value="pendiente">Pendientes</option>
        <option value="aceptada">Aceptadas</option>
        <option value="rechazada">Rechazadas</option>
        <option value="cancelada">Canceladas</option>
      </select>

      <label htmlFor="exchange-request-sort">
        Ordenar solicitudes
      </label>
      <select
        id="exchange-request-sort"
        value={sortOrder}
        onChange={(event) => setSortOrder(event.target.value)}
      >
        <option value="recientes">Más recientes primero</option>
        <option value="antiguas">Más antiguas primero</option>
      </select>
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        aria-label="Resumen de solicitudes de intercambio"
      >
        {[
          { label: 'Pendientes', count: requestSummary.pendientes },
          { label: 'Aceptadas', count: requestSummary.aceptadas },
          { label: 'Rechazadas', count: requestSummary.rechazadas },
          { label: 'Canceladas', count: requestSummary.canceladas },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-stone-200 bg-stone-50 p-4"
          >
            <p className="text-sm text-stone-600">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {item.count}
            </p>
          </div>
        ))}
      </div>
      {(statusFilter !== 'todas' || sortOrder !== 'recientes' || searchQuery.trim() !== '') && (
        <button
          type="button"
          onClick={() => {
            setStatusFilter('todas')
            setSortOrder('recientes')
            setSearchQuery('')
          }}
          className="self-start rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
        >
          Limpiar filtros
        </button>
      )}
      <label htmlFor="exchange-request-search">
        Buscar solicitudes
      </label>
      <input
        id="exchange-request-search"
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Buscar por publicación o mensaje..."
        className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900"
      />
      <FeedbackMessage type="error" message={error} />
      <FeedbackMessage type="success" message={success} />

      <p
        className="text-sm text-stone-600"
        role="status"
        aria-live="polite"
      >
        Mostrando {filterRequests(receivedRequests).length} solicitudes recibidas
        y {filterRequests(sentRequests).length} solicitudes enviadas.
      </p>
      <div className="exchange-management-grid">
        <div className="exchange-panel">
          <h3>Solicitudes recibidas ({receivedRequests.length}) · Pendientes: {pendingReceived}</h3>
          {receivedRequests.length === 0 ? (
            <p>{getEmptyMessage(receivedRequests)}</p>
          ) : filterRequests(receivedRequests).length === 0 ? (
            <p>{getEmptyMessage(receivedRequests)}</p>
          ) : (
            <ul>
              {filterRequests(receivedRequests).map((request) => renderRequest(request, true))}
            </ul>
          )}
        </div>

        <div className="exchange-panel">
          <h3>Solicitudes enviadas ({sentRequests.length}) · Pendientes: {pendingSent}</h3>
          {sentRequests.length === 0 ? (
            <p>{getEmptyMessage(sentRequests)}</p>
          ) : filterRequests(sentRequests).length === 0 ? (
            <p>{getEmptyMessage(sentRequests)}</p>
          ) : (
            <ul>
              {filterRequests(sentRequests).map((request) => renderRequest(request, false))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
