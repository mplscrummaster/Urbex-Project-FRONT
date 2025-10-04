import { ref, onUnmounted } from 'vue'

export const useGeolocation = (
  options = { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
) => {
  const coords = ref({ latitude: null, longitude: null, accuracy: null })
  const error = ref('')
  const locating = ref(false)
  let watchId = null

  const start = () => {
    if (!navigator.geolocation) {
      error.value = 'Géolocalisation non supportée.'
      return
    }
    locating.value = true
    error.value = ''
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        locating.value = false
        error.value = ''
        const { latitude, longitude, accuracy } = pos.coords
        coords.value = { latitude, longitude, accuracy }
      },
      (err) => {
        locating.value = false
        error.value = err?.message || 'Échec localisation'
      },
      options,
    )
  }

  const once = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        error.value = 'Géolocalisation non supportée.'
        return reject(new Error(error.value))
      }
      locating.value = true
      error.value = ''
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          locating.value = false
          const { latitude, longitude, accuracy } = pos.coords
          coords.value = { latitude, longitude, accuracy }
          resolve(coords.value)
        },
        (err) => {
          locating.value = false
          error.value = err?.message || 'Échec géolocalisation'
          reject(err)
        },
        options,
      )
    })
  }

  const stop = () => {
    if (watchId != null && navigator.geolocation) navigator.geolocation.clearWatch(watchId)
    watchId = null
  }

  onUnmounted(stop)

  return { coords, error, locating, start, stop, once }
}
