'use client';

import { Suspense, useState, useEffect, useCallback, useRef, Component, ReactNode } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TipButton from "@/components/TipButton";
import AmountSelector from "@/components/AmountSelector";
import RecipientSelector from "@/components/RecipientSelector";
import { resolveRecipient, ResolutionResult } from "@/lib/resolve";
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Share2, Settings2, ShieldCheck, ChevronRight, AlertTriangle, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Error Boundary for Magical Debugging ---
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Something went wrong</h1>
          <p className="text-zinc-500 mb-6 max-w-md">{this.state.error?.message || 'Unknown magic failure'}</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold">Try Refreshing</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function TippingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [recipientInput, setRecipientInput] = useState(searchParams.get('to') || '');
  const [amount, setAmount] = useState(searchParams.get('amount') || '0.002');
  const [title, setTitle] = useState(searchParams.get('title') || 'Send Support');
  const [description, setDescription] = useState(searchParams.get('desc') || 'Empower creators with instant, gasless tips on Base.');

  const [resolution, setResolution] = useState<ResolutionResult>({ address: null, type: 'unknown' });
  const [isResolving, setIsResolving] = useState(false);
  const timeoutRef = useRef<any>(null);

  const [showConfig, setShowConfig] = useState(false);

  const handleResolve = useCallback(async (input: string) => {
    if (!input) {
      setResolution({ address: null, type: 'unknown' });
      return;
    }
    setIsResolving(true);
    try {
      const result = await resolveRecipient(input);
      setResolution(result);
    } catch (e) {
      console.error('Resolution error:', e);
      setResolution({ address: null, type: 'unknown', error: 'Could not resolve recipient' });
    } finally {
      setIsResolving(false);
    }
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (recipientInput) {
      timeoutRef.current = setTimeout(() => {
        handleResolve(recipientInput);
      }, 700);
    } else {
      setResolution({ address: null, type: 'unknown' });
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [recipientInput, handleResolve]);

  const updateUrl = useCallback(() => {
    try {
      const params = new URLSearchParams();
      if (recipientInput) params.set('to', recipientInput);
      params.set('amount', amount);
      params.set('title', title);
      params.set('desc', description);
      router.replace(`?${params.toString()}`, { scroll: false });
    } catch (e) { }
  }, [recipientInput, amount, title, description, router]);

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Tipping Link Copied! ⚡');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Immersive Background Particles & Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden overflow-y-auto">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(0,82,255,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] animate-pulse rounded-full" />
        <div className="absolute bottom-[-10%] left-[5%] w-[30%] h-[30%] bg-indigo-600/5 blur-[120px] rounded-full" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 max-w-[480px] mx-auto px-6 pt-32 pb-20 flex flex-col gap-16">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center space-y-8"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-full shadow-2xl backdrop-blur-md"
            >
              <Zap size={14} className="text-blue-500 fill-current" />
              <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.3em] leading-none">Powered by Base</span>
            </motion.div>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.85] text-white">
            Tipping <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600">Reimagined.</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 font-bold max-w-[340px] mx-auto leading-relaxed italic">
            Create a personalized tipping experience that feels like magic. Instant and social.
          </p>
        </motion.div>

        {/* Input & Selector Section */}
        <div className="space-y-12">
          <RecipientSelector
            value={recipientInput}
            onChange={setRecipientInput}
            isResolving={isResolving}
            resolvedAddress={resolution.address}
            error={resolution.error || null}
            type={resolution.type}
            avatar={resolution.avatar}
            displayName={resolution.displayName}
          />

          <AmountSelector amount={amount} onChange={setAmount} />

          {/* Preview / Tip Button Card */}
          <div className="pt-8">
            <div className="mb-6 flex items-center justify-between px-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Live Preview</label>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/10" />
              </div>
            </div>

            <Suspense fallback={<div className="h-[400px] w-full bg-zinc-900/50 rounded-[2.5rem] animate-pulse border border-white/5 shadow-2xl" />}>
              <TipButton
                recipient={resolution.address || ''}
                amount={amount}
                title={title}
                description={description}
                isResolving={isResolving}
              />
            </Suspense>
          </div>

          {/* Primary Action & Configuration */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  updateUrl();
                  setShowConfig(true);
                  confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.8 },
                    colors: ['#0052FF', '#FFFFFF', '#00C2FF']
                  });
                }}
                className="w-full bg-white hover:bg-zinc-100 text-black font-black py-7 rounded-[2rem] flex items-center justify-center gap-3 shadow-[0_25px_50px_rgba(255,255,255,0.1)] active:scale-95 transition-all text-xl uppercase tracking-tight"
              >
                Create Tip Link <ChevronRight size={20} />
              </button>

              <div className="flex gap-4">
                <button
                  onClick={copyLink}
                  className="flex-1 p-5 bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white hover:border-white/10 rounded-2xl transition-all flex items-center justify-center gap-3 group text-xs font-black uppercase tracking-widest"
                >
                  <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                  Share Link
                </button>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="p-5 bg-zinc-900 border border-white/5 text-zinc-500 hover:text-blue-500 hover:border-blue-500/20 rounded-2xl transition-all flex items-center justify-center group"
                >
                  <Settings2 size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] space-y-8 mt-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Customize Card</h3>
                      <button onClick={() => setShowConfig(false)} className="text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-widest">Done</button>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Display Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-black/40 border-2 border-white/5 focus:border-blue-500/30 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Subtext</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={2}
                          className="w-full bg-black/40 border-2 border-white/5 focus:border-blue-500/30 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Footer Notes */}
        <div className="flex flex-col items-center gap-8 py-10 border-t border-white/5">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center group">
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Gasless</span>
              <span className="text-xs font-bold text-zinc-500">Sponsored by CDP</span>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="flex flex-col items-center group">
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Instant</span>
              <span className="text-xs font-bold text-zinc-500">Finalized in 2s</span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-full">
            <ShieldCheck size={14} className="text-blue-500/60" />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Verified on Base</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-blue-500 font-black text-xs uppercase tracking-widest animate-pulse">Initializing Magic...</span>
      </div>}>
        <TippingPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}
