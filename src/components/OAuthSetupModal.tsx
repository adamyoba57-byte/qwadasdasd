import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const OAuthSetupModal: React.FC = () => {
  const {
    isOAuthSetupModalOpen,
    setIsOAuthSetupModalOpen,
    activeOAuthSetupProvider,
    oauthStatus,
    saveOAuthConfig,
    loginWithDiscord,
    loginWithGoogle
  } = useApp();

  const [provider, setProvider] = useState<'discord' | 'google'>('discord');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (activeOAuthSetupProvider) {
      setProvider(activeOAuthSetupProvider);
    }
  }, [activeOAuthSetupProvider, isOAuthSetupModalOpen]);

  // Load existing configured masked values when modal opens
  useEffect(() => {
    if (isOAuthSetupModalOpen) {
      fetch('/api/auth/config')
        .then((r) => r.json())
        .then((data) => {
          if (provider === 'discord') {
            setClientId(data.discordClientId || '');
            setClientSecret(data.discordClientSecret || '');
          } else {
            setClientId(data.googleClientId || '');
            setClientSecret(data.googleClientSecret || '');
          }
        })
        .catch(console.warn);
    }
  }, [isOAuthSetupModalOpen, provider]);

  if (!isOAuthSetupModalOpen) return null;

  const isDiscord = provider === 'discord';
  const devRedirectUri = isDiscord
    ? (oauthStatus?.redirectUris?.discord?.dev || 'https://ais-dev-zrwqmxq6pzy7gmjz3dgfm3-818357937668.europe-west2.run.app/auth/discord/callback')
    : (oauthStatus?.redirectUris?.google?.dev || 'https://ais-dev-zrwqmxq6pzy7gmjz3dgfm3-818357937668.europe-west2.run.app/auth/google/callback');

  const sharedRedirectUri = isDiscord
    ? (oauthStatus?.redirectUris?.discord?.shared || 'https://ais-pre-zrwqmxq6pzy7gmjz3dgfm3-818357937668.europe-west2.run.app/auth/discord/callback')
    : (oauthStatus?.redirectUris?.google?.shared || 'https://ais-pre-zrwqmxq6pzy7gmjz3dgfm3-818357937668.europe-west2.run.app/auth/google/callback');

  const developerPortalUrl = isDiscord
    ? 'https://discord.com/developers/applications'
    : 'https://console.cloud.google.com/apis/credentials';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAndLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) {
      setStatusMsg({ type: 'error', text: 'Veuillez renseigner le Client ID et le Client Secret.' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    const payload = isDiscord
      ? { discordClientId: clientId.trim(), discordClientSecret: clientSecret.trim() }
      : { googleClientId: clientId.trim(), googleClientSecret: clientSecret.trim() };

    const res = await saveOAuthConfig(payload);
    setSaving(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Identifiants ${isDiscord ? 'Discord' : 'Google'} enregistrés avec succès ! Ouverture du pop-up...` });
      setTimeout(() => {
        setIsOAuthSetupModalOpen(false);
        if (isDiscord) {
          loginWithDiscord();
        } else {
          loginWithGoogle();
        }
      }, 700);
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Erreur lors de la sauvegarde.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0e0e12] border border-zinc-800 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsOAuthSetupModalOpen(false);
            setStatusMsg(null);
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
            isDiscord ? 'bg-[#5865F2]/20 border-[#5865F2]/40 text-[#5865F2]' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          }`}>
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-gaming flex items-center gap-2">
              <span>Configuration Connexion Réelle</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {isDiscord ? 'Discord OAuth2' : 'Google OAuth2'}
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Activez la vraie connexion pour permettre aux membres d'utiliser leur vrai compte {isDiscord ? 'Discord' : 'Google'}.
            </p>
          </div>
        </div>

        {/* Provider Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setProvider('discord');
              setStatusMsg(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isDiscord
                ? 'bg-[#5865F2] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>Discord</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setProvider('google');
              setStatusMsg(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              !isDiscord
                ? 'bg-zinc-100 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 mb-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Étape 1 : Obtenez vos clés API gratuites
            </span>
            <a
              href={developerPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 underline"
            >
              <span>{isDiscord ? 'Discord Developer Portal' : 'Google Cloud Console'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <span className="font-bold text-zinc-200 block mb-1">
              Étape 2 : Ajoutez ces URLs de redirection (Redirect URIs) dans votre App :
            </span>
            <div className="space-y-2 font-mono text-[11px]">
              {/* Development URL */}
              <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800 flex items-center justify-between gap-2">
                <div className="truncate text-zinc-300">
                  <span className="text-zinc-500 mr-2 text-[10px] uppercase">Dev:</span>
                  <span>{devRedirectUri}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(devRedirectUri, 'dev')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'dev' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'dev' ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              {/* Shared / Production URL */}
              <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800 flex items-center justify-between gap-2">
                <div className="truncate text-zinc-300">
                  <span className="text-zinc-500 mr-2 text-[10px] uppercase">Prod:</span>
                  <span>{sharedRedirectUri}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sharedRedirectUri, 'prod')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'prod' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'prod' ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMsg && (
          <div className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
          }`}>
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSaveAndLaunch} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-zinc-400 uppercase font-mono tracking-wider text-[11px] mb-1">
              {isDiscord ? 'Discord Client ID' : 'Google Client ID'} *
            </label>
            <input
              type="text"
              required
              placeholder={isDiscord ? 'e.g. 1289304918239012' : 'e.g. 104928374829-xxx.apps.googleusercontent.com'}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-purple-500 text-white outline-none font-mono text-xs transition-all"
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase font-mono tracking-wider text-[11px] mb-1">
              {isDiscord ? 'Discord Client Secret' : 'Google Client Secret'} *
            </label>
            <input
              type="password"
              required
              placeholder={isDiscord ? 'e.g. a7B9dE... (from Discord OAuth2 tab)' : 'e.g. GOCSPX-... (from Google Cloud)'}
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-purple-500 text-white outline-none font-mono text-xs transition-all"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                isDiscord
                  ? 'bg-[#5865F2] hover:bg-[#4752c4] shadow-[#5865f2]/25'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enregistrer & Lancer la Connexion Réelle</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsOAuthSetupModalOpen(false)}
              className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
