'use client';

import { motion } from 'framer-motion';
import { Edit3 } from 'lucide-react';

const PRESETS = [
    { value: '0.0004', label: '$1', emoji: '🎁' },
    { value: '0.002', label: '$5', emoji: '🍩' },
    { value: '0.004', label: '$10', emoji: '🍺' },
    { value: '0.01', label: '$25', emoji: '🍕' },
];

interface AmountSelectorProps {
    amount: string;
    onChange: (amount: string) => void;
}

export default function AmountSelector({ amount, onChange }: AmountSelectorProps) {
    const isCustom = !PRESETS.find(p => p.value === amount);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em]">Tip Amount</label>
                {isCustom && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 tracking-widest uppercase"
                    >
                        Custom
                    </motion.span>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {PRESETS.map((p) => {
                    const isSelected = amount === p.value;
                    return (
                        <motion.button
                            key={p.value}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onChange(p.value)}
                            className={`
                                flex flex-col items-center justify-center p-4 min-h-[5rem] rounded-2xl border-2 transition-all duration-200 shadow-xl
                                ${isSelected
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/20'
                                    : 'bg-zinc-900 border-white/5 text-zinc-400'}
                            `}
                        >
                            <span className="text-2xl mb-1">{p.emoji}</span>
                            <span className="text-sm font-black tracking-tight">{p.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            <div className="relative group">
                <div className={`
                    absolute inset-y-0 left-6 flex items-center pointer-events-none transition-colors
                    ${isCustom ? 'text-blue-500' : 'text-zinc-600 group-hover:text-zinc-400'}
                `}>
                    <Edit3 size={16} />
                </div>
                <input
                    type="number"
                    step="0.0001"
                    value={isCustom ? amount : ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type custom ETH amount..."
                    className={`
                        w-full bg-zinc-950 border-2 rounded-2xl px-14 py-6 text-base font-black outline-none transition-all
                        ${isCustom
                            ? 'border-blue-500/50 text-white shadow-lg shadow-blue-500/5'
                            : 'border-white/5 text-zinc-500 focus:border-blue-500/30 group-hover:border-white/10'}
                    `}
                />
                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <span className="text-xs font-black text-zinc-700 tracking-widest uppercase">ETH</span>
                </div>
            </div>
        </div>
    );
}
