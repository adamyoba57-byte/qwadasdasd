import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  PlayCircle,
  FileText,
  BookOpen,
  Bell,
  LogIn,
  Search,
  X,
  Shield,
  ChevronDown,
  LogOut,
  Users
} from 'lucide-react';
import { RulesModal, GuidesModal } from './InfoModals';
import { EasyAcssLogo } from './EasyAcssLogo';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    setSelectedPlatform,
    currentMember,
    logoutMember,
    isAdminAuthenticated,
    logoutAdmin,
    openAuthModal,
    siteContent
  } = useApp();

  const [activeTab, setActiveTab] = useState<'HOME' | 'FREE' | 'COMMUNITY' | 'RULES' | 'GUIDES'>('FREE');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isGuidesOpen, setIsGuidesOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Admin access detection: verified if authenticated admin or member is adam / admin
  const isCurrentAdmin = Boolean(
    isAdminAuthenticated ||
    currentMember?.role === 'admin' ||
    currentMember?.username?.toLowerCase() === 'adam' ||
    currentMember?.username?.toLowerCase() === 'admin' ||
    currentMember?.email?.toLowerCase().includes('adam')
  );

  const notifications = [
    { id: 1, title: 'Restock: Baldur\'s Gate 3', time: '10m ago', unread: true },
    { id: 2, title: 'Added: Black Myth Wukong Deluxe', time: '25m ago', unread: true },
    { id: 3, title: 'Updated: Cyberpunk 2077 Phantom Liberty', time: '1h ago', unread: true },
    { id: 4, title: 'Added: The Invincible (Day 1)', time: '2h ago', unread: true },
    { id: 5, title: 'Server maintenance completed: 100% online', time: '3h ago', unread: false },
    { id: 6, title: 'New 2FA Instant Code Dispatch active', time: '5h ago', unread: false },
    { id: 7, title: 'Welcome to EasyAcss Game Vault!', time: '1d ago', unread: false }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#08090d]/95 border-b border-white/[0.08] backdrop-blur-md shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo on Left: EasyAcss Logo */}
            <div
              onClick={() => {
                setActiveTab('HOME');
                setCurrentView('catalog');
                setSelectedPlatform('All');
                setSearchQuery('');
              }}
              className="cursor-pointer group shrink-0"
              title="EasyAcss Gaming Vault"
            >
              <EasyAcssLogo size="md" showSubtitle />
            </div>

            {/* Center Navigation Links: HOME, FREE, RULES, GUIDES */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {/* HOME */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('HOME');
                  setCurrentView('home');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  currentView === 'home'
                    ? 'text-white border border-purple-500/50 bg-purple-950/30 shadow-sm shadow-purple-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>HOME</span>
              </button>

              {/* FREE (Catalog) */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('FREE');
                  setCurrentView('free');
                  setSelectedPlatform('All');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  currentView === 'free' || currentView === 'catalog'
                    ? 'text-white border border-purple-500 bg-purple-950/40 shadow-sm shadow-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>FREE</span>
              </button>

              {/* COMMUNITY (User Shared Drops) */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('COMMUNITY');
                  setCurrentView('community');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  currentView === 'community'
                    ? 'text-white border border-purple-500 bg-purple-950/40 shadow-sm shadow-purple-500/30 font-extrabold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>COMMUNITY</span>
              </button>

              {/* RULES */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('RULES');
                  setCurrentView('rules');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  currentView === 'rules'
                    ? 'text-white border border-purple-500/50 bg-purple-950/30 shadow-sm shadow-purple-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>RULES</span>
              </button>

              {/* GUIDES */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('GUIDES');
                  setIsGuidesOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isGuidesOpen
                    ? 'text-white border border-purple-500/50 bg-purple-950/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>GUIDES</span>
              </button>
            </nav>

            {/* Right Action Menu: Socials, Search, Notifications, Login */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Discord Button (Blue) - Dynamically editable from Admin Panel */}
              <a
                href={siteContent.discordUrl || 'https://discord.gg/easyacss'}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-[11px] font-bold tracking-wide transition-all shadow-md shadow-[#5865f2]/20 cursor-pointer"
                title="Join our Discord Server"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Discord</span>
              </a>

              {/* YouTube Button (Red) - Dynamically editable from Admin Panel */}
              <a
                href={siteContent.youtubeUrl || 'https://youtube.com/@easyacss'}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white text-[11px] font-bold tracking-wide transition-all shadow-md shadow-red-600/20 cursor-pointer"
                title="Subscribe on YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube</span>
              </a>
              {/* Search Toggle / Input */}
              <div className="relative">
                {isSearchOpen ? (
                  <div className="flex items-center gap-1 bg-[#121520] border border-white/10 rounded-xl px-2.5 py-1">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-36 sm:w-48 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="Search games"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Notification Bell with Purple Badge (showing '7' like screenshot) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center shadow-md">
                    7
                  </span>
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0e1118] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                          Restock Notifications
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        7 New
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2 rounded-xl text-xs flex items-start justify-between gap-2 transition-colors ${
                            n.unread
                              ? 'bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/20'
                              : 'bg-white/[0.02] hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <p className="text-white font-medium text-[11px]">{n.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                          </div>
                          {n.unread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Panel Button - Visible when admin is authenticated (adam / admin / role admin) */}
              {isCurrentAdmin && (
                <button
                  id="navbar-admin-btn"
                  type="button"
                  onClick={() => setCurrentView('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
                    currentView === 'admin'
                      ? 'text-white bg-purple-600 border border-purple-400/50 shadow-purple-600/30'
                      : 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 hover:bg-emerald-900/80 hover:text-emerald-300'
                  }`}
                  title="Admin Panel"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-gaming">Admin Panel</span>
                </button>
              )}

              {/* Purple LOGIN Pill Button matching screenshot (or User Avatar if logged in) */}
              {currentMember ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl bg-purple-900/40 border border-purple-500/40 hover:bg-purple-900/60 text-xs text-white transition-all cursor-pointer"
                  >
                    <img
                      src={currentMember.avatar}
                      alt={currentMember.username}
                      className="w-5 h-5 rounded-full object-cover border border-purple-400"
                    />
                    <span className="font-bold text-xs truncate max-w-[80px]">
                      {currentMember.username}
                    </span>
                    <ChevronDown className="w-3 h-3 text-purple-300" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0e1118] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <div className="text-xs font-bold text-white">
                          {currentMember.username}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {currentMember.email}
                        </div>
                      </div>

                      {isCurrentAdmin && (
                        <button
                          onClick={() => {
                            setCurrentView('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/80 flex items-center gap-2 transition-colors mb-1.5 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Admin Panel</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logoutMember();
                          if (isAdminAuthenticated) {
                            logoutAdmin();
                          }
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="nav-login-btn"
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 rounded-xl bg-[#8a2be2] hover:bg-[#7a22cf] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>LOGIN</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-white/5 bg-[#08090d]/90 px-2 text-[10px] font-bold uppercase tracking-wider">
          <button
            onClick={() => {
              setActiveTab('HOME');
              setCurrentView('home');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded cursor-pointer ${
              currentView === 'home' ? 'text-purple-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('FREE');
              setCurrentView('free');
              setSelectedPlatform('All');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded cursor-pointer ${
              currentView === 'free' || currentView === 'catalog' ? 'text-purple-400 font-black' : 'text-slate-400'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Free</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('COMMUNITY');
              setCurrentView('community');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded cursor-pointer ${
              currentView === 'community' ? 'text-purple-400 font-black' : 'text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Community</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('RULES');
              setCurrentView('rules');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2 cursor-pointer ${
              currentView === 'rules' ? 'text-purple-400 font-bold' : 'text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>
          <button
            onClick={() => setIsGuidesOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2 text-slate-400 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guides</span>
          </button>
          {isCurrentAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex flex-col items-center gap-1 py-1 px-2 cursor-pointer ${
                currentView === 'admin' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* Info Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <GuidesModal isOpen={isGuidesOpen} onClose={() => setIsGuidesOpen(false)} />
    </>
  );
};
