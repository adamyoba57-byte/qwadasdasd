import React, { useState } from 'react';
import { GameAccount, Platform, AccountType } from '../types';
import { ImageUploadInput } from './ImageUploadInput';
import {
  X,
  Plus,
  Gamepad2,
  Key,
  Link2,
  Sparkles,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Monitor
} from 'lucide-react';
import { SteamSystemRequirements } from './SteamSystemRequirements';
import { isSteamRequirements } from '../utils/steamRequirementsParser';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (account: Omit<GameAccount, 'id' | 'views' | 'favorites'>) => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeSubTab, setActiveSubTab] = useState<'game' | 'credentials' | 'link'>('game');

  const [newAccData, setNewAccData] = useState({
    // Game info
    title: '',
    platform: 'Steam' as 'Steam' | 'Xbox' | 'Others' | 'Cookies',
    accountType: 'standard' as AccountType,
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    badge: 'Steam Key / Full Library',
    stock: 25,
    totalValueUSD: 59.99,
    status: 'active' as const,
    description: 'Instant high-speed access to full game catalog with offline mode enabled.',
    systemRequirements: '',
    game1Title: 'Primary Game Title',
    game1Genre: 'Action / RPG',
    game1Value: 59.99,

    // Credentials
    username: 'steam_vault_gamer',
    password: 'Pass#2025!Access',
    guardActive: true,
    guardCode: 'GK99P',
    instructions: 'Sign in through official client. Switch to Offline Mode to play uninterrupted.',
    cookieData: '',

    // Link Config
    linkEnabled: true,
    customShortlinkUrl: '',
    provider: 'global' as 'global' | 'gplinks' | 'shrinkme' | 'droplink' | 'custom' | 'direct',
    timerSeconds: 8
  });

  if (!isOpen) return null;

  const handleRegenerateCode = () => {
    const chars = '23456789BCDFGHJKMNPQRTVWXYZ';
    let newCode = '';
    for (let i = 0; i < 5; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAccData((prev) => ({ ...prev, guardCode: newCode }));
  };

  const handlePreset = (platform: 'Steam' | 'Xbox' | 'Cookies') => {
    if (platform === 'Steam') {
      setNewAccData((p) => ({
        ...p,
        platform: 'Steam',
        badge: 'Steam Key / Full Library',
        guardActive: true,
        coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
        instructions: 'Login on official Steam client. Switch to Offline Mode to play uninterrupted.'
      }));
    } else if (platform === 'Xbox') {
      setNewAccData((p) => ({
        ...p,
        platform: 'Xbox',
        badge: 'Xbox & PC App Access',
        guardActive: false,
        coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
        instructions: 'Login to Microsoft Store / Xbox App for Windows.'
      }));
    } else if (platform === 'Cookies') {
      setNewAccData((p) => ({
        ...p,
        platform: 'Cookies',
        badge: 'Session Cookie / 4 Screens',
        guardActive: false,
        coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        instructions: 'Import JSON cookie using Cookie-Editor extension or login via web browser directly.'
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title: newAccData.title.trim() || 'New Game Account',
      platform: newAccData.platform,
      accountType: newAccData.accountType,
      coverImage: newAccData.coverImage,
      badge: newAccData.badge,
      gameCount: 1,
      includedGames: [
        {
          title: newAccData.game1Title || newAccData.title,
          genre: newAccData.game1Genre || 'Action',
          valueUSD: Number(newAccData.game1Value) || Number(newAccData.totalValueUSD) || 59.99
        }
      ],
      totalValueUSD: Number(newAccData.totalValueUSD) || 59.99,
      stock: Number(newAccData.stock) || 10,
      status: newAccData.status,
      lastVerified: 'Just now',
      description: newAccData.description,
      systemRequirements: newAccData.systemRequirements.trim() || undefined,
      credentials: {
        username: newAccData.username,
        passwordHash: newAccData.password,
        guardActive: newAccData.guardActive,
        guardCode: newAccData.guardCode,
        instructions: newAccData.instructions,
        cookieData: newAccData.cookieData
      },
      linkConfig: {
        enabled: newAccData.linkEnabled,
        customShortlinkUrl: newAccData.customShortlinkUrl.trim() || undefined,
        provider: newAccData.provider as any,
        timerSeconds: Number(newAccData.timerSeconds) || 8
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0e111a] border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/40 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950/40 via-[#141824] to-[#0e111a] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-gaming text-white">
                Add Game Account, Credentials & Link
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Fill in game details, login keys, and monetization shortlink in one place
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Pills */}
        <div className="px-5 py-2.5 bg-[#0a0c10] border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Quick Presets:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePreset('Steam')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px]"
            >
              Steam Preset
            </button>
            <button
              type="button"
              onClick={() => handlePreset('Xbox')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px]"
            >
              Xbox Preset
            </button>
            <button
              type="button"
              onClick={() => handlePreset('Cookies')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px]"
            >
              Cookies Preset
            </button>
          </div>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="px-5 pt-3 pb-0 bg-[#12151e] border-b border-slate-800 flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('game')}
            className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeSubTab === 'game'
                ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>1. Game Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('credentials')}
            className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeSubTab === 'credentials'
                ? 'border-blue-500 text-blue-300 bg-blue-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>2. Credentials & 2FA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('link')}
            className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeSubTab === 'link'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>3. Shortlink & Link Config</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
          {/* TAB 1: GAME DETAILS */}
          {activeSubTab === 'game' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Game / Account Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EA Sports FC 25 Ultimate Edition"
                  value={newAccData.title}
                  onChange={(e) => setNewAccData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white font-sans text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Platform</label>
                  <select
                    value={newAccData.platform}
                    onChange={(e) => setNewAccData((p) => ({ ...p, platform: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                  >
                    <option value="Steam">Steam</option>
                    <option value="Xbox">Xbox</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Account Tier</label>
                  <select
                    value={newAccData.accountType}
                    onChange={(e) => setNewAccData((p) => ({ ...p, accountType: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                  >
                    <option value="standard">Standard Free</option>
                    <option value="vip">VIP Exclusive Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Total USD Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAccData.totalValueUSD}
                    onChange={(e) => setNewAccData((p) => ({ ...p, totalValueUSD: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Vault Status</label>
                  <div className="px-3 py-2.5 rounded-xl bg-[#0c0e15] border border-slate-700 text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-xs">Available</span>
                  </div>
                </div>
              </div>

              <ImageUploadInput
                label="Account Cover Image / Taswira d l-compte"
                value={newAccData.coverImage}
                onChange={(newUrl) => setNewAccData((p) => ({ ...p, coverImage: newUrl }))}
                id="add-account-cover-upload"
              />

              <div>
                <label className="block text-slate-300 mb-1 font-semibold text-xs">Game Description</label>
                <textarea
                  rows={2}
                  value={newAccData.description}
                  onChange={(e) => setNewAccData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Game overview, lore or story notes..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white text-xs"
                />
                {isSteamRequirements(newAccData.description) && !newAccData.systemRequirements && (
                  <p className="mt-1 text-[11px] text-sky-400 flex items-center gap-1 font-mono">
                    <Monitor className="w-3.5 h-3.5 shrink-0" />
                    <span>💡 Steam System Requirements detected in description! It will automatically format like Steam.</span>
                  </p>
                )}
              </div>

              {/* Steam System Requirements (Copy & Paste directly from Steam) */}
              <div className="p-4 rounded-2xl bg-[#0a0f17] border border-[#1e2a38] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#172435] border border-[#2a475e] flex items-center justify-center">
                      <Monitor className="w-3.5 h-3.5 text-[#67c1f5]" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">
                        Steam System Requirements (Copier men Steam w 7etha hna)
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        Copy specs from Steam and paste here — auto formats MINIMUM & RECOMMENDED!
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const demoSpecs = `MINIMUM:
OS *: 64-bit Windows 7 / Windows 10
Processor: Intel Core i5-750, 2.66 GHz / AMD Phenom II X4 965, 3.4 GHz or AMD Ryzen™ 3 1200, 3.1 GHz
Memory: 8 GB RAM
Graphics: NVIDIA® GeForce™ GTX 670 or NVIDIA® GeForce™ GTX 1050 / AMD® Radeon™ HD 7950 or AMD® Radeon™ R9 270
DirectX: Version 11
Network: Broadband Internet connection
RECOMMENDED:
OS *: 64-bit Windows 7 / Windows 10
Processor: Intel Core i5-2300, 2.8 GHz / AMD FX-6300, 3.5GHz or AMD Ryzen™ 5 1400, 3.2 GHz
Memory: 8 GB RAM
Graphics: NVIDIA® GeForce™ GTX 780 or NVIDIA® GeForce™ GTX 1060-6GB / AMD® Radeon™ R9 290 or RX 570
DirectX: Version 11
Network: Broadband Internet connection
* Starting January 1st, 2024, the Steam Client will only support Windows 10 and later versions.`;
                        setNewAccData((p) => ({ ...p, systemRequirements: demoSpecs }));
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#172435] hover:bg-[#1f3148] text-[#67c1f5] border border-[#2a475e]/60 transition-colors"
                    >
                      Paste Sample
                    </button>
                    {newAccData.systemRequirements && (
                      <button
                        type="button"
                        onClick={() => setNewAccData((p) => ({ ...p, systemRequirements: '' }))}
                        className="text-[11px] font-mono text-zinc-400 hover:text-red-400"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={newAccData.systemRequirements}
                  onChange={(e) => setNewAccData((p) => ({ ...p, systemRequirements: e.target.value }))}
                  placeholder={`Paste directly from Steam, e.g.:\nMINIMUM:\nOS *: 64-bit Windows 10\nProcessor: Intel Core i5...\nMemory: 8 GB RAM\nRECOMMENDED:\nOS *: Windows 11...`}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#060a0f] border border-[#1e2a38] text-xs text-white font-mono placeholder:text-zinc-600 focus:border-[#67c1f5] outline-none"
                />

                {/* Live Steam Preview */}
                {newAccData.systemRequirements && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-[#67c1f5] block mb-2 font-semibold">
                      👀 Steam Live Preview (Visitor View):
                    </span>
                    <SteamSystemRequirements requirementsText={newAccData.systemRequirements} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS & 2FA */}
          {activeSubTab === 'credentials' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/30 text-blue-300 text-xs flex items-center gap-2">
                <Key className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Enter working login details for this game account.</span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Login Username / Email *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. steam_vault_gamer"
                  value={newAccData.username}
                  onChange={(e) => setNewAccData((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Login Password *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Password#2025!"
                  value={newAccData.password}
                  onChange={(e) => setNewAccData((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#0c0e15] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Steam Guard 2FA Code Generator</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewAccData((p) => ({ ...p, guardActive: !p.guardActive }))}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      newAccData.guardActive
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {newAccData.guardActive ? '2FA ACTIVE' : '2FA DISABLED'}
                  </button>
                </div>

                {newAccData.guardActive && (
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Live 2FA Guard Code:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newAccData.guardCode}
                        onChange={(e) => setNewAccData((p) => ({ ...p, guardCode: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#12151e] border border-purple-500/40 text-purple-300 font-bold tracking-widest text-center"
                      />
                      <button
                        type="button"
                        onClick={handleRegenerateCode}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300"
                        title="Regenerate random code"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {newAccData.platform === 'Cookies' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Cookie Session JSON (for Cookies)</label>
                  <textarea
                    rows={3}
                    value={newAccData.cookieData}
                    onChange={(e) => setNewAccData((p) => ({ ...p, cookieData: e.target.value }))}
                    placeholder='[{"domain": ".streaming.com", "name": "session", "value": "..."}]'
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white font-mono text-[11px]"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Instructions for Users</label>
                <textarea
                  rows={2}
                  value={newAccData.instructions}
                  onChange={(e) => setNewAccData((p) => ({ ...p, instructions: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SHORTLINK & LINK CONFIG */}
          {activeSubTab === 'link' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-emerald-300 text-xs flex items-center gap-2">
                <Link2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Set up monetized shortlinks to monetize claims for this game.</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0e15] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Shortlink Monetization Gate</div>
                  <div className="text-[11px] text-slate-400">
                    Require visitors to complete shortlink countdown for this game
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNewAccData((p) => ({ ...p, linkEnabled: !p.linkEnabled }))}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    newAccData.linkEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {newAccData.linkEnabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                  <span>{newAccData.linkEnabled ? 'GATE ACTIVE' : 'BYPASS (DIRECT)'}</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Custom Shortlink URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://gplinks.co/your-game-link (Leave empty for default)"
                  value={newAccData.customShortlinkUrl}
                  onChange={(e) => setNewAccData((p) => ({ ...p, customShortlinkUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Paste the exact monetized link from GPLinks / ShrinkMe / DropLink.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Provider Preset</label>
                  <select
                    value={newAccData.provider}
                    onChange={(e) => setNewAccData((p) => ({ ...p, provider: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                  >
                    <option value="global">Use Global Default Provider</option>
                    <option value="gplinks">GPLinks.co</option>
                    <option value="shrinkme">ShrinkMe.io</option>
                    <option value="droplink">DropLink.co</option>
                    <option value="custom">Custom Monetized Domain</option>
                    <option value="direct">Direct Instant Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    Countdown Wait: {newAccData.timerSeconds}s
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={newAccData.timerSeconds}
                    onChange={(e) => setNewAccData((p) => ({ ...p, timerSeconds: parseInt(e.target.value) || 8 }))}
                    className="w-full accent-emerald-500 mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Account & Publish to Store</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
