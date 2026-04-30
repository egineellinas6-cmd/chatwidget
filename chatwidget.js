<script>
(function () {
  if (window.__cwLoaded) return;
  window.__cwLoaded = true;

  var cfg = {
    botName: 'AI Assistant',
    iconUrl: null,
    welcomeMessage: 'Γεια σας! Πώς μπορώ να σας βοηθήσω;',
    placeholder: 'Γράψτε ένα μήνυμα...',
    color: '#0ea574',
    colorDark: '#0a7d58',
    width: 380,
    position: 'bottom-right',
    groqApiKey: 'YOUR_API_KEY_HERE',
    model: 'llama-3.1-8b-instant',
    systemPrompt: 'You are a helpful real estate assistant.',
    historyMaxPairs: 10,

    suggestions: [
      'Βρες μου διαμέρισμα στη Θεσσαλονίκη',
      'Τιμές για ενοικίαση;',
      '2 υπνοδωμάτια κέντρο'
    ]
  };

  function init() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    const host = document.createElement('div');
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    const c = cfg.color;
    const cDark = cfg.colorDark;

    /* ---------------- STYLE ---------------- */
    const style = document.createElement('style');
    style.textContent = `
      *{box-sizing:border-box;font-family:system-ui;}

      #cw-btn{
        position:fixed;bottom:24px;right:24px;
        width:56px;height:56px;border-radius:50%;
        background:linear-gradient(135deg,${c},${cDark});
        border:none;color:#fff;cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        z-index:999999;
        box-shadow:0 10px 30px rgba(0,0,0,.25);
      }

      #cw-panel{
        position:fixed;bottom:90px;right:24px;
        width:${cfg.width}px;height:560px;
        background:#fff;border-radius:16px;
        display:flex;flex-direction:column;
        overflow:hidden;
        opacity:0;transform:translateY(20px) scale(.95);
        transition:.25s;
        pointer-events:none;
        box-shadow:0 20px 60px rgba(0,0,0,.2);
      }

      #cw-panel.open{
        opacity:1;transform:none;pointer-events:auto;
      }

      #cw-header{
        padding:14px;
        background:linear-gradient(135deg,${c},${cDark});
        color:#fff;font-weight:600;
      }

      #cw-msgs{
        flex:1;
        overflow:auto;
        padding:14px;
        background:#f6f7f9;
      }

      .cw-bub{
        padding:10px 14px;
        border-radius:14px;
        margin:6px 0;
        max-width:80%;
        font-size:14px;
        line-height:1.4;
      }

      .b{background:#fff;border:1px solid #eee;}
      .u{background:${c};color:#fff;margin-left:auto;}

      #cw-inputRow{
        display:flex;
        gap:8px;
        padding:10px;
        border-top:1px solid #eee;
        background:#fff;
      }

      textarea{
        flex:1;
        resize:none;
        border:none;
        outline:none;
        padding:10px;
        border-radius:12px;
        background:#f1f3f5;
      }

      #cw-send{
        width:40px;height:40px;
        border:none;border-radius:50%;
        background:${c};
        color:#fff;cursor:pointer;
      }

      .chips{
        display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;
      }

      .chip{
        padding:6px 10px;
        border:1px solid #ddd;
        border-radius:20px;
        font-size:12px;
        cursor:pointer;
        background:#fff;
      }

      .typing{opacity:.6;font-size:13px;}
    `;
    shadow.appendChild(style);

    /* ---------------- UI ---------------- */
    const btn = document.createElement('button');
    btn.id = 'cw-btn';
    btn.textContent = '💬';

    const panel = document.createElement('div');
    panel.id = 'cw-panel';

    const header = document.createElement('div');
    header.id = 'cw-header';
    header.textContent = cfg.botName;

    const msgs = document.createElement('div');
    msgs.id = 'cw-msgs';

    const inputRow = document.createElement('div');
    inputRow.id = 'cw-inputRow';

    const input = document.createElement('textarea');
    input.placeholder = cfg.placeholder;

    const send = document.createElement('button');
    send.id = 'cw-send';
    send.textContent = '➤';

    inputRow.appendChild(input);
    inputRow.appendChild(send);

    panel.appendChild(header);
    panel.appendChild(msgs);
    panel.appendChild(inputRow);

    /* IMPORTANT FIX (was crashing UI) */
    shadow.appendChild(btn);
    shadow.appendChild(panel);

    /* ---------------- STATE ---------------- */
    let open = false;
    let history = [];

    function toggle() {
      open = !open;
      panel.classList.toggle('open', open);
      if (open) input.focus();
    }

    btn.onclick = toggle;

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') panel.classList.remove('open');
    });

    function autoResize() {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    }
    input.addEventListener('input', autoResize);

    function addMsg(role, text) {
      const d = document.createElement('div');
      d.className = 'cw-bub ' + (role === 'user' ? 'u' : 'b');
      d.textContent = text;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }

    function addTyping() {
      const d = document.createElement('div');
      d.className = 'typing';
      d.textContent = 'Typing...';
      msgs.appendChild(d);
      return d;
    }

    function addSuggestions() {
      const wrap = document.createElement('div');
      wrap.className = 'chips';

      cfg.suggestions.forEach(s => {
        const c = document.createElement('div');
        c.className = 'chip';
        c.textContent = s;
        c.onclick = () => {
          input.value = s;
          sendMsg();
        };
        wrap.appendChild(c);
      });

      msgs.appendChild(wrap);
    }

    function sendMsg() {
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      autoResize();

      addMsg('user', text);
      history.push({ role: 'user', content: text });

      const typing = addTyping();

      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + cfg.groqApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: cfg.model,
          messages: [
            { role: 'system', content: cfg.systemPrompt },
            ...history
          ]
        })
      })
      .then(r => r.json())
      .then(d => {
        typing.remove();

        let reply = 'Error';
        if (d && d.choices && d.choices[0]) {
          reply = d.choices[0].message.content;
        }

        addMsg('bot', reply);
        history.push({ role: 'assistant', content: reply });
      })
      .catch(() => {
        typing.remove();
        addMsg('bot', 'Σφάλμα. Δοκιμάστε ξανά.');
      });
    }

    send.onclick = sendMsg;

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMsg();
      }
    });

    /* INIT */
    addMsg('bot', cfg.welcomeMessage);
    addSuggestions();
  }

  init();
})();
</script>
