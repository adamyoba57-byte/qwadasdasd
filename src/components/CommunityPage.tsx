import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  PlusCircle,
  ShieldCheck,
  Search,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Gamepad2,
  Sparkles,
  X,
  LogIn,
  Upload,
  Camera,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Clock,
  CheckCircle2,
  Hourglass
} from 'lucide-react';
import { Platform, CommunityAccount } from '../types';
import {
  checkTextSafety,
  checkImageSafety,
  VERIFIED_GAME_COVERS
} from '../lib/safetyFilter';
import { processImageFile } from './ImageUploadInput';

export const CommunityPage: React.FC = () => {
  const {
    communityAccounts,
    addCommunityAccount,
    deleteCommunityAccount,
    claimCommunityAccount,
    currentMember,
    isAdminAuthenticated,
    openAuthModal
  } = useApp();

  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeAccountToView, setActiveAccountToView] = useState<CommunityAccount | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 10-Second Wait & Unlock State for GET ACCOUNT
  const [unlockCountdown, setUnlockCountdown] = useState<number>(10);
  const [isAccountUnlocked, setIsAccountUnlocked] = useState<boolean>(false);
  const [unlockedAccountIds, setUnlockedAccountIds] = useState<Record<string, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup countdown timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle GET ACCOUNT with mandatory 10s wait
  const handleGetAccount = (account: CommunityAccount) => {
    setActiveAccountToView(account);
    setCopiedField(null);

    // If this account was already unlocked in current session, access immediately
    if (unlockedAccountIds[account.id]) {
      setIsAccountUnlocked(true);
      setUnlockCountdown(0);
      return;
    }

    // Otherwise initiate strict 10-second countdown
    setIsAccountUnlocked(false);
    setUnlockCountdown(10);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    let remaining = 10;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setUnlockCountdown(remaining);

      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setIsAccountUnlocked(true);
        setUnlockedAccountIds((prev) => ({ ...prev, [account.id]: true }));
        claimCommunityAccount(account.id);
      }
    }, 1000);
  };

  const handleCloseViewModal = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setActiveAccountToView(null);
  };

  // Form State for Sharing
  const [guestAuthorName, setGuestAuthorName] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const [platform, setPlatform] = useState<Platform>('Steam');
  const [accountUser, setAccountUser] = useState('');
  const [accountPass, setAccountPass] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCoverPreset, setSelectedCoverPreset] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle Image File Upload (Device file upload, drag-and-drop, supports all photo formats)
  const handleImageFile = async (file: File) => {
    setFormError(null);
    setIsProcessingImage(true);

    try {
      if (!file) return;

      // 1. Text & File Name screening for prohibited words
      const nameCheck = checkTextSafety(file.name);
      if (!nameCheck.isSafe) {
        throw new Error(nameCheck.reason || 'Prohibited file name detected.');
      }

      // 2. Read, format and compress photo to high-resolution JPEG Data URL
      const dataUrl = await processImageFile(file);

      // 3. Verify safety filter
      const safety = checkImageSafety(dataUrl);
      if (!safety.isSafe) {
        throw new Error(safety.reason || 'Image content rejected (+18 / NSFW).');
      }

      setImageUrl(dataUrl);
      setSelectedCoverPreset('');
    } catch (err: any) {
      setFormError(`Image upload error: ${err.message || 'Failed to process selected file.'}`);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return communityAccounts.filter((acc) => {
      const matchesPlatform = selectedPlatform === 'All' || acc.platform === selectedPlatform;
      const matchesSearch =
        acc.gameTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.submittedBy.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [communityAccounts, selectedPlatform, searchQuery]);

  // Handle Share Submission with Strict Safety Filter
  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalAuthorName = (currentMember?.username || guestAuthorName).trim();
    if (!finalAuthorName) {
      setFormError('Please enter your gamer nickname / username.');
      return;
    }

    if (!gameTitle.trim() || !accountUser.trim() || !accountPass.trim()) {
      setFormError('Please fill in game title, username, and password.');
      return;
    }

    const finalImage = imageUrl.trim() || selectedCoverPreset || VERIFIED_GAME_COVERS[0].url;

    // 1. Text safety check (Author, Titles, usernames, notes)
    const authorSafety = checkTextSafety(finalAuthorName);
    if (!authorSafety.isSafe) {
      setFormError(`Nickname rejected: ${authorSafety.reason}`);
      return;
    }

    const titleSafety = checkTextSafety(gameTitle);
    if (!titleSafety.isSafe) {
      setFormError(`Title rejected: ${titleSafety.reason}`);
      return;
    }

    const notesSafety = checkTextSafety(notes);
    if (!notesSafety.isSafe) {
      setFormError(`Notes rejected: ${notesSafety.reason}`);
      return;
    }

    const userSafety = checkTextSafety(accountUser);
    if (!userSafety.isSafe) {
      setFormError(`Username rejected: ${userSafety.reason}`);
      return;
    }

    // 2. Image safety check (Anti-NSFW / Adult URL filter)
    const imageSafety = checkImageSafety(finalImage);
    if (!imageSafety.isSafe) {
      setFormError(`Image rejected (+18 / NSFW prohibited): ${imageSafety.reason}`);
      return;
    }

    // Submission
    addCommunityAccount({
      gameTitle: gameTitle.trim(),
      platform: platform,
      coverImage: finalImage,
      imageUrl: finalImage,
      username: accountUser.trim(),
      password: accountPass.trim(),
      instructions: notes.trim() || 'Offline mode recommended after downloading game files.',
      notes: notes.trim() || 'Offline mode recommended after downloading game files.',
      submittedBy: {
        userId: currentMember?.id || `usr-${Date.now()}`,
        username: finalAuthorName,
        avatar: currentMember?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalAuthorName)}`,
        authProvider: currentMember ? (currentMember.provider || 'discord') : 'guest',
        discordTag: currentMember?.discordTag
      },
      isVerified: true
    });

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setIsShareModalOpen(false);
      // Reset form
      setGameTitle('');
      setAccountUser('');
      setAccountPass('');
      setImageUrl('');
      setSelectedCoverPreset('');
      setNotes('');
      setGuestAuthorName('');
    }, 1500);
  };

  const activeCoverDisplay = imageUrl || selectedCoverPreset || '';

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 pb-20 pt-6 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Hero Header Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#141622] via-[#0d0f17] to-[#07080b] border border-white/10 p-6 sm:p-10 mb-8 overflow-hidden shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Community Hub • Verified Gaming Drops</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Community Shared Drops
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              EasyAcss community members can share their gaming accounts so fellow gamers can enjoy them in offline mode. All shared drops are actively protected with automated +18 and NSFW safety screening.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Anti-NSFW (+18) Screening Active</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-300">
                <Gamepad2 className="w-4 h-4 text-purple-400" />
                <span>{communityAccounts.length} Drops Available</span>
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              id="btn-open-share-modal"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Share an Account</span>
            </button>

            {!currentMember && (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-purple-400" />
                <span>Member Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#0c0e14] p-3 rounded-2xl border border-white/[0.06]">
        {/* Platform Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {['All', 'Steam', 'Epic Games', 'EA App', 'Ubisoft', 'Battle.net', 'Rockstar', 'Xbox', 'PlayStation', 'Others'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPlatform(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search game, account or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#12141c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      {/* Grid of Community Accounts */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-[#0e1017]/60 border border-white/5 p-8">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300 mb-1">No community drops found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            No accounts match your current filter. Be the first to share a game drop with the community!
          </p>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Share an Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className="group rounded-2xl bg-[#0e1017] border border-white/[0.08] hover:border-purple-500/50 transition-all duration-300 overflow-hidden flex flex-col shadow-lg hover:shadow-2xl hover:shadow-purple-950/20"
            >
              {/* Game Cover Poster */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
                <img
                  src={account.coverImage || account.imageUrl}
                  alt={account.gameTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-transparent to-black/40" />

                {/* Platform Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white uppercase">
                  <span>{account.platform}</span>
                </div>

                {/* Safe Shield Verified Badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Safe</span>
                </div>

                {/* Submitted by pill */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                    <img
                      src={account.submittedBy.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'}
                      alt={account.submittedBy.username}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-[120px]">
                      @{account.submittedBy.username}
                    </span>
                    {account.submittedBy.discordTag && (
                      <span className="text-[9px] text-[#5865F2] font-mono font-bold">
                        {account.submittedBy.discordTag}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                    {account.submittedAt}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1">
                    {account.gameTitle}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {account.instructions || account.notes}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-purple-300 border border-purple-500/20">
                      {account.platform}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isAdminAuthenticated && (
                      <button
                        type="button"
                        onClick={() => deleteCommunityAccount(account.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                        title="Delete (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleGetAccount(account)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20 cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>GET ACCOUNT</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Account Details / Credentials Modal with 10-Second Wait */}
      {activeAccountToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#0f1118] border border-white/10 p-6 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={handleCloseViewModal}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <img
                src={activeAccountToView.coverImage || activeAccountToView.imageUrl}
                alt={activeAccountToView.gameTitle}
                className="w-16 h-16 rounded-xl object-cover border border-white/10"
              />
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase mb-1">
                  {activeAccountToView.platform}
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  {activeAccountToView.gameTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  Shared by @{activeAccountToView.submittedBy.username}
                </p>
              </div>
            </div>

            {/* 10-Second Countdown Wait Screen */}
            {!isAccountUnlocked ? (
              <div className="py-4 px-2 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center mx-auto shadow-xl shadow-purple-950/50">
                  <Clock className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold mb-2">
                    <Hourglass className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                    <span>PREPARING CREDENTIALS</span>
                  </div>
                  <h4 className="text-xl font-black text-white">
                    Please wait 10 seconds
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Verifying drop and decrypting community access credentials. Please do not close.
                  </p>
                </div>

                {/* Big Countdown Number */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 drop-shadow">
                    {unlockCountdown}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3">
                    seconds
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10 max-w-sm mx-auto">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((10 - unlockCountdown) / 10) * 100}%` }}
                  />
                </div>

                {/* Locked Preview placeholders */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-left space-y-2 max-w-sm mx-auto">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Username:</span>
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>••••••••••••</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Password:</span>
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>••••••••••••</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              /* Unlocked Content */
              <div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 mb-4 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Account Unlocked! Login credentials are now available below:</span>
                </div>

                {/* Warning rules */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5 mb-5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Golden Gaming Rule:</span>
                    Never modify credentials, email, or password. Switch your game launcher to « Offline Mode » immediately after downloading so all community members can play without disconnects.
                  </div>
                </div>

                {/* Credentials Boxes */}
                <div className="space-y-3 font-mono text-xs mb-5">
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block mb-0.5">Username / Login</span>
                      <span className="font-bold text-white text-sm select-all">{activeAccountToView.username}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeAccountToView.username, 'user')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-all cursor-pointer font-sans text-xs font-bold"
                    >
                      {copiedField === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'user' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block mb-0.5">Password</span>
                      <span className="font-bold text-white text-sm select-all">{activeAccountToView.password}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeAccountToView.password, 'pass')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-all cursor-pointer font-sans text-xs font-bold"
                    >
                      {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'pass' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {(activeAccountToView.instructions || activeAccountToView.notes) && (
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 font-sans">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Author's Instructions:</span>
                      <p className="text-xs text-slate-300">{activeAccountToView.instructions || activeAccountToView.notes}</p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Account Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-[#0f1118] border border-white/10 p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold w-fit mb-3">
              <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Community Drop Submission</span>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-1">
              Share an Account with the Community
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Fill in the account details. Our automated safety filter actively screens and blocks inappropriate or +18 / adult content.
            </p>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 mb-4">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 mb-4">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Account dropped successfully! It is now live for the community.</span>
              </div>
            )}

            <form onSubmit={handleShareSubmit} className="space-y-4 text-xs">
              {/* Publisher Identity */}
              {currentMember ? (
                <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentMember.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'}
                      alt={currentMember.username}
                      className="w-8 h-8 rounded-full border border-purple-400 object-cover"
                    />
                    <div>
                      <span className="text-white font-bold text-xs block">Publishing as @{currentMember.username}</span>
                      <span className="text-[10px] text-purple-300 font-mono">Verified Member</span>
                    </div>
                  </div>
                  <div className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Logged In
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 uppercase tracking-wider font-bold text-[11px]">
                      Your Nickname / Gamer Tag *
                    </label>
                    <span className="text-[10px] text-purple-400 font-medium">No login required</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ShadowGamer, ProPlayer, CyberGhost..."
                    value={guestAuthorName}
                    onChange={(e) => setGuestAuthorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all text-xs"
                  />
                  <p className="text-[11px] text-slate-400 pt-1">
                    Your nickname will be displayed on the public game drop card.
                  </p>
                </div>
              )}

              {/* Game Title */}
              <div>
                <label className="block text-slate-400 uppercase tracking-wider font-bold mb-1.5 text-[11px]">
                  Game Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk 2077, Black Myth: Wukong, FC 24..."
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all text-xs"
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-slate-400 uppercase tracking-wider font-bold mb-1.5 text-[11px]">
                  Platform *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['Steam', 'Epic Games', 'EA App', 'Ubisoft', 'Battle.net', 'Rockstar'] as Platform[]).map((plt) => (
                    <button
                      key={plt}
                      type="button"
                      onClick={() => setPlatform(plt)}
                      className={`py-2 px-1 rounded-xl text-center font-bold text-[11px] transition-all cursor-pointer ${
                        platform === plt
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {plt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase tracking-wider font-bold mb-1.5 text-[11px]">
                    Username / Login *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="account_username"
                    value={accountUser}
                    onChange={(e) => setAccountUser(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase tracking-wider font-bold mb-1.5 text-[11px]">
                    Password *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SecretPass123"
                    value={accountPass}
                    onChange={(e) => setAccountPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all text-xs font-mono"
                  />
                </div>
              </div>

              {/* COVER IMAGE: Direct Device Upload + Drag & Drop + Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-400 uppercase tracking-wider font-bold text-[11px]">
                    Cover Picture (Upload Photo or Pick Preset) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showUrlInput ? 'Hide URL link' : 'Paste web link instead'}</span>
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  id="community-file-input"
                  type="file"
                  accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.bmp,.jfif"
                  onChange={onFileInputChange}
                  className="hidden"
                />

                {/* Drag & Drop / Upload Card */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`p-3.5 rounded-2xl border-2 transition-all ${
                    isDragging
                      ? 'border-purple-400 bg-purple-950/40 shadow-lg shadow-purple-900/30'
                      : 'border-dashed border-slate-700 hover:border-purple-500/60 bg-black/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-3.5">
                    {/* Thumbnail Preview */}
                    <div className="relative group shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-md">
                      {activeCoverDisplay ? (
                        <img
                          src={activeCoverDisplay}
                          alt="Cover preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-[9px]">No photo</span>
                        </div>
                      )}

                      {activeCoverDisplay && (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                        >
                          <Camera className="w-4 h-4 mb-0.5 text-purple-400" />
                          <span className="text-[8px] font-bold uppercase">Change</span>
                        </div>
                      )}
                    </div>

                    {/* Upload button & Quick Samples */}
                    <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          id="btn-upload-cover"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessingImage}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                        >
                          {isProcessingImage ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>Upload Image from Device</span>
                        </button>

                        {activeCoverDisplay && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setSelectedCoverPreset('');
                            }}
                            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 hover:border-rose-800 border border-slate-700 text-slate-400 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Drag & drop your picture here, or click <strong className="text-purple-300">Upload Image</strong> (JPG, PNG, WebP supported).
                      </p>

                      {/* Quick Verified Presets */}
                      <div className="pt-1">
                        <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>Or pick a popular game cover:</span>
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                          {VERIFIED_GAME_COVERS.slice(0, 6).map((preset) => (
                            <button
                              key={preset.title}
                              type="button"
                              onClick={() => {
                                setSelectedCoverPreset(preset.url);
                                setImageUrl('');
                              }}
                              className={`relative rounded-lg overflow-hidden aspect-[16/10] border transition-all cursor-pointer ${
                                selectedCoverPreset === preset.url && !imageUrl
                                  ? 'border-purple-400 ring-2 ring-purple-500/50 scale-105'
                                  : 'border-white/10 opacity-70 hover:opacity-100'
                              }`}
                              title={preset.title}
                            >
                              <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Web URL Input */}
                {showUrlInput && (
                  <div className="p-3 rounded-xl bg-black/50 border border-slate-800 space-y-1">
                    <label className="block text-[11px] text-slate-400 font-medium">Direct Image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (e.target.value) setSelectedCoverPreset('');
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141824] border border-slate-700 text-white text-xs outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Only video game covers are permitted. Explicit, adult, or +18 content will be automatically rejected.</span>
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-400 uppercase tracking-wider font-bold mb-1.5 text-[11px]">
                  Instructions / Notes for Players
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Switch Steam to offline mode immediately after login, do not change login..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-community-drop"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Community Drop</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
