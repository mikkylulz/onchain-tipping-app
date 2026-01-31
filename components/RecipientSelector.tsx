'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, AlertCircle, Loader2, User } from 'lucide-react';

interface RecipientSelectorProps {
    value: string;
    onChange: (val: string) => void;
    isResolving: boolean;
    resolvedAddress: string | null;
    error: string | null;
    type?: 'address' | 'farcaster' | 'basename' | 'unknown';
    avatar?: string | null;
    displayName?: string | null;
}

export default function RecipientSelector({
    value,
    onChange,
    isResolving,
    resolvedAddress,
    error,
    type,
    avatar,
    displayName
}: RecipientSelectorProps) {
    const isVerified = resolvedAddress && !isResolving && !error;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em]">Recipient</label>
                {isVerified && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full"
                    >
                        <CheckCircle2 size={10} className="text-green-400" />
                        <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Verified Address</span>
                    </motion.div>
                )}
            </div>

            <div className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                    {isResolving ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <Search size={18} />}
                </div>

                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter address or @username..."
                    className={`
                        w-full bg-zinc-950 border-2 rounded-2xl px-14 py-6 text-base font-black outline-none transition-all placeholder:text-zinc-800
                        ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-blue-500/30 group-hover:border-white/10'}
                        ${isVerified ? 'text-white' : 'text-zinc-300'}
                    `}
                />

                <AnimatePresence>
                    {isVerified && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-y-0 right-6 flex items-center pointer-events-none"
                        >
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                <CheckCircle2 size={14} className="text-white" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Resolution Card */}
            <AnimatePresence mode="wait">
                {resolvedAddress && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`
                            p-5 rounded-2xl border-2 flex items-center gap-4 transition-all
                            ${error ? 'bg-red-500/5 border-red-500/20' : 'bg-zinc-900 border-white/5 shadow-2xl'}
                        `}
                    >
                        <div className="relative">
                            {avatar ? (
                                <img src={avatar} alt={displayName || 'Avatar'} className="w-12 h-12 rounded-xl border border-white/10" />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/10">
                                    <User size={24} className="text-zinc-600" />
                                </div>
                            )}
                            {isVerified && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                                    <CheckCircle2 size={10} className="text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-white truncate">{displayName || (type === 'farcaster' ? value : 'Resolved Recipient')}</h4>
                            <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">{resolvedAddress}</p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{type}</span>
                            {error && <AlertCircle size={14} className="text-red-500" />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-black text-red-500 uppercase tracking-widest px-2"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
