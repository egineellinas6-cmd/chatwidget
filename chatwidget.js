<script>
/* ============================================
   VERSION: v3.0 - Remote JSON from GitHub
   Date: May 2026
   Loads properties from: 
   https://raw.githubusercontent.com/egineellinas6-cmd/chatwidget/refs/heads/main/properties.json
   ============================================ */

(function () {
  if (window.__cwLoaded) return;
  window.__cwLoaded = true;

  const cfg = {
    botName: 'AI Assistant',
    welcomeMessage: 'Γεια σας! Πώς μπορώ να σας βοηθήσω;',
    placeholder: 'Γράψτε ένα μήνυμα...',
    color: '#0ea574',
    colorDark: '#0a7d58',
    width: 380,
    groqApiKey: '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',
    model: 'llama-3.3-70b-versatile',
    suggestions: [
      'Βρες μου διαμέρισμα στη Θεσσαλονίκη',
      'Τιμές για ενοικίαση;',
      '2 υπνοδωμάτια κέντρο'
    ]
  };

  let PROPERTIES = [];

  // Load properties from GitHub
  async function loadProperties() {
    try {
      const res = await fetch("https://raw.githubusercontent.com/egineellinas6-cmd/chatwidget/refs/heads/main/properties.json");
      PROPERTIES = await res.json();
      console.log("✅ Properties loaded from GitHub:", PROPERTIES.length);
    } catch (err) {
      console.error("Failed to load properties.json from GitHub");
      PROPERTIES = [];
    }
  }

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

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      #cw-btn { position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, ${c}, ${cDark}); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 28px; z-index: 9999999; box-shadow: 0 8px 25px rgba(14, 165, 116, 0.35); }
      #cw-panel { position: fixed; bottom: 92px; right: 24px; width: ${cfg.width}px; height: 580px; background: #ffffff; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 70px rgba(0, 0, 0, 0.18); opacity: 0; transform: translateY(30px) scale(0.96); transition: all 0.28s cubic-bezier(0.32, 0.72, 0, 1); pointer-events: none; z-index: 9999998; border: 1px solid #f0f0f0; }
      #cw-panel.open { opacity: 1; transform: none; pointer-events: auto; }
      @media (max-width: 900px) { #cw-panel { width: 100% !important; left: 0 !important; right: 0 !important; bottom: 0 !important; height: 85vh !important; border-radius: 20px 20px 0 0 !important; } }
      #cw-header { background: linear-gradient(135deg, ${c}, ${cDark}); color: white; padding: 14px 16px; display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 15px; }
      .avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 18px; }
      #cw-msgs { flex: 1; overflow-y: auto; padding: 16px; background: #f8fafc; }
      .cw-bub { padding: 12px 16px; border-radius: 18px; margin: 8px 0; max-width: 82%; font-size: 14.5px; line-height: 1.5; }
      .b { background: #fff; border: 1px solid #e2e8f0; }
      .u { background: ${c}; color: white; margin-left: auto; }
      #cw-inputRow { display: flex; gap: 10px; padding: 12px 14px; background: #fff; border-top: 1px solid #f1f5f9; }
      textarea { flex: 1; resize: none; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 16px; font-size: 14.5px; }
      #cw-send { width: 44px; height: 44px; border: none; border-radius: 50%; background: ${c}; color: white; cursor: pointer; }
      #cw-footer { padding: 8px 14px; text-align: center; font-size: 10.5px; color: #94a3b8; }
    `;
    shadow.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'cw-btn';
    btn.innerHTML = '💬';

    const panel = document.createElement('div');
    panel.id = 'cw-panel';

    const header = document.createElement('div');
    header.id = 'cw-header';
    header.innerHTML = `
      <div class="avatar">🏠</div>
      <div class="header-info">
        <div class="bot-name">${cfg.botName}</div>
        <div class="status"><span class="status-dot"></span> Online</div>
      </div>
      <button id="cw-close">×</button>
    `;

    const msgs = document.createElement('div');
    msgs.id = 'cw-msgs';

    const inputRow = document.createElement('div');
    inputRow.id = 'cw-inputRow';

    const input = document.createElement('textarea');
    input.placeholder = cfg.placeholder;

    const send = document.createElement('button');
    send.id = 'cw-send';
    send.innerHTML = '➤';

    inputRow.appendChild(input);
    inputRow.appendChild(send);

    const footer = document.createElement('div');
    footer.id = 'cw-footer';
    footer.innerHTML = `Powered by Groq • v3.0`;

    panel.appendChild(header);
    panel.appendChild(msgs);
    panel.appendChild(inputRow);
    panel.appendChild(footer);

    shadow.appendChild(btn);
    shadow.appendChild(panel);

    let open = false;
    let history = [];
    let isSending = false;

    function toggle() {
      open = !open;
      panel.classList.toggle('open', open);
      if (open) setTimeout(() => input.focus(), 100);
    }
    btn.onclick = toggle;

    header.querySelector('#cw-close').onclick = () => { open = false; panel.classList.remove('open'); };

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) { open = false; panel.classList.remove('open'); }
    });

    function autoResize() {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 110) + 'px';
    }
    input.addEventListener('input', autoResize);

    function addMsg(role, text) {
      const d = document.createElement('div');
      d.className = `cw-bub ${role === 'user' ? 'u' : 'b'}`;
      d.innerHTML = text;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }

    function addTyping() {
      const typing = document.createElement('div');
      typing.className = 'typing';
      typing.innerHTML = `<span>Typing</span><div class="typing-dots"><span></span><span></span><span></span></div>`;
      msgs.appendChild(typing);
      msgs.scrollTop = msgs.scrollHeight;
      return typing;
    }

    async function sendMsg() {
      if (isSending) return;
      const text = input.value.trim();
      if (!text) return;

      isSending = true;
      send.style.opacity = '0.5';
      send.style.pointerEvents = 'none';
      input.value = '';
      autoResize();

      addMsg('user', text);
      history.push({ role: 'user', content: text });

      const typing = addTyping();

      // Build context from loaded properties
      const contextText = PROPERTIES.length > 0 
        ? PROPERTIES.map(p => `• ${p.title} - ${p.location} | ${p.price} | ${p.size}\n  ${p.description}\n  Link: ${p.link}`).join('\n\n')
        : "No properties loaded.";

      const systemPrompt = `You are a helpful real estate assistant for Panda Θεσσαλον "οίκοι".

Use ONLY these properties to answer:
${contextText}

Rules:
- Answer in Greek
- Keep answers short (max 6-8 lines)
- Use bullet points
- When mentioning a property, include the link like this: [Δείτε το ακίνητο](LINK)
- End with phone number: 6974023646`;

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfg.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: cfg.model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...history
            ]
          })
        });

        const data = await res.json();
        typing.remove();

        if (!res.ok) {
          console.error("Groq Error:", data);
          addMsg('bot', `Σφάλμα: ${data.error?.message || 'Προσπαθήστε ξανά'}`);
          isSending = false;
          send.style.opacity = '1';
          send.style.pointerEvents = 'auto';
          return;
        }

        let reply = 'Σφάλμα. Δοκιμάστε ξανά.';
        if (data.choices && data.choices[0]?.message?.content) {
          reply = data.choices[0].message.content;
        }

        addMsg('bot', reply);
        history.push({ role: 'assistant', content: reply });

      } catch (err) {
        typing.remove();
        addMsg('bot', 'Σφάλμα σύνδεσης. Προσπαθήστε ξανά.');
      } finally {
        isSending = false;
        send.style.opacity = '1';
        send.style.pointerEvents = 'auto';
      }
    }

    send.onclick = sendMsg;

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMsg();
      }
    });

    // Load properties from GitHub and show welcome
    loadProperties().then(() => {
      addMsg('bot', cfg.welcomeMessage);
    });
  }

  init();
})();
</script>
