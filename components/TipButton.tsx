'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Transaction,
    TransactionButton,
    TransactionSponsor,
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { parseEther, getAddress, isAddress, formatEther } from 'viem';
import { base } from 'wagmi/chains';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Zap, CheckCircle2, AlertCircle, Wallet, LogOut, Sparkles, X, ExternalLink } from 'lucide-react';

interface TipButtonProps {
    recipient: string;
    amount: string;
    title?: string;
    description?: string;
    isResolving?: boolean;
}

export default function TipButton({
    recipient = '',
    amount = '0.002',
    title = 'Send Support',
    description = '',
    isResolving = false
}: TipButtonProps) {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const { data: balanceData } = useBalance({ address });

    const [showConnectors, setShowConnectors] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<'idle' | 'building' | 'pending' | 'success' | 'error'>('idle');

    // Safety values
    const ethAmount = parseFloat(amount || '0');
    const usdPrice = 2370;
    const usdValue = !isNaN(ethAmount) ? (ethAmount * usdPrice).toFixed(2) : '0.00';

    const finalizedRecipient = useMemo(() => {
        if (!recipient) return null;
        const clean = recipient.trim();
        if (isAddress(clean)) return getAddress(clean);
        return null;
    }, [recipient]);

    const calls = useMemo(() => {
        if (!amount || isNaN(ethAmount) || !finalizedRecipient || ethAmount <= 0) return [];
        try {
            return [{
                to: finalizedRecipient,
                value: parseEther(amount),
                data: '0x' as `0x${string}`
            }];
        } catch (e) {
            return [];
        }
    }, [finalizedRecipient, amount, ethAmount]);

    const handleOnStatus = useCallback((status: LifecycleStatus) => {
        try {
            if (status.statusName === 'buildingTransaction') setTxStatus('building');
            else if (status.statusName === 'transactionPending') setTxStatus('pending');
            else if (status.statusName === 'success') {
                setTxStatus('success');
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0052FF', '#00C2FF', '#FFFFFF']
                });
            } else if (status.statusName === 'error') {
                setTxStatus('error');
                const detail = status.statusData as any;
                setErrorMessage(detail?.message || 'Transaction failed. Check your wallet.');
            }
        } catch (e) {
            console.error('Status handler crashed', e);
        }
    }, []);

    const isWrongChain = isConnected && chainId !== base.id;
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL?.trim();
    const capabilities = useMemo(() => {
        return paymasterUrl && paymasterUrl.startsWith('http')
            ? { paymasterService: { url: paymasterUrl } }
            : undefined;
    }, [paymasterUrl]);

    return (
        <div className="w-full max-w-md mx-auto relative cursor-default">
            <AnimatePresence mode="wait">
                <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.98 }}
                    className="bg-zinc-900/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] p-8 sm:p-10 relative overflow-hidden group"
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Zap size={240} className="text-blue-500" />
                    </div>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/20">
                                    <Sparkles size={16} className="text-blue-400" />
                                </div>
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Base MiniKit</span>
                            </div>
                            <button className="text-zinc-700 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {txStatus === 'success' ? (
                                <motion.div
                                    key="success-state"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-10 text-center"
                                >
                                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                                        <CheckCircle2 size={48} className="text-green-500" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Tip Sent! 🎉</h3>
                                    <p className="text-zinc-500 text-sm font-medium mb-10 leading-relaxed">Your support has been delivered instantly over Base.</p>

                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={() => { setTxStatus('idle'); setErrorMessage(null); }}
                                            className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                        >
                                            Done
                                        </button>
                                        <button
                                            className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            Share Transaction <ExternalLink size={12} />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="space-y-3">
                                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tighter">{title}</h2>
                                        <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-[90%]">{description}</p>
                                    </div>

                                    {/* Main Amount Plate */}
                                    <div className="bg-zinc-950/60 rounded-[2.5rem] p-10 border border-white/5 shadow-inner relative group/amount">
                                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover/amount:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none" />
                                        <div className="text-6xl sm:text-7xl font-black text-white tracking-tighter tabular-nums flex items-baseline gap-3">
                                            {amount} <span className="text-2xl text-zinc-700 font-black uppercase tracking-widest">ETH</span>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xl font-black text-zinc-500 italic">≈ ${usdValue} <span className="text-[10px] uppercase not-italic opacity-40">USD</span></span>
                                            {balanceData && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Wallet</span>
                                                    <span className="text-[10px] font-bold text-blue-500/60 font-mono">
                                                        {parseFloat(formatEther(balanceData.value)).toFixed(4)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recipient Identity */}
                                    <div className="flex items-center justify-between px-2 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-white/10">
                                                <Wallet size={20} className="text-zinc-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Recipient</span>
                                                <span className="text-xs font-bold text-zinc-400 font-mono tracking-tighter">
                                                    {finalizedRecipient ? `${finalizedRecipient.slice(0, 8)}...${finalizedRecipient.slice(-6)}` : 'Waiting...'}
                                                </span>
                                            </div>
                                        </div>
                                        {finalizedRecipient && <CheckCircle2 size={16} className="text-green-500/60" />}
                                    </div>

                                    {/* Action Layer */}
                                    <div className="pt-2">
                                        {isConnected ? (
                                            isWrongChain ? (
                                                <button onClick={() => switchChain({ chainId: base.id })} className="w-full bg-white text-black font-black py-6 rounded-2xl hover:bg-zinc-100 transition-all shadow-2xl shadow-white/5 text-sm uppercase tracking-widest">Switch to Base</button>
                                            ) : (
                                                <Transaction
                                                    chainId={base.id}
                                                    calls={calls}
                                                    onStatus={handleOnStatus}
                                                    capabilities={capabilities}
                                                >
                                                    <TransactionButton
                                                        text="Send Support ⚡"
                                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 rounded-[1.75rem] transition-all shadow-[0_25px_50px_rgba(0,82,255,0.4)] active:scale-95 border border-white/10 text-lg tracking-tight disabled:opacity-20"
                                                        disabled={!calls.length || isResolving}
                                                    />
                                                    <div className="mt-4 flex justify-center opacity-40">
                                                        <TransactionSponsor />
                                                    </div>
                                                </Transaction>
                                            )
                                        ) : (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowConnectors(!showConnectors)}
                                                    className="w-full bg-zinc-100 hover:bg-white text-black font-black py-7 rounded-[1.75rem] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                                                >
                                                    <Wallet size={18} />
                                                    Connect Wallet
                                                </button>
                                                <AnimatePresence>
                                                    {showConnectors && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            className="absolute bottom-full left-0 right-0 mb-6 p-3 bg-zinc-900 border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[100] backdrop-blur-3xl"
                                                        >
                                                            <div className="px-4 py-3 border-b border-white/5 mb-2 flex justify-between items-center">
                                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Wallet</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-1">
                                                                {connectors.map(c => (
                                                                    <button key={c.id} onClick={() => { connect({ connector: c }); setShowConnectors(false); }} className="w-full text-left p-4 hover:bg-white/5 rounded-2xl text-sm font-black text-white/90 transition-all uppercase tracking-tight flex items-center justify-between group">
                                                                        {c.name}
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>

                                    {errorMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-xs font-black flex items-start gap-4"
                                        >
                                            <AlertCircle size={20} className="shrink-0" />
                                            <span>{errorMessage}</span>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
