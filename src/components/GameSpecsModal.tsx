import React, { useState, useEffect } from 'react';
import {
  X,
  Monitor,
  Check,
  Sparkles,
  Copy,
  RotateCcw,
  Save,
  Cpu,
  HardDrive
} from 'lucide-react';
import { GameAccount } from '../types';
import { SteamSystemRequirements } from './SteamSystemRequirements';

interface GameSpecsModalProps {
  account: GameAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountId: string, specs: string) => void;
}

// Preset matching the user's uploaded Image 2
const PRESET_STEAM_AAA = `System Requirements
MINIMUM:
Requires a 64-bit processor and operating system
OS: 64-bit Windows® 10 version 1909 or newer
PROCESSOR: Intel® Core™ i5-2500K or AMD™ FX-8350
MEMORY: 8 GB RAM
GRAPHICS: NVIDIA® GeForce® GTX 660 or Intel® Arc™ A380 or AMD Radeon™ R9 280
DIRECTX: Version 12
NETWORK: Broadband Internet connection
STORAGE: 90 GB available space
ADDITIONAL NOTES: *1080p native resolution / 720p render resolution, low graphics settings, 30fps, SSD Required
RECOMMENDED:
Requires a 64-bit processor and operating system
OS: 64-bit Windows® 10 version 1909 or newer
PROCESSOR: Intel® Core™ i5-4670K or AMD Ryzen™ 1300X
MEMORY: 16 GB RAM
GRAPHICS: NVIDIA® GeForce® GTX 970 or Intel® Arc™ A750 or AMD Radeon™ RX 470
DIRECTX: Version 12
NETWORK: Broadband Internet connection
STORAGE: 90 GB available space
ADDITIONAL NOTES: *1080p resolution, medium graphics settings, 60fps, SSD Required`;

// Preset for Mortal Kombat 11
const PRESET_MK11 = `System Requirements
MINIMUM:
Requires a 64-bit processor and operating system
OS: 64-bit Windows 7 / Windows 10
PROCESSOR: Intel Core i5-750, 2.66 GHz / AMD Phenom II X4 965, 3.4 GHz or AMD Ryzen™ 3 1200, 3.1 GHz
MEMORY: 8 GB RAM
GRAPHICS: NVIDIA® GeForce™ GTX 670 or NVIDIA® GeForce™ GTX 1050 / AMD® Radeon™ HD 7950 or AMD® Radeon™ R9 270
DIRECTX: Version 11
NETWORK: Broadband Internet connection
STORAGE: 60 GB available space
RECOMMENDED:
Requires a 64-bit processor and operating system
OS: 64-bit Windows 7 / Windows 10
PROCESSOR: Intel Core i5-2300, 2.8 GHz / AMD FX-6300, 3.5GHz or AMD Ryzen™ 5 1400, 3.2 GHz
MEMORY: 8 GB RAM
GRAPHICS: NVIDIA® GeForce™ GTX 780 or NVIDIA® GeForce™ GTX 1060-6GB / AMD® Radeon™ R9 290 or RX 570
DIRECTX: Version 11
NETWORK: Broadband Internet connection
STORAGE: 60 GB available space`;

// Preset for Competitive / Esports
const PRESET_ESPORTS = `System Requirements
MINIMUM:
Requires a 64-bit processor and operating system
OS: Windows® 10 64-bit
PROCESSOR: 4 hardware CPU threads - Intel® Core™ i5 750 or higher
MEMORY: 8 GB RAM
GRAPHICS: Video card must be 1 GB or more and should be a DirectX 11-compatible with support for Shader Model 5.0
DIRECTX: Version 11
STORAGE: 85 GB available space
RECOMMENDED:
Requires a 64-bit processor and operating system
OS: Windows® 10 / 11 64-bit
PROCESSOR: Intel® Core™ i7-9700K or AMD Ryzen™ 7 3700X
MEMORY: 16 GB RAM
GRAPHICS: NVIDIA® GeForce® RTX 2060 or AMD Radeon™ RX 5700 XT
DIRECTX: Version 12
NETWORK: Broadband Internet connection
STORAGE: 85 GB SSD available space`;

export const GameSpecsModal: React.FC<GameSpecsModalProps> = ({
  account,
  isOpen,
  onClose,
  onSave
}) => {
  const [specsText, setSpecsText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (account) {
      setSpecsText(account.systemRequirements || '');
      setSavedSuccess(false);
    }
  }, [account]);

  if (!isOpen || !account) return null;

  const handleSave = () => {
    onSave(account.id, specsText.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div
      id="game-specs-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="game-specs-modal-container"
        className="relative w-full max-w-4xl bg-[#0c1017] border border-[#2a475e] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-[#121923] border-b border-[#1f3042] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
              <img
                src={account.coverImage}
                alt={account.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-gaming flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#67c1f5]" />
                  <span>PC Config / System Requirements</span>
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#172535] text-[#67c1f5] border border-[#2a475e] font-mono">
                  {account.platform}
                </span>
              </div>
              <p className="text-xs text-[#8f98a0] font-sans truncate max-w-md mt-0.5">
                Game: <strong className="text-white">{account.title}</strong> — Configure PC requirements (MINIMUM & RECOMMENDED)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8f98a0] hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 font-sans">
          {/* Quick Presets Bar */}
          <div className="p-3 rounded-xl bg-[#101721] border border-[#1d2d3e] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8f98a0] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Presets (1-Click Fill)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Select a preset or paste from Steam
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSpecsText(PRESET_STEAM_AAA)}
                className="px-2.5 py-1.5 rounded-lg bg-[#1a2b3c] hover:bg-[#233a52] text-[#67c1f5] border border-[#2d4b68] text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Cpu className="w-3.5 h-3.5 text-[#67c1f5]" />
                <span>Steam AAA Preset (Image 2)</span>
              </button>

              <button
                type="button"
                onClick={() => setSpecsText(PRESET_MK11)}
                className="px-2.5 py-1.5 rounded-lg bg-[#1a2b3c] hover:bg-[#233a52] text-[#67c1f5] border border-[#2d4b68] text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Monitor className="w-3.5 h-3.5 text-orange-400" />
                <span>Mortal Kombat 11</span>
              </button>

              <button
                type="button"
                onClick={() => setSpecsText(PRESET_ESPORTS)}
                className="px-2.5 py-1.5 rounded-lg bg-[#1a2b3c] hover:bg-[#233a52] text-[#67c1f5] border border-[#2d4b68] text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Esports / Competitive</span>
              </button>

              <button
                type="button"
                onClick={() => setSpecsText('')}
                className="px-2 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ml-auto"
                title="Clear current text"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Raw Textarea Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Steam System Requirements Text</span>
                <span className="text-[11px] text-[#8f98a0] font-normal lowercase">
                  (copier direct mn Steam w 7etha hna)
                </span>
              </label>
              <span className="text-[11px] text-[#8f98a0] font-mono">
                {specsText.length} characters
              </span>
            </div>

            <textarea
              id="game-specs-textarea"
              rows={7}
              value={specsText}
              onChange={(e) => setSpecsText(e.target.value)}
              placeholder={`System Requirements\nMINIMUM:\nRequires a 64-bit processor and operating system\nOS: 64-bit Windows® 10\nPROCESSOR: Intel Core i5 / AMD Ryzen\nMEMORY: 8 GB RAM\nGRAPHICS: NVIDIA GeForce GTX 660\nDIRECTX: Version 12\nSTORAGE: 90 GB available space\nRECOMMENDED:\n...`}
              className="w-full p-3.5 rounded-xl bg-[#090d13] border border-[#203142] focus:border-[#67c1f5] text-[#c6d4df] font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#67c1f5] transition-all resize-y"
            />
          </div>

          {/* Live Steam Preview Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-gaming">
                <Monitor className="w-3.5 h-3.5 text-[#67c1f5]" />
                <span>Live Steam Preview (Kifach ghadi tban l players)</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Auto-Parsed
              </span>
            </div>

            {specsText.trim() ? (
              <div className="rounded-xl border border-[#2a475e] bg-[#0d131b] p-4">
                <SteamSystemRequirements requirementsText={specsText} />
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-[#203142] bg-[#090d13] text-center text-xs text-[#8f98a0]">
                <Monitor className="w-8 h-8 text-[#2a475e] mx-auto mb-2" />
                No requirements entered yet. Pick a preset above or paste specs from Steam to preview.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#121923] border-t border-[#1f3042] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-gaming font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="save-specs-btn"
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#67c1f5] hover:bg-[#52b1e8] text-[#0d131b] font-bold text-xs uppercase tracking-wider font-gaming flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-95 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-[#0d131b]" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#0d131b]" />
                <span>Save PC Config</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
