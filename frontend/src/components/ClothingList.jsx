import { useMemo, useState } from 'react'
import { clothingService } from '../services/clothingService'
import FeedbackMessage from './FeedbackMessage'

export default function ClothingList({ token, clothes, onDeleted }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('todas')
  const [sort, setSort] = useState('nombre')
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const categories = useMemo(
    () => [...new Set(clothes.map((item) => item.category))].sort(),
    [clothes]
  )

  const filteredClothes = useMemo(
    () => [...clothes].filter((item) => {
      const text = `${item.name} ${item.color} ${item.size || ''}`.toLowerCase()
      return text.includes(search.trim().toLowerCase()) &&
        (category === 'todas' || item.category === category)
    }).sort((a, b) => {
      if (sort === 'categoria') return a.category.localeCompare(b.category, 'es')
      if (sort === 'color') return a.color.localeCompare(b.color, 'es')
      return a.name.localeCompare(b.name, 'es')
    }),
    [clothes, search, category, sort]
  )

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

      <FeedbackMessage type="error" message={error} />

      <label htmlFor="clothing-search">Buscar prendas</label>
      <input
        id="clothing-search"
        type="search"
        placeholder="Nombre, color o talla"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <label htmlFor="clothing-category-filter">Categoría</label>
      <select
        id="clothing-category-filter"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option value="todas">Todas las categorías</option>
        {categories.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>

      <label htmlFor="clothing-sort">Ordenar por</label>
      <select
        id="clothing-sort"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
      >
        <option value="nombre">Nombre A-Z</option>
        <option value="categoria">Categoría A-Z</option>
        <option value="color">Color A-Z</option>
      </select>

      <button
        type="button"
        onClick={() => {
          setSearch('')
          setCategory('todas')
          setSort('nombre')
        }}
      >
        Limpiar filtros
      </button>

      <p>{filteredClothes.length} prendas encontradas</p>

      {filteredClothes.length === 0 ? (
        <p>No se encontraron prendas.</p>
      ) : (
        <ul>
          {filteredClothes.map((clothing) => (
            <li key={clothing.id}>
              <strong>{clothing.name}</strong>
              <p>Categoría: {clothing.category}</p>
              <p>Color: {clothing.color}</p>
              {clothing.size && <p>Talla: {clothing.size}</p>}

              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => handleDelete(clothing.id)}
              >
                {deletingId === clothing.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}


