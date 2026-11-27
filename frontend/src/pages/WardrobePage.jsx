import { useEffect, useState } from 'react'
import ClothingForm from '../components/ClothingForm'
import ClothingList from '../components/ClothingList'
import WardrobeStats from '../components/WardrobeStats'
import { clothingService } from '../services/clothingService'

export default function WardrobePage({ token, onLogout }) {
  const [clothes, setClothes] = useState([])
  const [editingClothing, setEditingClothing] = useState(null)
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

  function handleUpdated(clothing) {
    setClothes((current) =>
      current.map((item) => item.id === clothing.id ? clothing : item)
    )
    setEditingClothing(null)
  }

  function handleEdit(clothing) {
    setEditingClothing(clothing)
  }
  function handleDeleted(clothingId) {
    setClothes((current) => current.filter((item) => item.id !== clothingId))
  }

  return (
    <main className="wardrobe-dashboard">
      <header className="wardrobe-header">
        <div className="wardrobe-brand">
          <span className="wardrobe-brand-symbol">✳</span>
          <div>
            <strong>StyleInPL</strong>
            <small>ARMARIO VIRTUAL · MODA CIRCULAR</small>
          </div>
        </div>

        <button className="wardrobe-logout" type="button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </header>

      <section className="wardrobe-hero">
        <div>
          <span className="wardrobe-eyebrow">TU ESPACIO PERSONAL</span>
          <h1>Tu armario, tu estilo.</h1>
          <p>
            Organiza tus prendas, descubre lo que tienes y dales una nueva
            oportunidad a través del intercambio.
          </p>
        </div>
        <div className="wardrobe-hero-decoration" aria-hidden="true">✳</div>
      </section>

      <div className="wardrobe-summary">
        <WardrobeStats clothes={clothes} />
      </div>

      {loading && <p>Cargando prendas...</p>}
      {error && <p role="alert">{error}</p>}

      <div className="wardrobe-content">
        <section className="wardrobe-form-card">
          <div className="wardrobe-card-heading">
            <span>01</span>
            <div>
              <h2>Añadir nueva prenda</h2>
              <p>Registra una pieza en tu armario digital.</p>
            </div>
          </div>
          <ClothingForm token={token} onCreated={handleCreated} editingClothing={editingClothing} onUpdated={handleUpdated} onCancelEdit={() => setEditingClothing(null)} />
        </section>

        <section className="wardrobe-list-card">
          <div className="wardrobe-card-heading">
            <span>02</span>
            <div>
              <h2>Mi colección</h2>
              <p>Explora y administra todas tus prendas.</p>
            </div>
          </div>

          {!loading && !error && clothes.length === 0 && (
            <div className="wardrobe-empty">
              <span aria-hidden="true">◇</span>
              <h3>Tu colección empieza aquí</h3>
              <p>Agrega tu primera prenda para verla en este espacio.</p>
            </div>
          )}

          {!loading && !error && clothes.length > 0 && (
            <ClothingList
              token={token}
              clothes={clothes}
              onDeleted={handleDeleted}
              onEdit={handleEdit}
            />
          )}
        </section>
      </div>
    </main>
  )
}
