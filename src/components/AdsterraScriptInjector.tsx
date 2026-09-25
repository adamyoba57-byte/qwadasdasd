import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

// Helper to execute scripts contained in an HTML string or bare URL
function executeScripts(rawInput: string, containerId: string) {
  // Clean up any existing container with same ID
  const existing = document.getElementById(containerId);
  if (existing) {
    existing.remove();
  }

  let htmlSnippet = (rawInput || '').trim();
  if (!htmlSnippet) return;

  // If user pasted bare URL instead of <script> tag (e.g. //pl25838472.profitablecpmrate.com/.../invoke.js)
  if (!htmlSnippet.includes('<') && (htmlSnippet.startsWith('http://') || htmlSnippet.startsWith('https://') || htmlSnippet.startsWith('//'))) {
    const fullUrl = htmlSnippet.startsWith('//') ? `https:${htmlSnippet}` : htmlSnippet;
    htmlSnippet = `<script type="text/javascript" src="${fullUrl}"></script>`;
  }

  // Ensure protocol-relative URLs convert to https://
  htmlSnippet = htmlSnippet.replace(/(src|href)=["']\/\/([^"']+)["']/gi, '$1="https://$2"');
  htmlSnippet = htmlSnippet.replace(/(src|href)=\/\/([^\s>]+)/gi, '$1="https://$2"');

  const container = document.createElement('div');
  container.id = containerId;
  container.style.display = 'none';
  document.body.appendChild(container);

  // Parse HTML into a temporary DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlSnippet, 'text/html');
  const scripts = Array.from(doc.querySelectorAll('script'));

  // Also append any non-script HTML if present
  const nonScriptElements = Array.from(doc.body.childNodes).filter(
    (node) => node.nodeName.toLowerCase() !== 'script'
  );
  nonScriptElements.forEach((node) => {
    container.appendChild(document.importNode(node, true));
  });

  // Inject scripts in sequence so they execute in the host environment
  scripts.forEach((oldScript) => {
    const newScript = document.createElement('script');
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });
    
    const srcAttr = oldScript.getAttribute('src');
    if (srcAttr) {
      newScript.src = srcAttr.startsWith('//') ? `https:${srcAttr}` : srcAttr;
      newScript.async = true;
    } else {
      newScript.textContent = oldScript.textContent;
    }
    container.appendChild(newScript);
  });
}

export const AdsterraScriptInjector: React.FC = () => {
  const { adsterraConfig, user, triggerPopunder } = useApp();

  // 1. First-Click Popunder Trigger
  useEffect(() => {
    if (user.isVip || !adsterraConfig.enabled) return;
    if (!adsterraConfig.popunderOnFirstClick) return;
    if (!adsterraConfig.directLinkUrl?.trim()) return;

    let triggered = false;
    const handleFirstClick = () => {
      if (triggered) return;
      triggered = true;
      triggerPopunder();
    };

    window.addEventListener('click', handleFirstClick, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstClick);
    };
  }, [adsterraConfig.enabled, adsterraConfig.popunderOnFirstClick, adsterraConfig.directLinkUrl, user.isVip, triggerPopunder]);

  // 2. Popunder Script Injection
  useEffect(() => {
    const containerId = 'adsterra-popunder-injected-slot';

    if (user.isVip || !adsterraConfig.enabled || !adsterraConfig.popunderEnabled) {
      const el = document.getElementById(containerId);
      if (el) el.remove();
      return;
    }

    const popCode = adsterraConfig.popunderCode?.trim();
    if (popCode) {
      executeScripts(popCode, containerId);
    } else {
      const el = document.getElementById(containerId);
      if (el) el.remove();
    }

    return () => {
      const el = document.getElementById(containerId);
      if (el) el.remove();
    };
  }, [adsterraConfig.enabled, adsterraConfig.popunderEnabled, adsterraConfig.popunderCode, user.isVip]);

  // 3. Social Bar Script Injection
  useEffect(() => {
    const containerId = 'adsterra-socialbar-injected-slot';

    if (user.isVip || !adsterraConfig.enabled || !adsterraConfig.socialBarEnabled) {
      const el = document.getElementById(containerId);
      if (el) el.remove();
      return;
    }

    const sbCode = adsterraConfig.socialBarCode?.trim();
    if (sbCode) {
      executeScripts(sbCode, containerId);
    } else {
      const el = document.getElementById(containerId);
      if (el) el.remove();
    }

    return () => {
      const el = document.getElementById(containerId);
      if (el) el.remove();
    };
  }, [adsterraConfig.enabled, adsterraConfig.socialBarEnabled, adsterraConfig.socialBarCode, user.isVip]);

  return null;
};
