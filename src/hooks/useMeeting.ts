"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isSpeaking: boolean;
  vrPosition: [number, number, number];
  vrRotation: [number, number, number];
  avatarColor: string;
  isScreenSharing?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

const AVATAR_COLORS = [
  "#7c3aed", "#06b6d4", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#8b5cf6",
];

// Simulate a simple signaling mechanism using BroadcastChannel
// In production this would be a WebSocket server
export function useMeeting(roomId: string, userName: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [myPosition, setMyPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [myRotation, setMyRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  const myIdRef = useRef(uuidv4());
  const myId = myIdRef.current;
  const channelRef = useRef<BroadcastChannel | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const speakingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speakingCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const myColorRef = useRef(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);

  const myParticipant: Participant = {
    id: myId,
    name: userName,
    stream: localStream,
    audioEnabled: isAudioEnabled,
    videoEnabled: isVideoEnabled,
    isSpeaking: false,
    vrPosition: myPosition,
    vrRotation: myRotation,
    avatarColor: myColorRef.current,
    isScreenSharing,
  };

  // Initialize media
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
        setConnectionStatus("connected");
        setIsConnected(true);

        // Set up audio analysis for speaking detection
        try {
          const audioCtx = new AudioContext();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          analyserRef.current = analyser;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          speakingCheckRef.current = setInterval(() => {
            if (!analyserRef.current) return;
            const data = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(data);
            const avg = data.reduce((a, b) => a + b, 0) / data.length;
            // Broadcast speaking state
            channelRef.current?.postMessage({
              type: "speaking",
              senderId: myId,
              isSpeaking: avg > 15,
            });
          }, 200);
        } catch {
          // Audio analysis optional
        }
      } catch (err) {
        console.warn("Media access denied, running in audio-only / demo mode", err);
        setConnectionStatus("connected");
        setIsConnected(true);
      }
    }
    initMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (speakingCheckRef.current) clearInterval(speakingCheckRef.current);
      audioContextRef.current?.close();
    };
  }, [myId]);

  // BroadcastChannel for same-origin tab communication (simulated meeting)
  useEffect(() => {
    const channel = new BroadcastChannel(`vrmeet-${roomId}`);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const msg = event.data;
      if (msg.senderId === myId) return;

      switch (msg.type) {
        case "join": {
          // New participant joined
          setParticipants((prev) => {
            if (prev.find((p) => p.id === msg.senderId)) return prev;
            return [
              ...prev,
              {
                id: msg.senderId,
                name: msg.name,
                stream: null,
                audioEnabled: true,
                videoEnabled: true,
                isSpeaking: false,
                vrPosition: msg.vrPosition || [
                  (Math.random() - 0.5) * 6,
                  0,
                  (Math.random() - 0.5) * 6,
                ],
                vrRotation: [0, 0, 0],
                avatarColor: msg.color || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
              },
            ];
          });
          // Welcome them
          channel.postMessage({
            type: "welcome",
            senderId: myId,
            targetId: msg.senderId,
            name: userName,
            color: myColorRef.current,
            vrPosition: myPosition,
          });
          break;
        }
        case "welcome": {
          if (msg.targetId !== myId) break;
          setParticipants((prev) => {
            if (prev.find((p) => p.id === msg.senderId)) return prev;
            return [
              ...prev,
              {
                id: msg.senderId,
                name: msg.name,
                stream: null,
                audioEnabled: true,
                videoEnabled: true,
                isSpeaking: false,
                vrPosition: msg.vrPosition || [
                  (Math.random() - 0.5) * 6,
                  0,
                  (Math.random() - 0.5) * 6,
                ],
                vrRotation: [0, 0, 0],
                avatarColor: msg.color || AVATAR_COLORS[0],
              },
            ];
          });
          break;
        }
        case "leave": {
          setParticipants((prev) => prev.filter((p) => p.id !== msg.senderId));
          break;
        }
        case "speaking": {
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === msg.senderId ? { ...p, isSpeaking: msg.isSpeaking } : p
            )
          );
          break;
        }
        case "media-state": {
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === msg.senderId
                ? {
                    ...p,
                    audioEnabled: msg.audioEnabled,
                    videoEnabled: msg.videoEnabled,
                    isScreenSharing: msg.isScreenSharing,
                  }
                : p
            )
          );
          break;
        }
        case "vr-position": {
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === msg.senderId
                ? { ...p, vrPosition: msg.position, vrRotation: msg.rotation }
                : p
            )
          );
          break;
        }
        case "chat": {
          setChatMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              senderId: msg.senderId,
              senderName: msg.senderName,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
            },
          ]);
          break;
        }
      }
    };

    // Announce join
    channel.postMessage({
      type: "join",
      senderId: myId,
      name: userName,
      color: myColorRef.current,
      vrPosition: [
        (Math.random() - 0.5) * 6,
        0,
        (Math.random() - 0.5) * 6,
      ],
    });

    return () => {
      channel.postMessage({ type: "leave", senderId: myId });
      channel.close();
    };
  }, [roomId, myId, userName]);

  // Broadcast media state changes
  useEffect(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = isAudioEnabled;
    });
    channelRef.current?.postMessage({
      type: "media-state",
      senderId: myId,
      audioEnabled: isAudioEnabled,
      videoEnabled: isVideoEnabled,
      isScreenSharing,
    });
  }, [isAudioEnabled, isVideoEnabled, isScreenSharing, myId]);

  useEffect(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = isVideoEnabled;
    });
  }, [isVideoEnabled]);

  // Broadcast VR position
  const broadcastPosition = useCallback(
    (pos: [number, number, number], rot: [number, number, number]) => {
      channelRef.current?.postMessage({
        type: "vr-position",
        senderId: myId,
        position: pos,
        rotation: rot,
      });
    },
    [myId]
  );

  const updateVRPosition = useCallback(
    (pos: [number, number, number], rot: [number, number, number]) => {
      setMyPosition(pos);
      setMyRotation(rot);
      broadcastPosition(pos, rot);
    },
    [broadcastPosition]
  );

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled((prev) => !prev);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      screenStream?.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setScreenStream(stream);
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
        };
      } catch {
        // User cancelled
      }
    }
  }, [isScreenSharing, screenStream]);

  const sendChatMessage = useCallback(
    (content: string) => {
      const msg: ChatMessage = {
        id: uuidv4(),
        senderId: myId,
        senderName: userName,
        content,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, msg]);
      channelRef.current?.postMessage({
        type: "chat",
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      });
    },
    [myId, userName]
  );

  const leaveMeeting = useCallback(() => {
    channelRef.current?.postMessage({ type: "leave", senderId: myId });
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStream?.getTracks().forEach((t) => t.stop());
  }, [myId, screenStream]);

  return {
    myId,
    myParticipant,
    localStream,
    screenStream,
    participants,
    chatMessages,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isVRMode,
    setIsVRMode,
    isConnected,
    connectionStatus,
    myPosition,
    myRotation,
    updateVRPosition,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    sendChatMessage,
    leaveMeeting,
  };
}
