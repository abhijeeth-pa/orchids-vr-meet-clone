"use client";

import { use, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useMeeting } from "@/hooks/useMeeting";
import VideoGrid from "@/components/VideoGrid";
import ChatPanel from "@/components/ChatPanel";
import ParticipantsPanel from "@/components/ParticipantsPanel";
import ControlBar from "@/components/ControlBar";
import { Loader2, Headset, Wifi, WifiOff } from "lucide-react";

// Dynamically import VRSpace to avoid SSR issues with Three.js
const VRSpace = dynamic(() => import("@/components/VRSpace"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#040610]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-white/40 text-sm">Loading VR environment...</p>
      </div>
    </div>
  ),
});

export default function MeetingRoom({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = searchParams.get("name") || "Guest";

  const {
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
    updateVRPosition,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    sendChatMessage,
    leaveMeeting,
  } = useMeeting(roomId, userName);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastReadCount = useRef(0);

  // Track unread messages
  useEffect(() => {
    if (!isChatOpen) {
      setUnreadCount(chatMessages.length - lastReadCount.current);
    } else {
      lastReadCount.current = chatMessages.length;
      setUnreadCount(0);
    }
  }, [chatMessages, isChatOpen]);

  function handleLeave() {
    leaveMeeting();
    router.push("/");
  }

  function toggleChat() {
    setIsChatOpen((prev) => {
      if (!prev) {
        lastReadCount.current = chatMessages.length;
        setUnreadCount(0);
        setIsParticipantsOpen(false);
      }
      return !prev;
    });
  }

  function toggleParticipants() {
    setIsParticipantsOpen((prev) => {
      if (!prev) setIsChatOpen(false);
      return !prev;
    });
  }

  const sidebarOpen = isChatOpen || isParticipantsOpen;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#080a14] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
            <Headset className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            VRMeet
          </span>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-xs text-white/30 font-mono">{roomId}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* VR indicator */}
          {isVRMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-600/40 text-xs text-purple-300"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              VR ACTIVE
            </motion.div>
          )}

          {/* Connection status */}
          <div className="flex items-center gap-1.5 text-xs">
            {connectionStatus === "connected" ? (
              <>
                <Wifi className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Connected</span>
              </>
            ) : connectionStatus === "connecting" ? (
              <>
                <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
                <span className="text-yellow-400">Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-400" />
                <span className="text-red-400">Disconnected</span>
              </>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => setIsVRMode(false)}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${
                !isVRMode
                  ? "bg-purple-600 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setIsVRMode(true)}
              className={`px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
                isVRMode
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <Headset className="w-3 h-3" />
              VR Space
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Video / VR area */}
        <div className="flex-1 relative min-w-0">
          <AnimatePresence mode="wait">
            {isVRMode ? (
              <motion.div
                key="vr"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <VRSpace
                  participants={participants}
                  localParticipant={myParticipant}
                  screenStream={screenStream}
                  onPositionChange={updateVRPosition}
                />
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <VideoGrid
                  localParticipant={myParticipant}
                  participants={participants}
                  screenStream={screenStream}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="flex-shrink-0 overflow-hidden border-l border-white/5"
            >
              <div className="w-80 h-full p-2">
                <AnimatePresence mode="wait">
                  {isChatOpen && (
                    <ChatPanel
                      key="chat"
                      messages={chatMessages}
                      myId={myId}
                      onSend={sendChatMessage}
                      onClose={() => setIsChatOpen(false)}
                    />
                  )}
                  {isParticipantsOpen && (
                    <ParticipantsPanel
                      key="participants"
                      localParticipant={myParticipant}
                      participants={participants}
                      onClose={() => setIsParticipantsOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control bar */}
      <div className="flex-shrink-0 border-t border-white/5 bg-[#080a14]/95 backdrop-blur-sm">
        <ControlBar
          roomId={roomId}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          isVRMode={isVRMode}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreen={toggleScreenShare}
          onToggleVR={() => setIsVRMode((v) => !v)}
          onLeave={handleLeave}
          onToggleChat={toggleChat}
          onToggleParticipants={toggleParticipants}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
          participantCount={participants.length}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  );
}
