import { useEffect, useState } from 'react'
import { profileService } from '../services/profileService'
import FeedbackMessage from '../components/FeedbackMessage'

export default function ProfilePage({ token, onPasswordChanged }) {
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const data = await profileService.get(token)

        if (!active) return

        setProfile(data)
        setName(data.name)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()

  return () => {
      active = false
    }
  }, [token])

  async function handlePasswordChange(event) {
    event.preventDefault()

    if (changingPassword) return

    setError('')
    setSuccess('')

    if (newPassword.length < 8 || newPassword.length > 128) {
      setError('La nueva contraseña debe tener entre 8 y 128 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y su confirmación no coinciden.')
      return
    }

    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente de la actual.')
      return
    }

    setChangingPassword(true)

    try {
      await profileService.changePassword(
        token,
        currentPassword,
        newPassword
      )

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onPasswordChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (saving) return

    setError('')
    setSuccess('')

    const cleanName = name.trim()

    if (cleanName.length < 2 || cleanName.length > 100) {
      setError('El nombre debe tener entre 2 y 100 caracteres.')
      return
    }

    setSaving(true)

    try {
      const updated = await profileService.update(token, cleanName)

      setProfile(updated)
      setName(updated.name)
      setSuccess('Tu perfil se actualizó correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Mi perfil</h1>
      <p className="mb-6 text-gray-600">
        Consulta los datos de tu cuenta y actualiza tu nombre.
      </p>

      <FeedbackMessage type="error" message={error} />
      <FeedbackMessage type="success" message={success} />

      {loading ? (
        <p role="status">Cargando perfil...</p>
      ) : profile ? (
        <section className="rounded-lg border p-6">
          <form onSubmit={handleSubmit}>
            <label className="mb-2 block font-medium" htmlFor="profile-name">
              Nombre
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setSuccess('')
              }}
              minLength={2}
              maxLength={100}
              required
              disabled={saving}
              className="mb-5 w-full rounded border px-3 py-2"
            />

            <label className="mb-2 block font-medium" htmlFor="profile-email">
              Correo electrónico
            </label>

            <input
              id="profile-email"
              type="email"
              value={profile.email}
              readOnly
              className="mb-2 w-full rounded border bg-gray-100 px-3 py-2"
            />

            <p className="mb-6 text-sm text-gray-500">
              El correo electrónico no se puede modificar desde esta sección.
            </p>

            <button
              type="submit"
              disabled={saving || name.trim() === profile.name}
              className="rounded bg-black px-5 py-2 text-white disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </section>
      ) : (
        <p>No se pudo cargar la información de tu perfil.</p>
      )}

      {profile && !loading && (
        <section className="mt-8 rounded-lg border p-6">
          <h2 className="mb-2 text-xl font-semibold">
            Cambiar contraseña
          </h2>
          <p className="mb-5 text-sm text-gray-600">
            Introduce tu contraseña actual para establecer una nueva.
          </p>

          <form onSubmit={handlePasswordChange}>
            <label
              htmlFor="current-password"
              className="mb-2 block font-medium"
            >
              Contraseña actual
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              disabled={changingPassword}
              className="mb-5 w-full rounded border px-3 py-2"
            />

            <label
              htmlFor="new-password"
              className="mb-2 block font-medium"
            >
              Nueva contraseña
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              maxLength={128}
              required
              disabled={changingPassword}
              className="mb-5 w-full rounded border px-3 py-2"
            />

            <label
              htmlFor="confirm-password"
              className="mb-2 block font-medium"
            >
              Confirmar nueva contraseña
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              maxLength={128}
              required
              disabled={changingPassword}
              className="mb-6 w-full rounded border px-3 py-2"
            />

            <button
              type="submit"
              disabled={
                changingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="rounded bg-black px-5 py-2 text-white disabled:opacity-50"
            >
              {changingPassword
                ? 'Actualizando contraseña...'
                : 'Cambiar contraseña'}
            </button>
          </form>
        </section>
      )}
    </main>
  )
}
