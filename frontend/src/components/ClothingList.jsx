import { useState } from 'react'
import { clothingService } from '../services/clothingService'

export default function ClothingList({ token, clothes, onDeleted }) {
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  async function handleDelete(clothingId) {
    if (!window.confirm('¿Deseas eliminar esta prenda?')) return

    setError('')
    setDeletingId(clothingId)

    try {
      await clothingService.remove(token, clothingId)
      onDeleted(clothingId)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section>
      <h2>Mis prendas</h2>

      {error && <p role="alert">{error}</p>}

      <ul>
        {clothes.map((clothing) => (
          <li key={clothing.id}>
            <strong>{clothing.name}</strong>
            {' — '}
            {clothing.category}
            {' — '}
            {clothing.color}

            <button
              type="button"
              disabled={deletingId === clothing.id}
              onClick={() => handleDelete(clothing.id)}
            >
              {deletingId === clothing.id ? 'Eliminando...' : 'Eliminar'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
