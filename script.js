// ==========================================
// ESTADOS GLOBAIS E VARIÁVEIS
// ==========================================
const conquistasDesbloqueadas = new Set();
const fasesVisitadas = new Set();
const inventarioLoot = new Set();

const STORAGE_KEY = "portfolio_jornada";
const totalLoot = 3;

// Sistema de RPG
let xpAtual = 0;
let nivelAtual = 1;
let xpProximoNivel = 100;
let timerDigitacao = null;

// Rastreio do Mouse (Para a animação do XP brotar do lugar certo)
let ultimoClickX = window.innerWidth / 2;
let ultimoClickY = window.innerHeight / 2;

document.addEventListener("click", (e) => {
  ultimoClickX = e.pageX;
  ultimoClickY = e.pageY;
});

// ==========================================
// DADOS (BANCO DE INFORMAÇÕES)
// ==========================================
const fases = ["inicio", "formacao", "experiencias", "projetos", "skills", "contato"];

const conquistas = [
  { id: "inicio", texto: "A Jornada Começa!", descricao: "Você deu o primeiro passo ao iniciar a aventura.", dica: "Vá até o topo da página e inicie a jornada." },
  { id: "experiencia", texto: "Diário de Missões!", descricao: "Investigou o histórico de missões do jogador.", dica: "Abra os detalhes de uma experiência na Fase 2." },
  { id: "boss", texto: "Boss Derrotado!", descricao: "Comprovou sua força vencendo um Projeto.", dica: "Enfrente um Boss na Fase 3 clicando em 'Ver batalha'." },
  { id: "skills", texto: "Habilidades Reconhecidas!", descricao: "Desbloqueou a visão da árvore de talentos.", dica: "Role até a Fase 4 para revelar as skills." },
  { id: "fim", texto: "Fim da Jornada!", descricao: "Explorou todo o mapa e chegou ao Contato.", dica: "Desça até o fim da página para a recompensa final." },
];

const formacoes = [
  { curso: "Desenvolvimento de Software Multiplataforma", instituicao: "FATEC", periodo: "Em andamento" },
  { curso: "Desenvolvimento de Sistemas", instituicao: "ETEC", periodo: "Concluído" },
  { curso: "Redes de Computadores", instituicao: "SENAC", periodo: "Concluído" },
];

const projetos = [
  { nome: "Planet Spotter", descricao: "Aplicação web desenvolvida no NASA Space Apps para visualização de exoplanetas.", tecnologias: ["HTML", "CSS", "JavaScript"], categoria: "desafios", link: "https://nasasjc.vercel.app" },
  { nome: "Tempero da Casa", descricao: "Cardápio digital responsivo para visualização de pratos e categorias.", tecnologias: ["HTML", "CSS", "JavaScript"], categoria: "javascript", link: "https://temperodacasa.vercel.app" },
  { nome: "TaskMaster", descricao: "Gerenciador de tarefas moderno com React, TypeScript e drag & drop.", tecnologias: ["React", "TypeScript", "Vite"], categoria: "react", link: "https://taskmasterbr.vercel.app" },
];

const skills = [
  { nome: "HTML / CSS", nivel: 90, icone: "fa-brands fa-html5" },
  { nome: "JavaScript", nivel: 85, icone: "fa-brands fa-js" },
  { nome: "React", nivel: 80, icone: "fa-brands fa-react" },
  { nome: "TypeScript", nivel: 75, icone: "fa-solid fa-file-code" },
  { nome: "Python / Flask", nivel: 70, icone: "fa-brands fa-python" },
  { nome: "Banco de Dados", nivel: 75, icone: "fa-solid fa-database" },
  { nome: "Cloud & DevOps", nivel: 65, icone: "fa-solid fa-cloud" },
  { nome: "Data Analytics", nivel: 70, icone: "fa-solid fa-chart-line" },
  { nome: "Redes & Infraestrutura", nivel: 80, icone: "fa-solid fa-network-wired" },
];

const LOOT_CONFIG = {
  chave: { icone: "fa-key", descricao: "Chave Dourada: Abre caminhos secretos." },
  pergaminho: { icone: "fa-scroll", descricao: "Pergaminho Antigo: Contém códigos sagrados." },
  pocao: { icone: "fa-flask", descricao: "Poção de Mana: Restaura a energia criativa." },
};

const dicasNPC = [
  { id: "inicio", texto: "Saudações, dev! Para ganhar XP e subir de nível, você precisa interagir. Tente clicar em 'Iniciar Jornada' lá no topo." },
  { id: "experiencia", texto: "Boa! Investigar registros antigos dá experiência. Tente clicar em 'Ver mais detalhes' em alguma de suas Experiências." },
  { id: "boss", texto: "Sinto uma energia forte vindo da Fase 3... Há Chefões por lá! Enfrente um clicando em 'Ver batalha'." },
  { id: "skills", texto: "Você está ficando forte! Ouvi rumores de que existem 3 Itens Mágicos flutuando pela página... Encontrá-los dá muito XP!" },
  { id: "fim", texto: "Sua jornada está quase completa. O último grande tesouro está escondido no final do mapa, na área de Contato." },
];

// ==========================================
// SALVAMENTO (SAVE STATE)
// ==========================================
function salvarEstado() {
  const estado = {
    conquistas: Array.from(conquistasDesbloqueadas),
    fases: Array.from(fasesVisitadas),
    xp: xpAtual,
    nivel: nivelAtual
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

function carregarEstado() {
  try {
    const estadoSalvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!estadoSalvo) return;

    estadoSalvo.conquistas?.forEach((id) => conquistasDesbloqueadas.add(id));
    estadoSalvo.fases?.forEach((id) => fasesVisitadas.add(id));
    
    if(estadoSalvo.xp !== undefined) xpAtual = estadoSalvo.xp;
    if(estadoSalvo.nivel !== undefined) nivelAtual = estadoSalvo.nivel;

    renderConquistas();
    atualizarProgressoFases();
    atualizarUI_XP();
  } catch (error) {
    console.error("Corrompimento de Save State:", error);
  }
}

// ==========================================
// SISTEMA DE EXPERIÊNCIA E LEVEL UP
// ==========================================
function mostrarAnimacaoXP(pontos, x, y) {
  const xpDiv = document.createElement("div");
  xpDiv.className = "xp-flutuante";
  xpDiv.textContent = `+${pontos} XP`;
  
  // Posiciona a div onde o mouse clicou ou no centro da tela se for por scroll
  xpDiv.style.left = `${x || window.innerWidth / 2}px`;
  xpDiv.style.top = `${y || window.scrollY + window.innerHeight / 2}px`;
  
  document.body.appendChild(xpDiv);
  setTimeout(() => xpDiv.remove(), 1200);
}

function adicionarXP(pontos) {
  xpAtual += pontos;
  mostrarAnimacaoXP(pontos, ultimoClickX, ultimoClickY);
  
  if (xpAtual >= xpProximoNivel) {
    xpAtual -= xpProximoNivel; 
    nivelAtual++;
    xpProximoNivel = nivelAtual * 100; 
    
    tocarSom('levelup');
    if (typeof levelUpEffect === "function") levelUpEffect();
    
    mostrarNotificacaoNaTela(`LEVEL UP! Você alcançou o Nível ${nivelAtual}!`, true);
  }
  
  atualizarUI_XP();
  salvarEstado();
}

function atualizarUI_XP() {
  const devLevelText = document.querySelector(".dev-level");
  if (devLevelText) devLevelText.textContent = `Nv. ${nivelAtual} Dev`;
  
  const barraXP = document.getElementById("barraProgresso");
  if (barraXP) {
    const porcentagem = Math.min((xpAtual / xpProximoNivel) * 100, 100);
    barraXP.style.width = `${porcentagem}%`;
  }
}

function mostrarNotificacaoNaTela(mensagem, isDourada = false) {
  const notificacao = document.getElementById("notificacao");
  const textoNotificacao = document.getElementById("textoNotificacao");
  if (!notificacao || !textoNotificacao) return;

  textoNotificacao.textContent = mensagem;
  
  if (isDourada) {
    notificacao.style.borderLeftColor = "var(--accent-color)";
    notificacao.querySelector("i").style.color = "var(--accent-color)";
  } else {
    notificacao.style.borderLeftColor = "var(--gold-color)";
    notificacao.querySelector("i").style.color = "var(--gold-color)";
  }

  notificacao.classList.remove("hidden");
  notificacao.classList.add("show");
  setTimeout(() => notificacao.classList.remove("show"), 4000);
}

// ==========================================
// RENDERIZAÇÃO NA TELA
// ==========================================
function inicializarSaudacao() {
  const saudacao = document.getElementById("saudacao");
  if (!saudacao) return;
  const hora = new Date().getHours();
  if (hora < 12) saudacao.textContent = "🌅 Bom dia, aventureiro!";
  else if (hora < 18) saudacao.textContent = "🌞 Boa tarde, aventureiro!";
  else saudacao.textContent = "🌙 Boa noite, aventureiro!";
}

function renderConquistas() {
  const lista = document.getElementById("listaConquistas");
  if (!lista) return;

  lista.innerHTML = conquistas.map(conquista => {
    const isDesbloqueada = conquistasDesbloqueadas.has(conquista.id);
    const statusClass = isDesbloqueada ? "desbloqueada" : "bloqueada";
    const iconClass = isDesbloqueada ? "fa-trophy" : "fa-lock";
    const tooltipText = isDesbloqueada ? `Desbloqueada: ${conquista.descricao}` : `Bloqueada: ${conquista.dica}`;

    return `
      <li class="conquista-item ${statusClass}" data-tooltip="${tooltipText}">
        <i class="fa-solid ${iconClass}"></i>
        <span>${conquista.texto}</span>
      </li>
    `;
  }).join("");
}

function renderFormacao() {
  const container = document.getElementById("listaFormacao");
  if (container) {
    container.innerHTML = formacoes.map(f => `
      <div class="card">
        <h3>🎓 ${f.curso}</h3>
        <p>${f.instituicao}</p>
        <span>${f.periodo}</span>
      </div>
    `).join("");
  }
}

function renderProjetos() {
  const container = document.getElementById("listaProjetos");
  if (!container) return;
  container.innerHTML = "";

  projetos.forEach((projeto) => {
    const card = document.createElement("div");
    card.className = "card boss";
    card.dataset.derrotado = "false";
    card.dataset.categoria = projeto.categoria;

    card.innerHTML = `
      <h3><i class="fa-solid fa-dragon boss-icon"></i> ${projeto.nome}</h3>
      <p>${projeto.descricao}</p>
      <p><strong>Tecnologias:</strong> ${projeto.tecnologias.join(", ")}</p>
      <a href="${projeto.link}" target="_blank" class="btn-batalha">
        <i class="fa-solid fa-shield-halved"></i> Ver batalha
      </a>
    `;
    container.appendChild(card);

    const botao = card.querySelector(".btn-batalha");
    const icon = card.querySelector(".boss-icon");

    botao.addEventListener("click", () => {
      if (card.dataset.derrotado === "true") return;
      card.dataset.derrotado = "true";
      icon.classList.replace("fa-dragon", "fa-skull");
      icon.style.color = "#9ca3af";
      desbloquearConquista("boss");
      adicionarXP(100);
    });
  });
}

function renderSkills() {
  const container = document.getElementById("listaSkills");
  if (container) {
    container.innerHTML = skills.map(skill => `
      <div class="card skill">
        <div class="skill-header">
          <i class="${skill.icone} skill-badge"></i>
          <h3>${skill.nome}</h3>
        </div>
        <div class="barra">
          <div class="progresso" style="width:${skill.nivel}%"></div>
        </div>
      </div>
    `).join("");
  }
}

// ==========================================
// LÓGICA DE JOGO E NPC
// ==========================================
function desbloquearConquista(id) {
  if (!conquistasDesbloqueadas.has(id)) {
    conquistasDesbloqueadas.add(id);
    renderConquistas();
    
    const conquistaObj = conquistas.find(c => c.id === id);
    if (conquistaObj) mostrarNotificacaoNaTela(`Conquista: ${conquistaObj.texto}`);
    
    salvarEstado();
    atualizarProgressoFases();
    atualizarFalasNPC();
    tocarSom("conquista");
    adicionarXP(50);

    if (id === "fim") {
      levelUpEffect();
      tocarSom("levelup");
    }
  }
}

function atualizarProgressoFases() {
  const barraFases = document.getElementById("barraFases");
  if (barraFases) {
    const progresso = (fasesVisitadas.size / fases.length) * 100;
    barraFases.style.width = `${progresso}%`;
    salvarEstado();
  }
}

function atualizarFalasNPC() {
  const npcBalao = document.getElementById("npcBalao");
  const npcTexto = document.getElementById("npcTexto");
  if (!npcBalao || !npcTexto) return;

  const proximaDica = dicasNPC.find(dica => !conquistasDesbloqueadas.has(dica.id));
  const xpFaltante = xpProximoNivel - xpAtual;
  
  let textoFinal = proximaDica 
    ? `${proximaDica.texto} (Faltam ${xpFaltante} XP para o Nv. ${nivelAtual + 1}!)` 
    : `Incrível! Você completou toda a jornada e alcançou o Nv. ${nivelAtual}! Um recrutador vai ficar impressionado.`;

  npcBalao.classList.remove("hidden");
  
  if (timerDigitacao) clearInterval(timerDigitacao); 
  npcTexto.textContent = ""; 
  
  let i = 0;
  timerDigitacao = setInterval(() => {
    if (i < textoFinal.length) {
      npcTexto.textContent += textoFinal.charAt(i);
      if (i % 3 === 0) tocarSom('hover'); 
      i++;
    } else {
      clearInterval(timerDigitacao); 
    }
  }, 35); 
}

function inicializarNPC() {
  const npcSprite = document.getElementById("npcSprite");
  const btnFechar = document.getElementById("fecharNpc");

  if (npcSprite) npcSprite.addEventListener("click", atualizarFalasNPC);
  if (btnFechar) btnFechar.addEventListener("click", () => document.getElementById("npcBalao").classList.add("hidden"));
  setTimeout(() => atualizarFalasNPC(), 1000);
}

function coletarLoot(idItem) {
  if (inventarioLoot.has(idItem)) return;

  inventarioLoot.add(idItem);
  const itemNoMapa = document.getElementById(`loot-${idItem}`);
  if (itemNoMapa) itemNoMapa.style.display = "none";

  const slot = document.querySelector(`.slot[data-slot="${idItem}"]`);
  if (slot) {
    slot.classList.add("preenchido");
    slot.innerHTML = `<i class="fa-solid ${LOOT_CONFIG[idItem].icone}"></i>`;
    slot.setAttribute("data-tooltip", LOOT_CONFIG[idItem].descricao);
  }

  mostrarNotificacaoNaTela(`Loot encontrado: ${idItem.toUpperCase()}!`);
  tocarSom("loot");
  adicionarXP(80); // Loot dá um pouco mais de XP!

  if (inventarioLoot.size === totalLoot) {
    setTimeout(ativarTemaSecreto, 2000);
  }
}

function ativarTemaSecreto() {
  document.body.classList.add("theme-gameboy");
  const btnToggleTema = document.getElementById("btnToggleTema");
  if (btnToggleTema) btnToggleTema.classList.remove("hidden");

  mostrarNotificacaoNaTela("CÓDIGO SECRETO: Tema de 8-bits Desbloqueado!", true);
  if (typeof levelUpEffect === "function") levelUpEffect();
  tocarSom('levelup');
}

function levelUpEffect() {
  if (typeof confetti !== "undefined") {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#10b981", "#fbbf24", "#0ff"] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#10b981", "#fbbf24", "#0ff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}

// ==========================================
// EVENTOS E INTERATIVIDADE
// ==========================================
function inicializarEventosMissao() {
  const btnAceitar = document.getElementById("btnAceitarQuest");
  const btnRecusar = document.getElementById("btnRecusarQuest");
  const btnTentarNovamente = document.getElementById("btnTentarNovamente");
  const questPopup = document.getElementById("questPopup");
  const gameOverScreen = document.getElementById("gameOverScreen");

  if (!btnAceitar || !btnRecusar || !questPopup || !gameOverScreen || !btnTentarNovamente) return;

  btnAceitar.addEventListener("click", () => {
    questPopup.classList.add("aceitando"); 
    tocarSom('click'); 
    setTimeout(() => {
      questPopup.classList.add("hidden"); 
      questPopup.classList.remove("aceitando"); 
      localStorage.setItem("questLootAceita", "true");
    }, 1000); 
  });

  btnRecusar.addEventListener("click", () => {
    questPopup.classList.add("hidden"); 
    gameOverScreen.classList.remove("hidden");
    tocarSom('conquista'); 
  });

  btnTentarNovamente.addEventListener("click", () => {
    gameOverScreen.classList.add("hidden"); 
    setTimeout(() => {
      questPopup.classList.remove("hidden"); 
      tocarSom('click');
    }, 500);
  });
}

function inicializarObservers() {
  const faseObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visivel");
        fasesVisitadas.add(entry.target.id);
        atualizarProgressoFases();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".fase").forEach(fase => faseObserver.observe(fase));

  const skillSection = document.getElementById("skills");
  if (skillSection) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) desbloquearConquista("skills");
    }, { threshold: 0.3 }).observe(skillSection);
  }

  const contatoSection = document.getElementById("contato");
  if (contatoSection) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) desbloquearConquista("fim");
    }).observe(contatoSection);
  }
}

function inicializarEventosGlobais() {
  const btnStart = document.getElementById("startGame");
  if (btnStart) {
    btnStart.addEventListener("click", () => {
      document.getElementById("formacao")?.scrollIntoView({ behavior: "smooth" });
      desbloquearConquista("inicio");
    });
  }

  const btnToggleTema = document.getElementById("btnToggleTema");
  if (btnToggleTema) {
    btnToggleTema.addEventListener("click", () => document.body.classList.toggle("theme-gameboy"));
  }

  const btnReset = document.getElementById("resetJornada");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (!confirm("Tem certeza que deseja resetar toda a jornada?")) return;
      localStorage.clear();
      location.reload(); // Recarrega a página de forma limpa
    });
  }
}

function inicializarMenuMobile() {
  const btnMenu = document.getElementById("btnMenu");
  const hudNav = document.querySelector(".hud-nav");

  if (!btnMenu || !hudNav) return;

  btnMenu.addEventListener("click", () => {
    hudNav.classList.toggle("menu-aberto");
    const icone = btnMenu.querySelector("i");
    icone.className = hudNav.classList.contains("menu-aberto") ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  });

  hudNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hudNav.classList.remove("menu-aberto");
      btnMenu.querySelector("i").className = "fa-solid fa-bars";
    });
  });
}

function inicializarPainelConquistas() {
  const btnToggle = document.getElementById("btnConquistasToggle");
  const painel = document.querySelector(".conquistas");
  const btnFechar = document.getElementById("fecharConquistasMobile");

  if (btnToggle && painel && btnFechar) {
    btnToggle.addEventListener("click", () => {
      painel.classList.add("aberta");
      document.querySelector(".hud-nav")?.classList.remove("menu-aberto");
      document.querySelector("#btnMenu i")?.classList.replace("fa-xmark", "fa-bars");
      tocarSom("click");
    });

    btnFechar.addEventListener("click", () => {
      painel.classList.remove("aberta");
      tocarSom("click");
    });
  }
}

function inicializarFiltrosProjetos() {
  const botoes = document.querySelectorAll(".btn-filtro");
  botoes.forEach(btn => {
    btn.addEventListener("click", (e) => {
      botoes.forEach(b => b.classList.remove("btn-acao"));
      e.currentTarget.classList.add("btn-acao");

      const filtro = e.currentTarget.dataset.categoria;
      document.querySelectorAll("#listaProjetos .card.boss").forEach(card => {
        if (filtro === "todos" || card.dataset.categoria === filtro) {
          card.style.display = "block";
          card.style.animation = "fadeIn 0.5s ease-in";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

function inicializarMiniMapa() {
  const pontosMapa = document.querySelectorAll(".mapa-ponto");
  const mapaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        pontosMapa.forEach(p => p.classList.remove("ativo"));
        const pontoAtual = document.querySelector(`.mapa-ponto[data-fase="${entry.target.id}"]`);
        if (pontoAtual) pontoAtual.classList.add("ativo", "explorado");
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll(".fase").forEach(sec => mapaObserver.observe(sec));
}

function inicializarTimeline() {
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const detalhes = e.currentTarget.previousElementSibling;
      detalhes.classList.toggle("open");

      if (detalhes.classList.contains("open")) {
        e.currentTarget.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Esconder detalhes';
        e.currentTarget.classList.add("btn-acao");
        desbloquearConquista("experiencia");
      } else {
        e.currentTarget.innerHTML = '<i class="fa-solid fa-eye"></i> Ver mais detalhes';
        e.currentTarget.classList.remove("btn-acao");
      }
    });
  });
}

function inicializarQuestPopup() {
  const questPopup = document.getElementById("questPopup");
  if (questPopup && !localStorage.getItem("questLootAceita")) {
    setTimeout(() => questPopup.classList.remove("hidden"), 1000);
  }
}

// ==========================================
// ÁUDIO E EASTER EGGS
// ==========================================
let somAtivado = true;
const sfx = {
  hover: new Audio("audio/hover.mp3"),
  click: new Audio("audio/click.mp3"),
  conquista: new Audio("audio/conquista.mp3"),
  loot: new Audio("audio/loot.mp3"),
  levelup: new Audio("audio/levelup.mp3"),
};
sfx.hover.volume = 0.1;
sfx.click.volume = 0.3;

function tocarSom(nome) {
  if (!somAtivado || !sfx[nome]) return;
  const somClone = sfx[nome].cloneNode();
  somClone.volume = sfx[nome].volume;
  somClone.play().catch(() => console.log("Áudio bloqueado pelo navegador até o usuário interagir."));
}

function inicializarAudio() {
  const btnSom = document.getElementById("btnSom");
  if (btnSom) {
    btnSom.addEventListener("click", () => {
      somAtivado = !somAtivado;
      btnSom.innerHTML = somAtivado ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
      btnSom.classList.toggle("mutado", !somAtivado);
      if (somAtivado) tocarSom("click");
    });
  }

  document.querySelectorAll("button, a, .card, .loot-item, .mapa-ponto, .npc-sprite").forEach(el => {
    el.addEventListener("mouseenter", () => tocarSom("hover"));
    if (el.id !== "btnSom") el.addEventListener("click", () => tocarSom("click"));
  });
}

// Easter Egg Secreto: KONAMI CODE (Cima, Cima, Baixo, Baixo, Esq, Dir, Esq, Dir, B, A)
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;
document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      // Código ativado!
      adicionarXP(999);
      ativarTemaSecreto();
      konamiIndex = 0; 
    }
  } else {
    konamiIndex = 0; // Errou a sequência, reseta
  }
});

// ==========================================
// BOOT (INICIALIZAÇÃO DO JOGO)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarSaudacao();
  renderFormacao();
  renderProjetos();
  renderSkills();
  carregarEstado(); // Carrega o Save antes de ligar os eventos

  inicializarFiltrosProjetos();
  inicializarObservers();
  inicializarEventosGlobais();
  inicializarTimeline();
  inicializarNPC();
  inicializarMiniMapa();
  inicializarQuestPopup();
  inicializarAudio();
  inicializarMenuMobile();
  inicializarPainelConquistas();
  inicializarEventosMissao();
});