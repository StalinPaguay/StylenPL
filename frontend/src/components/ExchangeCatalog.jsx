import { useMemo, useState } from 'react'

export default function ExchangeCatalog({ exchanges }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [sort, setSort] = useState('recientes')

  const filteredExchanges = useMemo(() => {
    const results = exchanges.filter((exchange) => {
      const text = `${exchange.title} ${exchange.description || ''}`.toLowerCase()
      const matchesSearch = text.includes(search.trim().toLowerCase())
      const matchesStatus = status === 'todos' || exchange.status === status

      return matchesSearch && matchesStatus
    })

    return [...results].sort((a, b) => {
      if (sort === 'titulo') {
        return a.title.localeCompare(b.title, 'es')
      }

      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()

      return sort === 'antiguos' ? dateA - dateB : dateB - dateA
    })
  }, [exchanges, search, status, sort])

  return (
    <section>
      <h2>Explorar intercambios</h2>

      <label htmlFor="exchange-search">Buscar publicaciones</label>
      <input
        id="exchange-search"
        type="search"
        placeholder="Buscar por título o descripción"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <label htmlFor="exchange-status">Filtrar por estado</label>
      <select
        id="exchange-status"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="todos">Todos</option>
        <option value="disponible">Disponible</option>
        <option value="reservado">Reservado</option>
        <option value="intercambiado">Intercambiado</option>
      </select>

      <label htmlFor="exchange-sort">Ordenar publicaciones</label>
      <select
        id="exchange-sort"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
      >
        <option value="recientes">Más recientes</option>
        <option value="antiguos">Más antiguos</option>
        <option value="titulo">Título A-Z</option>
      </select>

      <button
        type="button"
        onClick={() => {
          setSearch('')
          setStatus('todos')
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
              <strong>{exchange.title}</strong>
              <p>{exchange.description}</p>
              <small>Estado: {exchange.status}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

