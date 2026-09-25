import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HelpCircle, X, MessageSquare, Send, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const SupportModal: React.FC = () => {
  const { isSupportModalOpen, setIsSupportModalOpen, siteContent, accounts } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [reportAccountId, setReportAccountId] = useState<string>(accounts[0]?.id || '');
  const [reportReason, setReportReason] = useState<string>('Password changed by previous user');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isSupportModalOpen) return null;

  const faqs = [
    {
      q: 'How do I login and play Steam games safely?',
      a: 'Download and launch the official Steam desktop client. Login with the provided username and password. If prompted for Steam Guard, use our live 2FA code generator. Once in, download the game and switch Steam to Offline Mode (Steam > Go Offline) to play without being interrupted by other users.'
    },
    {
      q: 'What is the Monetized Shortlink step?',
      a: 'To keep this service 100% free and pay for game purchases and server costs, free claims pass through a sponsor shortlink (GPLinks/Shrinkme). You simply wait for the countdown timer and click "Get Link" to access the credentials. VIP members bypass this completely.'
    },
    {
      q: 'How do Cookie accounts work (Netflix, Prime, Crunchyroll)?',
      a: 'Cookie accounts provide session access without needing account passwords. Install a browser extension like "Cookie-Editor", go to the streaming platform (e.g. crunchyroll.com), click the extension, paste the JSON session, and refresh the page!'
    },
    {
      q: 'What if an account password gets locked or changed?',
      a: 'Accounts are monitored by automated bots and restocked every 6 hours. You can also submit an instant replacement report below or post in our Discord #restock channel for priority replacement.'
    }
  ];

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsSupportModalOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0e111a] border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/40 overflow-hidden max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-lg font-gaming text-white">
              Support Center & Knowledge Base
            </h2>
          </div>
          <button
            onClick={() => setIsSupportModalOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Community Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={siteContent.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 flex items-center gap-3 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Join Official Discord</h4>
                <p className="text-[11px] text-slate-300 font-mono">18,400+ members & live restocks</p>
              </div>
            </a>

            <a
              href={siteContent.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/40 flex items-center gap-3 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0088cc] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Telegram Restock Alerts</h4>
                <p className="text-[11px] text-slate-300 font-mono">Instant notifications for new AAA drops</p>
              </div>
            </a>
          </div>

          {/* FAQ Accordion */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 font-gaming uppercase tracking-wider mb-3">
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-[#12151e] border border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-4 py-3 text-left font-semibold text-xs sm:text-sm text-slate-200 flex items-center justify-between hover:bg-slate-800/40"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-3 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 font-mono">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Report Account Form */}
          <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800">
            <h3 className="text-sm font-bold text-white font-gaming mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Report Inactive Account / Restock Request
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-3">
              Encountered a dead key or invalid login? Submit below for rapid queue replacement.
            </p>

            {submitted ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Report logged! Our automated restock bot has queued a replacement key.</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Select Affected Account</label>
                  <select
                    value={reportAccountId}
                    onChange={(e) => setReportAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.platform})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Issue Description</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                  >
                    <option value="Password changed by previous user">Password changed / Login incorrect</option>
                    <option value="Steam Guard 2FA verification timeout">Steam Guard 2FA verification code rejected</option>
                    <option value="Cookie session expired">Cookie session expired / invalid JSON</option>
                    <option value="Game library revoked">Game library revoked or locked</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming text-xs font-bold transition-all shadow-md shadow-purple-600/30"
                >
                  Submit Replacement Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
