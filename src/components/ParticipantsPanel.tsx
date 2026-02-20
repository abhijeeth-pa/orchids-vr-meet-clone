"use client";

import { motion } from "framer-motion";
import { Participant } from "@/hooks/useMeeting";
import { Mic, MicOff, Video, VideoOff, Users, X } from "lucide-react";

interface ParticipantsPanelProps {
  localParticipant: Participant;
  participants: Participant[];
  onClose: () => void;
}

function ParticipantRow({ participant, isLocal }: { participant: Participant; isLocal: boolean }) {
  const initial = participant.name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 relative"
        style={{
          background: participant.avatarColor + "25",
          border: `2px solid ${participant.avatarColor}60`,
          color: participant.avatarColor,
        }}
      >
        {initial}
        {participant.isSpeaking && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-[#080a14] animate-pulse" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-white truncate">
            {participant.name}
          </span>
          {isLocal && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 flex-shrink-0">
              You
            </span>
          )}
        </div>
        {participant.isSpeaking && (
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "100ms" }} />
            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "200ms" }} />
            <span className="text-[9px] text-cyan-400 ml-0.5">speaking</span>
          </div>
        )}
      </div>

      {/* Status icons */}
      <div className="flex items-center gap-1.5 opacity-60">
        {participant.audioEnabled ? (
          <Mic className="w-3.5 h-3.5 text-white/60" />
        ) : (
          <MicOff className="w-3.5 h-3.5 text-red-400" />
        )}
        {participant.videoEnabled ? (
          <Video className="w-3.5 h-3.5 text-white/60" />
        ) : (
          <VideoOff className="w-3.5 h-3.5 text-white/40" />
        )}
      </div>
    </div>
  );
}

export default function ParticipantsPanel({
  localParticipant,
  participants,
  onClose,
}: ParticipantsPanelProps) {
  const total = 1 + participants.length;

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      className="h-full flex flex-col vr-glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Participants</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
            {total}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Local */}
        <ParticipantRow participant={localParticipant} isLocal={true} />

        {/* Divider if others */}
        {participants.length > 0 && (
          <div className="h-px bg-white/5 mx-2 my-1" />
        )}

        {/* Remote */}
        {participants.map((p) => (
          <ParticipantRow key={p.id} participant={p} isLocal={false} />
        ))}

        {participants.length === 0 && (
          <div className="text-center py-6">
            <p className="text-white/30 text-xs">Share the meeting link to invite others</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-purple-500/20">
        <div className="text-xs text-white/30 text-center">
          {total === 1 ? "You're the only one here" : `${total} people in this meeting`}
        </div>
      </div>
    </motion.div>
  );
}
