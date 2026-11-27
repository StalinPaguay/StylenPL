import { useEffect, useState } from 'react'
import ExchangeForm from '../components/ExchangeForm'
import ExchangeList from '../components/ExchangeList'
import ExchangeCatalog from '../components/ExchangeCatalog'
import ExchangeStats from '../components/ExchangeStats'
import { clothingService } from '../services/clothingService'
import { exchangeService } from '../services/exchangeService'
import { exchangeRequestService } from '../services/exchangeRequestService'
import ExchangeRequestList from '../components/ExchangeRequestList'

export default function ExchangePage({ token, onBack }) {
  const [clothes, setClothes] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [myExchanges, setMyExchanges] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [refreshingRequests, setRefreshingRequests] = useState(false)
  const [receivedRequests, setReceivedRequests] = useState([])
  const [editingExchange, setEditingExchange] = useState(null)
  const [error, setError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [clothingData, exchangeData, myExchangeData, sentData, receivedData] = await Promise.all([
          clothingService.list(token),
          exchangeService.list(),
          exchangeService.mine(token),
          exchangeRequestService.sent(token),
          exchangeRequestService.received(token),
        ])

        if (active) {
          setClothes(clothingData)
          setExchanges(exchangeData)
          setMyExchanges(myExchangeData)
          setSentRequests(sentData)
          setReceivedRequests(receivedData)
        }
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()
    return () => { active = false }
  }, [token])

  async function handleRefresh() {
    setLoading(true)
    setError('')
    setRequestSuccess('')
    try {
      const [exchangeData, myExchangeData] = await Promise.all([
        exchangeService.list(),
        exchangeService.mine(token),
      ])
      setExchanges(exchangeData)
      setMyExchanges(myExchangeData)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(exchange) {
    setEditingExchange(exchange)

    requestAnimationFrame(() => {
      document.getElementById('exchange-editor')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  function handleCreated(exchange) {
    if (exchange.status === 'disponible') {
      setExchanges((current) => [exchange, ...current])
    }
    setMyExchanges((current) => [exchange, ...current])
  }

  async function handleUpdated(updatedExchange) {
    setMyExchanges((current) =>
      current.map((exchange) =>
        exchange.id === updatedExchange.id ? updatedExchange : exchange
      )
    )
    setExchanges((current) => {
      const remaining = current.filter(
        (exchange) => exchange.id !== updatedExchange.id
      )
      return updatedExchange.status === 'disponible'
        ? [updatedExchange, ...remaining]
        : remaining
    })

    if (updatedExchange.status === 'intercambiado') {
      await handleRefreshRequests()
    }
  }

  async function handleRequestUpdated(updatedRequest) {
    setSentRequests((current) =>
      current.map((request) =>
        request.id === updatedRequest.id ? updatedRequest : request
      )
    )

    setReceivedRequests((current) =>
      current.map((request) =>
        request.id === updatedRequest.id ? updatedRequest : request
      )
    )

    if (updatedRequest.status === 'aceptada') {
      await handleRefresh()

      const [sentData, receivedData] = await Promise.all([
        exchangeRequestService.sent(token),
        exchangeRequestService.received(token),
      ])

      setSentRequests(sentData)
      setReceivedRequests(receivedData)
    }
  }

  async function handleRefreshRequests() {
    setError('')
    setRequestSuccess('')
    setRefreshingRequests(true)

    try {
      const [sentData, receivedData, exchangeData, myExchangeData] = await Promise.all([
        exchangeRequestService.sent(token),
        exchangeRequestService.received(token),
        exchangeService.list(),
        exchangeService.mine(token),
      ])

      setSentRequests(sentData)
      setReceivedRequests(receivedData)
      setExchanges(exchangeData)
      setMyExchanges(myExchangeData)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setRefreshingRequests(false)
    }
  }
  function handleRequestCreated(request) {
    setSentRequests((current) => [request, ...current])
    setRequestSuccess(
      'Solicitud enviada correctamente. Puedes consultar su estado en tus solicitudes enviadas.'
    )
  }

  async function handleDeleted(exchangeId) {
    setExchanges((current) =>
      current.filter((exchange) => exchange.id !== exchangeId)
    )
    setMyExchanges((current) =>
      current.filter((exchange) => exchange.id !== exchangeId)
    )

    const refreshed = await handleRefreshRequests()

    if (!refreshed) {
      throw new Error(
        'La publicación fue eliminada, pero no se pudo actualizar el historial. Actualiza las solicitudes para consultar su estado.'
      )
    }
  }

  return (
    <main className="exchange-dashboard">
      <header className="exchange-dashboard-header">
        <div className="wardrobe-brand">
          <span className="wardrobe-brand-symbol">✳</span>
          <div>
            <strong>StyleInPL</strong>
            <small>ARMARIO VIRTUAL · MODA CIRCULAR</small>
          </div>
        </div>
        <button type="button" className="exchange-back" onClick={onBack}>
          ← Volver a mi armario
        </button>
      </header>

      <section className="exchange-hero">
        <div>
          <span className="wardrobe-eyebrow">COMUNIDAD STYLEINPL</span>
          <h1>Renueva tu estilo. Intercambia.</h1>
          <p>
            Dale una segunda vida a tus prendas y descubre nuevas
            posibilidades para tu armario.
          </p>
        </div>
        <span className="exchange-hero-icon" aria-hidden="true">↔</span>
      </section>

      <div className="exchange-toolbar">
        <div>
          <h2>Panel de intercambios</h2>
          <p>Publica, administra y explora prendas disponibles.</p>
        </div>
        <button type="button" onClick={handleRefresh} disabled={loading}>
          {loading ? 'Actualizando...' : '↻ Actualizar catálogo'}
        </button>
      </div>

      {loading && <p>Cargando intercambios...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <div className="exchange-summary">
            <ExchangeStats
              exchanges={exchanges}
              myExchanges={myExchanges}
            />
          </div>

          <div className="exchange-management-grid">
            <section className="exchange-panel" id="exchange-editor">
              <div className="exchange-panel-heading">
                <span>01</span>
                <div>
                  <h2>Publicar una prenda</h2>
                  <p>Comparte una prenda de tu armario.</p>
                </div>
              </div>
              <ExchangeForm
                token={token}
                clothes={clothes}
                myExchanges={myExchanges}
                onCreated={handleCreated}
                onUpdated={handleUpdated}
                editingExchange={editingExchange}
                onCancelEdit={() => setEditingExchange(null)}
              />
            </section>

            <section className="exchange-panel" id="exchange-editor">
              <div className="exchange-panel-heading">
                <span>02</span>
                <div>
                  <h2>Mis publicaciones</h2>
                  <p>Gestiona los estados de tus intercambios.</p>
                </div>
              </div>
              <ExchangeList
                token={token}
                exchanges={myExchanges}
                onDeleted={handleDeleted}
                onUpdated={handleUpdated}
                onEdit={handleEdit}
              />
            </section>
          </div>

          <ExchangeRequestList
            refreshing={refreshingRequests}
            onRefresh={handleRefreshRequests}
            exchanges={[...exchanges, ...myExchanges]}
            token={token}
            sentRequests={sentRequests}
            receivedRequests={receivedRequests}
            onUpdated={handleRequestUpdated}
          />

          <section className="exchange-catalog-panel">
            <div className="exchange-panel-heading">
              <span>03</span>
              <div>
                <h2>Explorar el catálogo</h2>
                <p>Encuentra prendas disponibles en la comunidad.</p>
              </div>
            </div>
            {requestSuccess && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{requestSuccess}</span>
                  <button
                    type="button"
                    onClick={() => setRequestSuccess('')}
                    aria-label="Cerrar confirmación"
                    className="shrink-0 rounded-lg px-2 py-1 font-semibold hover:bg-emerald-100"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
            <ExchangeCatalog
              sentRequests={sentRequests}
              exchanges={exchanges}
              token={token}
              myExchanges={myExchanges}
              onRequestCreated={handleRequestCreated}
              onRequestStart={() => setRequestSuccess('')}
            onRefresh={handleRefresh}
            />
          </section>
        </>
      )}
    </main>
  )
}
