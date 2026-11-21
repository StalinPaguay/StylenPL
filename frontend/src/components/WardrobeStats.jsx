import { useMemo } from 'react'

export default function WardrobeStats({ clothes }) {
  const stats = useMemo(() => {
    const categories = new Set(clothes.map((item) => item.category))
    const colors = new Set(
      clothes.map((item) => item.color?.trim().toLowerCase()).filter(Boolean)
    )

    return [
      { label: 'Total de prendas', value: clothes.length },
      { label: 'Categorías', value: categories.size },
      { label: 'Colores diferentes', value: colors.size },
    ]
  }, [clothes])

  return (
    <section>
      <h2>Resumen de mi armario</h2>

      <div className="exchange-stats">
        {stats.map((stat) => (
          <article className="exchange-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
