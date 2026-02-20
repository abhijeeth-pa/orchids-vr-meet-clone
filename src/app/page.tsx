"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import {
  Video,
  Plus,
  ArrowRight,
  Headset,
  Globe,
  Users,
  Zap,
  Shield,
  Mic,
  MonitorPlay,
  Star,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [name, setName] = useState("");
  const [showJoin, setShowJoin] = useState(false);

  function createMeeting() {
    const id = uuidv4().slice(0, 8);
    const userName = name.trim() || "Guest";
    router.push(`/meet/${id}?name=${encodeURIComponent(userName)}`);
  }

  function joinMeeting() {
    if (!joinCode.trim()) return;
    const userName = name.trim() || "Guest";
    router.push(`/meet/${joinCode.trim()}?name=${encodeURIComponent(userName)}`);
  }

  const features = [
    {
      icon: Headset,
      title: "Full VR Immersion",
      desc: "Step into a 3D virtual conference room with spatial audio and avatar presence.",
      color: "#7c3aed",
    },
    {
      icon: Globe,
      title: "Spatial Audio",
      desc: "Voices sound like they come from your colleagues' 3D avatar positions in the room.",
      color: "#06b6d4",
    },
    {
      icon: Users,
      title: "3D Avatars",
      desc: "Move freely in VR space. Your avatar reflects your head tracking in real-time.",
      color: "#ec4899",
    },
    {
      icon: Zap,
      title: "Ultra-Low Latency",
      desc: "Peer-to-peer WebRTC connections ensure < 100ms latency for crystal-clear calls.",
      color: "#f59e0b",
    },
    {
      icon: Shield,
      title: "End-to-End Encrypted",
      desc: "All video, audio, and VR positional data is encrypted before transmission.",
      color: "#10b981",
    },
    {
      icon: MonitorPlay,
      title: "Screen Sharing in VR",
      desc: "Share your screen as a floating panel inside the VR room for everyone to see.",
      color: "#3b82f6",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080a14] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
            <Headset className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            VRMeet
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Star className="w-3 h-3 text-yellow-400" />
          <span>The Future of Meetings</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/10 border border-purple-600/30 text-purple-300 text-sm mb-8">
            <Headset className="w-4 h-4" />
            <span>Virtual Reality Video Conferencing</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-none">
            <span className="block text-white">Meet in</span>
            <span className="block bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Virtual Reality
            </span>
          </h1>

          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            The next evolution of video conferencing. Walk around, gesture, share screens as floating panels, 
            and experience true spatial presence with colleagues anywhere in the world.
          </p>
        </motion.div>

        {/* Meeting card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="vr-glass rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-sm text-white/40 mb-2">Your name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>

            {showJoin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label className="block text-sm text-white/40 mb-2">Meeting code</label>
                <input
                  type="text"
                  placeholder="e.g. abc-12345"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/60 transition-colors"
                />
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              {!showJoin ? (
                <>
                  <button
                    onClick={createMeeting}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl py-3 font-semibold transition-all hover:shadow-lg hover:shadow-purple-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    New Meeting
                  </button>
                  <button
                    onClick={() => setShowJoin(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-white rounded-xl py-3 font-semibold transition-all"
                  >
                    <Video className="w-4 h-4" />
                    Join Meeting
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={joinMeeting}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl py-3 font-semibold transition-all hover:shadow-lg hover:shadow-cyan-600/30"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Join Room
                  </button>
                  <button
                    onClick={() => { setShowJoin(false); setJoinCode(""); }}
                    className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            <p className="text-center text-xs text-white/20">
              No account needed • Works in browser • VR headset optional
            </p>
          </div>
        </motion.div>

        {/* VR visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="mt-20 relative w-full max-w-3xl mx-auto"
        >
          <div className="relative h-64 rounded-2xl overflow-hidden vr-border">
            {/* Simulated VR room preview */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d0f20] to-[#080a14]">
              {/* Grid floor */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1/2"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(124,58,237,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.15) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                  transform: "perspective(200px) rotateX(40deg)",
                  transformOrigin: "bottom center",
                }}
              />
              {/* Avatars */}
              {[
                { x: "20%", color: "#7c3aed", delay: 0 },
                { x: "40%", color: "#06b6d4", delay: 0.5 },
                { x: "60%", color: "#ec4899", delay: 1 },
                { x: "80%", color: "#f59e0b", delay: 1.5 },
              ].map((av, i) => (
                <motion.div
                  key={i}
                  className="absolute bottom-1/3"
                  style={{ left: av.x }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: av.delay,
                    ease: "easeInOut",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: av.color + "33",
                      border: `2px solid ${av.color}`,
                      boxShadow: `0 0 15px ${av.color}66`,
                    }}
                  >
                    <Users className="w-4 h-4" style={{ color: av.color }} />
                  </div>
                </motion.div>
              ))}
              {/* Screen share panel */}
              <div className="absolute top-4 right-8 w-32 h-20 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <MonitorPlay className="w-6 h-6 text-blue-400" />
              </div>
              {/* Label */}
              <div className="absolute top-4 left-4 text-xs text-purple-400/60 font-mono">
                VR ROOM PREVIEW
              </div>
            </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-purple-600/20 blur-xl rounded-full" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              meet in VR
            </span>
          </h2>
          <p className="text-white/40 text-lg">
            Powered by WebRTC, Three.js, and spatial audio technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-all hover:bg-white/5 group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{
                  background: feat.color + "20",
                  border: `1px solid ${feat.color}40`,
                }}
              >
                <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
              </div>
              <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-8 py-16 text-center">
        <div className="max-w-xl mx-auto vr-glass rounded-3xl p-12">
          <Headset className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">Ready to enter the VR room?</h2>
          <p className="text-white/40 mb-8">Works in any modern browser. No VR headset required.</p>
          <button
            onClick={createMeeting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-purple-600/30"
          >
            <Plus className="w-5 h-5" />
            Start a VR Meeting
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-white/20 text-sm border-t border-white/5">
        <Mic className="w-3 h-3 inline mr-1" />
        VRMeet — Built with WebRTC + Three.js + React Three Fiber
      </footer>
    </div>
  );
}
