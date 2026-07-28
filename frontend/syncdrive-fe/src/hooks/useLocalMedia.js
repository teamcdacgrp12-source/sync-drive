
export const getLocalMedia = async (video = true, audio = true) => {
  const constraints = {
    video: video
      ? {
          width: { ideal: 640 },
          height: { ideal: 360 },
          facingMode: 'user',
        }
      : false,
    audio: audio
      ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      : false,
  }

  return navigator.mediaDevices.getUserMedia(constraints)
}
