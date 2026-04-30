(function () {
  var cfg = {
    botName: 'AI Assistant',
    welcomeMessage: 'Hi! How can I help you today?',
    placeholder: 'Type a message...',
    color: '#1a73e8',
    width: 360,
    position: 'bottom-right'
  };

  function init() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    var host = document.createElement('div');
    document.body.appendChild(host);
    if (!host.attachShadow) {
      document.body.removeChild(host);
      return;
    }
    var shadow = host.attachShadow({ mode: 'open' });

    var c = cfg.color;
    var vPos = cfg.position.split('-')[0];
    var hPos = cfg.position.split('-')[1];
    var w = cfg.width;

    var style = document.createElement('style');
    style.textContent = [
      '#cw-btn{position:fixed;' + vPos + ':24px;' + hPos + ':24px;width:52px;height:52px;border-radius:999px;background:' + c + ';color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:13px;font-weight:700;user-select:none;line-height:1;}',
      '#cw-panel{position:fixed;' + vPos + ':84px;' + hPos + ':24px;width:' + w + 'px;max-width:calc(100vw - 32px);height:560px;max-height:min(72vh,580px);display:none;flex-direction:column;overflow:hidden;background:#fff;border-radius:16px;box-shadow:0 10px 36px rgba(0,0,0,.20);z-index:2147483647;font-family:system-ui,-apple-system,sans-serif;border:1px solid rgba(0,0,0,.06);}',
      '#cw-header{background:' + c + ';color:#fff;padding:13px 15px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;}',
      '#cw-title{font-size:15px;font-weight:700;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '#cw-close{border:0;background:transparent;color:#fff;cursor:pointer;font-size:18px;line-height:1;padding:4px;}',
      '#cw-messages{flex:1;overflow-y:auto;padding:14px;background:#f9f9f9;display:flex;flex-direction:column;gap:10px;}',
      '.cw-row{display:flex;gap:8px;align-items:flex-start;max-width:100%;}',
      '.cw-row.cw-user{flex-direction:row-reverse;}',
      '.cw-avatar{width:26px;height:26px;border-radius:999px;flex:0 0 26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;}',
      '.cw-avatar.cw-bot{background:#e8f0fe;color:' + c + ';}',
      '.cw-avatar.cw-user{background:' + c + ';color:#fff;}',
      '.cw-bubble{max-width:82%;padding:8px 11px;font-size:14px;line-height:1.5;border-radius:13px;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;}',
      '.cw-bubble.cw-bot{background:#fff;color:#222;border:1px solid #e5e7eb;border-bottom-left-radius:3px;}',
      '.cw-bubble.cw-user{background:' + c + ';color:#fff;border-bottom-right-radius:3px;}',
      '#cw-inputRow{padding:10px 12px;border-top:1px solid #eee;display:flex;gap:8px;background:#fff;flex-shrink:0;}',
      '#cw-input{flex:1;min-width:0;font-size:14px;padding:8px 12px;border:1px solid #ddd;border-radius:18px;outline:none;background:#f5f5f5;color:#222;font-family:system-ui,-apple-system,sans-serif;}',
      '#cw-send{width:34px;height:34px;border-radius:999px;border:0;background:' + c + ';color:#fff;cursor:pointer;flex:0 0 34px;}',
      '#cw-send:disabled{opacity:.5;cursor:not-allowed;}'
    ].join('');
    shadow.appendChild(style);

    // Build DOM elements (no innerHTML = no quote issues)
    var btn = document.createElement('button');
    btn.id = 'cw-btn';
    btn.setAttribute('aria-label', 'Open chat');
    btn.textContent = 'Chat';
    shadow.appendChild(btn);

    var panel = document.createElement('div');
    panel.id = 'cw-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.style.display = 'none';

    var header = document.createElement('div');
    header.id = 'cw-header';

    var titleEl = document.createElement('span');
    titleEl.id = 'cw-title';
    titleEl.textContent = cfg.botName;

    var closeBtn = document.createElement('button');
    closeBtn.id = 'cw-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = 'X';

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    var msgs = document.createElement('div');
    msgs.id = 'cw-messages';

    var inputRow = document.createElement('div');
    inputRow.id = 'cw-inputRow';

    var input = document.createElement('input');
    input.id = 'cw-input';
    input.type = 'text';
    input.placeholder = cfg.placeholder;

    var sendBtn = document.createElement('button');
    sendBtn.id = 'cw-send';
    sendBtn.type = 'button';
    sendBtn.textContent = 'Send';

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);
    panel.appendChild(header);
    panel.appendChild(msgs);
    panel.appendChild(inputRow);
    shadow.appendChild(panel);

    var history = [];

    function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }

    function setOpen(open) {
      panel.style.display = open ? 'flex' : 'none';
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) { setTimeout(function () { input.focus(); }, 0); }
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
      row.appendChild(av);
      row.appendChild(bub);
      msgs.appendChild(row);
      scrollBottom();
      return row;
    }

    function seed() {
      msgs.innerHTML = '';
      history = [];
      addMsg('bot', cfg.welcomeMessage);
    }

    function doSend() {
      var text = input.value.trim();
      if (!text || sendBtn.disabled) { return; }
      input.value = '';
      sendBtn.disabled = true;
      addMsg('user', text);
      history.push({ role: 'user', content: text });
      var typingRow = addMsg('bot', '...');
      setTimeout(function () {
        var reply = 'Thanks for your message! This is a test response - the AI will be connected soon.';
        if (typingRow.parentNode) { typingRow.parentNode.removeChild(typingRow); }
        addMsg('bot', reply);
        history.push({ role: 'assistant', content: reply });
        sendBtn.disabled = false;
        scrollBottom();
      }, 800);
    }

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
