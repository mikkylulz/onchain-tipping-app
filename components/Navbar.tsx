'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Wallet, Zap } from 'lucide-react';

export default function Navbar() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [showConnectors, setShowConnectors] = useState(false);

    return (
        <nav className="fixed top-0 inset-x-0 z-[100] px-6 py-4 flex justify-center pointer-events-none">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="pointer-events-auto flex items-center justify-between gap-8 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 p-1.5 pl-3 pr-2 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] max-w-fit sm:min-w-[480px] w-full group relative"
            >
                {/* Visual Accent Gradient */}
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_8px_20px_rgba(0,82,255,0.4)] border border-blue-400/20">
                        <Zap size={16} className="text-white fill-current" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white tracking-[0.25em] uppercase leading-none">Base Tip</span>
                    </div>
                </div>

                {/* Desktop Content Spacer / Status Indicator */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Network Live</span>
                </div>

                {/* Wallet Action Section */}
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <div className="flex items-center bg-white/5 border border-white/5 rounded-xl p-0.5 group/wallet">
                            <div className="flex flex-col px-3 py-1">
                                <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest leading-none mb-1">Vault Linked</span>
                                <span className="text-[10px] font-bold text-white/50 font-mono tracking-tighter">
                                    {address?.slice(0, 6)}...{address?.slice(-4)}
                                </span>
                            </div>
                            <button
                                onClick={() => disconnect()}
                                className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-lg transition-all border border-white/5"
                                title="Disconnect"
                            >
                                <LogOut size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() => setShowConnectors(!showConnectors)}
                                className="bg-white hover:bg-zinc-100 text-black px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] shadow-xl active:scale-95 transition-all flex items-center gap-2.5"
                            >
                                <Wallet size={14} />
                                Connect
                            </button>

                            <AnimatePresence>
                                {showConnectors && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setShowConnectors(false)}
                                            className="fixed inset-0 z-[-1]"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            className="absolute right-0 mt-4 p-2 bg-zinc-900 border border-white/10 rounded-2xl w-64 shadow-[0_40px_80px_rgba(0,0,0,0.8)] z-[110] backdrop-blur-3xl overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-white/5 mb-2">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Wallet</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-1">
                                                {connectors.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => { connect({ connector: c }); setShowConnectors(false); }}
                                                        className="w-full text-left p-4 hover:bg-white/5 rounded-xl text-sm font-black text-white/90 transition-all flex items-center justify-between group"
                                                    >
                                                        {c.name}
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.div>
        </nav>
    );
}
