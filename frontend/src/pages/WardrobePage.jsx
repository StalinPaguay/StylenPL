import { useEffect, useState } from 'react'
import ClothingForm from '../components/ClothingForm'
import ClothingList from '../components/ClothingList'
import WardrobeStats from '../components/WardrobeStats'
import { clothingService } from '../services/clothingService'

export default function WardrobePage({ token, onLogout }) {
  const [clothes, setClothes] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadClothes() {
      try {
        const data = await clothingService.list(token)
        if (active) setClothes(data)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadClothes()

    return () => {
      active = false
    }
  }, [token])

  function handleCreated(clothing) {
    setClothes((current) => [clothing, ...current])
  }

  function handleDeleted(clothingId) {
    setClothes((current) => current.filter((item) => item.id !== clothingId))
  }

  return (
    <main>
      <h1>StyleInPL</h1>
      <h2>Mi armario digital</h2>
      <p className="wardrobe-counter">
        Prendas registradas: <strong>{clothes.length}</strong>
      </p>

      {loading && <p>Cargando prendas...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && clothes.length === 0 && (
        <p>Tu armario está vacío. Agrega tu primera prenda.</p>
      )}

      {!loading && !error && clothes.length > 0 && (
        <ClothingList token={token} clothes={clothes} onDeleted={handleDeleted} />
      )}

      {!loading && !error && <WardrobeStats clothes={clothes} />}

      <ClothingForm token={token} onCreated={handleCreated} />

      <button type="button" onClick={onLogout}>
        Cerrar sesión
      </button>
    </main>
  )
}


