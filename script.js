// =========================
// 1. ESTADO GLOBAL & DADOS
// =========================
const conquistasDesbloqueadas = new Set();
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
  { id: "inicio", texto: "A Jornada Começa!" },
  { id: "boss", texto: "Primeiro Boss Derrotado!" },
  { id: "skills", texto: "Habilidades Reconhecidas!" },
  { id: "fim", texto: "Chegou ao fim da jornada!" },
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
// 4. RENDERIZAÇÕES DOM
// =========================
// Função simulada para evitar erros caso não exista no seu código
function renderConquistas() {
  // Lógica para renderizar os badges visuais de conquista no HTML
  console.log("Conquistas atuais:", Array.from(conquistasDesbloqueadas));
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
    renderConquistas();
    mostrarNotificacao(id);
    salvarEstado();
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

  // Observadores de Conquistas Específicas
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

      // Reseta os chefões visuais
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

function inicializarTimeline() {
  const botoes = document.querySelectorAll(".toggle-btn");

  botoes.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Pega a <ul> que está logo antes do botão clicado
      const detalhes = e.currentTarget.previousElementSibling;
      const icone = e.currentTarget.querySelector("i");

      detalhes.classList.toggle("open");

      if (detalhes.classList.contains("open")) {
        e.currentTarget.innerHTML =
          '<i class="fa-solid fa-eye-slash"></i> Esconder detalhes';
        e.currentTarget.classList.add("btn-acao"); // Dá um brilho no botão
      } else {
        e.currentTarget.innerHTML =
          '<i class="fa-solid fa-eye"></i> Ver mais detalhes';
        e.currentTarget.classList.remove("btn-acao");
      }
    });
  });
}

// =========================
// 7. INICIALIZAÇÃO
// =========================
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
});
