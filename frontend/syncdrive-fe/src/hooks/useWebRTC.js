import { useCallback, useRef, useState } from 'react'
import { sendSignal } from '../socket/roomSocket'

const ICE_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
}

export const useWebRTC = (roomId, user) => {
  const peersRef = useRef(new Map())
  const [remoteStreams, setRemoteStreams] = useState(new Map())

  // Create a fresh peer connection for each remote participant and attach the local stream.
  const createPeerConnection = useCallback((targetUserId, localStream) => {
    const peer = new RTCPeerConnection(ICE_CONFIG)

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        const sender = peer.addTrack(track, localStream)
        if (track.kind === 'video') {
          const params = sender.getParameters()
          if (!params.encodings) params.encodings = [{}]
          params.encodings[0].maxBitrate = 1_500_000
          sender.setParameters(params).catch(() => undefined)
        }
      })
    }

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(roomId, 'candidate', { candidate: event.candidate, target: targetUserId })
      }
    }

    peer.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const next = new Map(prev)
        next.set(targetUserId, event.streams[0])
        return next
      })
    }

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed' || peer.connectionState === 'closed') {
        setRemoteStreams((prev) => {
          const next = new Map(prev)
          next.delete(targetUserId)
          return next
        })
        peersRef.current.delete(targetUserId)
      }
    }

    peersRef.current.set(targetUserId, peer)
    return peer
  }, [roomId])

  // Route incoming signaling data into the correct WebRTC handshake step.
  const handleIncomingSignal = useCallback(async (signal, localStream) => {
    if (!user?.username) return

    const { type, sender, payload } = signal
    if (sender === user.username) return

    let parsedPayload = payload
    if (typeof parsedPayload === 'string') {
      try {
        parsedPayload = JSON.parse(parsedPayload)
      } catch {
        return
      }
    }

    if (parsedPayload?.target && parsedPayload.target !== user.username) return

    let peer = peersRef.current.get(sender)

    try {
      if (type === 'offer') {
        if (peer) {
          peer.close()
          peersRef.current.delete(sender)
          peer = null
        }

        peer = createPeerConnection(sender, localStream)
        await peer.setRemoteDescription(new RTCSessionDescription(parsedPayload.sdp || parsedPayload))
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        sendSignal(roomId, 'answer', { sdp: answer, target: sender })
      } else if (type === 'answer' && peer) {
        if (peer.signalingState !== 'have-local-offer') return
        await peer.setRemoteDescription(new RTCSessionDescription(parsedPayload.sdp || parsedPayload))
      } else if (type === 'candidate' && peer) {
        if (parsedPayload?.candidate) {
          await peer.addIceCandidate(new RTCIceCandidate(parsedPayload.candidate))
        }
      } else if (type === 'join') {
        if (localStream) {
          if (peer) {
            peer.close()
            peersRef.current.delete(sender)
          }

          const freshPeer = createPeerConnection(sender, localStream)
          const offer = await freshPeer.createOffer()
          await freshPeer.setLocalDescription(offer)
          sendSignal(roomId, 'offer', { sdp: offer, target: sender })
        }
      }
    } catch (error) {
      if (error?.name !== 'InvalidStateError') {
        console.warn('WebRTC signal handling failed', error)
      }
    }
  }, [createPeerConnection, roomId, user?.username])

  
  const replaceVideoTrack = useCallback((newStream) => {
    peersRef.current.forEach((peer) => {
      const sender = peer.getSenders().find((entry) => entry.track?.kind === 'video')
      if (!sender) return

      if (newStream) {
        const nextTrack = newStream.getVideoTracks()[0]
        if (nextTrack) sender.replaceTrack(nextTrack).catch(() => undefined)
      } else {
        sender.replaceTrack(null).catch(() => undefined)
      }
    })
  }, [])

  // Make a direct connection to a specific peer when a stream starts for a room.
  const connectToPeer = useCallback(async (targetUserId, stream) => {
    if (!stream) return

    if (peersRef.current.has(targetUserId)) {
      peersRef.current.get(targetUserId).close()
      peersRef.current.delete(targetUserId)
    }

    const peer = createPeerConnection(targetUserId, stream)
    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)
    sendSignal(roomId, 'offer', { sdp: offer, target: targetUserId })
  }, [createPeerConnection, roomId])

  return {
    remoteStreams,
    handleIncomingSignal,
    replaceVideoTrack,
    connectToPeer,
  }
}
