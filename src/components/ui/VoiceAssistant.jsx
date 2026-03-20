/**
 * BOCRA Voice Assistant
 * Wake word: greeting + "BOCRA" (e.g. "Hey BOCRA", "Hi BOCRA")
 * Uses Web Speech API for input, browser TTS for output
 * Routes queries through Supabase chat Edge Function
 * Navigation only on explicit "go to", "take me to", "open" commands
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import { supabaseUrl_, supabaseAnonKey_ } from '../../lib/supabase';

const CHAT_API = `${supabaseUrl_}/functions/v1/chat`;

const PAGES = [
  { keywords: ['home', 'main page', 'homepage'], path: '/' },
  { keywords: ['about', 'about bocra'], path: '/about/profile' },
  { keywords: ['complaint', 'file complaint', 'complain'], path: '/services/file-complaint' },
  { keywords: ['licence', 'license', 'licensing'], path: '/licensing' },
  { keywords: ['verify', 'verification'], path: '/services/licence-verification' },
  { keywords: ['qos', 'quality of service', 'network monitoring'], path: '/services/qos-monitoring' },
  { keywords: ['register', 'domain', 'dot bw'], path: '/services/register-bw' },
  { keywords: ['portal', 'operator portal', 'asms'], path: '/services/asms-webcp' },
  { keywords: ['contact', 'contact us'], path: '/contact' },
  { keywords: ['search'], path: '/search' },
  { keywords: ['cybersecurity', 'cyber security'], path: '/cybersecurity' },
  { keywords: ['documents', 'publications'], path: '/documents' },
  { keywords: ['ict licensing', 'ict framework'], path: '/documents/ict-licensing' },
  { keywords: ['news', 'media'], path: '/media/news' },
  { keywords: ['admin', 'dashboard'], path: '/admin' },
  { keywords: ['board of directors'], path: '/about/board-of-directors' },
  { keywords: ['statistics', 'stats'], path: '/telecom-statistics' },
];

const WAKE_WORDS = ['bocra', 'bokra', 'boca'];
const GREETINGS = ['hey', 'hi', 'hello', 'yo', 'ok', 'okay'];
const FAREWELLS = ['bye', 'goodbye', 'thanks', 'thank you', 'no thanks', 'nope', "that's all", 'close', 'stop'];
const NAV_TRIGGERS = ['go to', 'take me to', 'open', 'navigate to', 'show me', 'visit'];

function detectWakeWord(text) {
  const lower = text.toLowerCase().trim();
  return GREETINGS.some(g => WAKE_WORDS.some(w => lower.includes(g + ' ' + w) || lower.includes(g + ', ' + w)));
}

function detectFarewell(text) {
  const lower = text.toLowerCase().trim();
  return FAREWELLS.some(w => lower.includes(w));
}

function detectNavigation(text) {
  const lower = text.toLowerCase();
  const isNavCommand = NAV_TRIGGERS.some(t => lower.includes(t));
  if (!isNavCommand) return null;
  for (const page of PAGES) {
    if (page.keywords.some(kw => lower.includes(kw))) return page;
  }
  return null;
}

function cleanQuery(text) {
  let c = text;
  for (const g of GREETINGS) {
    for (const w of WAKE_WORDS) {
      c = c.replace(new RegExp(`${g}\\s+${w}[,.]?\\s*`, 'gi'), '');
    }
  }
  return c.trim();
}

// Get best available voice
function getBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  const prefs = [
    'Google UK English Female', 'Samantha', 'Karen', 'Moira',
    'Microsoft Zira', 'Google US English', 'Fiona', 'Victoria',
    'Microsoft Hazel', 'Tessa'
  ];
  for (const name of prefs) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }
  // Fallback: any English female-sounding voice
  const en = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
  return en || voices.find(v => v.lang.startsWith('en')) || voices[0];
}

export default function VoiceAssistant() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | listening | thinking | speaking
  const [bgListening, setBgListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [micAllowed, setMicAllowed] = useState(false);
  const bgRecRef = useRef(null);
  const activeRecRef = useRef(null);
  const navigate = useNavigate();
  const activeRef = useRef(false);
  const synthRef = useRef(window.speechSynthesis);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SpeechRecognition;

  // Load voices early
  useEffect(() => {
    synthRef.current.getVoices();
    window.speechSynthesis.onvoiceschanged = () => synthRef.current.getVoices();
  }, []);

  const speak = useCallback((text, onDone) => {
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.05;
    utter.lang = 'en-GB';
    const voice = getBestVoice();
    if (voice) utter.voice = voice;
    utter.onstart = () => setPhase('speaking');
    utter.onend = () => { setPhase('idle'); onDone?.(); };
    utter.onerror = () => { setPhase('idle'); onDone?.(); };
    synthRef.current.speak(utter);
  }, []);

  const askClaude = useCallback(async (msg) => {
    setPhase('thinking');
    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseAnonKey_}`, apikey: supabaseAnonKey_ },
        body: JSON.stringify({ message: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        return (data.reply || "Sorry, I couldn't process that.").replace(/\*\*/g, '').replace(/#+\s/g, '').replace(/\[.*?\]\(.*?\)/g, '');
      }
    } catch (e) { console.warn('Voice AI error:', e); }
    return "I'm having trouble connecting. Please try again.";
  }, []);

  // Stop everything cleanly
  const stopAll = useCallback(() => {
    synthRef.current.cancel();
    activeRecRef.current?.abort?.();
    activeRecRef.current = null;
    setPhase('idle');
  }, []);

  // Start listening for user's question
  const listenForQuestion = useCallback(() => {
    if (!SpeechRecognition || !activeRef.current) return;
    stopAll();

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;
    activeRecRef.current = rec;

    let finalText = '';

    rec.onstart = () => setPhase('listening');
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
      if (e.results[e.results.length - 1]?.isFinal) {
        finalText = t;
      }
    };

    rec.onend = () => {
      if (!activeRef.current) return;
      if (!finalText) { setPhase('idle'); return; }

      const cleaned = cleanQuery(finalText);

      // Farewell
      if (detectFarewell(cleaned)) {
        speak("Goodbye! Call me anytime.", () => dismiss());
        return;
      }

      // Navigation — only with explicit command words
      const nav = detectNavigation(cleaned);
      if (nav) {
        speak(`Taking you to the ${nav.keywords[0]} page.`, () => {
          navigate(nav.path);
          dismiss();
        });
        setResponse(`Navigating to ${nav.keywords[0]}...`);
        return;
      }

      // Too short
      if (cleaned.length < 3) {
        speak("I didn't catch that. Could you say that again?", () => {
          if (activeRef.current) listenForQuestion();
        });
        return;
      }

      // Ask Claude
      (async () => {
        const reply = await askClaude(cleaned);
        setResponse(reply);
        const short = reply.length > 350 ? reply.substring(0, 350) + '...' : reply;
        speak(short, () => {
          if (activeRef.current) {
            speak("Anything else?", () => {
              if (activeRef.current) listenForQuestion();
            });
          }
        });
      })();
    };

    rec.onerror = (e) => {
      console.warn('Speech error:', e.error);
      if (e.error === 'no-speech' && activeRef.current) {
        // Retry listening
        setTimeout(() => { if (activeRef.current) listenForQuestion(); }, 300);
      }
    };

    try { rec.start(); } catch(e) {}
  }, [SpeechRecognition, speak, askClaude, navigate, stopAll]);

  // Activate the assistant
  const activate = useCallback(() => {
    bgRecRef.current?.abort?.();
    setBgListening(false);
    activeRef.current = true;
    setActive(true);
    setTranscript('');
    setResponse('');
    speak("Hi! How can I help you?", () => {
      if (activeRef.current) listenForQuestion();
    });
  }, [speak, listenForQuestion]);

  // Dismiss the assistant
  const dismiss = useCallback(() => {
    stopAll();
    activeRef.current = false;
    setActive(false);
    setTranscript('');
    setResponse('');
    // Restart background listening after a pause
    setTimeout(() => startBgListening(), 1000);
  }, [stopAll]);

  // Background wake word listener
  const startBgListening = useCallback(() => {
    if (!SpeechRecognition || activeRef.current) return;
    bgRecRef.current?.abort?.();

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    bgRecRef.current = rec;

    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (detectWakeWord(t)) {
          rec.abort();
          setBgListening(false);
          activate();
          return;
        }
      }
    };

    rec.onend = () => {
      if (!activeRef.current && micAllowed) {
        setTimeout(() => {
          if (!activeRef.current) startBgListening();
        }, 500);
      }
    };

    rec.onerror = (e) => {
      if (e.error !== 'aborted' && !activeRef.current && micAllowed) {
        setTimeout(() => startBgListening(), 2000);
      }
    };

    try { rec.start(); setBgListening(true); } catch(e) {}
  }, [SpeechRecognition, micAllowed, activate]);

  // Enable voice
  const enableVoice = () => {
    setMicAllowed(true);
    localStorage.setItem('bocra-voice-enabled', 'true');
  };

  // Start bg listening when enabled
  useEffect(() => {
    if (micAllowed && !active) startBgListening();
    return () => bgRecRef.current?.abort?.();
  }, [micAllowed]);

  // Check if previously enabled
  useEffect(() => {
    if (localStorage.getItem('bocra-voice-enabled') === 'true') setMicAllowed(true);
  }, []);

  if (!supported) return null;

  // Not enabled
  if (!micAllowed) {
    return (
      <button onClick={enableVoice}
        className="fixed bottom-24 left-4 sm:left-6 z-[94] flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00458B] to-[#00A6CE] flex items-center justify-center">
          <Mic size={14} className="text-white" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-bold text-[#00458B]">Voice Assistant</p>
          <p className="text-[8px] text-gray-400">Say "Hey BOCRA"</p>
        </div>
      </button>
    );
  }

  // Active overlay
  if (active) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative flex flex-col items-center gap-5 max-w-sm w-full mx-4">
          {/* Animated orb */}
          <div className="relative">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 ${
              phase === 'speaking' ? 'bg-gradient-to-br from-[#6BBE4E] to-[#00A6CE] scale-110' :
              phase === 'thinking' ? 'bg-gradient-to-br from-[#F7B731] to-[#FF6600]' :
              phase === 'listening' ? 'bg-gradient-to-br from-[#00A6CE] to-[#00458B] scale-105' :
              'bg-gradient-to-br from-[#00458B] to-[#001A3A]'
            }`}>
              {phase === 'speaking' ? (
                <div className="flex items-end gap-[3px] h-10">
                  {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} className="w-[3px] bg-white/90 rounded-full" style={{
                      animation: 'voiceBar 0.5s ease-in-out infinite alternate',
                      animationDelay: `${i * 0.07}s`,
                      height: '8px',
                    }} />
                  ))}
                </div>
              ) : phase === 'thinking' ? (
                <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
              ) : phase === 'listening' ? (
                <Mic size={36} className="text-white" />
              ) : (
                <Volume2 size={30} className="text-white/70" />
              )}
            </div>
            {phase === 'listening' && (
              <>
                <div className="absolute inset-[-10px] rounded-full border-2 border-[#00A6CE]/30 animate-ping" style={{animationDuration:'1.5s'}} />
                <div className="absolute inset-[-22px] rounded-full border border-[#00A6CE]/15 animate-ping" style={{animationDuration:'2.5s'}} />
              </>
            )}
            {phase === 'speaking' && (
              <div className="absolute inset-[-6px] rounded-full border-2 border-[#6BBE4E]/30 animate-pulse" />
            )}
          </div>

          {/* Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  phase === 'listening' ? 'bg-[#00A6CE] animate-pulse' :
                  phase === 'speaking' ? 'bg-[#6BBE4E] animate-pulse' :
                  phase === 'thinking' ? 'bg-[#F7B731] animate-pulse' : 'bg-gray-300'
                }`} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {phase === 'speaking' ? 'Speaking' : phase === 'thinking' ? 'Thinking' : phase === 'listening' ? 'Listening' : 'BOCRA Assistant'}
                </span>
              </div>
              <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 p-1"><X size={16}/></button>
            </div>

            {transcript && <p className="text-sm text-[#00458B] font-medium mb-2">"{transcript}"</p>}

            {response ? (
              <p className="text-xs text-gray-600 leading-relaxed max-h-40 overflow-y-auto">{response}</p>
            ) : phase === 'thinking' ? (
              <p className="text-xs text-gray-400 animate-pulse">Processing your request...</p>
            ) : phase === 'listening' ? (
              <p className="text-xs text-[#00A6CE]">I'm listening...</p>
            ) : (
              <p className="text-xs text-gray-400">How can I help you?</p>
            )}
          </div>

          <p className="text-[10px] text-white/40">Tap outside to dismiss · Say "goodbye" to close</p>
        </div>

        <style>{`
          @keyframes voiceBar {
            0% { height: 6px; }
            100% { height: 28px; }
          }
        `}</style>
      </div>
    );
  }

  // Passive indicator
  return (
    <div className="fixed bottom-24 left-4 sm:left-6 z-[94]">
      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-md">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00458B] to-[#00A6CE] flex items-center justify-center">
            <Mic size={14} className="text-white" />
          </div>
          {bgListening && <div className="absolute inset-[-3px] rounded-full border-2 border-[#00A6CE]/40 animate-ping" style={{animationDuration:'3s'}} />}
        </div>
        <div className="text-left">
          <p className="text-[10px] font-bold text-[#00458B]">Voice Active</p>
          <p className="text-[8px] text-gray-400">Say "Hey BOCRA"</p>
        </div>
        <button onClick={() => {
          setMicAllowed(false);
          localStorage.removeItem('bocra-voice-enabled');
          bgRecRef.current?.abort?.();
          setBgListening(false);
        }} className="text-gray-300 hover:text-gray-500 ml-1"><MicOff size={12}/></button>
      </div>
    </div>
  );
}
