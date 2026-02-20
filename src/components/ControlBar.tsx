"use client";

import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  Headset,
  PhoneOff,
  MessageCircle,
  Users,
  MoreHorizontal,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

interface ControlBarProps {
  roomId: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isVRMode: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreen: () => void;
  onToggleVR: () => void;
  onLeave: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  participantCount: number;
  unreadCount: number;
}

export default function ControlBar({
  roomId,
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isVRMode,
  onToggleAudio,
  onToggleVideo,
  onToggleScreen,
  onToggleVR,
  onLeave,
  onToggleChat,
  onToggleParticipants,
  isChatOpen,
  isParticipantsOpen,
  participantCount,
  unreadCount,
}: ControlBarProps) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 30 }}
      className="flex items-center justify-between px-6 py-3"
    >
      {/* Meeting info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/50 font-mono">{roomId}</span>
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/80 text-xs transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy link</span>
            </>
          )}
        </button>
      </div>

      {/* Center controls */}
      <div className="flex items-center gap-2">
        {/* Audio */}
        <button
          onClick={onToggleAudio}
          className={`control-btn ${!isAudioEnabled ? "danger" : ""}`}
          title={isAudioEnabled ? "Mute" : "Unmute"}
        >
          {isAudioEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </button>

        {/* Video */}
        <button
          onClick={onToggleVideo}
          className={`control-btn ${!isVideoEnabled ? "danger" : ""}`}
          title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {isVideoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </button>

        {/* Screen Share */}
        <button
          onClick={onToggleScreen}
          className={`control-btn ${isScreenSharing ? "active" : ""}`}
          title={isScreenSharing ? "Stop sharing" : "Share screen"}
        >
          {isScreenSharing ? (
            <MonitorOff className="w-5 h-5" />
          ) : (
            <MonitorUp className="w-5 h-5" />
          )}
        </button>

        {/* VR Mode toggle */}
        <button
          onClick={onToggleVR}
          className={`control-btn ${isVRMode ? "vr-active" : ""} w-auto px-4 gap-2`}
          title={isVRMode ? "Exit VR Mode" : "Enter VR Mode"}
          style={{ borderRadius: "24px", width: "auto", minWidth: "100px" }}
        >
          <Headset className="w-5 h-5" />
          <span className="text-xs font-semibold">
            {isVRMode ? "Exit VR" : "VR Mode"}
          </span>
        </button>

        {/* Leave */}
        <button
          onClick={onLeave}
          className="control-btn danger w-auto px-4 gap-2"
          style={{ borderRadius: "24px", width: "auto", minWidth: "80px" }}
          title="Leave meeting"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-xs font-semibold">Leave</span>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Participants */}
        <button
          onClick={onToggleParticipants}
          className={`control-btn ${isParticipantsOpen ? "active" : ""} relative`}
          title="Participants"
        >
          <Users className="w-5 h-5" />
          {participantCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-[9px] text-white flex items-center justify-center font-bold">
              {participantCount}
            </span>
          )}
        </button>

        {/* Chat */}
        <button
          onClick={onToggleChat}
          className={`control-btn ${isChatOpen ? "active" : ""} relative`}
          title="Chat"
        >
          <MessageCircle className="w-5 h-5" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[9px] text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
