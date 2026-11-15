// Gezi Platformu - Google Analytics 4
(function () {
  if(window.__gpAnalyticsLoaded)return;window.__gpAnalyticsLoaded=true;
  var measurementId = 'G-SL0GWRTHRR';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
  // Classify attributable AI visits without recording query strings or personal data.
  var aiHosts = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai', 'grok.com', 'you.com'];
  try {
    var source = new URL(document.referrer).hostname.toLowerCase();
    if (aiHosts.some(function(host){ return source === host || source.endsWith('.' + host); })) {
      window.gtag('event', 'ai_referral', { source_domain: source });
    }
  } catch (_) {}
  document.addEventListener('click', function(event){
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var method = /^tel:/i.test(href) ? 'phone' : /^https:\/\/(?:wa\.me|api\.whatsapp\.com)(?:\/|$)/i.test(href) ? 'whatsapp' : /^mailto:/i.test(href) ? 'email' : null;
    if (method) window.gtag('event', 'contact_click', { contact_method: method, transport_type: 'beacon' });
  });
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(script);
})();
