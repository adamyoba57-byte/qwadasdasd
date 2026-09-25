import React, { useState } from 'react';
import { Monitor, Cpu, HardDrive, Check, Copy } from 'lucide-react';
import { parseSteamRequirements, ParsedRequirements } from '../utils/steamRequirementsParser';

interface SteamSystemRequirementsProps {
  requirementsText?: string | null;
  className?: string;
  showTitle?: boolean;
}

export const SteamSystemRequirements: React.FC<SteamSystemRequirementsProps> = ({
  requirementsText,
  className = '',
  showTitle = true,
}) => {
  const [copied, setCopied] = useState(false);

  if (!requirementsText || !requirementsText.trim()) {
    return null;
  }

  const parsed: ParsedRequirements = parseSteamRequirements(requirementsText);

  if (!parsed.hasRequirements && parsed.minimum.length === 0 && parsed.recommended.length === 0) {
    // If not parseable as requirements, render as formatted text
    return (
      <div className={`p-4 rounded-xl bg-[#0c1219]/90 border border-[#1b2838] text-xs text-[#c6d4df] leading-relaxed font-sans ${className}`}>
        {requirementsText}
      </div>
    );
  }

  const hasBoth = parsed.minimum.length > 0 && parsed.recommended.length > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(requirementsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="steam-system-requirements"
      className={`rounded-xl bg-[#0d131b] border border-[#1e2a38] p-5 sm:p-6 text-[#c6d4df] shadow-2xl relative overflow-hidden font-sans ${className}`}
    >
      {/* Subtle Steam Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Steam Header Bar */}
      {showTitle && (
        <div className="pb-2.5 mb-4 border-b border-[#2a475e] relative">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-normal tracking-wide text-white font-sans">
              System Requirements
            </h3>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy System Requirements"
              className="text-[11px] font-mono text-[#8f98a0] hover:text-white px-2 py-1 rounded bg-[#172435]/60 hover:bg-[#1b2838] border border-[#2a475e]/50 flex items-center gap-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Specs</span>
                </>
              )}
            </button>
          </div>
          {/* Subtle cyan accent bar under title matching Steam */}
          <div className="absolute -bottom-[1px] left-0 w-28 h-[2px] bg-[#67c1f5]" />
        </div>
      )}

      {/* Two Column Grid (Matching Steam Store Page) */}
      <div
        className={`grid gap-6 sm:gap-8 ${
          hasBoth ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* MINIMUM Column */}
        {parsed.minimum.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8f98a0] pb-1 border-b border-[#1b2838]/80">
              MINIMUM:
            </div>

            {parsed.minHeadingNote && (
              <p className="text-xs text-[#c6d4df] pt-0.5 leading-snug">
                {parsed.minHeadingNote}
              </p>
            )}

            <ul className="space-y-1.5 pt-1 text-xs leading-relaxed">
              {parsed.minimum.map((item, idx) => (
                <li key={`min-${idx}`} className="text-xs leading-relaxed">
                  <strong className="font-bold uppercase tracking-wider text-[#8f98a0] mr-1.5 text-[11px] sm:text-xs">
                    {item.key}:
                  </strong>
                  <span className="text-[#c6d4df] break-words text-xs">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* RECOMMENDED Column */}
        {parsed.recommended.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8f98a0] pb-1 border-b border-[#1b2838]/80">
              RECOMMENDED:
            </div>

            {parsed.recHeadingNote && (
              <p className="text-xs text-[#c6d4df] pt-0.5 leading-snug">
                {parsed.recHeadingNote}
              </p>
            )}

            <ul className="space-y-1.5 pt-1 text-xs leading-relaxed">
              {parsed.recommended.map((item, idx) => (
                <li key={`rec-${idx}`} className="text-xs leading-relaxed">
                  <strong className="font-bold uppercase tracking-wider text-[#8f98a0] mr-1.5 text-[11px] sm:text-xs">
                    {item.key}:
                  </strong>
                  <span className="text-[#c6d4df] break-words text-xs">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footnotes / Disclaimers at Bottom */}
      {parsed.footnotes.length > 0 && (
        <div className="mt-5 pt-3 border-t border-[#1b2838] space-y-1">
          {parsed.footnotes.map((fn, idx) => (
            <p key={`fn-${idx}`} className="text-[11px] text-[#8f98a0] leading-relaxed italic">
              {fn}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
