// ==========================================
// 1. ESTADO GLOBAL & DADOS (DATABASE)
// ==========================================
const conquistasDesbloqueadas = new Set();
const fasesVisitadas = new Set();
const inventarioLoot = new Set();

const STORAGE_KEY = "portfolio_jornada";
const totalLoot = 3;

const fases = [
  "inicio",
  "formacao",
  "experiencias",
  "projetos",
  "skills",
  "contato",
];

const conquistas = [
  {
    id: "inicio",
    texto: "A Jornada Começa!",
    descricao: "Você deu o primeiro passo ao iniciar a aventura.",
    dica: "Vá até o topo da página e inicie a jornada.",
  },
  {
    id: "experiencia",
    texto: "Diário de Missões!",
    descricao: "Investigou o histórico de missões do jogador.",
    dica: "Abra os detalhes de uma experiência na Fase 2.",
  },
  {
    id: "boss",
    texto: "Boss Derrotado!",
    descricao: "Comprovou sua força vencendo um Projeto.",
    dica: "Enfrente um Boss na Fase 3 clicando em 'Ver batalha'.",
  },
  {
    id: "skills",
    texto: "Habilidades Reconhecidas!",
    descricao: "Desbloqueou a visão da árvore de talentos.",
    dica: "Role até a Fase 4 para revelar as skills.",
  },
  {
    id: "fim",
    texto: "Fim da Jornada!",
    descricao: "Explorou todo o mapa e chegou ao Contato.",
    dica: "Desça até o fim da página para a recompensa final.",
  },
];

const formacoes = [
  {
    curso: "Desenvolvimento de Software Multiplataforma",
    instituicao: "FATEC",
    periodo: "Em andamento",
  },
  {
    curso: "Desenvolvimento de Sistemas",
    instituicao: "ETEC",
    periodo: "Concluído",
  },
  {
    curso: "Redes de Computadores",
    instituicao: "SENAC",
    periodo: "Concluído",
  },
];

const projetos = [
  {
    nome: "Planet Spotter",
    descricao:
      "Aplicação web desenvolvida no NASA Space Apps Challenge para visualização interativa de exoplanetas.",
    tecnologias: ["HTML", "CSS", "JavaScript"],
    categoria: "desafios",
    link: "https://nasasjc.vercel.app",
  },
  {
    nome: "Tempero da Casa",
    descricao:
      "Cardápio digital responsivo para visualização de pratos e navegação entre categorias.",
    tecnologias: ["HTML", "CSS", "JavaScript"],
    categoria: "javascript",
    link: "https://temperodacasa.vercel.app",
  },
  {
    nome: "TaskMaster",
    descricao:
      "Gerenciador de tarefas moderno com React, TypeScript, Vite, drag & drop e temas claros/escuros.",
    tecnologias: ["React", "TypeScript", "Vite"],
    categoria: "react",
    link: "https://taskmasterbr.vercel.app",
  },
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
  {
    nome: "Redes & Infraestrutura",
    nivel: 80,
    icone: "fa-solid fa-network-wired",
  },
];

const LOOT_CONFIG = {
  chave: {
    icone: "fa-key",
    descricao: "Chave Dourada: Abre caminhos secretos.",
  },
  pergaminho: {
    icone: "fa-scroll",
    descricao: "Pergaminho Antigo: Contém códigos sagrados.",
  },
  pocao: {
    icone: "fa-flask",
    descricao: "Poção de Mana: Restaura a energia criativa.",
  },
};

const dicasNPC = [
  {
    id: "inicio",
    texto:
      "Saudações, aventureiro! Sou o teu guia. Para começar a nossa jornada, sobe até ao topo e clica em 'Iniciar Jornada'.",
  },
  {
    id: "experiencia",
    texto:
      "Excelente! Agora desce até à Fase 2 (Experiências) e clica em 'Ver mais detalhes' num dos registos para leres o diário da missão.",
  },
  {
    id: "boss",
    texto:
      "Muito bem! Agora, desce até à Fase 3 (Projetos). Há chefões lá! Clica em 'Ver batalha' para derrotares algum.",
  },
  {
    id: "skills",
    texto:
      "Bela vitória! Para fortalecer o teu personagem, continua a descer até à Fase 4 e revela as tuas Habilidades.",
  },
  {
    id: "fim",
    texto:
      "Estás quase lá! O último tesouro desta jornada está escondido no final, na secção de Contato!",
  },
];

// ==========================================
// 2. SISTEMA DE SAVE (LOCAL STORAGE)
// ==========================================
function salvarEstado() {
  const estado = {
    conquistas: Array.from(conquistasDesbloqueadas),
    fases: Array.from(fasesVisitadas),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

function carregarEstado() {
  try {
    const estadoSalvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!estadoSalvo) return;

    estadoSalvo.conquistas?.forEach((id) => conquistasDesbloqueadas.add(id));
    estadoSalvo.fases?.forEach((id) => fasesVisitadas.add(id));

    renderConquistas();
    atualizarProgressoFases();
  } catch (error) {
    console.error("Erro ao carregar estado salvo:", error);
  }
}

// ==========================================
// 3. RENDERIZAÇÃO DOM (UI)
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

  lista.innerHTML = "";
  conquistas.forEach((conquista) => {
    const isDesbloqueada = conquistasDesbloqueadas.has(conquista.id);
    const statusClass = isDesbloqueada ? "desbloqueada" : "bloqueada";
    const iconClass = isDesbloqueada ? "fa-trophy" : "fa-lock";
    const tooltipText = isDesbloqueada
      ? `Desbloqueada: ${conquista.descricao}`
      : `Bloqueada: ${conquista.dica}`;

    lista.innerHTML += `
      <li class="conquista-item ${statusClass}" data-tooltip="${tooltipText}">
        <i class="fa-solid ${iconClass}"></i>
        <span>${conquista.texto}</span>
      </li>
    `;
  });
}

function renderFormacao() {
  const container = document.getElementById("listaFormacao");
  if (!container) return;

  container.innerHTML = formacoes
    .map(
      (f) => `
    <div class="card">
      <h3>🎓 ${f.curso}</h3>
      <p>${f.instituicao}</p>
      <span>${f.periodo}</span>
    </div>
  `,
    )
    .join("");
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
      <h3>
        <i class="fa-solid fa-dragon boss-icon"></i>
        ${projeto.nome}
      </h3>
      <p>${projeto.descricao}</p>
      <p><strong>Tecnologias:</strong> ${projeto.tecnologias.join(", ")}</p>
      <a href="${projeto.link}" target="_blank" class="btn-batalha">
        <i class="fa-solid fa-sword"></i> Ver batalha
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
    });
  });
}

function renderSkills() {
  const container = document.getElementById("listaSkills");
  if (!container) return;

  container.innerHTML = skills
    .map(
      (skill) => `
    <div class="card skill">
      <div class="skill-header">
        <i class="${skill.icone} skill-badge"></i>
        <h3>${skill.nome}</h3>
      </div>
      <div class="barra">
        <div class="progresso" style="width:${skill.nivel}%"></div>
      </div>
    </div>
  `,
    )
    .join("");
}

// ==========================================
// 4. LÓGICA DE JOGO (CORE MECHANICS)
// ==========================================
function mostrarNotificacao(id) {
  const notificacao = document.getElementById("notificacao");
  const textoNotificacao = document.getElementById("textoNotificacao");
  const conquista = conquistas.find((c) => c.id === id);

  if (!conquista || !notificacao || !textoNotificacao) return;

  textoNotificacao.textContent = `Conquista desbloqueada: ${conquista.texto}`;
  notificacao.classList.remove("hidden");
  notificacao.classList.add("show");

  setTimeout(() => notificacao.classList.remove("show"), 3000);
}

function desbloquearConquista(id) {
  if (!conquistasDesbloqueadas.has(id)) {
    conquistasDesbloqueadas.add(id);
    renderConquistas();
    mostrarNotificacao(id);
    salvarEstado();
    atualizarProgressoFases();
    atualizarFalasNPC();
    tocarSom("conquista"); // <--- ADICIONE AQUI

    if (id === "fim") {
      levelUpEffect();
      tocarSom("levelup"); // <--- ADICIONE AQUI
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

// === NPC ===
function atualizarFalasNPC() {
  const npcBalao = document.getElementById("npcBalao");
  const npcTexto = document.getElementById("npcTexto");
  if (!npcBalao || !npcTexto) return;

  const proximaDica = dicasNPC.find(
    (dica) => !conquistasDesbloqueadas.has(dica.id),
  );
  npcTexto.textContent = proximaDica
    ? proximaDica.texto
    : "Incrível! Você completou toda a jornada. Tenho certeza que um recrutador ficaria impressionado!";

  npcBalao.classList.remove("hidden");
}

function inicializarNPC() {
  const npcSprite = document.getElementById("npcSprite");
  const btnFechar = document.getElementById("fecharNpc");

  if (!npcSprite) return;

  npcSprite.addEventListener("click", atualizarFalasNPC);

  if (btnFechar) {
    btnFechar.addEventListener("click", () =>
      document.getElementById("npcBalao").classList.add("hidden"),
    );
  }

  setTimeout(() => atualizarFalasNPC(), 1000);
}

// === LOOT & INVENTÁRIO ===
function coletarLoot(idItem) {
  if (inventarioLoot.has(idItem)) return;

  inventarioLoot.add(idItem);

  // Esconde o item do mapa
  const itemNoMapa = document.getElementById(`loot-${idItem}`);
  if (itemNoMapa) itemNoMapa.style.display = "none";

  // Preenche o Slot
  const slot = document.querySelector(`.slot[data-slot="${idItem}"]`);
  if (slot) {
    slot.classList.add("preenchido");
    slot.innerHTML = `<i class="fa-solid ${LOOT_CONFIG[idItem].icone}"></i>`;
    slot.setAttribute("data-tooltip", LOOT_CONFIG[idItem].descricao);
  }

  // Notificação
  const textoNotificacao = document.getElementById("textoNotificacao");
  const notificacao = document.getElementById("notificacao");
  textoNotificacao.textContent = `Loot encontrado: ${idItem.toUpperCase()}!`;
  notificacao.classList.remove("hidden");
  notificacao.classList.add("show");
  setTimeout(() => notificacao.classList.remove("show"), 3000);
  tocarSom('loot');

  // Tema Secreto
  if (inventarioLoot.size === totalLoot) {
    setTimeout(ativarTemaSecreto, 2000);
  }
}

function ativarTemaSecreto() {
  document.body.classList.add("theme-gameboy");

  const btnToggleTema = document.getElementById("btnToggleTema");
  if (btnToggleTema) btnToggleTema.classList.remove("hidden");

  const textoNotificacao = document.getElementById("textoNotificacao");
  const notificacao = document.getElementById("notificacao");

  textoNotificacao.textContent = "CÓDIGO SECRETO: Tema de 8-bits Desbloqueado!";
  notificacao.classList.remove("hidden");
  notificacao.classList.add("show");

  if (typeof levelUpEffect === "function") levelUpEffect();
}

// === EFEITOS ESPECIAIS ===
function levelUpEffect() {
  if (typeof confetti !== "undefined") {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#10b981", "#fbbf24", "#0ff"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#10b981", "#fbbf24", "#0ff"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}

// ==========================================
// 5. EVENTOS E OBSERVERS
// ==========================================
function progressoPorScroll() {
  const barraScroll = document.getElementById("barraProgresso");
  if (!barraScroll) return;

  const scrollTop = window.scrollY;
  const alturaTotal =
    document.documentElement.scrollHeight - window.innerHeight;
  barraScroll.style.width = `${(scrollTop / alturaTotal) * 100}%`;
}

function inicializarObservers() {
  const baseObserverConfig = { threshold: 0.2 };

  const faseObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fase = entry.target;
        fase.classList.add("visivel");
        fasesVisitadas.add(fase.id);
        atualizarProgressoFases();
        observer.unobserve(fase);
      }
    });
  }, baseObserverConfig);

  document
    .querySelectorAll(".fase")
    .forEach((fase) => faseObserver.observe(fase));

  const skillSection = document.getElementById("skills");
  if (skillSection) {
    new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) desbloquearConquista("skills");
      },
      { threshold: 0.3 },
    ).observe(skillSection);
  }

  const contatoSection = document.getElementById("contato");
  if (contatoSection) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) desbloquearConquista("fim");
    }).observe(contatoSection);
  }
}

function inicializarEventos() {
  // Otimização do Scroll
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        progressoPorScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  const btnStart = document.getElementById("startGame");
  if (btnStart) {
    btnStart.addEventListener("click", () => {
      document
        .getElementById("formacao")
        ?.scrollIntoView({ behavior: "smooth" });
      desbloquearConquista("inicio");
    });
  }

  const btnToggleTema = document.getElementById("btnToggleTema");
  if (btnToggleTema) {
    btnToggleTema.addEventListener("click", () =>
      document.body.classList.toggle("theme-gameboy"),
    );
  }

  const btnReset = document.getElementById("resetJornada");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (!confirm("Tem certeza que deseja resetar toda a jornada?")) return;

      // Limpa dados salvos
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("questLootAceita");
      conquistasDesbloqueadas.clear();
      fasesVisitadas.clear();
      inventarioLoot.clear();

      // Reseta UI Base
      renderConquistas();
      atualizarProgressoFases();
      const barraScroll = document.getElementById("barraProgresso");
      if (barraScroll) barraScroll.style.width = "0%";

      // Reseta Bosses
      document.querySelectorAll(".card.boss").forEach((card) => {
        card.dataset.derrotado = "false";
        const icon = card.querySelector(".boss-icon");
        if (icon) {
          icon.classList.remove("fa-skull");
          icon.classList.add("fa-dragon");
          icon.style.color = "";
        }
      });

      // Reseta Loot e Tema
      document.body.classList.remove("theme-gameboy");
      if (btnToggleTema) btnToggleTema.classList.add("hidden");

      document
        .querySelectorAll(".loot-item")
        .forEach((item) => (item.style.display = "inline-block"));
      document.querySelectorAll(".slot").forEach((slot) => {
        slot.classList.remove("preenchido");
        slot.innerHTML = '<i class="fa-solid fa-question"></i>';
        slot.setAttribute("data-tooltip", "Slot Vazio");
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
      alert("Jornada resetada com sucesso!");
    });
  }
}

function inicializarFiltrosProjetos() {
  const botoes = document.querySelectorAll(".btn-filtro");

  botoes.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      botoes.forEach((b) => b.classList.remove("btn-acao"));
      e.currentTarget.classList.add("btn-acao");

      const filtro = e.currentTarget.dataset.categoria;
      const cards = document.querySelectorAll("#listaProjetos .card.boss");

      cards.forEach((card) => {
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
  const secoes = document.querySelectorAll(".fase");

  const mapaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          pontosMapa.forEach((p) => p.classList.remove("ativo"));
          const pontoAtual = document.querySelector(
            `.mapa-ponto[data-fase="${entry.target.id}"]`,
          );
          if (pontoAtual) {
            pontoAtual.classList.add("ativo", "explorado");
          }
        }
      });
    },
    { threshold: 0.5 },
  );

  secoes.forEach((sec) => mapaObserver.observe(sec));
}

function inicializarTimeline() {
  const botoes = document.querySelectorAll(".toggle-btn");

  botoes.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const detalhes = e.currentTarget.previousElementSibling;
      detalhes.classList.toggle("open");

      if (detalhes.classList.contains("open")) {
        e.currentTarget.innerHTML =
          '<i class="fa-solid fa-eye-slash"></i> Esconder detalhes';
        e.currentTarget.classList.add("btn-acao");
        desbloquearConquista("experiencia");
      } else {
        e.currentTarget.innerHTML =
          '<i class="fa-solid fa-eye"></i> Ver mais detalhes';
        e.currentTarget.classList.remove("btn-acao");
      }
    });
  });
}

function inicializarQuestPopup() {
  const questPopup = document.getElementById("questPopup");
  const btnAceitar = document.getElementById("btnAceitarQuest");

  if (!questPopup || !btnAceitar) return;

  if (!localStorage.getItem("questLootAceita")) {
    setTimeout(() => questPopup.classList.remove("hidden"), 1000);
  }

  btnAceitar.addEventListener("click", () => {
    questPopup.classList.add("hidden");
    localStorage.setItem("questLootAceita", "true");
  });
}

// ==========================================
// SISTEMA DE ÁUDIO (SFX)
// ==========================================
let somAtivado = true;

const sfx = {
  hover: new Audio("audio/hover.mp3"),
  click: new Audio("audio/click.mp3"),
  conquista: new Audio("audio/conquista.mp3"),
  loot: new Audio("audio/loot.mp3"),
  levelup: new Audio("audio/levelup.mp3"),
};

// Abaixa o volume do hover para não ficar irritante
sfx.hover.volume = 0.1;
sfx.click.volume = 0.3;

function tocarSom(nome) {
  if (!somAtivado || !sfx[nome]) return;

  // Clona o áudio para permitir que o mesmo som toque várias vezes seguidas (sem cortar)
  const somClone = sfx[nome].cloneNode();
  somClone.volume = sfx[nome].volume;

  // O .catch evita erros no console se o navegador bloquear o autoplay
  somClone
    .play()
    .catch((e) =>
      console.log("Áudio bloqueado pelo navegador até o usuário interagir."),
    );
}

function inicializarAudio() {
  const btnSom = document.getElementById("btnSom");

  if (btnSom) {
    btnSom.addEventListener("click", () => {
      somAtivado = !somAtivado;
      btnSom.innerHTML = somAtivado
        ? '<i class="fa-solid fa-volume-high"></i>'
        : '<i class="fa-solid fa-volume-xmark"></i>';
      btnSom.classList.toggle("mutado", !somAtivado);

      if (somAtivado) tocarSom("click");
    });
  }

  // Adiciona o som de Hover e Click nos botões e links
  const elementosInterativos = document.querySelectorAll(
    "button, a, .card, .loot-item, .mapa-ponto, .npc-sprite",
  );

  elementosInterativos.forEach((el) => {
    el.addEventListener("mouseenter", () => tocarSom("hover"));
    // Só adiciona som de clique se não for o botão de som (para não encavalar)
    if (el.id !== "btnSom") {
      el.addEventListener("click", () => tocarSom("click"));
    }
  });
}

// ==========================================
// 6. INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarSaudacao();
  renderFormacao();
  renderProjetos();
  renderSkills();
  carregarEstado();

  inicializarFiltrosProjetos();
  inicializarObservers();
  inicializarEventos();
  inicializarTimeline();
  inicializarNPC();
  inicializarMiniMapa();
  inicializarQuestPopup();
  inicializarAudio();
});
