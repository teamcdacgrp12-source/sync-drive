import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "../../api/api";
import { userApi } from "../../api/user.api";
import { roomApi } from "../../api/room.api";
import { streamApi } from "../../api/stream.api";
import RoomHeader from "./RoomHeader";
import VideoPlayer from "./VideoPlayer";
import ChatPanel from "./ChatPanel";
import ParticipantList from "./ParticipantList";
import {
  connectSocket,
  disconnectSocket,
  sendMessage,
} from "../../socket/roomSocket";
import { authUtils } from "../auth/auth.utils";
import { useWebRTC } from "../../hooks/useWebRTC";
import { createMp4Stream } from "../../hooks/useMp4Stream";
import HostControls from "./HostControls";
import PlayerControls from "./PlayerControls";
import "./room.css";

const normalizeYoutubeUrl = (input) => {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw) return null;
  let videoId = null;
  try {
    // youtu.be/VIDEO_ID
    const shortMatch = raw.match(/(?:youtu\.be\/)([A-Za-z0-9_-]{11})(?:\?|$)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    } else {
      // youtube.com/watch?v=VIDEO_ID or embed/VIDEO_ID
      const watchMatch = raw.match(/(?:v=|\/embed\/)([A-Za-z0-9_-]{11})/);
      if (watchMatch) videoId = watchMatch[1];
    }
    if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
  } catch (_) {}
  return null;
};

const RoomView = () => {
  const { roomCode: rawRoomCode } = useParams();
  // Ensure case-insensitive matching for the room code
  const roomCode = rawRoomCode?.toUpperCase();
  const navigate = useNavigate();

  // --- Basic State ---
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [profileMap, setProfileMap] = useState({});
  const [user, setUser] = useState(() => authUtils.getUser());

  // --- Room State ---
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState(null);
  const [hostLeft, setHostLeft] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [numericRoomId, setNumericRoomId] = useState(null);

  // --- WebRTC & Media State ---
  const [localStream, setLocalStream] = useState(null);

  // Player state manages the active media content
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    isMp4: false,
    isYoutube: false,
    youtubeUrl: null,
    currentTime: 0,
    duration: 0,
    mediaName: null,
  });

  // Local Audio State
  const [isLocalMuted, setIsLocalMuted] = useState(true);
  const [localVolume, setLocalVolume] = useState(0.5);

  const localStreamRef = useRef(null);
  const isConnected = useRef(false);

  // Refs for managing DOM elements and active streams
  const mp4VideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const fileInputRef = useRef(null);
  const joinSentRef = useRef(false);
  const videoPlayerRef = useRef(null);

  // Custom hook for WebRTC peer connections
  const {
    remoteStreams,
    handleIncomingSignal,
    replaceVideoTrack,
    connectToPeer,
  } = useWebRTC(roomCode, user);

  // Track the host's current timestamp and the last heartbeat time
  const lastHostTimeRef = useRef(0);
  const lastHeartbeatReceivedAt = useRef(Date.now());

  // --- Player Event Handlers ---

  // Handles play actions triggered by the native video player or custom controls
  const handlePlayerPlay = () => {
    // If Host, broadcast the PLAY command
    if (isHost) {
      if (!playerState.isPlaying) {
        setPlayerState((prev) => ({ ...prev, isPlaying: true }));
        sendMessage(roomCode, JSON.stringify({ type: "PLAY" }), "SYNC");
      }
      return;
    }

    // If Participant, snap to the host's current time
    if (playerState.isMp4 && videoPlayerRef.current) {
      videoPlayerRef.current.jumpToLive();
    } else if (playerState.isYoutube && videoPlayerRef.current) {
      const hostTime = lastHostTimeRef.current || 0;
      videoPlayerRef.current.seek(hostTime);
    }
  };

  // Handles pause actions triggered by the native video player or custom controls
  const handlePlayerPause = () => {
    // Only the Host can broadcast a PAUSE command
    if (isHost) {
      if (playerState.isPlaying) {
        setPlayerState((prev) => ({ ...prev, isPlaying: false }));
        sendMessage(roomCode, JSON.stringify({ type: "PAUSE" }), "SYNC");
      }
    }
  };

  // --- Host Heartbeat Loop ---
  // Sends synchronization data to participants every 2 seconds
  useEffect(() => {
    let interval;
    if (isHost && (playerState.isMp4 || playerState.isYoutube)) {
      interval = setInterval(() => {
        let currentTime = 0;

        if (playerState.isYoutube && videoPlayerRef.current) {
          // Ask ReactPlayer for the time
          currentTime = videoPlayerRef.current.getCurrentTime();
        } else if (playerState.isMp4) {
          // Ask local hidden video element for the time
          currentTime = mp4VideoRef.current?.currentTime || 0;
        }

        const payload = {
          type: "HEARTBEAT",
          time: currentTime,
          isMp4: playerState.isMp4,
          isYoutube: playerState.isYoutube,
          youtubeUrl: playerState.youtubeUrl,
          mediaName: playerState.mediaName,
          isPlaying: playerState.isPlaying,
        };
        sendMessage(roomCode, JSON.stringify(payload), "SYNC");
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [
    isHost,
    playerState.isMp4,
    playerState.isYoutube,
    playerState.mediaName,
    playerState.isPlaying,
    playerState.youtubeUrl,
    roomCode,
  ]);

  // --- Stream Selection Logic ---
  const hostProfile = profileMap[hostId];
  const hostUsername = hostProfile?.username;

  // Determine which stream to display in the VideoPlayer
  const activeStream = isHost
    ? localStream
    : (hostUsername && remoteStreams.get(hostUsername)) ||
      // Fallback to first available stream
      (remoteStreams.size > 0 ? remoteStreams.values().next().value : null);

  // --- Playback Control Handlers ---

  const handlePlayPause = () => {
    // YouTube specific handling
    if (playerState.isYoutube && videoPlayerRef.current) {
      const nextPlaying = !playerState.isPlaying;
      if (nextPlaying) {
        videoPlayerRef.current.play();
        setPlayerState((prev) => ({ ...prev, isPlaying: true }));
        sendMessage(roomCode, JSON.stringify({ type: "PLAY" }), "SYNC");
      } else {
        videoPlayerRef.current.pause();
        setPlayerState((prev) => ({ ...prev, isPlaying: false }));
        sendMessage(roomCode, JSON.stringify({ type: "PAUSE" }), "SYNC");
      }
      return;
    }

    // Native Video Element handling
    const video = mp4VideoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));
      sendMessage(roomCode, JSON.stringify({ type: "PLAY" }), "SYNC");
    } else {
      video.pause();
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      sendMessage(roomCode, JSON.stringify({ type: "PAUSE" }), "SYNC");
    }
  };

  const handleStop = () => {
    if (playerState.isYoutube && videoPlayerRef.current) {
      videoPlayerRef.current.pause();
      setPlayerState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
      return;
    }
    const video = mp4VideoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      setPlayerState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }
  };

  const handleSeek = (time) => {
    if (playerState.isYoutube && videoPlayerRef.current) {
      videoPlayerRef.current.seek(time);
      setPlayerState((prev) => ({ ...prev, currentTime: time }));
      sendMessage(roomCode, JSON.stringify({ type: "SEEK", time }), "SYNC");
    } else {
      const video = mp4VideoRef.current;
      if (video) {
        video.currentTime = time;
        setPlayerState((prev) => ({ ...prev, currentTime: time }));
      }
    }
  };

  const handleSkipForward = () => {
    if (playerState.isYoutube && videoPlayerRef.current) {
      const newTime = Math.min(
        (playerState.currentTime || 0) + 10,
        playerState.duration || Infinity
      );
      videoPlayerRef.current.seek(newTime);
      setPlayerState((prev) => ({ ...prev, currentTime: newTime }));
      sendMessage(roomCode, JSON.stringify({ type: "SEEK", time: newTime }), "SYNC");
    } else {
      const video = mp4VideoRef.current;
      if (video)
        video.currentTime = Math.min(video.currentTime + 10, video.duration);
    }
  };

  const handleSkipBack = () => {
    if (playerState.isYoutube && videoPlayerRef.current) {
      const newTime = Math.max((playerState.currentTime || 0) - 10, 0);
      videoPlayerRef.current.seek(newTime);
      setPlayerState((prev) => ({ ...prev, currentTime: newTime }));
      sendMessage(roomCode, JSON.stringify({ type: "SEEK", time: newTime }), "SYNC");
    } else {
      const video = mp4VideoRef.current;
      if (video) video.currentTime = Math.max(video.currentTime - 10, 0);
    }
  };

  const handleGoToStart = () => {
    if (playerState.isYoutube && videoPlayerRef.current) {
      videoPlayerRef.current.seek(0);
      setPlayerState((prev) => ({ ...prev, currentTime: 0 }));
      sendMessage(roomCode, JSON.stringify({ type: "SEEK", time: 0 }), "SYNC");
    } else {
      const video = mp4VideoRef.current;
      if (video) video.currentTime = 0;
    }
  };

  const handleGoToEnd = () => {
    if (playerState.isYoutube && videoPlayerRef.current) {
      const dur = playerState.duration || 0;
      videoPlayerRef.current.seek(dur);
      setPlayerState((prev) => ({ ...prev, currentTime: dur }));
      sendMessage(roomCode, JSON.stringify({ type: "SEEK", time: dur }), "SYNC");
    } else {
      const video = mp4VideoRef.current;
      if (video) video.currentTime = video.duration;
    }
  };

  // --- Host Specific Functions ---

  const handleStartMp4 = async (file) => {
    if (!isHost || !file) return;

    // Immediately kill the previous video to stop ghost time updates
    if (mp4VideoRef.current) {
      mp4VideoRef.current.pause();
      mp4VideoRef.current.ontimeupdate = null;
      mp4VideoRef.current.onended = null;
      mp4VideoRef.current = null;
    }

    // Clear input so onchange triggers if the same file is selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const { video, stream } = await createMp4Stream(file);
      mp4VideoRef.current = video;

      // Bind video events to update local state
      video.ontimeupdate = () => {
        setPlayerState((prev) => ({ ...prev, currentTime: video.currentTime }));
      };

      video.onloadedmetadata = () => {
        setPlayerState((prev) => ({ ...prev, duration: video.duration }));
      };

      video.onended = () =>
        setPlayerState((prev) => ({ ...prev, isPlaying: false }));

      // Set the stream as local stream for WebRTC broadcasting
      setLocalStream(stream);
      localStreamRef.current = stream;
      replaceVideoTrack(stream);

      await video.play();
      setPlayerState({
        isPlaying: true,
        isMp4: true,
        isYoutube: false,
        currentTime: 0,
        duration: video.duration || 0,
        mediaName: file.name,
      });

      // Broadcast LOAD and PLAY commands
      sendMessage(
        roomCode,
        JSON.stringify({ type: "LOAD", filename: file.name }),
        "SYNC"
      );

      setTimeout(() => {
        sendMessage(roomCode, JSON.stringify({ type: "PLAY" }), "SYNC");
      }, 500);

      // Register stream with backend
      await streamApi.startStream({
        roomId: numericRoomId,
        userId: user.id,
        type: "MP4",
        source: file.name,
      });

      // Connect to existing participants if necessary
      const currentProfiles = { ...profileMap };
      const missingIds = participants.filter((pId) => !currentProfiles[pId]);

      if (missingIds.length > 0) {
        try {
          const fetchedProfiles = await userApi.getUsersBatch(
            missingIds.map(Number)
          );
          fetchedProfiles.forEach((p) => {
            currentProfiles[p.userId] = p;
          });
          setProfileMap((prev) => ({ ...prev, ...currentProfiles }));
        } catch (e) {
          // console.error("Profile fetch failed:", e);
        }
      }

      if (participants && participants.length > 0) {
        participants.forEach((pId) => {
          const pidNum = Number(pId);
          const myId = Number(user.id);
          const pProfile = currentProfiles[pId];

          if (pidNum !== myId && pProfile?.username) {
            connectToPeer(pProfile.username, stream);
          }
        });
      }
    } catch (e) {
      // console.error("MP4 Error", e);
    }
  };

  const handleStartScreen = async () => {
    if (!isHost) return;
    try {
      let stream = null;

      // Retry logic for Entire Screen Sharing
      try {
        // Attempt 1: Try to get video AND audio
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      } catch (err) {
        // console.warn("Could not get display audio, trying video only...", err);
        // Attempt 2: Fallback to video only
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
      }

      screenStreamRef.current = stream;

      // Set local state
      setLocalStream(stream);
      localStreamRef.current = stream;
      replaceVideoTrack(stream);

      // Force player to wake up
      setPlayerState({
        isPlaying: true,
        isMp4: false,
        isYoutube: false,
        youtubeUrl: null,
        currentTime: 0,
        duration: 0,
        mediaName: "Host Screen",
      });

      // Handle stream stop (user clicks Stop Sharing chrome floating bar)
      stream.getVideoTracks()[0].onended = handleStopScreen;

      // Register with API
      await streamApi.startStream({
        roomId: numericRoomId,
        userId: user.id,
        type: "SCREEN",
        source: "Screen",
      });

      // Force connection to all participants
      if (participants && participants.length > 0) {
        participants.forEach((pId) => {
          const pidNum = Number(pId);
          const myId = Number(user.id);
          const pProfile = profileMap[pId];

          if (pidNum !== myId && pProfile?.username) {
            // console.log(`📡 Offering Screen Share to ${pProfile.username}...`);
            connectToPeer(pProfile.username, stream);
          }
        });
      }

      // Broadcast Signal to Participants
      sendMessage(roomCode, JSON.stringify({ type: "SCREEN_SHARE" }), "SYNC");
    } catch (e) {
      // console.error("Screen Share Error", e);
      alert("Failed to start screen share. Please check browser permissions.");
    }
  };

  const handleStartYoutube = async (url) => {
    if (!isHost || !url) return;

    const normalizedUrl = normalizeYoutubeUrl(url);
    if (!normalizedUrl) {
      // console.warn("Invalid YouTube URL:", url);
      return;
    }

    // Cleanup active streams
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (mp4VideoRef.current) {
      mp4VideoRef.current.pause();
      mp4VideoRef.current = null;
    }

    // Clear local stream tracks
    setLocalStream(null);
    localStreamRef.current = null;
    replaceVideoTrack(null);

    // Stop backend stream if active
    try {
      if (numericRoomId) {
        await streamApi.stopStream({
          roomId: numericRoomId,
          userId: user.id,
        });
      }
    } catch (e) {
      // console.warn("Stop stream API failed (ignoring):", e);
    }

    // Update State
    setPlayerState({
      isPlaying: true,
      isMp4: false,
      isYoutube: true,
      currentTime: 0,
      duration: 0,
      mediaName: "YouTube Video",
      youtubeUrl: normalizedUrl,
    });

    // Broadcast Load Command
    sendMessage(
      roomCode,
      JSON.stringify({ type: "LOAD_YOUTUBE", url: normalizedUrl }),
      "SYNC"
    );
  };

  const handleStopScreen = async () => {
    if (!isHost) return;

    const hasActiveStream = !!screenStreamRef.current || !!mp4VideoRef.current;

    // Stop tracks for any active streams
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (mp4VideoRef.current) {
      mp4VideoRef.current.pause();
      mp4VideoRef.current = null;
    }

    setPlayerState((prev) => ({
      ...prev,
      isPlaying: false,
      isMp4: false,
      isYoutube: false,
      youtubeUrl: null,
    }));

    sendMessage(roomCode, JSON.stringify({ type: "STOP" }), "SYNC");

    // Clear local stream
    setLocalStream(null);
    localStreamRef.current = null;
    replaceVideoTrack(null);

    if (hasActiveStream) {
      try {
        await streamApi.stopStream({ roomId: numericRoomId, userId: user.id });
      } catch (e) {
        // console.warn("Stop stream API failed (ignoring):", e);
      }
    }
  };

  // --- Effects ---

  // Handle User Auth State
  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(authUtils.getUser());
    };
    window.addEventListener("user-updated", handleUserUpdate);

    const handleBeforeUnload = (e) => {
      if (isHost && (playerState.isMp4 || playerState.isYoutube)) {
        e.preventDefault();
        e.returnValue =
          "You are hosting a stream. Leaving will stop playback. Are you sure?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("user-updated", handleUserUpdate);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isHost, playerState.isMp4, playerState.isYoutube]);

  const handleLogout = () => {
    authUtils.clearAuth();
    setUser(null);
    navigate("/login");
  };

  // Sync Profiles for all participants to map IDs to Usernames
  useEffect(() => {
    const syncProfiles = async () => {
      const uniqueIds = new Set(participants.map((id) => Number(id)));
      if (hostId) uniqueIds.add(Number(hostId));

      if (uniqueIds.size === 0) return;

      try {
        const userIds = Array.from(uniqueIds);
        const profiles = await userApi.getUsersBatch(userIds);
        const newMap = {};
        profiles.forEach((p) => {
          newMap[p.userId] = p;
        });
        setProfileMap((prev) => ({ ...prev, ...newMap }));
      } catch (err) {
        // console.error("Profile sync failed", err);
      }
    };
    syncProfiles();
  }, [participants, hostId]);

  // Handle Host Leaving
  useEffect(() => {
    let timer;
    if (hostLeft && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (hostLeft && countdown === 0) {
      navigate("/rooms");
    }
    return () => clearInterval(timer);
  }, [hostLeft, countdown, navigate]);

  // Watchdog: Monitor heartbeat from host to detect disconnects
  useEffect(() => {
    if (isHost) return;

    const checkInterval = setInterval(() => {
      if (playerState.isYoutube || playerState.isMp4) {
        const timeSinceLastHeartbeat =
          Date.now() - lastHeartbeatReceivedAt.current;

        if (timeSinceLastHeartbeat > 10000) {
          // console.warn(`⚠️ Host Heartbeat lost...`);

          setPlayerState((prev) => {
            if (!prev.isYoutube && !prev.isMp4) return prev;
            return {
              ...prev,
              isPlaying: false,
              isMp4: false,
              isYoutube: false,
              youtubeUrl: null,
              mediaName: null,
            };
          });
          lastHeartbeatReceivedAt.current = Date.now();
        }
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [isHost, playerState.isYoutube, playerState.isMp4]);

  // Initial Room Setup (Join, History, Check Host, Socket)
  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Main initialization function acts as a gatekeeper
    const initRoom = async () => {
      try {
        // Attempt to join the room via API first
        await roomApi.joinRoom(roomCode);
        // console.log("Joined room successfully");

        // If successful, proceed to connect socket and load data
        establishConnection();
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message?.toLowerCase() || "";

        // Allow access if the user is already a member
        if (status === 409 || message.includes("already joined")) {
          // console.log("User already in room, proceeding...");
          establishConnection();
        } else {
          // Reject access for real errors
          // console.error("Access denied:", message);
          alert(`Cannot join room: ${message || "Access denied"}`);
          navigate("/rooms");
        }
      }
    };

    // Only called if API authorization passes
    const establishConnection = () => {
      // 1. Load Chat History
      const loadHistory = async () => {
        try {
          const response = await api.get(`/chat/history/${roomCode}`);
          if (Array.isArray(response.data)) setMessages(response.data);
        } catch (err) {
          // console.error("History failed", err);
        }
      };
      loadHistory();

      // 2. Check Host Status
      const checkHostStatus = async (retryCount = 0) => {
        try {
          const details = await roomApi.getRoomDetails(roomCode);
          setHostId(details.hostUserId);
          setNumericRoomId(details.roomId);
          if (user && details.hostUserId == user.id) {
            setIsHost(true);
          }
        } catch (error) {
          if (retryCount < 2)
            setTimeout(() => checkHostStatus(retryCount + 1), 1000);
        }
      };
      checkHostStatus();

      // 3. Connect Socket
      if (!isConnected.current) {
        isConnected.current = true;
        connectSocket(
          roomCode,
          (msg) => {
            if (msg.type === "HOST_LEFT") {
              setHostLeft(true);
            } else if (String(msg.type).toUpperCase() === "SYNC") {
              try {
                const action = JSON.parse(msg.content);
                lastHeartbeatReceivedAt.current = Date.now();

                // Synchronization Logic
                if (action.type === "PAUSE") {
                  videoPlayerRef.current?.pause();
                  setPlayerState((prev) => ({ ...prev, isPlaying: false }));
                } else if (action.type === "PLAY") {
                  videoPlayerRef.current?.play();
                  setPlayerState((prev) => ({ ...prev, isPlaying: true }));
                } else if (action.type === "LOAD") {
                  setPlayerState((prev) => ({
                    ...prev,
                    isMp4: true,
                    isYoutube: false,
                    mediaName: action.filename,
                    isPlaying: false,
                  }));
                } else if (action.type === "SCREEN_SHARE") {
                  setPlayerState((prev) => ({
                    ...prev,
                    isMp4: false,
                    isYoutube: false,
                    youtubeUrl: null,
                    isPlaying: true,
                    mediaName: "Host Screen",
                  }));
                } else if (action.type === "LOAD_YOUTUBE") {
                  const url = normalizeYoutubeUrl(action.url) || action.url;
                  if (url) {
                    setPlayerState((prev) => ({
                      ...prev,
                      isMp4: false,
                      isYoutube: true,
                      youtubeUrl: url,
                      mediaName: "YouTube Video",
                      isPlaying: true,
                    }));
                  }
                } else if (action.type === "STOP") {
                  setPlayerState((prev) => ({
                    ...prev,
                    isMp4: false,
                    isYoutube: false,
                    youtubeUrl: null,
                    mediaName: null,
                    isPlaying: false,
                  }));
                } else if (action.type === "SEEK") {
                  if (!isHost && videoPlayerRef.current) {
                    videoPlayerRef.current.seek(action.time);
                  }
                } else if (action.type === "HEARTBEAT") {
                  lastHostTimeRef.current = action.time;
                  lastHeartbeatReceivedAt.current = Date.now();

                  setPlayerState((prev) => {
                    let newState = { ...prev };
                    let hasChanged = false;

                    // Enforce Host State
                    if (!isHost && action.isYoutube && action.youtubeUrl) {
                      const normalizedUrl =
                        normalizeYoutubeUrl(action.youtubeUrl) ||
                        action.youtubeUrl;

                      if (
                        !prev.isYoutube ||
                        prev.youtubeUrl !== normalizedUrl
                      ) {
                        newState.isYoutube = true;
                        newState.isMp4 = false;
                        newState.youtubeUrl = normalizedUrl;
                        newState.mediaName =
                          action.mediaName || "YouTube Video";
                        hasChanged = true;
                      }
                    } else if (!isHost && action.isMp4) {
                      if (!prev.isMp4 || prev.mediaName !== action.mediaName) {
                        newState.isMp4 = true;
                        newState.isYoutube = false;
                        newState.mediaName = action.mediaName;
                        hasChanged = true;
                      }
                    }

                    if (
                      action.isPlaying !== undefined &&
                      action.isPlaying !== prev.isPlaying
                    ) {
                      newState.isPlaying = action.isPlaying;
                      hasChanged = true;
                    }

                    return hasChanged ? newState : prev;
                  });
                }
              } catch (e) {
                // console.error("Failed to parse SYNC payload", e);
              }
            } else if (msg.type === "CHAT") {
              setMessages((prev) => {
                const isDuplicate = prev.some(
                  (m) =>
                    (m.id && m.id === msg.id) ||
                    (m.sender === msg.sender &&
                      m.content === msg.content &&
                      Math.abs(
                        new Date(m.timestamp).getTime() -
                          new Date(msg.timestamp).getTime()
                      ) < 1000)
                );

                if (isDuplicate) return prev;
                return [...prev, msg];
              });
            }
          },
          (users) => {
            setParticipants(users);
          },
          (signal) => handleIncomingSignal(signal, localStreamRef.current)
        );

        if (!joinSentRef.current) {
          joinSentRef.current = true;
          setTimeout(() => {
            import("../../socket/roomSocket").then(({ sendSignal }) => {
              sendSignal(roomCode, "join", {});
            });
          }, 1500);
        }
      }
    };

    // Execute the initialization flow
    initRoom();

    return () => {
      isConnected.current = false;
      disconnectSocket();
    };
  }, [roomCode, navigate]);

  if (!user) return null;

  return (
    <div className="room-wrapper" style={styles.wrapper}>
      <RoomHeader
        roomId={roomCode}
        user={user}
        onLogout={handleLogout}
        isHost={isHost}
        disableProfileLink={true}
      />

      <div className="room-container">
        {hostLeft && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/90 text-center backdrop-blur-md">
            <div className="flex flex-col items-center">
              <Lock className="mb-5 size-16 text-destructive" />
              <h2 className="text-xl font-bold">Room Closed</h2>
              <p className="mt-2 text-muted-foreground">
                The host has left the room.
              </p>
              <div className="my-5 text-6xl font-extrabold text-destructive">
                {countdown}
              </div>
              <Button variant="secondary" onClick={() => navigate("/rooms")}>
                <Undo2 className="size-4" />
                Return to Lobby
              </Button>
            </div>
          </div>
        )}

        <div className="main-content">
          <div
            className="video-section"
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              backgroundColor: "black",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <VideoPlayer
              key={
                playerState.isYoutube
                  ? `youtube-${playerState.youtubeUrl}`
                  : activeStream
                    ? activeStream.id
                    : "no-stream"
              }
              ref={videoPlayerRef}
              roomCode={roomCode}
              stream={
                playerState.isYoutube ||
                (!playerState.isMp4 && !playerState.isPlaying)
                  ? null
                  : activeStream
              }
              onProgress={(time) => {
                if (isHost) {
                  setPlayerState((prev) => ({
                    ...prev,
                    currentTime: time,
                  }));
                }
              }}
              onDuration={(dur) => {
                setPlayerState((prev) => ({ ...prev, duration: dur }));
              }}
              isHost={isHost}
              mediaName={playerState.mediaName}
              isMp4={playerState.isMp4}
              isYoutube={playerState.isYoutube}
              youtubeUrl={playerState.youtubeUrl}
              isPlaying={playerState.isPlaying}
              onPlay={handlePlayerPlay}
              onPause={handlePlayerPause}
              muted={isLocalMuted}
              volume={localVolume}
            />

            {/* Unified Controls Container */}
            <div
              className="host-controls-wrapper"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "auto",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "0 20px 20px 20px",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                gap: "10px",
                zIndex: 50,
              }}
            >
              {/* Host Control Panel */}
              {isHost && (
                <div style={{ width: "100%", maxWidth: "700px" }}>
                  <HostControls
                    onStartMp4={handleStartMp4}
                    onStartScreen={handleStartScreen}
                    onStopScreen={handleStopScreen}
                    onStartYoutube={handleStartYoutube}
                    fileInputRef={fileInputRef}
                  />
                </div>
              )}

              {/* Player Controls */}
              {(playerState.isMp4 || playerState.isYoutube) && (
                <div style={{ width: "100%", maxWidth: "700px" }}>
                  <PlayerControls
                    isPlaying={playerState.isPlaying}
                    currentTime={playerState.currentTime}
                    duration={playerState.duration}
                    isHost={isHost}
                    onPlayPause={isHost ? handlePlayPause : () => {}}
                    onStop={handleStop}
                    onSeek={handleSeek}
                    onSkipForward={handleSkipForward}
                    onSkipBack={handleSkipBack}
                    onGoToStart={handleGoToStart}
                    onGoToEnd={handleGoToEnd}
                    isMuted={isLocalMuted}
                    volume={localVolume}
                    onToggleMute={() => setIsLocalMuted((prev) => !prev)}
                    onVolumeChange={(val) => {
                      setLocalVolume(val);
                      if (val > 0) setIsLocalMuted(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="participants-section">
            <ParticipantList
              participants={participants}
              profileMap={profileMap}
            />
          </div>
          <div className="chat-section">
            <ChatPanel
              messages={messages}
              roomCode={roomCode}
              profileMap={profileMap}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0f172a",
  },
};

export default RoomView;
