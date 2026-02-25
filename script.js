// =========================
// 1. ESTADO GLOBAL & DADOS
// =========================
const conquistasDesbloqueadas = new Set();
const inventarioLoot = new Set();
const totalLoot = 3;
const fasesVisitadas = new Set();
const fases = [
  "inicio",
  "formacao",
  "experiencias",
  "projetos",
  "skills",
  "contato",
];

// Mock do array de conquistas (Adicionado pois faltava no original)
const conquistas = [
  { id: "inicio", texto: "A Jornada Começa!", descricao: "Você deu o primeiro passo ao iniciar a aventura.", dica: "Vá até o topo da página e inicie a jornada." },
  { id: "experiencia", texto: "Diário de Missões!", descricao: "Investigou o histórico de missões do jogador.", dica: "Abra os detalhes de uma experiência na Fase 2." },
  { id: "boss", texto: "Boss Derrotado!", descricao: "Comprovou sua força vencendo um Projeto.", dica: "Enfrente um Boss na Fase 3 clicando em 'Ver batalha'." },
  { id: "skills", texto: "Habilidades Reconhecidas!", descricao: "Desbloqueou a visão da árvore de talentos.", dica: "Role até a Fase 4 para revelar as skills." },
  { id: "fim", texto: "Fim da Jornada!", descricao: "Explorou todo o mapa e chegou ao Contato.", dica: "Desça até o fim da página para a recompensa final." },
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

// Substitua o seu array de skills atual por este:
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

// =========================
// 2. LOCAL STORAGE
// =========================
const STORAGE_KEY = "portfolio_jornada";

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

// =========================
// 3. SAUDAÇÃO DINÂMICA
// =========================
function inicializarSaudacao() {
  const saudacao = document.getElementById("saudacao");
  if (!saudacao) return;

  const hora = new Date().getHours();
  if (hora < 12) saudacao.textContent = "🌅 Bom dia, aventureiro!";
  else if (hora < 18) saudacao.textContent = "🌞 Boa tarde, aventureiro!";
  else saudacao.textContent = "🌙 Boa noite, aventureiro!";
}

// =========================
// SISTEMA DE NPC / DICAS (SEQUENCIAL)
// =========================

// Transformamos em um Array (lista) para garantir a ordem exata das falas
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

function inicializarNPC() {
  const npcSprite = document.getElementById("npcSprite");
  const npcBalao = document.getElementById("npcBalao");
  const npcTexto = document.getElementById("npcTexto");
  const btnFechar = document.getElementById("fecharNpc");

  if (!npcSprite || !npcBalao) return;

  // Função central que define o que o NPC vai falar
  function falarProximaDica() {
    // Procura na lista a PRIMEIRA dica cuja conquista ainda NÃO foi desbloqueada
    const proximaDica = dicasNPC.find(
      (dica) => !conquistasDesbloqueadas.has(dica.id),
    );

    if (proximaDica) {
      npcTexto.textContent = proximaDica.texto;
    } else {
      npcTexto.textContent =
        "Incrível! Você completou toda a jornada. Tenho certeza que um recrutador ficaria impressionado!";
    }

    npcBalao.classList.remove("hidden");
  }

  // 1. Ao clicar no NPC, ele repete a dica atual
  npcSprite.addEventListener("click", falarProximaDica);

  // 2. Fechar o balão ao clicar no X
  btnFechar.addEventListener("click", () => {
    npcBalao.classList.add("hidden");
  });

  // 3. SAUDAÇÃO INICIAL: Faz o NPC falar sozinho assim que a página carrega
  // Coloquei um atraso de 1 segundo (1000ms) para dar tempo da página abrir bonita antes dele falar
  setTimeout(() => {
    falarProximaDica();
  }, 1000);
}

// =========================
// SISTEMA DE LOOT E INVENTÁRIO
// =========================
function coletarLoot(idItem) {
  // Se já apanhou o item, não faz nada
  if (inventarioLoot.has(idItem)) return;

  // Dicionário de ícones
  const iconesLoot = {
    'chave': 'fa-key',
    'pergaminho': 'fa-scroll',
    'pocao': 'fa-flask'
  };

  // 1. Adiciona ao inventário virtual
  inventarioLoot.add(idItem);

  // 2. Esconde o item do ecrã
  const itemNoMapa = document.getElementById(`loot-${idItem}`);
  if (itemNoMapa) itemNoMapa.style.display = 'none';

  // 3. Preenche o slot no painel lateral
  const slot = document.querySelector(`.slot[data-slot="${idItem}"]`);
  if (slot) {
    slot.classList.add('preenchido');
    slot.innerHTML = `<i class="fa-solid ${iconesLoot[idItem]}"></i>`;
  }

  const descricoesLoot = {
    'chave': 'Chave Dourada: Abre caminhos secretos.',
    'pergaminho': 'Pergaminho Antigo: Contém códigos sagrados.',
    'pocao': 'Poção de Mana: Restaura a energia criativa.'
  };

  slot.setAttribute('data-tooltip', descricoesLoot[idItem]);

  // 4. Mostra uma notificação de sucesso
  const textoNotificacao = document.getElementById("textoNotificacao");
  const notificacao = document.getElementById("notificacao");
  
  textoNotificacao.textContent = `Loot encontrado: ${idItem.toUpperCase()}!`;
  notificacao.classList.remove("hidden");
  notificacao.classList.add("show");
  setTimeout(() => notificacao.classList.remove("show"), 3000);

  // 5. Verifica se apanhou todos para ativar o Tema Secreto!
  if (inventarioLoot.size === totalLoot) {
    setTimeout(ativarTemaSecreto, 2000); // Espera 2 segundos antes de ativar
  }
}

function ativarTemaSecreto() {
  document.body.classList.add("theme-gameboy");
  
  // Faz o botão aparecer no inventário!
  const btnToggleTema = document.getElementById("btnToggleTema");
  if (btnToggleTema) {
    btnToggleTema.classList.remove("hidden");
  }
  
  const textoNotificacao = document.getElementById("textoNotificacao");
  const notificacao = document.getElementById("notificacao");
  
  textoNotificacao.textContent = "CÓDIGO SECRETO: Tema de 8-bits Desbloqueado!";
  notificacao.classList.remove("hidden");
  notificacao.classList.add("show");
  
  if (typeof levelUpEffect === "function") levelUpEffect();
}

// =========================
// 4. RENDERIZAÇÕES DOM
// =========================
// Função simulada para evitar erros caso não exista no seu código
function renderConquistas() {
  const lista = document.getElementById("listaConquistas");
  if (!lista) return;

  lista.innerHTML = "";

  conquistas.forEach((conquista) => {
    const isDesbloqueada = conquistasDesbloqueadas.has(conquista.id);
    const statusClass = isDesbloqueada ? "desbloqueada" : "bloqueada";
    const iconClass = isDesbloqueada ? "fa-trophy" : "fa-lock";
    
    // Define o texto que vai aparecer no Tooltip
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

  // Utilizando map e join para melhor performance no DOM
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

function renderCursos() {
  const container = document.getElementById("listaCursos");
  if (!container) return;

  container.innerHTML = cursos
    .map(
      (curso) => `
    <div class="card">
      <h3>📜 ${curso.nome}</h3>
      <p>Carga horária: ${curso.horas}h</p>
      <span>Ano: ${curso.ano}</span>
    </div>
  `,
    )
    .join("");
}

function renderProjetos() {
  // <--- Remova o argumento filtro daqui
  const container = document.getElementById("listaProjetos");
  if (!container) return;
  container.innerHTML = "";

  projetos.forEach((projeto) => {
    const card = document.createElement("div");
    card.className = "card boss";
    card.dataset.derrotado = "false";
    card.dataset.categoria = projeto.categoria; // <--- NOVA LINHA: Salva a categoria no HTML do card

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

    // Evento de "Derrotar o Boss"
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

// =========================
// EFEITO DE LEVEL UP (CONFETES)
// =========================
function levelUpEffect() {
  // Verifica se a biblioteca de confetes carregou corretamente
  if (typeof confetti !== "undefined") {
    const duration = 3000; // 3 segundos de confetes
    const end = Date.now() + duration;

    (function frame() {
      // Confetes saindo do canto esquerdo
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#fbbf24', '#0ff'] // Verde, Dourado, Ciano
      });
      // Confetes saindo do canto direito
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#fbbf24', '#0ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }
}

function inicializarFiltrosProjetos() {
  const botoes = document.querySelectorAll(".btn-filtro");

  botoes.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // 1. Remove o brilho de todos os botões e coloca só no clicado
      botoes.forEach((b) => b.classList.remove("btn-acao"));
      e.currentTarget.classList.add("btn-acao");

      // 2. Descobre qual categoria foi clicada
      const filtro = e.currentTarget.dataset.categoria;
      const cards = document.querySelectorAll("#listaProjetos .card.boss");

      // 3. Esconde ou mostra os chefões
      cards.forEach((card) => {
        if (filtro === "todos" || card.dataset.categoria === filtro) {
          card.style.display = "block";
          card.style.animation = "fadeIn 0.5s ease-in"; // Dá um efeito suave ao aparecer
        } else {
          card.style.display = "none";
        }
      });
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

// =========================
// 5. SISTEMA DE JOGO & NOTIFICAÇÕES
// =========================
function mostrarNotificacao(id) {
  const notificacao = document.getElementById("notificacao");
  const textoNotificacao = document.getElementById("textoNotificacao");
  const conquista = conquistas.find((c) => c.id === id);

  if (!conquista || !notificacao || !textoNotificacao) return;

  textoNotificacao.textContent = `Conquista desbloqueada: ${conquista.texto}`;
  notificacao.classList.remove("hidden");
  notificacao.classList.add("show");

  setTimeout(() => {
    notificacao.classList.remove("show");
  }, 3000);
}

function desbloquearConquista(id) {
  if (!conquistasDesbloqueadas.has(id)) {
    conquistasDesbloqueadas.add(id);
    
    renderConquistas(); // Atualiza o painel lateral mudando o cadeado para troféu
    mostrarNotificacao(id); // Mostra o Toast na tela
    salvarEstado();
    atualizarProgressoFases(); 

    // Se a conquista desbloqueada for a última ("fim"), dispara o Level Up!
    if (id === "fim") {
      levelUpEffect();
    }
  }
}

function atualizarProgressoFases() {
  const barraFases = document.getElementById("barraFases"); // Use um ID específico no HTML
  if (!barraFases) return;

  const progresso = (fasesVisitadas.size / fases.length) * 100;
  barraFases.style.width = `${progresso}%`;
  salvarEstado();
}

function progressoPorScroll() {
  const barraScroll = document.getElementById("barraProgresso"); // ID exclusivo para o scroll
  if (!barraScroll) return;

  const scrollTop = window.scrollY;
  const alturaTotal =
    document.documentElement.scrollHeight - window.innerHeight;
  const progresso = (scrollTop / alturaTotal) * 100;

  barraScroll.style.width = `${progresso}%`;
}

// =========================
// 6. OBSERVERS E EVENTOS
// =========================
function inicializarObservers() {
  const baseObserverConfig = { threshold: 0.2 };

  // Observador de Fases
  const faseObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fase = entry.target;
        fase.classList.add("visivel");
        fasesVisitadas.add(fase.id);
        atualizarProgressoFases();

        // Se já registrou a fase, não precisa observar mais (opcional para performance)
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
  window.addEventListener("scroll", progressoPorScroll);

  const btnStart = document.getElementById("startGame");
  if (btnStart) {
    btnStart.addEventListener("click", () => {
      document
        .getElementById("formacao")
        ?.scrollIntoView({ behavior: "smooth" });
      desbloquearConquista("inicio");
    });
  }

  const btnReset = document.getElementById("resetJornada");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (!confirm("Tem certeza que deseja resetar toda a jornada?")) return;

      localStorage.removeItem(STORAGE_KEY);
      conquistasDesbloqueadas.clear();
      fasesVisitadas.clear();

      renderConquistas();
      atualizarProgressoFases();

      const barraScroll = document.getElementById("barraProgresso");
      if (barraScroll) barraScroll.style.width = "0%";

      document.querySelectorAll(".card.boss").forEach((card) => {
        card.dataset.derrotado = "false";
        const icon = card.querySelector(".boss-icon");
        if (icon) {
          icon.classList.remove("fa-skull");
          icon.classList.add("fa-dragon");
          icon.style.color = "";
        }
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
      alert("Jornada resetada com sucesso!");
    });
  }
}

function inicializarMiniMapa() {
  const pontosMapa = document.querySelectorAll(".mapa-ponto");
  const secoes = document.querySelectorAll(".fase");

  // Observer para saber em qual seção o usuário está EXATAMENTE agora
  const mapaObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Se pelo menos 50% da fase estiver visível na tela
      if (entry.isIntersecting) {
        const idFaseAtual = entry.target.id;

        // 1. Remove a classe 'ativo' de todos os pontos
        pontosMapa.forEach(p => p.classList.remove("ativo"));

        // 2. Encontra o ponto correspondente à fase atual e ativa o brilho neon
        const pontoAtual = document.querySelector(`.mapa-ponto[data-fase="${idFaseAtual}"]`);
        if (pontoAtual) {
          pontoAtual.classList.add("ativo");
          pontoAtual.classList.add("explorado"); // Já marca como explorado para sempre
        }
      }
    });
  }, { threshold: 0.5 }); // O threshold 0.5 exige que metade da tela mostre a seção

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


// 7. INICIALIZAÇÃO
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
  const btnToggleTema = document.getElementById("btnToggleTema");
  if (btnToggleTema) {
    btnToggleTema.addEventListener("click", () => {
      document.body.classList.toggle("theme-gameboy");
    });
  }
});
