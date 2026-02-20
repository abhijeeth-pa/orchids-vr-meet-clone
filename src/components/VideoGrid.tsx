"use client";

import { useEffect, useRef } from "react";
import { Participant } from "@/hooks/useMeeting";
import { Mic, MicOff, VideoOff, Monitor, User } from "lucide-react";

function VideoTile({
  participant,
  isLocal,
  isLarge,
}: {
  participant: Participant;
  isLocal: boolean;
  isLarge?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const initial = participant.name.charAt(0).toUpperCase();

  return (
    <div
      className={`video-tile ${participant.isSpeaking ? "speaking" : ""} ${isLarge ? "h-full" : ""}`}
    >
      {/* Video */}
      {participant.stream && participant.videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className={`w-full h-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#0d0f1a] min-h-[120px]">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              background: participant.avatarColor + "30",
              border: `2px solid ${participant.avatarColor}`,
              boxShadow: `0 0 20px ${participant.avatarColor}40`,
              color: participant.avatarColor,
            }}
          >
            {initial}
          </div>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Name tag */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <span className="text-xs text-white font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {participant.name}
          {isLocal && " (You)"}
        </span>
        {participant.isScreenSharing && (
          <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
            <Monitor className="w-2.5 h-2.5 inline mr-0.5" />
            Sharing
          </span>
        )}
      </div>

      {/* Status icons */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {!participant.audioEnabled && (
          <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
        {!participant.videoEnabled && (
          <div className="w-6 h-6 rounded-full bg-gray-500/80 flex items-center justify-center">
            <VideoOff className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Speaking indicator */}
      {participant.isSpeaking && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/50">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] text-cyan-300">speaking</span>
        </div>
      )}

      {/* Avatar color bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: participant.avatarColor }}
      />
    </div>
  );
}

interface VideoGridProps {
  localParticipant: Participant;
  participants: Participant[];
  screenStream: MediaStream | null;
}

export default function VideoGrid({
  localParticipant,
  participants,
  screenStream,
}: VideoGridProps) {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const allParticipants = [localParticipant, ...participants];

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const hasScreenShare = !!screenStream;
  const count = allParticipants.length;

  let gridClass = "grid gap-2 p-2 h-full";
  if (hasScreenShare) {
    gridClass += " grid-cols-1";
  } else if (count === 1) {
    gridClass += " grid-cols-1";
  } else if (count === 2) {
    gridClass += " grid-cols-2";
  } else if (count <= 4) {
    gridClass += " grid-cols-2 grid-rows-2";
  } else if (count <= 6) {
    gridClass += " grid-cols-3 grid-rows-2";
  } else {
    gridClass += " grid-cols-4";
  }

  if (hasScreenShare) {
    return (
      <div className="h-full flex gap-2 p-2">
        {/* Main screen share */}
        <div className="flex-1 video-tile relative overflow-hidden rounded-xl">
          <video
            ref={screenVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain bg-black"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 backdrop-blur-sm">
            <Monitor className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-300">Screen Share</span>
          </div>
        </div>

        {/* Side panel with participants */}
        <div className="w-48 flex flex-col gap-2 overflow-y-auto">
          {allParticipants.map((p) => (
            <div key={p.id} className="aspect-video flex-shrink-0">
              <VideoTile
                participant={p}
                isLocal={p.id === localParticipant.id}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {allParticipants.map((p) => (
        <VideoTile
          key={p.id}
          participant={p}
          isLocal={p.id === localParticipant.id}
          isLarge={count === 1}
        />
      ))}
    </div>
  );
}
