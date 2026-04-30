(function () {
  if (window.__cwLoaded) return;
  window.__cwLoaded = true;

  var cfg = {
    botName:         'AI Assistant',
    // Optional: URL to your logo image (e.g. 'https://yoursite.com/logo.png')
    // Set to null to show initials instead
    iconUrl:         null,
    welcomeMessage:  'Γεια σας! Πώς μπορώ να σας βοηθήσω;',
    placeholder:     'Γράψτε ένα μήνυμα...',
    color:           '#0ea574',
    colorDark:       '#0a7d58',
    width:           380,
    position:        'bottom-right',
    groqApiKey:      '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',
    model:           'llama-3.1-8b-instant',
    systemPrompt:    'You are a helpful real estate assistant. Be concise and friendly. Answer in the same language the user writes in.',
    rateLimitMs:     1500,
    historyMaxPairs: 10,
  };

  function init() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', init); return; }

    var host = document.createElement('div');
    document.body.appendChild(host);
    if (!host.attachShadow) { document.body.removeChild(host); return; }
    var shadow = host.attachShadow({ mode: 'open' });

    var c     = cfg.color;
    var cDark = cfg.colorDark;
    var vPos  = cfg.position.split('-')[0];
    var hPos  = cfg.position.split('-')[1];
    var w     = cfg.width;

    var SVG_CHAT  = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="white"/><path d="M7 9H17M7 13H13" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>';
    var SVG_DOWN  = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 10L12 15L17 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var SVG_DOTS  = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
    var SVG_CLOSE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>';
    var SVG_SEND  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var style = document.createElement('style');
    style.textContent = [
      '@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap");',

      /* Toggle button */
      '#cw-btn{position:fixed;' + vPos + ':24px;' + hPos + ':24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,' + c + ',' + cDark + ');color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2147483647;box-shadow:0 4px 20px rgba(0,0,0,.22);transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease;outline:none;overflow:hidden;}',
      '#cw-btn:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(0,0,0,.28),0 0 0 6px ' + c + '22;}',
      '#cw-btn-inner{position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;}',
      '.cw-icon{position:absolute;display:flex;align-items:center;justify-content:center;transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .2s ease;}',
      '.cw-icon-chat{transform:scale(1) rotate(0deg);opacity:1;}',
      '.cw-icon-down{transform:scale(0) rotate(-90deg);opacity:0;}',
      '#cw-btn.open .cw-icon-chat{transform:scale(0) rotate(90deg);opacity:0;}',
      '#cw-btn.open .cw-icon-down{transform:scale(1) rotate(0deg);opacity:1;}',

      /* Panel */
      '#cw-panel{position:fixed;' + vPos + ':92px;' + hPos + ':24px;width:' + w + 'px;max-width:calc(100vw - 32px);height:580px;max-height:min(74vh,600px);display:flex;flex-direction:column;overflow:hidden;background:#fff;border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,.15),0 8px 24px rgba(0,0,0,.08);z-index:2147483647;font-family:"DM Sans",system-ui,sans-serif;transform-origin:bottom right;transform:scale(.92) translateY(12px);opacity:0;pointer-events:none;transition:transform .28s cubic-bezier(.34,1.56,.64,1),opacity .2s ease;}',
      '#cw-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto;}',

      /* Mobile full screen */
      '@media(max-width:520px){#cw-panel{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;max-width:100%!important;height:100%!important;max-height:100%!important;border-radius:0!important;transform-origin:bottom center!important;}}',
      '@media(max-width:520px){#cw-btn{' + vPos + ':16px!important;' + hPos + ':16px!important;}}',

      /* Header */
      '#cw-header{background:linear-gradient(135deg,' + c + ' 0%,' + cDark + ' 100%);padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;position:relative;box-shadow:0 2px 12px rgba(0,0,0,.12);}',
      '#cw-hav{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex:0 0 36px;overflow:hidden;}',
      '#cw-hav img{width:100%;height:100%;object-fit:cover;}',
      '#cw-hinfo{flex:1;min-width:0;}',
      '#cw-title{font-size:15px;font-weight:600;color:#fff;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '#cw-status{font-size:11px;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:5px;margin-top:2px;}',
      '#cw-sdot{width:6px;height:6px;border-radius:50%;background:#a8ffdd;box-shadow:0 0 6px #a8ffdd;animation:cwPulse 2s infinite;}',
      '@keyframes cwPulse{0%,100%{opacity:1;}50%{opacity:.5;}}',
      '#cw-hacts{display:flex;align-items:center;gap:4px;flex-shrink:0;}',
      '.cw-hbtn{width:32px;height:32px;border:none;background:rgba(255,255,255,.12);border-radius:50%;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;transition:background .15s ease;}',
      '.cw-hbtn:hover{background:rgba(255,255,255,.28);}',

      /* Dropdown */
      '#cw-menu{position:absolute;top:calc(100% + 6px);right:52px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.14);border:1px solid #f0f0f0;overflow:hidden;z-index:30;transform:scale(.9) translateY(-6px);opacity:0;pointer-events:none;transition:transform .18s cubic-bezier(.34,1.56,.64,1),opacity .15s ease;min-width:170px;}',
      '#cw-menu.open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto;}',
      '.cw-mi{padding:11px 14px;font-size:13px;font-weight:500;color:#333;cursor:pointer;display:flex;align-items:center;gap:9px;transition:background .1s;font-family:"DM Sans",system-ui,sans-serif;}',
      '.cw-mi:hover{background:#f7f7f7;}',
      '.cw-mi.danger{color:#e53e3e;}',
      '.cw-mi.danger:hover{background:#fff5f5;}',

      /* Messages */
      '#cw-msgs{flex:1;overflow-y:auto;padding:16px 14px;background:#f8f9fa;display:flex;flex-direction:column;gap:8px;position:relative;scroll-behavior:smooth;}',
      '#cw-msgs::-webkit-scrollbar{width:3px;}',
      '#cw-msgs::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px;}',
      '.cw-row{display:flex;gap:8px;align-items:flex-end;max-width:100%;animation:cwIn .22s ease;}',
      '.cw-row.u{flex-direction:row-reverse;}',
      '@keyframes cwIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}',
      '.cw-mav{width:24px;height:24px;border-radius:50%;flex:0 0 24px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;overflow:hidden;margin-bottom:1px;}',
      '.cw-mav.b{background:' + c + '20;color:' + c + ';}',
      '.cw-mav.u{background:' + c + ';color:#fff;}',
      '.cw-mav img{width:100%;height:100%;object-fit:cover;}',
      '.cw-bub{max-width:80%;padding:10px 14px;font-size:14px;line-height:1.55;word-break:break-word;overflow-wrap:anywhere;white-space:pre-wrap;}',
      '.cw-bub.b{background:#fff;color:#1a1a1a;border-radius:18px 18px 18px 4px;box-shadow:0 1px 4px rgba(0,0,0,.07);border:1px solid #efefef;}',
      '.cw-bub.u{background:linear-gradient(135deg,' + c + ',' + cDark + ');color:#fff;border-radius:18px 18px 4px 18px;box-shadow:0 2px 8px ' + c + '44;}',

      /* Typing */
      '.cw-typing{display:flex;align-items:center;gap:5px;padding:12px 14px;min-width:52px;}',
      '.cw-dot{width:6px;height:6px;border-radius:50%;background:#c0c0c0;animation:cwBounce 1.3s infinite ease-in-out;}',
      '.cw-dot:nth-child(2){animation-delay:.18s;}',
      '.cw-dot:nth-child(3){animation-delay:.36s;}',
      '@keyframes cwBounce{0%,60%,100%{transform:translateY(0);opacity:.35;}30%{transform:translateY(-5px);opacity:1;}}',

      /* Retry */
      '.cw-retry{margin-top:7px;display:inline-block;font-size:12px;color:' + c + ';background:none;border:1.5px solid ' + c + '55;border-radius:8px;padding:3px 10px;cursor:pointer;transition:all .15s;font-family:"DM Sans",system-ui,sans-serif;}',
      '.cw-retry:hover{background:' + c + ';color:#fff;border-color:' + c + ';}',

      /* Date separator */
      '.cw-dsep{text-align:center;font-size:11px;color:#bbb;padding:4px 0 10px;letter-spacing:.3px;}',

      /* Scroll btn */
      '#cw-scrollbtn{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:' + c + ';color:#fff;border:none;border-radius:20px;padding:5px 16px;font-size:12px;font-weight:500;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.14);display:none;z-index:10;white-space:nowrap;font-family:"DM Sans",system-ui,sans-serif;animation:cwIn .15s ease;}',

      /* Input */
      '#cw-inputRow{padding:12px 14px;border-top:1px solid #f0f0f0;display:flex;gap:8px;align-items:center;background:#fff;flex-shrink:0;}',
      '#cw-iwrap{flex:1;display:flex;align-items:center;background:#f4f5f7;border:1.5px solid transparent;border-radius:22px;padding:0 14px;transition:border-color .15s,background .15s;}',
      '#cw-iwrap:focus-within{border-color:' + c + '66;background:#fff;}',
      '#cw-input{flex:1;font-size:14px;padding:9px 0;border:none;outline:none;background:transparent;color:#1a1a1a;font-family:"DM Sans",system-ui,sans-serif;}',
      '#cw-input::placeholder{color:#aab;}',
      '#cw-send{width:36px;height:36px;border-radius:50%;border:0;background:linear-gradient(135deg,' + c + ',' + cDark + ');color:#fff;cursor:pointer;flex:0 0 36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px ' + c + '55;transition:transform .15s,box-shadow .15s;}',
      '#cw-send:hover{transform:scale(1.08);box-shadow:0 4px 12px ' + c + '66;}',
      '#cw-send:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none;}',
      '#cw-cd{font-size:11px;color:#bbb;white-space:nowrap;flex:0 0 auto;padding-right:2px;}',

      /* Confirm overlay */
      '#cw-cfm{position:absolute;inset:0;background:rgba(10,10,10,.5);backdrop-filter:blur(5px);display:none;align-items:center;justify-content:center;z-index:40;}',
      '#cw-cfm.show{display:flex;}',
      '#cw-cfmbox{background:#fff;border-radius:18px;padding:26px 24px;max-width:270px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.18);animation:cwIn .22s ease;font-family:"DM Sans",system-ui,sans-serif;}',
      '#cw-cfmbox h3{margin:0 0 8px;font-size:16px;font-weight:600;color:#111;}',
      '#cw-cfmbox p{margin:0 0 20px;font-size:13px;color:#666;line-height:1.55;}',
      '.cw-cfmbtns{display:flex;gap:8px;}',
      '.cw-cfmbtns button{flex:1;padding:10px 0;border-radius:11px;font-size:13px;font-weight:600;border:none;cursor:pointer;font-family:"DM Sans",system-ui,sans-serif;transition:filter .15s;}',
      '.cw-cfmbtns button:hover{filter:brightness(.93);}',
      '#cw-cfm-no{background:#f0f0f0;color:#555;}',
      '#cw-cfm-yes{background:linear-gradient(135deg,' + c + ',' + cDark + ');color:#fff;}',

      '@media(max-width:520px){#cw-panel.open{border-radius:0!important;}}',
    ].join('');
    shadow.appendChild(style);

    // ── Toggle button ─────────────────────────────────────────────────────────
    var btn = document.createElement('button'); btn.id = 'cw-btn'; btn.setAttribute('aria-label', 'Open chat');
    var inner = document.createElement('div'); inner.id = 'cw-btn-inner';
    var iconChat = document.createElement('span'); iconChat.className = 'cw-icon cw-icon-chat'; iconChat.innerHTML = SVG_CHAT;
    var iconDown = document.createElement('span'); iconDown.className = 'cw-icon cw-icon-down'; iconDown.innerHTML = SVG_DOWN;
    inner.appendChild(iconChat); inner.appendChild(iconDown); btn.appendChild(inner);
    shadow.appendChild(btn);

    // ── Panel ─────────────────────────────────────────────────────────────────
    var panel = document.createElement('div'); panel.id = 'cw-panel'; panel.setAttribute('aria-hidden', 'true');

    // Header
    var header = document.createElement('div'); header.id = 'cw-header';
    var hav = document.createElement('div'); hav.id = 'cw-hav';
    if (cfg.iconUrl) { var hi = document.createElement('img'); hi.src = cfg.iconUrl; hav.appendChild(hi); }
    else { hav.textContent = (cfg.botName || 'AI').charAt(0); }
    var hinfo = document.createElement('div'); hinfo.id = 'cw-hinfo';
    var titleEl = document.createElement('div'); titleEl.id = 'cw-title'; titleEl.textContent = cfg.botName;
    var statusEl = document.createElement('div'); statusEl.id = 'cw-status';
    var sdot = document.createElement('span'); sdot.id = 'cw-sdot';
    statusEl.appendChild(sdot); statusEl.appendChild(document.createTextNode('Online'));
    hinfo.appendChild(titleEl); hinfo.appendChild(statusEl);
    var hacts = document.createElement('div'); hacts.id = 'cw-hacts';
    var menuBtn = document.createElement('button'); menuBtn.className = 'cw-hbtn'; menuBtn.innerHTML = SVG_DOTS;
    var closeBtn = document.createElement('button'); closeBtn.className = 'cw-hbtn'; closeBtn.innerHTML = SVG_CLOSE;
    hacts.appendChild(menuBtn); hacts.appendChild(closeBtn);
    // Dropdown
    var menu = document.createElement('div'); menu.id = 'cw-menu';
    var miNew = document.createElement('div'); miNew.className = 'cw-mi danger';
    miNew.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 12H21M12 3V21" stroke="#e53e3e" stroke-width="2.5" stroke-linecap="round"/></svg> Νέα Συνομιλία';
    menu.appendChild(miNew);
    header.appendChild(hav); header.appendChild(hinfo); header.appendChild(hacts); header.appendChild(menu);

    // Messages
    var msgs = document.createElement('div'); msgs.id = 'cw-msgs';
    var scrollBtn = document.createElement('button'); scrollBtn.id = 'cw-scrollbtn'; scrollBtn.textContent = '↓  Νέα μηνύματα';
    msgs.appendChild(scrollBtn);

    // Input row
    var inputRow = document.createElement('div'); inputRow.id = 'cw-inputRow';
    var iwrap = document.createElement('div'); iwrap.id = 'cw-iwrap';
    var input = document.createElement('input'); input.id = 'cw-input'; input.type = 'text'; input.placeholder = cfg.placeholder;
    iwrap.appendChild(input);
    var sendBtn = document.createElement('button'); sendBtn.id = 'cw-send'; sendBtn.innerHTML = SVG_SEND;
    var cdEl = document.createElement('span'); cdEl.id = 'cw-cd';
    inputRow.appendChild(iwrap); inputRow.appendChild(sendBtn); inputRow.appendChild(cdEl);

    // Confirm overlay
    var cfm = document.createElement('div'); cfm.id = 'cw-cfm';
    var cfmBox = document.createElement('div'); cfmBox.id = 'cw-cfmbox';
    cfmBox.innerHTML = '<h3>Νέα Συνομιλία;</h3><p>Η τρέχουσα συνομιλία θα διαγραφεί οριστικά.</p><div class="cw-cfmbtns"><button id="cw-cfm-no">Άκυρο</button><button id="cw-cfm-yes">Διαγραφή</button></div>';
    cfm.appendChild(cfmBox);

    panel.appendChild(header); panel.appendChild(msgs); panel.appendChild(inputRow); panel.appendChild(cfm);
    shadow.appendChild(panel);

    // ── State ─────────────────────────────────────────────────────────────────
    var history = [], isOpen = false, menuOpen = false, cooldownTimer = null;

    // ── Helpers ───────────────────────────────────────────────────────────────
    function nb() { return msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 80; }
    function sb() { msgs.scrollTop = msgs.scrollHeight; scrollBtn.style.display = 'none'; }
    msgs.addEventListener('scroll', function () { scrollBtn.style.display = nb() ? 'none' : 'block'; });
    scrollBtn.addEventListener('click', sb);

    function setOpen(o) {
      isOpen = o;
      panel.classList.toggle('open', o);
      btn.classList.toggle('open', o);
      panel.setAttribute('aria-hidden', o ? 'false' : 'true');
      if (o) { setTimeout(function () { input.focus(); sb(); }, 100); repositionPanel(); }
      else { closeMenu(); }
    }

    function closeMenu() { menu.classList.remove('open'); menuOpen = false; }
    menuBtn.addEventListener('click', function (e) { e.stopPropagation(); menuOpen = !menuOpen; menu.classList.toggle('open', menuOpen); });
    document.addEventListener('click', function () { closeMenu(); });

    miNew.addEventListener('click', function () { closeMenu(); cfm.classList.add('show'); });
    cfm.querySelector('#cw-cfm-no').addEventListener('click', function () { cfm.classList.remove('show'); });
    cfm.querySelector('#cw-cfm-yes').addEventListener('click', function () { cfm.classList.remove('show'); seed(); });

    function addMsg(role, text) {
      var row = document.createElement('div'); row.className = 'cw-row' + (role === 'user' ? ' u' : '');
      var mav = document.createElement('div'); mav.className = 'cw-mav ' + (role === 'user' ? 'u' : 'b');
      if (role === 'bot' && cfg.iconUrl) { var mi = document.createElement('img'); mi.src = cfg.iconUrl; mav.appendChild(mi); }
      else { mav.textContent = role === 'user' ? 'Ε' : (cfg.botName || 'AI').charAt(0); }
      var bub = document.createElement('div'); bub.className = 'cw-bub ' + (role === 'user' ? 'u' : 'b');
      bub.textContent = String(text != null ? text : '');
      row.appendChild(mav); row.appendChild(bub);
      msgs.insertBefore(row, scrollBtn);
      if (nb()) { sb(); } else { scrollBtn.style.display = 'block'; }
      return { row: row, bub: bub };
    }

    function addTyping() {
      var row = document.createElement('div'); row.className = 'cw-row';
      var mav = document.createElement('div'); mav.className = 'cw-mav b'; mav.textContent = (cfg.botName || 'AI').charAt(0);
      var bub = document.createElement('div'); bub.className = 'cw-bub b cw-typing';
      for (var i = 0; i < 3; i++) { var d = document.createElement('span'); d.className = 'cw-dot'; bub.appendChild(d); }
      row.appendChild(mav); row.appendChild(bub);
      msgs.insertBefore(row, scrollBtn); if (nb()) { sb(); }
      return row;
    }

    function seed() {
      while (msgs.firstChild && msgs.firstChild !== scrollBtn) msgs.removeChild(msgs.firstChild);
      history = [];
      var sep = document.createElement('div'); sep.className = 'cw-dsep';
      sep.textContent = new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' });
      msgs.insertBefore(sep, scrollBtn);
      addMsg('bot', cfg.welcomeMessage);
    }

    function startCooldown() {
      var rem = cfg.rateLimitMs; sendBtn.disabled = true;
      var iv = setInterval(function () { rem -= 200; if (rem <= 0) { clearInterval(iv); cdEl.textContent = ''; } else { cdEl.textContent = (rem / 1000).toFixed(1) + 's'; } }, 200);
      cooldownTimer = iv;
    }
    function enableSend() { if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; } cdEl.textContent = ''; sendBtn.disabled = false; }
    function trim() { var m = cfg.historyMaxPairs * 2; if (history.length > m) history = history.slice(history.length - m); }

    function doRequest(payload, tr, onOk, onErr) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.groq.com/openai/v1/chat/completions', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Bearer ' + cfg.groqApiKey);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (tr && tr.parentNode) tr.parentNode.removeChild(tr);
        try { var d = JSON.parse(xhr.responseText); onOk((d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || (d.error && d.error.message) || 'No response.'); }
        catch (e) { onErr('Σφάλμα απόκρισης.'); }
      };
      xhr.onerror = function () { if (tr && tr.parentNode) tr.parentNode.removeChild(tr); onErr('Σφάλμα δικτύου.'); };
      xhr.send(JSON.stringify(payload));
    }

    function doSend() {
      var text = input.value.trim(); if (!text || sendBtn.disabled) return;
      input.value = ''; startCooldown(); addMsg('user', text);
      history.push({ role: 'user', content: text }); trim();
      var tr = addTyping();
      var payload = { model: cfg.model, messages: [{ role: 'system', content: cfg.systemPrompt }].concat(history) };
      doRequest(payload, tr,
        function (r) { addMsg('bot', r); history.push({ role: 'assistant', content: r }); trim(); enableSend(); },
        function (e) {
          var res = addMsg('bot', e); var rb = document.createElement('button'); rb.className = 'cw-retry'; rb.textContent = '↺ Δοκιμή ξανά';
          (function (p, r, row) { r.addEventListener('click', function () { r.disabled = true; r.textContent = 'Δοκιμή…'; var nt = addTyping(); doRequest(p, nt, function (reply) { if (row.parentNode) row.parentNode.removeChild(row); addMsg('bot', reply); history.push({ role: 'assistant', content: reply }); trim(); enableSend(); }, function (e2) { r.disabled = false; r.textContent = '↺ Δοκιμή ξανά'; var r2 = addMsg('bot', e2); var rb2 = document.createElement('button'); rb2.className = 'cw-retry'; rb2.textContent = '↺ Δοκιμή ξανά'; r2.bub.appendChild(rb2); enableSend(); }); }); })(payload, rb, res.row);
          res.bub.appendChild(rb); enableSend();
        }
      );
    }

    function repositionPanel() {
      if (!window.visualViewport || window.innerWidth <= 520) return;
      var vv = window.visualViewport, off = window.innerHeight - vv.height - vv.offsetTop;
      if (vPos === 'bottom') { panel.style.bottom = (off + 92) + 'px'; btn.style.bottom = (off + 24) + 'px'; }
    }
    if (window.visualViewport) { window.visualViewport.addEventListener('resize', repositionPanel); window.visualViewport.addEventListener('scroll', repositionPanel); }

    btn.addEventListener('click', function () { setOpen(!isOpen); });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    sendBtn.addEventListener('click', doSend);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); doSend(); } });

    seed();
  }

  if (document.body) { init(); }
  else { document.addEventListener('DOMContentLoaded', init); }
})();
