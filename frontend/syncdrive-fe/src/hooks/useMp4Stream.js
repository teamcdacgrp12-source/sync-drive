
export const createMp4Stream = (file) => {
  const videoElement = document.createElement('video')
  videoElement.src = URL.createObjectURL(file)
  videoElement.crossOrigin = 'anonymous'
  videoElement.muted = true
  videoElement.playsInline = true
  videoElement.preload = 'auto'

  return new Promise((resolve, reject) => {
    videoElement.onloadedmetadata = () => {
      if (typeof videoElement.captureStream === 'function') {
        const stream = videoElement.captureStream()
        resolve({ video: videoElement, stream })
        return
      }

      reject(new Error('Captured streams are not supported in this browser'))
    }

    videoElement.onerror = () => reject(new Error('The selected file could not be decoded'))
  })
}
