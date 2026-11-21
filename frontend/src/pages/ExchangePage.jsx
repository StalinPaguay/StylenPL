import { useEffect, useState } from 'react'
import ExchangeForm from '../components/ExchangeForm'
import ExchangeList from '../components/ExchangeList'
import ExchangeCatalog from '../components/ExchangeCatalog'
import ExchangeStats from '../components/ExchangeStats'
import { clothingService } from '../services/clothingService'
import { exchangeService } from '../services/exchangeService'

export default function ExchangePage({ token, onBack }) {
  const [clothes, setClothes] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [myExchanges, setMyExchanges] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [clothingData, exchangeData, myExchangeData] = await Promise.all([
          clothingService.list(token),
          exchangeService.list(),
          exchangeService.mine(token),
        ])

        if (active) {
          setClothes(clothingData)
          setExchanges(exchangeData)
          setMyExchanges(myExchangeData)
        }
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [token])

  async function handleRefresh() {
    setLoading(true)
    setError('')

    try {
      const [exchangeData, myExchangeData] = await Promise.all([
        exchangeService.list(),
        exchangeService.mine(token),
      ])

      setExchanges(exchangeData)
      setMyExchanges(myExchangeData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCreated(exchange) {
    setExchanges((current) => [exchange, ...current])
    setMyExchanges((current) => [exchange, ...current])
  }

  function handleDeleted(exchangeId) {
    setExchanges((current) =>
      current.filter((exchange) => exchange.id !== exchangeId)
    )
    setMyExchanges((current) =>
      current.filter((exchange) => exchange.id !== exchangeId)
    )
  }

  return (
    <main>
      <h1>StyleInPL</h1>
      <h2>Intercambios</h2>

      <button type="button" onClick={onBack}>
        Volver a mi armario
      </button>

      <button type="button" onClick={handleRefresh} disabled={loading}>
        {loading ? 'Actualizando...' : 'Actualizar intercambios'}
      </button>

      {loading && <p>Cargando intercambios...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <ExchangeStats
            exchanges={exchanges}
            myExchanges={myExchanges}
          />

          <ExchangeForm
            token={token}
            clothes={clothes}
            onCreated={handleCreated}
          />

          <ExchangeList
            token={token}
            exchanges={myExchanges}
            onDeleted={handleDeleted}
          />

          <ExchangeCatalog exchanges={exchanges} />
        </>
      )}
    </main>
  )
}



