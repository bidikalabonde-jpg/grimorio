/**
 * O GRIMÓRIO DO MESTRE - MOTOR PRINCIPAL DE DADOS & INTERFACE
 */

class GrimoireApp {
  constructor() {
    this.storageKey = 'grimorio_rpg_mestre_v1';
    this.data = this.loadData();
    this.currentTab = 'campanha';
    this.audioCtx = null;
    this.diceHistory = [];

    this.initElements();
    this.bindEvents();
    this.render();
  }

  // Carregamento & Salvamento
  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Erro ao ler localStorage, utilizando dados padrão:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_RPG_DATA));
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      this.showToast("⚠️ Espaço de armazenamento cheio ao salvar!");
      console.error(e);
    }
  }

  getActiveCampaign() {
    const camp = this.data.campaigns.find(c => c.id === this.data.activeCampaignId);
    return camp || this.data.campaigns[0] || null;
  }

  // Inicialização de Elementos DOM
  initElements() {
    this.campaignSelect = document.getElementById('campaignSelect');
    this.stealthBtn = document.getElementById('btnToggleStealth');
    this.diceToggleBtn = document.getElementById('diceToggleBtn');
    this.dicePanel = document.getElementById('dicePanel');
    this.toastEl = document.getElementById('grimoireToast');
    this.tabs = document.querySelectorAll('.tab-btn');
    this.sections = document.querySelectorAll('.view-section');
    this.modalBackdrop = document.getElementById('modalBackdrop');
    this.modalContainer = document.getElementById('modalContainer');
  }

  // Event Listeners
  bindEvents() {
    // Abas
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });

    // Seletor de Campanha
    this.campaignSelect.addEventListener('change', (e) => {
      this.data.activeCampaignId = e.target.value;
      this.saveData();
      this.render();
      this.showToast(`Campanha ativa: ${this.getActiveCampaign().name}`);
    });

    // Modo Mestre Oculto (Anti-Spoiler para jogadores)
    this.stealthBtn.addEventListener('click', () => {
      this.toggleStealthMode();
    });

    // Rolador de Dados
    this.diceToggleBtn.addEventListener('click', () => {
      this.dicePanel.classList.toggle('active');
    });

    // Fechar modal ao clicar fora
    this.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) {
        this.closeModal();
      }
    });

    // Tecla ESC fecha modais e painel de dados
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.dicePanel.classList.remove('active');
      }
    });
  }

  // Alternar Modo Mestre Oculto
  toggleStealthMode() {
    this.data.settings.stealthMode = !this.data.settings.stealthMode;
    this.saveData();
    this.applyStealthMode();
    if (this.data.settings.stealthMode) {
      this.showToast("🛡️ Modo Mestre Oculto ATIVADO! Segredos borrados.");
    } else {
      this.showToast("👁️ Modo Mestre Oculto DESATIVADO! Segredos visíveis.");
    }
  }

  applyStealthMode() {
    if (this.data.settings.stealthMode) {
      document.body.classList.add('stealth-mode-active');
      this.stealthBtn.classList.add('btn-stealth-active');
      this.stealthBtn.innerHTML = `🛡️ Mestre Oculto: ON`;
    } else {
      document.body.classList.remove('stealth-mode-active');
      this.stealthBtn.classList.remove('btn-stealth-active');
      this.stealthBtn.innerHTML = `👁️ Mestre Oculto: OFF`;
    }
  }

  // Alternância de Abas
  switchTab(tabId) {
    this.currentTab = tabId;
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    this.sections.forEach(s => s.classList.toggle('active', s.id === `section-${tabId}`));
    this.renderCurrentTab();
  }

  // Renderização Geral
  render() {
    this.applyStealthMode();
    this.populateCampaignSelect();
    this.renderCurrentTab();
  }

  populateCampaignSelect() {
    this.campaignSelect.innerHTML = '';
    this.data.campaigns.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (c.id === this.data.activeCampaignId) {
        opt.selected = true;
      }
      this.campaignSelect.appendChild(opt);
    });
  }

  renderCurrentTab() {
    const campaign = this.getActiveCampaign();
    if (!campaign) return;

    switch (this.currentTab) {
      case 'campanha':
        this.renderCampaignOverview(campaign);
        break;
      case 'sessoes':
        this.renderSessions(campaign);
        break;
      case 'segredos':
        this.renderSecrets(campaign);
        break;
      case 'npcs':
        this.renderNPCs(campaign);
        break;
      case 'itens':
        this.renderItems(campaign);
        break;
      case 'mapas':
        this.renderLocations(campaign);
        break;
    }
  }

  // --- SEÇÃO: VISÃO GERAL DA CAMPANHA ---
  renderCampaignOverview(campaign) {
    const container = document.getElementById('campaignOverviewContent');
    if (!container) return;

    let playersHtml = '';
    if (campaign.players && campaign.players.length > 0) {
      playersHtml = campaign.players.map((p, idx) => `
        <div class="parchment-card" style="padding: 12px; margin-bottom: 8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>${this.escapeHtml(p.name)}</strong>
            <button class="btn btn-leather" style="padding:2px 8px; font-size:11px;" onclick="app.removePlayer(${idx})">Remover</button>
          </div>
          <div style="font-size:13px; color:var(--crimson); font-weight:600;">${this.escapeHtml(p.character || '')}</div>
          <div style="font-size:12px; color:var(--ink-faded); margin-top:4px;">${this.escapeHtml(p.notes || '')}</div>
        </div>
      `).join('');
    } else {
      playersHtml = `<p style="font-style:italic; color:var(--ink-faded);">Nenhum aventureiro registrado ainda.</p>`;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        <!-- Coluna da Campanha -->
        <div class="parchment-card" style="border-left: 5px solid var(--gold-dark);">
          <div class="card-header">
            <h3 class="card-title">${this.escapeHtml(campaign.name)}</h3>
            <span class="card-badge badge-legendary">${this.escapeHtml(campaign.system)}</span>
          </div>
          <div style="margin-bottom: 12px; font-size: 13px;">
            <strong>Cenário/Mundo:</strong> <span style="color:var(--crimson);">${this.escapeHtml(campaign.setting || 'Não especificado')}</span>
          </div>
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px; white-space: pre-line;">${this.escapeHtml(campaign.description)}</p>
          
          <div style="display:flex; gap:8px; margin-top:auto;">
            <button class="btn btn-gold" onclick="app.openEditCampaignModal()">✏️ Editar Detalhes</button>
            <button class="btn btn-wax" onclick="app.openNewCampaignModal()">➕ Nova Campanha</button>
          </div>
        </div>

        <!-- Coluna dos Jogadores -->
        <div class="parchment-card">
          <div class="card-header">
            <h3 class="card-title">Aventureiros da Mesa (${campaign.players ? campaign.players.length : 0})</h3>
            <button class="btn btn-gold" style="padding: 4px 10px; font-size: 11px;" onclick="app.openAddPlayerModal()">➕ Adicionar Jogador</button>
          </div>
          <div style="max-height: 380px; overflow-y: auto; padding-right: 4px;">
            ${playersHtml}
          </div>
        </div>
      </div>
    `;
  }

  // --- SEÇÃO: DIÁRIO DE SESSÕES ---
  renderSessions(campaign) {
    const list = document.getElementById('sessionsList');
    if (!list) return;

    if (!campaign.sessions || campaign.sessions.length === 0) {
      list.innerHTML = `
        <div class="parchment-card" style="text-align:center; padding: 40px;">
          <h3 class="card-title" style="margin-bottom:10px;">Nenhuma sessão registrada</h3>
          <p style="color:var(--ink-faded); margin-bottom:20px;">Comece a registrar as crônicas e acontecimentos de cada sessão de jogo.</p>
          <button class="btn btn-wax" onclick="app.openNewSessionModal()">📜 Escrever Primeira Sessão</button>
        </div>
      `;
      return;
    }

    // Ordenar por número desc
    const sorted = [...campaign.sessions].sort((a, b) => b.number - a.number);

    list.innerHTML = sorted.map(s => `
      <div class="session-entry">
        <div class="session-top">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="session-number-badge">Sessão #${s.number}</span>
            <h3 style="font-family: var(--font-title); font-size: 18px; color: var(--crimson);">${this.escapeHtml(s.title)}</h3>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="session-date">📅 ${s.date || 'Data não definida'}</span>
            <button class="btn btn-leather" style="padding: 3px 8px; font-size: 11px;" onclick="app.openEditSessionModal('${s.id}')">✏️</button>
            <button class="btn btn-leather" style="padding: 3px 8px; font-size: 11px;" onclick="app.deleteSession('${s.id}')">🗑️</button>
          </div>
        </div>
        <p style="font-size: 14.5px; line-height: 1.7; margin-bottom: 12px; white-space: pre-line;">${this.escapeHtml(s.summary)}</p>
        
        <div class="session-meta-grid">
          ${s.xpAwarded ? `<div class="meta-box"><strong>XP Concedido:</strong> ${this.escapeHtml(s.xpAwarded)}</div>` : ''}
          ${s.rewards ? `<div class="meta-box"><strong>Tesouros & Itens:</strong> ${this.escapeHtml(s.rewards)}</div>` : ''}
          ${s.hooks ? `<div class="meta-box"><strong>Ganchos & Próximos Passos:</strong> ${this.escapeHtml(s.hooks)}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  // --- SEÇÃO: PAINEL SECRETO DO MESTRE ---
  renderSecrets(campaign) {
    const grid = document.getElementById('secretsGrid');
    if (!grid) return;

    if (!campaign.secrets || campaign.secrets.length === 0) {
      grid.innerHTML = `
        <div class="parchment-card" style="grid-column: 1/-1; text-align:center; padding: 40px;">
          <h3 class="card-title">Nenhum segredo guardado no cofre</h3>
          <p style="color:var(--ink-faded); margin: 12px 0 20px;">Anote aqui reviravoltas, verdade dos NPCs, e revelações planejadas.</p>
          <button class="btn btn-wax" onclick="app.openNewSecretModal()">🤫 Lacrar Novo Segredo</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = campaign.secrets.map(sec => `
      <div class="parchment-card secret-card">
        <div class="card-header">
          <span class="card-badge ${sec.revealed ? 'badge-neutral' : 'badge-hostile'}">
            ${sec.revealed ? '✓ Revelado aos Jogadores' : '🔒 Confidencial / Oculto'}
          </span>
          <span style="font-size: 11px; font-family: var(--font-accent); color: var(--ink-faded);">${this.escapeHtml(sec.category || 'Geral')}</span>
        </div>
        <h4 style="font-family: var(--font-title); font-size: 16px; color: var(--crimson); margin-bottom: 6px;">${this.escapeHtml(sec.title)}</h4>
        <div class="secret-content">
          ${this.escapeHtml(sec.content)}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:10px;">
          <label style="font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px;">
            <input type="checkbox" ${sec.revealed ? 'checked' : ''} onchange="app.toggleSecretRevealed('${sec.id}')">
            Revelado?
          </label>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-leather" style="padding: 3px 8px; font-size: 11px;" onclick="app.openEditSecretModal('${sec.id}')">✏️</button>
            <button class="btn btn-leather" style="padding: 3px 8px; font-size: 11px;" onclick="app.deleteSecret('${sec.id}')">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- SEÇÃO: NPCS & FACÇÕES ---
  renderNPCs(campaign) {
    const grid = document.getElementById('npcsGrid');
    if (!grid) return;

    if (!campaign.npcs || campaign.npcs.length === 0) {
      grid.innerHTML = `
        <div class="parchment-card" style="grid-column: 1/-1; text-align:center; padding: 40px;">
          <h3 class="card-title">Nenhum NPC registrado</h3>
          <p style="color:var(--ink-faded); margin: 12px 0 20px;">Dê vida ao mundo criando nobres, lojistas, vilões ou aliados.</p>
          <div style="display:flex; justify-content:center; gap:10px;">
            <button class="btn btn-wax" onclick="app.openNewNPCModal()">👤 Criar NPC Manualmente</button>
            <button class="btn btn-gold" onclick="app.generateRandomNPC()">🎲 Gerar NPC Rápido</button>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = campaign.npcs.map(npc => {
      let badgeClass = 'badge-neutral';
      if (npc.status && (npc.status.toLowerCase().includes('aliad') || npc.status.toLowerCase().includes('amigo'))) badgeClass = 'badge-allied';
      if (npc.status && (npc.status.toLowerCase().includes('hostil') || npc.status.toLowerCase().includes('vil') || npc.status.toLowerCase().includes('inimigo'))) badgeClass = 'badge-hostile';

      return `
        <div class="parchment-card">
          <div class="card-header">
            <div>
              <h4 class="card-title" style="font-size:17px;">${this.escapeHtml(npc.name)}</h4>
              <div style="font-size:12px; color:var(--ink-faded); font-family:var(--font-accent);">${this.escapeHtml(npc.role || '')}</div>
            </div>
            <span class="card-badge ${badgeClass}">${this.escapeHtml(npc.status || 'Neutro')}</span>
          </div>

          <div style="font-size:13px; margin-bottom:8px;">
            <strong>Facção:</strong> <span style="color:var(--crimson);">${this.escapeHtml(npc.faction || 'Nenhuma')}</span> | 
            <strong>Local:</strong> <span>${this.escapeHtml(npc.location || 'Incerto')}</span>
          </div>

          ${npc.appearance ? `<div style="font-size:12.5px; color:var(--ink-mid); margin-bottom:6px;"><strong>Aparência:</strong> ${this.escapeHtml(npc.appearance)}</div>` : ''}
          ${npc.personality ? `<div style="font-size:12.5px; color:var(--ink-mid); margin-bottom:6px;"><strong>Personalidade:</strong> ${this.escapeHtml(npc.personality)}</div>` : ''}
          ${npc.secret ? `
            <div class="secret-content" style="font-size:12px; margin: 8px 0;">
              <strong>🤫 Segredo do Mestre:</strong> ${this.escapeHtml(npc.secret)}
            </div>
          ` : ''}
          ${npc.stats ? `<div style="font-size:12px; background:#e6d7bc; padding:6px 10px; border-radius:4px; font-family:var(--font-accent); margin-top:6px;"><strong>⚔️ Combate:</strong> ${this.escapeHtml(npc.stats)}</div>` : ''}

          <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:auto; padding-top:10px;">
            <button class="btn btn-leather" style="padding: 3px 8px; font-size: 11px;" onclick="app.openEditNPCModal('${npc.id}')">✏️ Editar</button>
            <button class="btn btn-leather" style="padding: 3px 8px; font-size: 11px;" onclick="app.deleteNPC('${npc.id}')">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- SEÇÃO: ITENS & TESOUROS ---
  renderItems(campaign) {
    const grid = document.getElementById('itemsGrid');
    if (!grid) return;

    if (!campaign.items || campaign.items.length === 0) {
      grid.innerHTML = `
        <div class="parchment-card" style="grid-column: 1/-1; text-align:center; padding: 40px;">
          <h3 class="card-title">Nenhum item ou artefato registrado</h3>
          <p style="color:var(--ink-faded); margin: 12px 0 20px;">Adicione armas mágicas, relíquias antigas e poções da sua mesa.</p>
          <button class="btn btn-wax" onclick="app.openNewItemModal()">⚔️ Adicionar Item Mágico</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = campaign.items.map(item => {
      let rClass = 'badge-common';
      const r = (item.rarity || '').toLowerCase();
      if (r.includes('lend')) rClass = 'badge-legendary';
      else if (r.includes('rar')) rClass = 'badge-rare';
      else if (r.includes('incom')) rClass = 'badge-uncommon';

      return `
        <div class="parchment-card">
          <div class="card-header">
            <div>
              <h4 class="card-title" style="font-size:17px;">${this.escapeHtml(item.name)}</h4>
              <div style="font-size:12px; color:var(--ink-faded);">${this.escapeHtml(item.type || 'Item Geral')}</div>
            </div>
            <span class="card-badge ${rClass}">${this.escapeHtml(item.rarity || 'Comum')}</span>
          </div>

          <div style="display:flex; gap:12px; font-size:12px; margin-bottom:10px; color:var(--crimson); font-family:var(--font-accent); font-weight:600;">
            ${item.value ? `<span>💰 Valor: ${this.escapeHtml(item.value)}</span>` : ''}
            ${item.attunement ? `<span>🔮 Requer Sintonização</span>` : '<span>✨ Sintonização não necessária</span>'}
          </div>

          <p style="font-size:13.5px; line-height:1.5; margin-bottom:10px;">${this.escapeHtml(item.description || '')}</p>

          ${item.properties ? `
            <div style="background:#e8dac0; border-left:3px solid var(--gold-dark); padding:8px 10px; font-size:12.5px; margin-bottom:10px;">
              <strong>Efeitos & Propriedades:</strong> ${this.escapeHtml(item.properties)}
            </div>
          ` : ''}

          <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:auto; padding-top:8px;">
            <button class="btn btn-leather" style="padding: 3px 8px; font-size: 11px;" onclick="app.openEditItemModal('${item.id}')">✏️ Editar</button>
            <button class="btn btn-leather" style="padding: 3px 8px; font-size: 11px;" onclick="app.deleteItem('${item.id}')">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- SEÇÃO: MAPAS & LUGARES ---
  renderLocations(campaign) {
    const grid = document.getElementById('locationsGrid');
    if (!grid) return;

    if (!campaign.locations || campaign.locations.length === 0) {
      grid.innerHTML = `
        <div class="parchment-card" style="grid-column: 1/-1; text-align:center; padding: 40px;">
          <h3 class="card-title">Nenhum local ou mapa mapeado</h3>
          <p style="color:var(--ink-faded); margin: 12px 0 20px;">Guarde cidades, masmorras, reinos e pontos de interesse do seu mundo.</p>
          <button class="btn btn-wax" onclick="app.openNewLocationModal()">🗺️ Adicionar Localidade</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = campaign.locations.map(loc => `
      <div class="parchment-card">
        <div class="card-header">
          <div>
            <h4 class="card-title" style="font-size:17px;">${this.escapeHtml(loc.name)}</h4>
            <div style="font-size:12px; color:var(--ink-faded);">${this.escapeHtml(loc.type || 'Região')}</div>
          </div>
          <span class="card-badge badge-neutral">Perigo: ${this.escapeHtml(loc.danger || 'Indefinido')}</span>
        </div>

        <p style="font-size:13.5px; line-height:1.5; margin-bottom:10px;">${this.escapeHtml(loc.description || '')}</p>

        ${loc.pointsOfInterest ? `
          <div style="background:#e8dac0; padding:8px 10px; border-radius:4px; font-size:12.5px; margin-bottom:10px;">
            <strong>📍 Pontos de Interesse:</strong> ${this.escapeHtml(loc.pointsOfInterest)}
          </div>
        ` : ''}

        ${loc.mapUrl ? `
          <div style="margin-top:10px; border:2px solid var(--gold-dark); border-radius:4px; overflow:hidden;">
            <img src="${loc.mapUrl}" alt="Mapa de ${this.escapeHtml(loc.name)}" style="width:100%; max-height:220px; object-fit:cover; display:block; cursor:pointer;" onclick="app.openImagePreview('${loc.mapUrl}', '${this.escapeHtml(loc.name)}')"/>
          </div>
        ` : ''}

        <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:auto; padding-top:10px;">
          <button class="btn btn-leather" style="padding: 3px 8px; font-size: 11px;" onclick="app.openEditLocationModal('${loc.id}')">✏️ Editar</button>
          <button class="btn btn-leather" style="padding: 3px 8px; font-size: 11px;" onclick="app.deleteLocation('${loc.id}')">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  // --- ROLADOR DE DADOS E SOM SINTETIZADO ---
  playDiceSound() {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Sintetizar estalo de dados rolando na mesa de madeira
      const now = this.audioCtx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        osc.type = 'triangle';
        const startFreq = 220 + Math.random() * 260;
        osc.frequency.setValueAtTime(startFreq, now + i * 0.06);
        osc.frequency.exponentialRampToValueAtTime(80, now + i * 0.06 + 0.05);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.18 / (i + 1), now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.07);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.08);
      }
    } catch (e) {
      // Navegadores com restrição de áudio silenciam sem erro
    }
  }

  rollDice(sides) {
    this.playDiceSound();
    const countInput = document.getElementById('diceCountInput');
    const modInput = document.getElementById('diceModInput');
    const count = Math.max(1, parseInt(countInput ? countInput.value : 1) || 1);
    const mod = parseInt(modInput ? modInput.value : 0) || 0;

    let rolls = [];
    let sum = 0;
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      sum += roll;
    }
    const total = sum + mod;

    const resultTotalEl = document.getElementById('diceResultTotal');
    const resultDetailEl = document.getElementById('diceResultDetail');

    let modStr = mod !== 0 ? (mod > 0 ? ` + ${mod}` : ` - ${Math.abs(mod)}`) : '';
    let detailText = `${count}d${sides} [${rolls.join(', ')}]${modStr}`;

    resultTotalEl.classList.remove('result-crit', 'result-fail');
    if (sides === 20 && count === 1) {
      if (rolls[0] === 20) {
        resultTotalEl.classList.add('result-crit');
        detailText += ' — 🌟 ACERTO CRÍTICO!';
      } else if (rolls[0] === 1) {
        resultTotalEl.classList.add('result-fail');
        detailText += ' — 💀 FALHA CRÍTICA!';
      }
    }

    resultTotalEl.textContent = total;
    resultDetailEl.textContent = detailText;

    // Registrar no histórico
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.diceHistory.unshift({ time: now, text: `${detailText} = <strong>${total}</strong>` });
    if (this.diceHistory.length > 20) this.diceHistory.pop();

    this.renderDiceHistory();
  }

  renderDiceHistory() {
    const historyContainer = document.getElementById('diceHistoryList');
    if (!historyContainer) return;
    historyContainer.innerHTML = this.diceHistory.map(h => `
      <div class="history-entry">
        <span>${h.text}</span>
        <span style="opacity:0.7;">${h.time}</span>
      </div>
    `).join('');
  }

  // --- GERADOR DE NPC ALEATÓRIO ---
  generateRandomNPC() {
    const firstNames = ["Theron", "Alia", "Dorn", "Kaelen", "Morrigan", "Boran", "Valeria", "Garrick", "Sylvan", "Vesper", "Bran", "Lyanna", "Thalor", "Kael"];
    const lastNames = ["Coração-de-Ferro", "Sussurro-da-Noite", "Chama-Eterna", "Falco", "Ribeiro", "Corvo-Negro", "Lâmina-Pálida", "Gravewood", "Vander"];
    const roles = ["Ferreiro Arcano", "Mercenário Errante", "Sacerdotisa da Luz", "Espião da Coroa", "Ervanária Misteriosa", "Nobre Endividado", "Caçador de Recompensas", "Contrabandista"];
    const factions = ["Guilda das Sombras", "Ordem do Sol Alvo", "Independentes", "Nobreza de Valoria", "Círculo dos Druidas", "Culto das Catacumbas"];
    const traits = ["Extremamente desconfiado", "Fala em enigmas e charadas", "Sempre acaricia o punho da adaga", "Aparente amabilidade, olhar predatório", "Gagueja quando mente"];
    const secrets = [
      "Roubou uma relíquia proibida e finge ser um humilde artesão.",
      "Está secretamente a serviço do vilão principal como informante.",
      "É o herdeiro legítimo de uma linhagem nobre supostamente extinta.",
      "Possui uma maldição de licantropia oculta.",
      "Sabe onde se esconde o covil dos bandidos da floresta."
    ];

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const newNPC = {
      id: "npc_" + Date.now(),
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      role: pick(roles),
      faction: pick(factions),
      status: "Neutro",
      location: "Taverna Local",
      appearance: "Capa de viagem puída, cicatriz na têmpora esquerda e botas enlameadas.",
      personality: pick(traits),
      secret: pick(secrets),
      stats: "CA 14, PV 35, Ataque: Espada Curta (+5, 1d6+3)"
    };

    const campaign = this.getActiveCampaign();
    if (!campaign.npcs) campaign.npcs = [];
    campaign.npcs.unshift(newNPC);
    this.saveData();
    this.renderNPCs(campaign);
    this.showToast(`✨ NPC Gerado: ${newNPC.name}`);
  }

  // --- MODAIS E AÇÕES CRUD ---
  openModal(title, htmlBody, onSave) {
    this.modalContainer.innerHTML = `
      <div class="modal-header">
        <span>${title}</span>
        <button class="btn btn-leather" style="padding:2px 8px;" onclick="app.closeModal()">✕</button>
      </div>
      <div class="modal-body">${htmlBody}</div>
      <div class="modal-footer">
        <button class="btn btn-leather" onclick="app.closeModal()">Cancelar</button>
        <button class="btn btn-wax" id="modalSaveBtn">Salvar no Grimório</button>
      </div>
    `;

    document.getElementById('modalSaveBtn').addEventListener('click', () => {
      if (onSave()) {
        this.closeModal();
      }
    });

    this.modalBackdrop.classList.add('active');
  }

  closeModal() {
    this.modalBackdrop.classList.remove('active');
  }

  // Nova Campanha
  openNewCampaignModal() {
    const html = `
      <div class="form-group">
        <label>Nome da Campanha:</label>
        <input type="text" id="mCampName" class="form-input" placeholder="Ex: A Fúria do Dragão de Gelo" required />
      </div>
      <div class="form-group">
        <label>Sistema de RPG:</label>
        <input type="text" id="mCampSystem" class="form-input" placeholder="Ex: D&D 5e, Tormenta20, Ordem Paranormal, Chamado de Cthulhu..." />
      </div>
      <div class="form-group">
        <label>Cenário / Mundo:</label>
        <input type="text" id="mCampSetting" class="form-input" placeholder="Ex: Forgotten Realms, Arton, Terra Medieval..." />
      </div>
      <div class="form-group">
        <label>Sinopse / Visão Geral:</label>
        <textarea id="mCampDesc" class="form-textarea" rows="4" placeholder="Descreva o conflito inicial, o tom da aventura e o que espera os jogadores..."></textarea>
      </div>
    `;

    this.openModal("📜 Registrar Nova Campanha", html, () => {
      const name = document.getElementById('mCampName').value.trim();
      if (!name) {
        alert("O nome da campanha é obrigatório!");
        return false;
      }
      const newCamp = {
        id: "camp_" + Date.now(),
        name: name,
        system: document.getElementById('mCampSystem').value.trim() || 'Custom',
        setting: document.getElementById('mCampSetting').value.trim(),
        description: document.getElementById('mCampDesc').value.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        players: [],
        sessions: [],
        secrets: [],
        npcs: [],
        items: [],
        locations: []
      };
      this.data.campaigns.push(newCamp);
      this.data.activeCampaignId = newCamp.id;
      this.saveData();
      this.render();
      this.showToast(`Campanha '${name}' criada com sucesso!`);
      return true;
    });
  }

  // Editar Campanha Atual
  openEditCampaignModal() {
    const c = this.getActiveCampaign();
    if (!c) return;

    const html = `
      <div class="form-group">
        <label>Nome da Campanha:</label>
        <input type="text" id="mCampName" class="form-input" value="${this.escapeHtml(c.name)}" />
      </div>
      <div class="form-group">
        <label>Sistema de RPG:</label>
        <input type="text" id="mCampSystem" class="form-input" value="${this.escapeHtml(c.system || '')}" />
      </div>
      <div class="form-group">
        <label>Cenário / Mundo:</label>
        <input type="text" id="mCampSetting" class="form-input" value="${this.escapeHtml(c.setting || '')}" />
      </div>
      <div class="form-group">
        <label>Sinopse / Visão Geral:</label>
        <textarea id="mCampDesc" class="form-textarea" rows="4">${this.escapeHtml(c.description || '')}</textarea>
      </div>
    `;

    this.openModal("✏️ Editar Detalhes da Campanha", html, () => {
      c.name = document.getElementById('mCampName').value.trim() || c.name;
      c.system = document.getElementById('mCampSystem').value.trim();
      c.setting = document.getElementById('mCampSetting').value.trim();
      c.description = document.getElementById('mCampDesc').value.trim();
      this.saveData();
      this.render();
      this.showToast("Campanha atualizada!");
      return true;
    });
  }

  // Adicionar Jogador
  openAddPlayerModal() {
    const html = `
      <div class="form-group">
        <label>Nome do Jogador / Personagem:</label>
        <input type="text" id="mPName" class="form-input" placeholder="Ex: Bryan (Lucas)" required />
      </div>
      <div class="form-group">
        <label>Classe, Raça e Nível:</label>
        <input type="text" id="mPChar" class="form-input" placeholder="Ex: Paladino Nível 4 (Humano)" />
      </div>
      <div class="form-group">
        <label>Anotações do Mestre / Motivações:</label>
        <textarea id="mPNotes" class="form-textarea" rows="3" placeholder="Ex: Busca vingar o irmão desaparecido na floresta..."></textarea>
      </div>
    `;

    this.openModal("➕ Adicionar Aventureiro à Mesa", html, () => {
      const name = document.getElementById('mPName').value.trim();
      if (!name) return false;
      const c = this.getActiveCampaign();
      if (!c.players) c.players = [];
      c.players.push({
        name: name,
        character: document.getElementById('mPChar').value.trim(),
        notes: document.getElementById('mPNotes').value.trim()
      });
      this.saveData();
      this.renderCampaignOverview(c);
      this.showToast(`Jogador ${name} adicionado!`);
      return true;
    });
  }

  removePlayer(idx) {
    const c = this.getActiveCampaign();
    if (confirm(`Remover aventureiro ${c.players[idx].name}?`)) {
      c.players.splice(idx, 1);
      this.saveData();
      this.renderCampaignOverview(c);
      this.showToast("Aventureiro removido.");
    }
  }

  // Nova Sessão
  openNewSessionModal() {
    const c = this.getActiveCampaign();
    const nextNum = (c.sessions && c.sessions.length > 0) ? Math.max(...c.sessions.map(s => s.number)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];

    const html = `
      <div style="display:flex; gap:12px;">
        <div class="form-group" style="width:100px;">
          <label>Nº Sessão:</label>
          <input type="number" id="mSessNum" class="form-input" value="${nextNum}" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Data:</label>
          <input type="date" id="mSessDate" class="form-input" value="${today}" />
        </div>
      </div>
      <div class="form-group">
        <label>Título da Sessão:</label>
        <input type="text" id="mSessTitle" class="form-input" placeholder="Ex: A Emboscada no Desfiladeiro da Morte" required />
      </div>
      <div class="form-group">
        <label>Resumo dos Acontecimentos:</label>
        <textarea id="mSessSummary" class="form-textarea" rows="5" placeholder="O que aconteceu nesta sessão? Decisões tomadas pelos jogadores, combates travados e pistas encontradas..."></textarea>
      </div>
      <div class="form-group">
        <label>Recompensas & Tesouros:</label>
        <input type="text" id="mSessRewards" class="form-input" placeholder="Ex: 120 PO, Joia de Rubi, Poção de Invisibilidade" />
      </div>
      <div class="form-group">
        <label>XP ou Marco Concedido:</label>
        <input type="text" id="mSessXP" class="form-input" placeholder="Ex: 500 XP cada / Marco de Nível 5" />
      </div>
      <div class="form-group">
        <label>Ganchos Pendentes & Próxima Sessão:</label>
        <input type="text" id="mSessHooks" class="form-input" placeholder="Ex: Investigar a caverna ao amanhecer; interrogar o cultista capturado" />
      </div>
    `;

    this.openModal("📜 Registrar Sessão de Jogo", html, () => {
      const title = document.getElementById('mSessTitle').value.trim();
      if (!title) {
        alert("O título da sessão é obrigatório!");
        return false;
      }
      if (!c.sessions) c.sessions = [];
      c.sessions.push({
        id: "sess_" + Date.now(),
        number: parseInt(document.getElementById('mSessNum').value) || nextNum,
        date: document.getElementById('mSessDate').value,
        title: title,
        summary: document.getElementById('mSessSummary').value.trim(),
        rewards: document.getElementById('mSessRewards').value.trim(),
        xpAwarded: document.getElementById('mSessXP').value.trim(),
        hooks: document.getElementById('mSessHooks').value.trim()
      });
      this.saveData();
      this.renderSessions(c);
      this.showToast(`Sessão #${nextNum} registrada!`);
      return true;
    });
  }

  openEditSessionModal(id) {
    const c = this.getActiveCampaign();
    const s = c.sessions.find(x => x.id === id);
    if (!s) return;

    const html = `
      <div style="display:flex; gap:12px;">
        <div class="form-group" style="width:100px;">
          <label>Nº Sessão:</label>
          <input type="number" id="mSessNum" class="form-input" value="${s.number}" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Data:</label>
          <input type="date" id="mSessDate" class="form-input" value="${s.date || ''}" />
        </div>
      </div>
      <div class="form-group">
        <label>Título:</label>
        <input type="text" id="mSessTitle" class="form-input" value="${this.escapeHtml(s.title)}" required />
      </div>
      <div class="form-group">
        <label>Resumo dos Acontecimentos:</label>
        <textarea id="mSessSummary" class="form-textarea" rows="5">${this.escapeHtml(s.summary || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Recompensas & Tesouros:</label>
        <input type="text" id="mSessRewards" class="form-input" value="${this.escapeHtml(s.rewards || '')}" />
      </div>
      <div class="form-group">
        <label>XP ou Marco Concedido:</label>
        <input type="text" id="mSessXP" class="form-input" value="${this.escapeHtml(s.xpAwarded || '')}" />
      </div>
      <div class="form-group">
        <label>Ganchos Pendentes:</label>
        <input type="text" id="mSessHooks" class="form-input" value="${this.escapeHtml(s.hooks || '')}" />
      </div>
    `;

    this.openModal(`✏️ Editar Sessão #${s.number}`, html, () => {
      s.number = parseInt(document.getElementById('mSessNum').value) || s.number;
      s.date = document.getElementById('mSessDate').value;
      s.title = document.getElementById('mSessTitle').value.trim() || s.title;
      s.summary = document.getElementById('mSessSummary').value.trim();
      s.rewards = document.getElementById('mSessRewards').value.trim();
      s.xpAwarded = document.getElementById('mSessXP').value.trim();
      s.hooks = document.getElementById('mSessHooks').value.trim();
      this.saveData();
      this.renderSessions(c);
      this.showToast("Sessão atualizada!");
      return true;
    });
  }

  deleteSession(id) {
    const c = this.getActiveCampaign();
    if (confirm("Deseja realmente apagar esta sessão do diário?")) {
      c.sessions = c.sessions.filter(s => s.id !== id);
      this.saveData();
      this.renderSessions(c);
      this.showToast("Sessão excluída.");
    }
  }

  // Segredos do Mestre
  openNewSecretModal() {
    const html = `
      <div class="form-group">
        <label>Título do Segredo / Reviravolta:</label>
        <input type="text" id="mSecTitle" class="form-input" placeholder="Ex: A Verdadeira Identidade do Regente" required />
      </div>
      <div class="form-group">
        <label>Categoria:</label>
        <select id="mSecCat" class="form-select">
          <option value="Trama Principal">Trama Principal</option>
          <option value="Segredo de Personagem">Segredo de Personagem</option>
          <option value="Reviravolta Iminente">Reviravolta Iminente</option>
          <option value="Fraqueza do Vilão">Fraqueza do Vilão</option>
          <option value="Lore Oculto">Lore Oculto</option>
        </select>
      </div>
      <div class="form-group">
        <label>Conteúdo Confidencial (Apenas para os olhos do Mestre):</label>
        <textarea id="mSecContent" class="form-textarea" rows="4" placeholder="Descreva os fatos que os jogadores ainda não descobriram..."></textarea>
      </div>
    `;

    this.openModal("🔒 Selar Novo Segredo", html, () => {
      const title = document.getElementById('mSecTitle').value.trim();
      const content = document.getElementById('mSecContent').value.trim();
      if (!title || !content) {
        alert("Preencha o título e o conteúdo do segredo.");
        return false;
      }
      const c = this.getActiveCampaign();
      if (!c.secrets) c.secrets = [];
      c.secrets.push({
        id: "sec_" + Date.now(),
        title: title,
        category: document.getElementById('mSecCat').value,
        content: content,
        revealed: false
      });
      this.saveData();
      this.renderSecrets(c);
      this.showToast("Segredo selado no cofre!");
      return true;
    });
  }

  openEditSecretModal(id) {
    const c = this.getActiveCampaign();
    const sec = c.secrets.find(x => x.id === id);
    if (!sec) return;

    const html = `
      <div class="form-group">
        <label>Título do Segredo:</label>
        <input type="text" id="mSecTitle" class="form-input" value="${this.escapeHtml(sec.title)}" required />
      </div>
      <div class="form-group">
        <label>Categoria:</label>
        <input type="text" id="mSecCat" class="form-input" value="${this.escapeHtml(sec.category || '')}" />
      </div>
      <div class="form-group">
        <label>Conteúdo Confidencial:</label>
        <textarea id="mSecContent" class="form-textarea" rows="4">${this.escapeHtml(sec.content || '')}</textarea>
      </div>
    `;

    this.openModal("✏️ Editar Segredo", html, () => {
      sec.title = document.getElementById('mSecTitle').value.trim() || sec.title;
      sec.category = document.getElementById('mSecCat').value.trim();
      sec.content = document.getElementById('mSecContent').value.trim();
      this.saveData();
      this.renderSecrets(c);
      this.showToast("Segredo atualizado.");
      return true;
    });
  }

  toggleSecretRevealed(id) {
    const c = this.getActiveCampaign();
    const sec = c.secrets.find(x => x.id === id);
    if (sec) {
      sec.revealed = !sec.revealed;
      this.saveData();
      this.renderSecrets(c);
      this.showToast(sec.revealed ? "Marcado como revelado aos jogadores!" : "Retornado ao status confidencial.");
    }
  }

  deleteSecret(id) {
    const c = this.getActiveCampaign();
    if (confirm("Remover este segredo permanentemente?")) {
      c.secrets = c.secrets.filter(s => s.id !== id);
      this.saveData();
      this.renderSecrets(c);
      this.showToast("Segredo destruído.");
    }
  }

  // Novo NPC
  openNewNPCModal() {
    const html = `
      <div class="form-group">
        <label>Nome do NPC:</label>
        <input type="text" id="mNPCName" class="form-input" placeholder="Ex: Lorde Roderic Valen" required />
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Papel / Ocupação:</label>
          <input type="text" id="mNPCRole" class="form-input" placeholder="Ex: Alquimista Real" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Status / Alinhamento:</label>
          <input type="text" id="mNPCStatus" class="form-input" placeholder="Ex: Aliado, Neutro, Hostil..." />
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Facção / Organização:</label>
          <input type="text" id="mNPCFaction" class="form-input" placeholder="Ex: Guilda dos Ladrões" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Localização Atual:</label>
          <input type="text" id="mNPCLocation" class="form-input" placeholder="Ex: Castelo da Capital" />
        </div>
      </div>
      <div class="form-group">
        <label>Aparência & Maneirismos:</label>
        <input type="text" id="mNPCAppearance" class="form-input" placeholder="Ex: Olho de vidro, capa cinzenta, cheira a ervas secas..." />
      </div>
      <div class="form-group">
        <label>Personalidade:</label>
        <input type="text" id="mNPCPersonality" class="form-input" placeholder="Ex: Frio, calculista, mas generoso com quem o respeita..." />
      </div>
      <div class="form-group">
        <label>🤫 Segredo ou Motivação Oculta:</label>
        <textarea id="mNPCSecret" class="form-textarea" rows="2" placeholder="O que ele esconde dos jogadores?"></textarea>
      </div>
      <div class="form-group">
        <label>Ficha Rápida de Combate (PV, CA, Ataques):</label>
        <input type="text" id="mNPCStats" class="form-input" placeholder="Ex: CA 15, PV 45, Ataque: Rapieira (+5, 1d8+3)" />
      </div>
    `;

    this.openModal("👤 Criar Novo NPC", html, () => {
      const name = document.getElementById('mNPCName').value.trim();
      if (!name) return false;
      const c = this.getActiveCampaign();
      if (!c.npcs) c.npcs = [];
      c.npcs.push({
        id: "npc_" + Date.now(),
        name: name,
        role: document.getElementById('mNPCRole').value.trim(),
        status: document.getElementById('mNPCStatus').value.trim() || 'Neutro',
        faction: document.getElementById('mNPCFaction').value.trim(),
        location: document.getElementById('mNPCLocation').value.trim(),
        appearance: document.getElementById('mNPCAppearance').value.trim(),
        personality: document.getElementById('mNPCPersonality').value.trim(),
        secret: document.getElementById('mNPCSecret').value.trim(),
        stats: document.getElementById('mNPCStats').value.trim()
      });
      this.saveData();
      this.renderNPCs(c);
      this.showToast(`NPC ${name} adicionado ao tomo!`);
      return true;
    });
  }

  openEditNPCModal(id) {
    const c = this.getActiveCampaign();
    const npc = c.npcs.find(x => x.id === id);
    if (!npc) return;

    const html = `
      <div class="form-group">
        <label>Nome do NPC:</label>
        <input type="text" id="mNPCName" class="form-input" value="${this.escapeHtml(npc.name)}" required />
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Papel:</label>
          <input type="text" id="mNPCRole" class="form-input" value="${this.escapeHtml(npc.role || '')}" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Status:</label>
          <input type="text" id="mNPCStatus" class="form-input" value="${this.escapeHtml(npc.status || '')}" />
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Facção:</label>
          <input type="text" id="mNPCFaction" class="form-input" value="${this.escapeHtml(npc.faction || '')}" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Localização:</label>
          <input type="text" id="mNPCLocation" class="form-input" value="${this.escapeHtml(npc.location || '')}" />
        </div>
      </div>
      <div class="form-group">
        <label>Aparência:</label>
        <input type="text" id="mNPCAppearance" class="form-input" value="${this.escapeHtml(npc.appearance || '')}" />
      </div>
      <div class="form-group">
        <label>Personalidade:</label>
        <input type="text" id="mNPCPersonality" class="form-input" value="${this.escapeHtml(npc.personality || '')}" />
      </div>
      <div class="form-group">
        <label>Segredo:</label>
        <textarea id="mNPCSecret" class="form-textarea" rows="2">${this.escapeHtml(npc.secret || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Ficha de Combate:</label>
        <input type="text" id="mNPCStats" class="form-input" value="${this.escapeHtml(npc.stats || '')}" />
      </div>
    `;

    this.openModal(`✏️ Editar NPC: ${npc.name}`, html, () => {
      npc.name = document.getElementById('mNPCName').value.trim() || npc.name;
      npc.role = document.getElementById('mNPCRole').value.trim();
      npc.status = document.getElementById('mNPCStatus').value.trim();
      npc.faction = document.getElementById('mNPCFaction').value.trim();
      npc.location = document.getElementById('mNPCLocation').value.trim();
      npc.appearance = document.getElementById('mNPCAppearance').value.trim();
      npc.personality = document.getElementById('mNPCPersonality').value.trim();
      npc.secret = document.getElementById('mNPCSecret').value.trim();
      npc.stats = document.getElementById('mNPCStats').value.trim();
      this.saveData();
      this.renderNPCs(c);
      this.showToast("NPC atualizado!");
      return true;
    });
  }

  deleteNPC(id) {
    const c = this.getActiveCampaign();
    if (confirm("Remover este NPC da campanha?")) {
      c.npcs = c.npcs.filter(n => n.id !== id);
      this.saveData();
      this.renderNPCs(c);
      this.showToast("NPC removido.");
    }
  }

  // Novo Item Mágico
  openNewItemModal() {
    const html = `
      <div class="form-group">
        <label>Nome do Item:</label>
        <input type="text" id="mItemName" class="form-input" placeholder="Ex: Anel da Visão Sombria" required />
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Tipo:</label>
          <input type="text" id="mItemType" class="form-input" placeholder="Ex: Arma, Armadura, Poção, Varinha..." />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Raridade:</label>
          <select id="mItemRarity" class="form-select">
            <option value="Comum">Comum</option>
            <option value="Incomum">Incomum</option>
            <option value="Raro">Raro</option>
            <option value="Muito Raro">Muito Raro</option>
            <option value="Lendário">Lendário</option>
            <option value="Artefato">Artefato</option>
          </select>
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <div class="form-group" style="flex:1;">
          <label>Valor de Mercado / PO:</label>
          <input type="text" id="mItemValue" class="form-input" placeholder="Ex: 500 PO" />
        </div>
        <div class="form-group" style="padding-top:16px;">
          <label style="cursor:pointer; display:flex; align-items:center; gap:6px;">
            <input type="checkbox" id="mItemAttune" /> Requer Sintonização?
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>Descrição / História:</label>
        <textarea id="mItemDesc" class="form-textarea" rows="3" placeholder="Aparência física, história e lendas sobre o item..."></textarea>
      </div>
      <div class="form-group">
        <label>Propriedades Mecânicas & Bônus:</label>
        <textarea id="mItemProps" class="form-textarea" rows="2" placeholder="Ex: +1 na CA, concede visão no escuro 18m..."></textarea>
      </div>
    `;

    this.openModal("⚔️ Adicionar Item ou Relíquia", html, () => {
      const name = document.getElementById('mItemName').value.trim();
      if (!name) return false;
      const c = this.getActiveCampaign();
      if (!c.items) c.items = [];
      c.items.push({
        id: "item_" + Date.now(),
        name: name,
        type: document.getElementById('mItemType').value.trim() || 'Item Mágico',
        rarity: document.getElementById('mItemRarity').value,
        value: document.getElementById('mItemValue').value.trim(),
        attunement: document.getElementById('mItemAttune').checked,
        description: document.getElementById('mItemDesc').value.trim(),
        properties: document.getElementById('mItemProps').value.trim()
      });
      this.saveData();
      this.renderItems(c);
      this.showToast(`Item '${name}' catalogado!`);
      return true;
    });
  }

  openEditItemModal(id) {
    const c = this.getActiveCampaign();
    const item = c.items.find(x => x.id === id);
    if (!item) return;

    const html = `
      <div class="form-group">
        <label>Nome do Item:</label>
        <input type="text" id="mItemName" class="form-input" value="${this.escapeHtml(item.name)}" required />
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Tipo:</label>
          <input type="text" id="mItemType" class="form-input" value="${this.escapeHtml(item.type || '')}" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Raridade:</label>
          <input type="text" id="mItemRarity" class="form-input" value="${this.escapeHtml(item.rarity || '')}" />
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <div class="form-group" style="flex:1;">
          <label>Valor:</label>
          <input type="text" id="mItemValue" class="form-input" value="${this.escapeHtml(item.value || '')}" />
        </div>
        <div class="form-group" style="padding-top:16px;">
          <label style="cursor:pointer; display:flex; align-items:center; gap:6px;">
            <input type="checkbox" id="mItemAttune" ${item.attunement ? 'checked' : ''} /> Sintonização?
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>Descrição:</label>
        <textarea id="mItemDesc" class="form-textarea" rows="3">${this.escapeHtml(item.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Propriedades:</label>
        <textarea id="mItemProps" class="form-textarea" rows="2">${this.escapeHtml(item.properties || '')}</textarea>
      </div>
    `;

    this.openModal(`✏️ Editar Item: ${item.name}`, html, () => {
      item.name = document.getElementById('mItemName').value.trim() || item.name;
      item.type = document.getElementById('mItemType').value.trim();
      item.rarity = document.getElementById('mItemRarity').value.trim();
      item.value = document.getElementById('mItemValue').value.trim();
      item.attunement = document.getElementById('mItemAttune').checked;
      item.description = document.getElementById('mItemDesc').value.trim();
      item.properties = document.getElementById('mItemProps').value.trim();
      this.saveData();
      this.renderItems(c);
      this.showToast("Item atualizado!");
      return true;
    });
  }

  deleteItem(id) {
    const c = this.getActiveCampaign();
    if (confirm("Remover este item do inventário do mestre?")) {
      c.items = c.items.filter(i => i.id !== id);
      this.saveData();
      this.renderItems(c);
      this.showToast("Item removido.");
    }
  }

  // Locais & Mapas
  openNewLocationModal() {
    const html = `
      <div class="form-group">
        <label>Nome do Local / Região:</label>
        <input type="text" id="mLocName" class="form-input" placeholder="Ex: Pântano dos Suspiros" required />
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Tipo:</label>
          <input type="text" id="mLocType" class="form-input" placeholder="Ex: Masmorra, Cidade, Floresta, Templo..." />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Nível de Perigo:</label>
          <input type="text" id="mLocDanger" class="form-input" placeholder="Ex: Baixo, Mortal, Letal..." />
        </div>
      </div>
      <div class="form-group">
        <label>Descrição & Atmosfera:</label>
        <textarea id="mLocDesc" class="form-textarea" rows="3" placeholder="Clima, cheiros, perigos ambientais e sensação ao entrar no local..."></textarea>
      </div>
      <div class="form-group">
        <label>Pontos de Interesse:</label>
        <input type="text" id="mLocPOI" class="form-input" placeholder="Ex: Cabana da Bruxa, Círculo de Pedras, Caverna dos Vermes" />
      </div>
      <div class="form-group">
        <label>URL ou Imagem do Mapa:</label>
        <input type="text" id="mLocMapUrl" class="form-input" placeholder="https://exemplo.com/mapa.jpg (ou deixe vazio)" />
      </div>
    `;

    this.openModal("🗺️ Adicionar Localidade", html, () => {
      const name = document.getElementById('mLocName').value.trim();
      if (!name) return false;
      const c = this.getActiveCampaign();
      if (!c.locations) c.locations = [];
      c.locations.push({
        id: "loc_" + Date.now(),
        name: name,
        type: document.getElementById('mLocType').value.trim() || 'Região',
        danger: document.getElementById('mLocDanger').value.trim() || 'Moderado',
        description: document.getElementById('mLocDesc').value.trim(),
        pointsOfInterest: document.getElementById('mLocPOI').value.trim(),
        mapUrl: document.getElementById('mLocMapUrl').value.trim()
      });
      this.saveData();
      this.renderLocations(c);
      this.showToast(`Localidade ${name} catalogada!`);
      return true;
    });
  }

  openEditLocationModal(id) {
    const c = this.getActiveCampaign();
    const loc = c.locations.find(x => x.id === id);
    if (!loc) return;

    const html = `
      <div class="form-group">
        <label>Nome:</label>
        <input type="text" id="mLocName" class="form-input" value="${this.escapeHtml(loc.name)}" required />
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;">
          <label>Tipo:</label>
          <input type="text" id="mLocType" class="form-input" value="${this.escapeHtml(loc.type || '')}" />
        </div>
        <div class="form-group" style="flex:1;">
          <label>Perigo:</label>
          <input type="text" id="mLocDanger" class="form-input" value="${this.escapeHtml(loc.danger || '')}" />
        </div>
      </div>
      <div class="form-group">
        <label>Descrição:</label>
        <textarea id="mLocDesc" class="form-textarea" rows="3">${this.escapeHtml(loc.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Pontos de Interesse:</label>
        <input type="text" id="mLocPOI" class="form-input" value="${this.escapeHtml(loc.pointsOfInterest || '')}" />
      </div>
      <div class="form-group">
        <label>URL do Mapa:</label>
        <input type="text" id="mLocMapUrl" class="form-input" value="${this.escapeHtml(loc.mapUrl || '')}" />
      </div>
    `;

    this.openModal(`✏️ Editar Local: ${loc.name}`, html, () => {
      loc.name = document.getElementById('mLocName').value.trim() || loc.name;
      loc.type = document.getElementById('mLocType').value.trim();
      loc.danger = document.getElementById('mLocDanger').value.trim();
      loc.description = document.getElementById('mLocDesc').value.trim();
      loc.pointsOfInterest = document.getElementById('mLocPOI').value.trim();
      loc.mapUrl = document.getElementById('mLocMapUrl').value.trim();
      this.saveData();
      this.renderLocations(c);
      this.showToast("Local atualizado!");
      return true;
    });
  }

  deleteLocation(id) {
    const c = this.getActiveCampaign();
    if (confirm("Remover este local do mapa?")) {
      c.locations = c.locations.filter(l => l.id !== id);
      this.saveData();
      this.renderLocations(c);
      this.showToast("Local removido.");
    }
  }

  openImagePreview(url, title) {
    const html = `
      <div style="text-align:center;">
        <img src="${url}" alt="${title}" style="max-width:100%; max-height:70vh; border-radius:4px; border:2px solid var(--gold-dark); box-shadow:0 8px 24px rgba(0,0,0,0.5);" />
      </div>
    `;
    this.openModal(`🗺️ Visualizador: ${title}`, html, () => true);
  }

  // --- BACKUP & RESTAURAÇÃO JSON ---
  exportBackup() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `grimorio_mestre_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast("💾 Backup exportado com sucesso em JSON!");
  }

  importBackup() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && Array.isArray(parsed.campaigns)) {
            this.data = parsed;
            this.saveData();
            this.render();
            this.showToast("📜 Grimório restaurado com sucesso do arquivo!");
          } else {
            alert("Formato de arquivo JSON inválido para o Grimório.");
          }
        } catch (err) {
          alert("Erro ao ler o arquivo JSON: " + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  resetToDefaultData() {
    if (confirm("⚠️ Deseja restaurar os dados de exemplo originais? Todas as alterações não exportadas serão perdidas.")) {
      this.data = JSON.parse(JSON.stringify(DEFAULT_RPG_DATA));
      this.saveData();
      this.render();
      this.showToast("🔄 Grimório restaurado para os dados de exemplo!");
    }
  }

  // Feedback Toast
  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 3200);
  }

  // Sanitizador simples para segurança de exibição
  escapeHtml(str) {
    if (typeof str !== 'string') return str || '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Inicializar aplicação ao carregar a página
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new GrimoireApp();
});
