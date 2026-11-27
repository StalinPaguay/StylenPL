import { useMemo, useState } from 'react'
import ExchangeRequestForm from './ExchangeRequestForm'

function getExchangeStatusLabel(status) {
  const labels = {
    disponible: 'Disponible',
    reservado: 'Reservado',
    intercambiado: 'Intercambiado',
    cancelado: 'Cancelado',
  }

  return labels[status] || status || 'Sin estado'
}
export default function ExchangeCatalog({ exchanges,
  token,
  myExchanges = [],
  onRequestCreated, onRequestStart, onRefresh, sentRequests = [] }) {
  const [selectedExchangeId, setSelectedExchangeId] = useState(null)
  const ownExchangeIds = new Set(myExchanges.map((item) => item.id))
  const pendingExchangeIds = new Set(
    sentRequests
      .filter((request) => request.status === 'pendiente')
      .map((request) => request.exchange_id)
  )
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recientes')

  const filteredExchanges = useMemo(() => {
    const results = exchanges.filter((exchange) => {
      const text = `${exchange.title} ${exchange.description || ''}`.toLowerCase()
      const matchesSearch = text.includes(search.trim().toLowerCase())

      return matchesSearch
    })

    return [...results].sort((a, b) => {
      if (sort === 'titulo') {
        return a.title.localeCompare(b.title, 'es')
      }

      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()

      return sort === 'antiguos' ? dateA - dateB : dateB - dateA
    })
  }, [exchanges, search, sort])

  return (
    <section>
      <h2>Explorar intercambios</h2>

      <label htmlFor="exchange-search">Buscar publicaciones</label>
      <input
        id="exchange-search"
        type="search"
        placeholder="Buscar por tÃ­tulo o descripciÃ³n"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <label htmlFor="exchange-sort">Ordenar publicaciones</label>
      <select
        id="exchange-sort"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
      >
        <option value="recientes">MÃ¡s recientes</option>
        <option value="antiguos">MÃ¡s antiguos</option>
        <option value="titulo">TÃ­tulo A-Z</option>
      </select>

      <button
        type="button"
        onClick={() => {
          setSearch('')
          setSort('recientes')
        }}
      >
        Limpiar filtros
      </button>

      <p>{filteredExchanges.length} publicaciones encontradas</p>

      {filteredExchanges.length === 0 ? (
        <p>No se encontraron intercambios.</p>
      ) : (
        <ul>
          {filteredExchanges.map((exchange) => (
            <li key={exchange.id}>
              <strong>{exchange.title}
<span
  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
    exchange.status === 'reservado'
      ? 'bg-amber-100 text-amber-800'
      : exchange.status === 'disponible'
        ? 'bg-emerald-100 text-emerald-800'
        : 'bg-stone-200 text-stone-700'
  }`}
>
  {getExchangeStatusLabel(exchange.status)}
</span></strong>
              <p>{exchange.description}</p>
              <small>Estado: {exchange.status}</small>

              {pendingExchangeIds.has(exchange.id) && (
                <p className="exchange-request-pending" role="status">
                  Solicitud pendiente de respuesta
                </p>
              )}

              {!ownExchangeIds.has(exchange.id) && token && !pendingExchangeIds.has(exchange.id) && exchange.status === 'disponible' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedExchangeId !== exchange.id) {
                        onRequestStart?.()
                      }
                      setSelectedExchangeId((current) =>
                        current === exchange.id ? null : exchange.id
                      )
                    }}
                  >
                    {selectedExchangeId === exchange.id
                      ? 'Cerrar solicitud'
                      : 'Solicitar intercambio'}
                  </button>

                  {selectedExchangeId === exchange.id && (
                    <ExchangeRequestForm
                      token={token}
                      exchange={exchange}
                      onCreated={(request) => {
                        onRequestCreated?.(request)
                        setSelectedExchangeId(null)
                      }}
                      onUnavailable={() => {
                        Promise.resolve(onRefresh?.()).catch(() => {
                          // ExchangePage ya muestra el error de actualización.
                        })
                      }}
                    />
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
