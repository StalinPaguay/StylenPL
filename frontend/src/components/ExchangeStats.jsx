export default function ExchangeStats({ exchanges, myExchanges }) {
  const available = exchanges.filter(
    (exchange) => exchange.status === 'disponible'
  ).length

  const stats = [
    { label: 'Publicaciones totales', value: exchanges.length },
    { label: 'Disponibles', value: available },
    { label: 'Mis publicaciones', value: myExchanges.length },
  ]

  return (
    <section>
      <h2>Resumen de intercambios</h2>

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
