import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Crown, Network, Lock, Check } from 'lucide-react';
import { ProgressNodeData } from '@/lib/progress-data';

export const ProgressNode = memo(({ data, selected }: { data: ProgressNodeData, selected: boolean }) => {
    const isCompleted = data.status === 'completed';
    const isInProgress = data.status === 'progress';
    const isLocked = data.status === 'locked';
    const color = data.color || '#e5e7eb'; // Default gray

    // Breathing glow effect specifically requested for in-progress or root
    const breathingGlow = {
        animate: { boxShadow: `0px 0px 20px 8px ${color}80`, opacity: [0.3, 0.7, 0.3] },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    };

    return (
        <div className={`relative flex flex-col items-center justify-center group ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>

            {/* Target Handle (Top) - Don't show for root */}
            {data.type !== 'root' && (
                <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-transparent border-none" />
            )}

            {/* The Glow */}
            {(isInProgress || data.type === 'root') && (
                <motion.div animate={breathingGlow.animate} transition={breathingGlow.transition} className="absolute inset-0 rounded-full" />
            )}

            {/* The Node Circle */}
            <div
                className={`relative z-10 flex items-center justify-center rounded-full transition-transform duration-300
          ${selected ? 'scale-110' : 'group-hover:scale-105'}
          ${data.type === 'root' ? 'w-20 h-20' : data.type === 'category' ? 'w-16 h-16' : data.type === 'skill' ? 'w-14 h-14' : 'w-12 h-12'}
        `}
                style={{
                    backgroundColor: isCompleted ? color : isLocked ? '#f9fafb' : '#ffffff',
                    border: `4px solid ${isLocked ? '#d1d5db' : color}`,
                    boxShadow: isCompleted ? `0 4px 14px ${color}60` : 'none',
                }}
            >
                {/* Icons */}
                {data.type === 'root' && <Crown className="w-8 h-8 text-black" />}
                {data.type !== 'root' && isCompleted && <Check className="w-6 h-6 text-white stroke-[3]" />}
                {isInProgress && <span className="text-xs font-bold" style={{ color: color }}>{data.percentage || '0%'}</span>}
                {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
            </div>

            {/* Optional Label underneath */}
            {data.label && (
                <div className={`absolute top-full mt-2 whitespace-nowrap px-3 py-1 text-sm font-bold rounded-full bg-white border border-gray-200 shadow-sm
          ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                    {data.label}
                </div>
            )}

            {/* Collapsible Indicator */}
            {data.isCollapsible && (
                <div className="absolute -right-2 -top-2 w-5 h-5 bg-white border border-gray-300 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm z-20">
                    {data.isCollapsed ? '+' : '-'}
                </div>
            )}

            {/* Source Handle (Bottom) */}
            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-transparent border-none" />

        </div>
    );
});

ProgressNode.displayName = 'ProgressNode';
