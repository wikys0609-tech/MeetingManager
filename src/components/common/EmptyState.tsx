import React from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<any>;
  ctaText?: string;
  ctaLink?: string;
  ctaAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = HelpCircle,
  ctaText,
  ctaLink,
  ctaAction,
}: EmptyStateProps) {
  return (
    <div className="glass-panel p-10 rounded-2xl border border-card-border text-center flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="p-4 rounded-full bg-white/5 border border-card-border text-slate-500 mb-4 animate-pulse">
        <Icon size={28} className="text-indigo-400/75" />
      </div>
      
      <h3 className="text-sm font-bold text-white mb-1.5 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      
      {ctaText && (
        <>
          {ctaLink ? (
            <Link
              href={ctaLink}
              className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer"
            >
              {ctaText}
            </Link>
          ) : (
            ctaAction && (
              <button
                onClick={ctaAction}
                className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer"
              >
                {ctaText}
              </button>
            )
          )}
        </>
      )}
    </div>
  );
}
