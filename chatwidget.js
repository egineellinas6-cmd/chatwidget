(function () {
  // ── Guard against double-injection ────────────────────────────────────────
  if (window.__cwLoaded) return;
  window.__cwLoaded = true;

  var cfg = {
    botName: 'AI Assistant',
    welcomeMessage: 'Hi! How can I help you today?',
    placeholder: 'Type a message...',
    color: '#1a73e8',
    width: 360,
    position: 'bottom-right',
    groqApiKey: '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',
    model: 'llama-3.1-8b-instant',
    systemPrompt: 'You are a helpful real estate assistant. Be concise and friendly.',
    rateLimitMs: 1500,       // ms to lock send after each message
    historyMaxPairs: 10      // keep last N user+assistant pairs
  };

  function init() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', init); return; }

    var host = document.createElement('div');
    document.body.appendChild(host);
    if (!host.attachShadow) { document.body.removeChild(host); return; }
    var shadow = host.attachShadow({ mode: 'open' });

    var c   = cfg.color;
    var vPos = cfg.position.split('-')[0];   // 'bottom' | 'top'
    var hPos = cfg.position.split('-')[1];   // 'right'  | 'left'
    var w   = cfg.width;

    // ── Styles ────────────────────────────────────────────────────────────────
    var style = document.createElement('style');
    style.textContent = [
      /* --- toggle button --- */
      '#cw-btn{position:fixed;' + vPos + ':24px;' + hPos + ':24px;width:52px;height:52px;border-radius:999px;background:' + c + ';color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:13px;font-weight:700;user-select:none;line-height:1;transition:transform .15s ease,box-shadow .15s ease;}',
      '#cw-btn:hover{transform:scale(1.08);box-shadow:0 10px 28px rgba(0,0,0,.22);}',

      /* --- panel --- */
      '#cw-panel{position:fixed;' + vPos + ':84px;' + hPos + ':24px;width:' + w + 'px;max-width:calc(100vw - 32px);height:560px;max-height:min(72vh,580px);display:none;flex-direction:column;overflow:hidden;background:#fff;border-radius:16px;box-shadow:0 10px 36px rgba(0,0,0,.20);z-index:2147483647;font-family:system-ui,-apple-system,sans-serif;border:1px solid rgba(0,0,0,.06);}',

      /* --- header --- */
      '#cw-header{background:' + c + ';color:#fff;padding:13px 15px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;}',
      '#cw-title{font-size:15px;font-weight:700;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '#cw-close{border:0;background:transparent;color:#fff;cursor:pointer;font-size:18px;line-height:1;padding:4px;}',

      /* --- messages area --- */
      '#cw-messages{flex:1;overflow-y:auto;padding:14px;background:#f9f9f9;display:flex;flex-direction:column;gap:10px;position:relative;}',
      '.cw-row{display:flex;gap:8px;align-items:flex-start;max-width:100%;}',
      '.cw-row.cw-user{flex-direction:row-reverse;}',
      '.cw-avatar{width:26px;height:26px;border-radius:999px;flex:0 0 26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;}',
      '.cw-avatar.cw-bot{background:#e8f0fe;color:' + c + ';}',
      '.cw-avatar.cw-user{background:' + c + ';color:#fff;}',
      '.cw-bubble{max-width:82%;padding:8px 11px;font-size:14px;line-height:1.5;border-radius:13px;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;}',
      '.cw-bubble.cw-bot{background:#fff;color:#222;border:1px solid #e5e7eb;border-bottom-left-radius:3px;}',
      '.cw-bubble.cw-user{background:' + c + ';color:#fff;border-bottom-right-radius:3px;}',

      /* --- animated typing dots --- */
      '.cw-typing{display:flex;align-items:center;gap:4px;padding:10px 13px;height:36px;}',
      '.cw-dot{width:7px;height:7px;border-radius:50%;background:#aaa;animation:cwBounce 1.2s infinite ease-in-out;}',
      '.cw-dot:nth-child(2){animation-delay:.2s;}',
      '.cw-dot:nth-child(3){animation-delay:.4s;}',
      '@keyframes cwBounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-6px);opacity:1;}}',

      /* --- retry button inside bubble --- */
      '.cw-retry{margin-top:6px;display:block;font-size:12px;color:' + c + ';background:none;border:1px solid ' + c + ';border-radius:8px;padding:3px 10px;cursor:pointer;}',
      '.cw-retry:hover{background:' + c + ';color:#fff;}',

      /* --- rate-limit countdown badge --- */
      '#cw-cooldown{font-size:11px;color:#999;padding:2px 0 0 4px;align-self:center;white-space:nowrap;flex:0 0 auto;}',

      /* --- scroll-to-bottom button --- */
      '#cw-scroll-btn{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:' + c + ';color:#fff;border:none;border-radius:999px;padding:5px 14px;font-size:13px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.18);display:none;z-index:10;white-space:nowrap;}',
      '#cw-scroll-btn:hover{filter:brightness(1.1);}',

      /* --- input row --- */
      '#cw-inputRow{padding:10px 12px;border-top:1px solid #eee;display:flex;gap:8px;align-items:center;background:#fff;flex-shrink:0;}',
      '#cw-input{flex:1;min-width:0;font-size:14px;padding:8px 12px;border:1px solid #ddd;border-radius:18px;outline:none;background:#f5f5f5;color:#222;font-family:system-ui,-apple-system,sans-serif;}',
      '#cw-send{width:34px;height:34px;border-radius:999px;border:0;background:' + c + ';color:#fff;cursor:pointer;flex:0 0 34px;font-size:13px;font-weight:700;}',
      '#cw-send:disabled{opacity:.5;cursor:not-allowed;}'
    ].join('');
    shadow.appendChild(style);

    // ── Build DOM ─────────────────────────────────────────────────────────────
    var btn = document.createElement('button');
    btn.id = 'cw-btn';
    btn.setAttribute('aria-label', 'Open chat');
    btn.textContent = 'Chat';
    shadow.appendChild(btn);

    var panel = document.createElement('div');
    panel.id = 'cw-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.style.display = 'none';

    var header = document.createElement('div'); header.id = 'cw-header';
    var titleEl = document.createElement('span'); titleEl.id = 'cw-title'; titleEl.textContent = cfg.botName;
    var closeBtn = document.createElement('button'); closeBtn.id = 'cw-close'; closeBtn.type = 'button'; closeBtn.setAttribute('aria-label', 'Close'); closeBtn.textContent = '✕';
    header.appendChild(titleEl); header.appendChild(closeBtn);

    var msgs = document.createElement('div'); msgs.id = 'cw-messages';

    // scroll-to-bottom floating button (lives inside msgs)
    var scrollBtn = document.createElement('button');
    scrollBtn.id = 'cw-scroll-btn';
    scrollBtn.textContent = '↓ New messages';
    msgs.appendChild(scrollBtn);

    var inputRow = document.createElement('div'); inputRow.id = 'cw-inputRow';
    var input = document.createElement('input'); input.id = 'cw-input'; input.type = 'text'; input.placeholder = cfg.placeholder;
    var sendBtn = document.createElement('button'); sendBtn.id = 'cw-send'; sendBtn.type = 'button'; sendBtn.textContent = '➤';
    var cooldownEl = document.createElement('span'); cooldownEl.id = 'cw-cooldown';

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);
    inputRow.appendChild(cooldownEl);

    panel.appendChild(header);
    panel.appendChild(msgs);
    panel.appendChild(inputRow);
    shadow.appendChild(panel);

    // ── State ─────────────────────────────────────────────────────────────────
    var history = [];
    var cooldownTimer = null;
    var lastFailedPayload = null;   // for retry

    // ── Helpers ───────────────────────────────────────────────────────────────
    function isNearBottom() {
      return msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 60;
    }

    function scrollBottom() {
      msgs.scrollTop = msgs.scrollHeight;
      scrollBtn.style.display = 'none';
    }

    // Show/hide the ↓ button based on scroll position
    msgs.addEventListener('scroll', function () {
      scrollBtn.style.display = isNearBottom() ? 'none' : 'block';
    });
    scrollBtn.addEventListener('click', scrollBottom);

    function setOpen(open) {
      panel.style.display = open ? 'flex' : 'none';
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) {
        setTimeout(function () { input.focus(); scrollBottom(); }, 0);
        repositionPanel();
      }
    }

    function addMsg(role, text) {
      var row = document.createElement('div');
      row.className = 'cw-row' + (role === 'user' ? ' cw-user' : '');
      var av = document.createElement('div');
      av.className = 'cw-avatar ' + (role === 'user' ? 'cw-user' : 'cw-bot');
      av.textContent = role === 'user' ? 'U' : 'AI';
      var bub = document.createElement('div');
      bub.className = 'cw-bubble ' + (role === 'user' ? 'cw-user' : 'cw-bot');
      bub.textContent = String(text != null ? text : '');
      row.appendChild(av); row.appendChild(bub);
      // Insert before the scroll button so it doesn't get pushed below
      msgs.insertBefore(row, scrollBtn);
      if (isNearBottom()) { scrollBottom(); } else { scrollBtn.style.display = 'block'; }
      return { row: row, bub: bub };
    }

    // ── Typing indicator ──────────────────────────────────────────────────────
    function addTyping() {
      var row = document.createElement('div');
      row.className = 'cw-row';
      var av = document.createElement('div');
      av.className = 'cw-avatar cw-bot'; av.textContent = 'AI';
      var bub = document.createElement('div');
      bub.className = 'cw-bubble cw-bot cw-typing';
      for (var i = 0; i < 3; i++) {
        var dot = document.createElement('span'); dot.className = 'cw-dot'; bub.appendChild(dot);
      }
      row.appendChild(av); row.appendChild(bub);
      msgs.insertBefore(row, scrollBtn);
      if (isNearBottom()) { scrollBottom(); }
      return row;
    }

    function seed() {
      // Remove all children except the scroll button
      while (msgs.firstChild && msgs.firstChild !== scrollBtn) {
        msgs.removeChild(msgs.firstChild);
      }
      history = [];
      addMsg('bot', cfg.welcomeMessage);
    }

    // ── Rate limiting ─────────────────────────────────────────────────────────
    function startCooldown() {
      var remaining = cfg.rateLimitMs;
      sendBtn.disabled = true;
      var interval = setInterval(function () {
        remaining -= 200;
        if (remaining <= 0) {
          clearInterval(interval);
          cooldownEl.textContent = '';
          // Don't re-enable here — the XHR callback re-enables after response
        } else {
          cooldownEl.textContent = (remaining / 1000).toFixed(1) + 's';
        }
      }, 200);
      cooldownTimer = interval;
    }

    function enableSend() {
      if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
      cooldownEl.textContent = '';
      sendBtn.disabled = false;
    }

    // ── Cap history ───────────────────────────────────────────────────────────
    function trimHistory() {
      // Keep only the last N user+assistant pairs (2 entries per pair)
      var maxEntries = cfg.historyMaxPairs * 2;
      if (history.length > maxEntries) {
        history = history.slice(history.length - maxEntries);
      }
    }

    // ── Core send / retry ─────────────────────────────────────────────────────
    function doRequest(payload, typingRow, onSuccess, onError) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.groq.com/openai/v1/chat/completions', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Bearer ' + cfg.groqApiKey);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (typingRow && typingRow.parentNode) typingRow.parentNode.removeChild(typingRow);
        var reply;
        try {
          var data = JSON.parse(xhr.responseText);
          reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
            || (data.error && data.error.message)
            || 'No response.';
          onSuccess(reply);
        } catch (e) {
          onError('Error: could not parse response.');
        }
      };
      xhr.onerror = function () {
        if (typingRow && typingRow.parentNode) typingRow.parentNode.removeChild(typingRow);
        onError('Network error.');
      };
      xhr.send(JSON.stringify(payload));
    }

    function doSend() {
      var text = input.value.trim();
      if (!text || sendBtn.disabled) return;
      input.value = '';
      startCooldown();

      addMsg('user', text);
      history.push({ role: 'user', content: text });
      trimHistory();

      var typingRow = addTyping();

      var messages = [{ role: 'system', content: cfg.systemPrompt }].concat(history);
      var payload = { model: cfg.model, messages: messages };
      lastFailedPayload = null;

      doRequest(payload, typingRow,
        function (reply) {
          addMsg('bot', reply);
          history.push({ role: 'assistant', content: reply });
          trimHistory();
          enableSend();
        },
        function (errText) {
          // Show error bubble with Retry button
          var result = addMsg('bot', errText);
          var retryBtn = document.createElement('button');
          retryBtn.className = 'cw-retry';
          retryBtn.textContent = '↺ Retry';
          lastFailedPayload = payload;
          (function (savedPayload, savedRetryBtn, savedRow) {
            retryBtn.addEventListener('click', function () {
              savedRetryBtn.disabled = true;
              savedRetryBtn.textContent = 'Retrying…';
              var newTyping = addTyping();
              doRequest(savedPayload, newTyping,
                function (reply) {
                  // Remove the error row
                  if (savedRow.parentNode) savedRow.parentNode.removeChild(savedRow);
                  addMsg('bot', reply);
                  history.push({ role: 'assistant', content: reply });
                  trimHistory();
                  enableSend();
                },
                function (errText2) {
                  savedRetryBtn.disabled = false;
                  savedRetryBtn.textContent = '↺ Retry';
                  var result2 = addMsg('bot', errText2);
                  var retryBtn2 = document.createElement('button');
                  retryBtn2.className = 'cw-retry';
                  retryBtn2.textContent = '↺ Retry';
                  result2.bub.appendChild(retryBtn2);
                  enableSend();
                }
              );
            });
          })(payload, retryBtn, result.row);
          result.bub.appendChild(retryBtn);
          enableSend();
        }
      );
    }

    // ── Mobile: reposition panel when virtual keyboard appears ────────────────
    function repositionPanel() {
      if (!window.visualViewport) return;
      var vv = window.visualViewport;
      // Distance from bottom of visual viewport to bottom of layout viewport
      var bottomOffset = window.innerHeight - vv.height - vv.offsetTop;
      var pad = 24;
      var panelBottom = bottomOffset + 52 + pad + pad; // above the toggle btn
      if (vPos === 'bottom') {
        panel.style.bottom = panelBottom + 'px';
        btn.style.bottom   = (bottomOffset + pad) + 'px';
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', repositionPanel);
      window.visualViewport.addEventListener('scroll', repositionPanel);
    }

    // ── Event wiring ──────────────────────────────────────────────────────────
    btn.addEventListener('click', function () { setOpen(panel.style.display !== 'flex'); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.keyCode === 13 || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault(); btn.click();
      }
    });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    sendBtn.addEventListener('click', doSend);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); doSend(); }
    });

    seed();
  }

  if (document.body) { init(); }
  else { document.addEventListener('DOMContentLoaded', init); }
})();
