import React, { useState, useRef } from 'react';
import { ChatMessage, VoiceNote } from '../types/game';
import { X, Mic, Send, Play, Square, Radio, MessageSquare, Volume2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface VoiceNoteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (content: string, channel: 'world' | 'guild') => void;
  onSendVoiceNote: (voiceNote: VoiceNote, channel: 'world' | 'guild') => void;
  playerName: string;
}

export const VoiceNoteChatModal: React.FC<VoiceNoteChatModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onSendVoiceNote,
  playerName,
}) => {
  const [activeChannel, setActiveChannel] = useState<'world' | 'guild'>('world');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const quickTactics = [
    '⚔️ Awas monster malam datang!',
    '🏠 Ayo kumpul di rumah berlindung!',
    '💎 Saya menemukan bijih emas & kristal!',
    '🌾 Ada panen gandum siap diambil di kebun!',
    '👑 Bantu serang Boss Golem Purba!',
  ];

  // Start Voice Recording
  const handleStartRecording = async () => {
    try {
      sound.playVoiceChirp();
      setIsRecording(true);
      setRecordTimer(0);
      audioChunksRef.current = [];

      recordIntervalRef.current = window.setInterval(() => {
        setRecordTimer((t) => t + 1);
      }, 1000);

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
      }
    } catch {
      // Fallback to simulated voice note if user declines mic or device is restricted
      // Will still produce procedural voice waves & playback!
    }
  };

  // Stop & Send Voice Note
  const handleStopRecording = () => {
    setIsRecording(false);
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }

    const duration = Math.max(1, recordTimer);
    const waveHeights = Array.from({ length: 12 }, () => Math.random() * 0.8 + 0.2);

    const voiceNote: VoiceNote = {
      id: `vn_${Date.now()}`,
      sender: playerName,
      duration,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waveHeights,
      textSnippet: `[Pesan Suara Walkie-Talkie ${duration}s]`,
    };

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          voiceNote.audioDataUri = reader.result as string;
          onSendVoiceNote(voiceNote, activeChannel);
        };
        reader.readAsDataURL(audioBlob);
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    } else {
      onSendVoiceNote(voiceNote, activeChannel);
    }

    sound.playVoiceChirp();
  };

  // Play voice note
  const handlePlayVoiceNote = (vn: VoiceNote) => {
    setPlayingVoiceId(vn.id);
    sound.playVoiceChirp();

    if (vn.audioDataUri) {
      const audio = new Audio(vn.audioDataUri);
      audio.play();
      audio.onended = () => setPlayingVoiceId(null);
    } else {
      // Procedural radio walkie-talkie chirp
      sound.playTone(400, 600, 'sawtooth', 0.2, 0.1);
      setTimeout(() => {
        sound.playTone(600, 300, 'triangle', vn.duration * 0.4, 0.08);
      }, 200);
      setTimeout(() => setPlayingVoiceId(null), vn.duration * 1000);
    }
  };

  const handleSendText = () => {
    if (textInput.trim()) {
      onSendMessage(textInput.trim(), activeChannel);
      setTextInput('');
      sound.playTone(600, 750, 'sine', 0.06);
    }
  };

  const filteredMessages = messages.filter((m) => m.channel === activeChannel);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[85vh] max-h-[600px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-slate-100 text-sm">Radio Walkie-Talkie & Voice Note</h2>
          </div>
          <button
            onClick={() => {
              sound.playTone(300, 150, 'sine', 0.08);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Switch */}
        <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveChannel('world')}
            className={`py-2 flex items-center justify-center gap-1.5 font-medium transition-colors ${
              activeChannel === 'world'
                ? 'border-b-2 border-blue-400 text-blue-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Saluran Dunia (Global)</span>
          </button>
          <button
            onClick={() => setActiveChannel('guild')}
            className={`py-2 flex items-center justify-center gap-1.5 font-medium transition-colors ${
              activeChannel === 'guild'
                ? 'border-b-2 border-indigo-400 text-indigo-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Saluran Guild Kamu</span>
          </button>
        </div>

        {/* Chat Feed */}
        <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-2.5 bg-slate-950/30">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              Belum ada pesan di saluran ini. Mulai bicara lewat Voice Note atau kirim pesan taktis!
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl border max-w-[85%] text-xs flex flex-col gap-1 ${
                  msg.sender === playerName
                    ? 'ml-auto bg-blue-950/50 border-blue-800/80 text-blue-100'
                    : 'mr-auto bg-slate-800/80 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400">
                  <strong className={msg.sender === playerName ? 'text-blue-300' : 'text-amber-300'}>
                    {msg.sender}
                  </strong>
                  <span>{msg.timestamp}</span>
                </div>

                {msg.voiceNote ? (
                  /* Voice Note Bubble with waveform */
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handlePlayVoiceNote(msg.voiceNote!)}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 active:scale-95 shadow"
                    >
                      {playingVoiceId === msg.voiceNote.id ? (
                        <Volume2 className="w-4 h-4 animate-pulse text-amber-300" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 flex items-center gap-0.5 h-6 px-1 bg-slate-950/60 rounded-lg">
                      {msg.voiceNote.waveHeights.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-blue-400 rounded-full transition-all"
                          style={{
                            height: `${Math.max(4, h * 20)}px`,
                            opacity: playingVoiceId === msg.voiceNote?.id ? 1 : 0.6,
                          }}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-mono text-slate-300">
                      {msg.voiceNote.duration}s
                    </span>
                  </div>
                ) : (
                  <p className="leading-snug">{msg.content}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Quick Tactic Radio Buttons */}
        <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800 flex gap-1.5 overflow-x-auto">
          {quickTactics.map((tactic, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(tactic, activeChannel)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 shrink-0 active:scale-95 transition-all"
            >
              {tactic}
            </button>
          ))}
        </div>

        {/* Bottom Input & Voice Note Recording Trigger */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between bg-red-950/50 border border-red-700 rounded-xl px-3 py-2 text-xs text-red-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Merekam Voice Note... ({recordTimer}s)</span>
              </div>
              <button
                onClick={handleStopRecording}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Kirim</span>
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Ketik pesan taktis..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />

              <button
                onClick={handleSendText}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl flex items-center justify-center active:scale-95 border border-slate-700"
                title="Kirim Teks"
              >
                <Send className="w-4 h-4" />
              </button>

              <button
                onClick={handleStartRecording}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center active:scale-95 shadow-md shadow-blue-900/50"
                title="Tahan / Klik untuk Rekam Voice Note"
              >
                <Mic className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
