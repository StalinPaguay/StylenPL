export default function FeedbackMessage({ type = 'info', message }) {
  if (!message) return null

  const styles = {
    success: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #86efac',
    },
    error: {
      background: '#fef2f2',
      color: '#b91c1c',
      border: '1px solid #fca5a5',
    },
    info: {
      background: '#eff6ff',
      color: '#1d4ed8',
      border: '1px solid #93c5fd',
    },
  }

  return (
    <p
      role={type === 'error' ? 'alert' : 'status'}
      style={{
        padding: '12px',
        borderRadius: '10px',
        margin: '12px 0',
        ...styles[type],
      }}
    >
      {message}
    </p>
  )
}
