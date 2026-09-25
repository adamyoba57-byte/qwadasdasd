import React, { useState } from 'react';
import { GameAccount, Platform, AccountType } from '../types';
import { useApp } from '../context/AppContext';
import { ImageUploadInput } from './ImageUploadInput';
import {
  X,
  Save,
  Gamepad2,
  Key,
  Link2,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  ExternalLink,
  Monitor
} from 'lucide-react';
import { SteamSystemRequirements } from './SteamSystemRequirements';
import { isSteamRequirements } from '../utils/steamRequirementsParser';

interface EditAccountModalProps {
  account: GameAccount;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<GameAccount>) => void;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  account,
  isOpen,
  onClose,
  onSave
}) => {
  const { getAccountUnlockUrl } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'game' | 'credentials' | 'link'>('game');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: account.title,
    platform: account.platform,
    accountType: account.accountType,
    badge: account.badge,
    stock: account.stock,
    totalValueUSD: account.totalValueUSD,
    coverImage: account.coverImage,
    description: account.description,
    systemRequirements: account.systemRequirements || '',
    status: account.status,
    username: account.credentials.username,
    password: account.credentials.passwordHash,
    guardActive: account.credentials.guardActive,
    guardCode: account.credentials.guardCode || 'CK89P',
    instructions: account.credentials.instructions,
    cookieData: account.credentials.cookieData || '',
    linkEnabled: account.linkConfig?.enabled ?? true,
    customShortlinkUrl: account.linkConfig?.customShortlinkUrl || '',
    provider: account.linkConfig?.provider || 'global',
    timerSeconds: account.linkConfig?.timerSeconds ?? 8
  });

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegenerateCode = () => {
    const chars = '23456789BCDFGHJKMNPQRTVWXYZ';
    let newCode = '';
    for (let i = 0; i < 5; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, guardCode: newCode }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      platform: formData.platform,
      accountType: formData.accountType,
      badge: formData.badge,
      totalValueUSD: Number(formData.totalValueUSD) || 0,
      coverImage: formData.coverImage,
      description: formData.description,
      systemRequirements: formData.systemRequirements.trim() || undefined,
      status: 'active',
      stock: 999,
      credentials: {
        username: formData.username,
        passwordHash: formData.password,
        guardActive: formData.guardActive,
        guardCode: formData.guardCode,
        instructions: formData.instructions,
        cookieData: formData.cookieData
      },
      linkConfig: {
        enabled: formData.linkEnabled,
        customShortlinkUrl: formData.customShortlinkUrl.trim() || undefined,
        provider: formData.provider as any,
        timerSeconds: Number(formData.timerSeconds) || 8
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0e111a] border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/40 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950/40 via-[#141824] to-[#0e111a] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-gaming text-white">
                Edit Game, Credentials & Link Config
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                ID: {account.id} • {account.title}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
          {/* SUBTAB 1: GAME INFO */}
          {activeSubTab === 'game' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Game / Account Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white font-sans text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData((p) => ({ ...p, platform: e.target.value as any }))}
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
                    value={formData.accountType}
                    onChange={(e) => setFormData((p) => ({ ...p, accountType: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                  >
                    <option value="standard">Standard Free Access</option>
                    <option value="vip">VIP Exclusive Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Total Value ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalValueUSD}
                    onChange={(e) => setFormData((p) => ({ ...p, totalValueUSD: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Status</label>
                  <div className="px-3 py-2.5 rounded-xl bg-[#0c0e15] border border-slate-700 text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-xs">Available (Always Online)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Badge Label</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData((p) => ({ ...p, badge: e.target.value }))}
                  placeholder="e.g. Steam Key / Full Library"
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                />
              </div>

              <ImageUploadInput
                label="Account Cover Image / Taswira d l-compte"
                value={formData.coverImage}
                onChange={(newUrl) => setFormData((p) => ({ ...p, coverImage: newUrl }))}
                id="edit-account-cover-upload"
              />

              <div>
                <label className="block text-slate-300 mb-1 font-semibold text-xs">Game Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Game overview, lore or story notes..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white text-xs"
                />
                {isSteamRequirements(formData.description) && !formData.systemRequirements && (
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
                        const mk11Demo = `MINIMUM:
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
                        setFormData((p) => ({ ...p, systemRequirements: mk11Demo }));
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#172435] hover:bg-[#1f3148] text-[#67c1f5] border border-[#2a475e]/60 transition-colors"
                    >
                      Paste MK11 Sample
                    </button>
                    {formData.systemRequirements && (
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, systemRequirements: '' }))}
                        className="text-[11px] font-mono text-zinc-400 hover:text-red-400"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={formData.systemRequirements}
                  onChange={(e) => setFormData((p) => ({ ...p, systemRequirements: e.target.value }))}
                  placeholder={`Paste directly from Steam, e.g.:\nMINIMUM:\nOS *: 64-bit Windows 10\nProcessor: Intel Core i5...\nMemory: 8 GB RAM\nRECOMMENDED:\nOS *: Windows 11...`}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#060a0f] border border-[#1e2a38] text-xs text-white font-mono placeholder:text-zinc-600 focus:border-[#67c1f5] outline-none"
                />

                {/* Live Steam Preview */}
                {formData.systemRequirements && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-[#67c1f5] block mb-2 font-semibold">
                      👀 Steam Live Preview (كيفاش كيبان للزائر):
                    </span>
                    <SteamSystemRequirements requirementsText={formData.systemRequirements} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBTAB 2: CREDENTIALS & 2FA */}
          {activeSubTab === 'credentials' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/30 text-blue-300 text-xs flex items-center gap-2">
                <Key className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Credentials will be revealed to verified users upon claiming this game.</span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Login Username / Account Email</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.username, 'user')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copy Username"
                  >
                    {copiedField === 'user' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Account Password</label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.password, 'pass')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copy Password"
                  >
                    {copiedField === 'pass' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {formData.platform === 'Cookies' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Cookie Session JSON / Tokens</label>
                  <textarea
                    rows={3}
                    value={formData.cookieData}
                    onChange={(e) => setFormData((p) => ({ ...p, cookieData: e.target.value }))}
                    placeholder='[{"domain": ".crunchyroll.com", "name": "session_id", "value": "..."}]'
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white font-mono text-[11px]"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Login Instructions for User</label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData((p) => ({ ...p, instructions: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                />
              </div>
            </div>
          )}

          {/* SUBTAB 3: SHORTLINK & MONETIZATION (2-STEP CUTT.LY SETUP) */}
          {activeSubTab === 'link' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-emerald-300 text-xs flex items-center gap-2">
                <Link2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Configure the Cutt.ly monetization gate & unlock link for this game.</span>
              </div>

              {/* Toggle Shortlink Active for this game */}
              <div className="p-4 rounded-xl bg-[#0c0e15] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Shortlink Monetization Gate</div>
                  <div className="text-[11px] text-slate-400">
                    Require users to pass through Cutt.ly to unlock credentials.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, linkEnabled: !p.linkEnabled }))}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    formData.linkEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {formData.linkEnabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                  <span>{formData.linkEnabled ? 'GATE ACTIVE' : 'BYPASS (DIRECT)'}</span>
                </button>
              </div>

              {/* STEP 1: SECRET UNLOCK LINK (Destination to put in Cutt.ly) */}
              <div className="p-3.5 rounded-xl bg-[#0c0e15] border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 font-gaming">
                    <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Rabit ta3 User & Password (Secret Destination Link)</span>
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono">Paste in Cutt.ly</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Nsakh had l-lien o 7etto f Cutt.ly bach y-khtasro (Copy and paste this unlock link into Cutt.ly):
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-xl bg-[#151824] border border-purple-500/30 text-purple-200 text-xs font-mono truncate select-all">
                    {getAccountUnlockUrl(account.id)}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getAccountUnlockUrl(account.id));
                      setCopiedField('unlockUrl');
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-gaming flex items-center gap-1.5 transition-all shrink-0"
                  >
                    {copiedField === 'unlockUrl' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Nsakh Rabit
                      </>
                    )}
                  </button>
                  <a
                    href="https://cutt.ly"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-gaming flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Fte7 Cutt.ly
                  </a>
                </div>
              </div>

              {/* STEP 2: CUTT.LY SHORTENED LINK */}
              <div className="p-3.5 rounded-xl bg-[#0c0e15] border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-gaming">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Rabit Mokhtasar mn Cutt.ly (Shortlink for 'Get Account')</span>
                  </span>
                  {formData.customShortlinkUrl && (
                    <a
                      href={formData.customShortlinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Test Link
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Mli t-khtaser l-lien f Cutt.ly, jibo o 7etto hna (Paste your shortened Cutt.ly link here):
                </p>
                <input
                  type="text"
                  placeholder="https://cutt.ly/your-game-key"
                  value={formData.customShortlinkUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, customShortlinkUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#151824] border border-emerald-500/30 focus:border-emerald-400 text-emerald-300 text-xs font-mono focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Provider Preset</label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData((p) => ({ ...p, provider: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white text-xs font-mono"
                  >
                    <option value="cutly">Cutt.ly (Default)</option>
                    <option value="global">Global Default Provider</option>
                    <option value="gplinks">GPLinks.co</option>
                    <option value="shrinkme">ShrinkMe.io</option>
                    <option value="droplink">DropLink.co</option>
                    <option value="custom">Custom Monetized Domain</option>
                    <option value="direct">Direct Instant Claim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    Countdown Timer: {formData.timerSeconds}s
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={formData.timerSeconds}
                    onChange={(e) => setFormData((p) => ({ ...p, timerSeconds: parseInt(e.target.value) || 8 }))}
                    className="w-full accent-emerald-500 mt-2"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-[#0c0e15] p-2.5 rounded-xl border border-slate-800 leading-relaxed font-mono">
                <span className="text-amber-400 font-bold">💡 Note:</span> L-user 9bel myakhod l-account, khas howa lwel ikhtaser rabit f Cutt.ly bach yakhod user o password!
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Game, Credentials & Link</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
