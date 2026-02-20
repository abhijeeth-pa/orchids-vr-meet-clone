"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/hooks/useMeeting";
import { Send, MessageCircle, X, Smile } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  myId: string;
  onSend: (content: string) => void;
  onClose: () => void;
}

export default function ChatPanel({
  messages,
  myId,
  onSend,
  onClose,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

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
          <MessageCircle className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Chat</span>
          {messages.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              {messages.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageCircle className="w-8 h-8 text-purple-400/30 mb-2" />
            <p className="text-white/30 text-sm">No messages yet</p>
            <p className="text-white/20 text-xs mt-1">Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === myId;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
            >
              {!isOwn && (
                <span className="text-[10px] text-white/40 mb-1 ml-1">
                  {msg.senderName}
                </span>
              )}
              <div className={`chat-message ${isOwn ? "own" : "other"}`}>
                <p className="text-sm text-white break-words">{msg.content}</p>
              </div>
              <span className="text-[9px] text-white/25 mt-1 mx-1">
                {formatTime(msg.timestamp)}
              </span>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-purple-500/20">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-purple-500/40 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
