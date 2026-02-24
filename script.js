// =========================
// ESTADO GLOBAL (ADICIONADO)
// =========================
const conquistasDesbloqueadas = new Set();
const fasesVisitadas = new Set();

const fases = ["inicio", "formacao", "cursos", "projetos", "skills", "contato"];
const barra = document.getElementById("barraProgresso");


// === LOCAL STORAGE ===
const STORAGE_KEY = "portfolio_jornada";

function salvarEstado() {
  const estado = {
    conquistas: Array.from(conquistasDesbloqueadas),
    fases: Array.from(fasesVisitadas)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

function carregarEstado() {
  const estadoSalvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!estadoSalvo) return;

  estadoSalvo.conquistas.forEach(id => conquistasDesbloqueadas.add(id));
  estadoSalvo.fases.forEach(id => fasesVisitadas.add(id));

  renderConquistas();
  atualizarProgresso();
}

// =========================
// SAUDAÇÃO
// =========================
const saudacao = document.getElementById("saudacao");
const hora = new Date().getHours();

if (hora < 12) {
  saudacao.textContent = "🌅 Bom dia, aventureiro!";
} else if (hora < 18) {
  saudacao.textContent = "🌞 Boa tarde, aventureiro!";
} else {
  saudacao.textContent = "🌙 Boa noite, aventureiro!";
}

// =========================
// DADOS
// =========================
const formacoes = [
  { curso: "Desenvolvimento de Sistemas", instituicao: "ETEC", periodo: "2023 - 2024" },
  { curso: "Redes de Computadores", instituicao: "ETEC", periodo: "2021 - 2022" },
];

const cursos = [
  { nome: "HTML e CSS", horas: 40, ano: 2023 },
  { nome: "JavaScript", horas: 60, ano: 2024 },
  { nome: "Git e GitHub", horas: 20, ano: 2024 },
];

const projetos = [
  {
    nome: "TaskMaster",
    descricao: "Gerenciador de tarefas com foco em produtividade.",
    tecnologias: ["HTML", "CSS", "JavaScript"],
    categoria: "web",
    link: "https://taskmasterbr.vercel.app/",
  },
  {
    nome: "Cápsula do Tempo",
    descricao: "Aplicação para salvar mensagens e lembranças para o futuro.",
    tecnologias: ["React", "Firebase"],
    categoria: "frontend",
    link: "#",
  },
];

const skills = [
  { nome: "HTML", nivel: 90 },
  { nome: "CSS", nivel: 85 },
  { nome: "JavaScript", nivel: 80 },
  { nome: "Git", nivel: 70 },
  { nome: "Comunicação", nivel: 85 },
];

// =========================
// RENDERIZAÇÕES
// =========================
function renderFormacao() {
  const container = document.getElementById("listaFormacao");
  container.innerHTML = "";

  formacoes.forEach(f => {
    container.innerHTML += `
      <div class="card">
        <h3>🎓 ${f.curso}</h3>
        <p>${f.instituicao}</p>
        <span>${f.periodo}</span>
      </div>
    `;
  });
}

function renderCursos() {
  const container = document.getElementById("listaCursos");
  container.innerHTML = "";

  cursos.forEach(curso => {
    container.innerHTML += `
      <div class="card">
        <h3>📜 ${curso.nome}</h3>
        <p>Carga horária: ${curso.horas}h</p>
        <span>Ano: ${curso.ano}</span>
      </div>
    `;
  });
}

function renderProjetos(filtro = "todos") {
  const container = document.getElementById("listaProjetos");
  container.innerHTML = "";

  projetos.forEach(projeto => {
    if (filtro !== "todos" && projeto.categoria !== filtro) return;

    const card = document.createElement("div");
    card.className = "card boss";
    card.dataset.derrotado = "false";

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
  container.innerHTML = "";

  skills.forEach(skill => {
    container.innerHTML += `
      <div class="card skill">
        <h3>${skill.nome}</h3>
        <div class="barra">
          <div class="progresso" style="width:${skill.nivel}%"></div>
        </div>
      </div>
    `;
  });
}

// =========================
// INTERAÇÕES
// =========================
document.getElementById("startGame").addEventListener("click", () => {
  document.getElementById("formacao").scrollIntoView({ behavior: "smooth" });
  desbloquearConquista("inicio");
});

// =========================
// OBSERVERS
// =========================
document.querySelectorAll(".fase").forEach(fase => {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      fase.classList.add("visivel");
      fasesVisitadas.add(fase.id);
      atualizarProgresso();
    }
  }, { threshold: 0.2 }).observe(fase);
});

// Skills
const skillSection = document.getElementById("skills");
new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    desbloquearConquista("skills");
  }
}, { threshold: 0.3 }).observe(skillSection);

// Contato
new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    desbloquearConquista("fim");
  }
}).observe(document.getElementById("contato"));

// =========================
// PROGRESSO DA JORNADA
// =========================
const barraScroll = document.getElementById("barraProgresso");

function progressoPorScroll() {
  const scrollTop = window.scrollY;
  const alturaTotal =
    document.documentElement.scrollHeight - window.innerHeight;

  const progresso = (scrollTop / alturaTotal) * 100;
  barraScroll.style.width = `${progresso}%`;
}

window.addEventListener("scroll", progressoPorScroll);

// =========================
// NOTIFICAÇÃO
// =========================
const notificacao = document.getElementById("notificacao");
const textoNotificacao = document.getElementById("textoNotificacao");

function mostrarNotificacao(id) {
  const conquista = conquistas.find(c => c.id === id);
  if (!conquista) return;

  textoNotificacao.textContent = `Conquista desbloqueada: ${conquista.texto}`;

  notificacao.classList.remove("hidden");
  notificacao.classList.add("show");

  setTimeout(() => {
    notificacao.classList.remove("show");
  }, 3000);
}

// =========================
// INIT
// =========================
renderFormacao();
renderCursos();
renderProjetos();
renderSkills();

function desbloquearConquista(id) {
  if (!conquistasDesbloqueadas.has(id)) {
    conquistasDesbloqueadas.add(id);
    renderConquistas();
    mostrarNotificacao(id);
    salvarEstado();
  }
}

function atualizarProgresso() {
  const progresso = (fasesVisitadas.size / fases.length) * 100;
  barra.style.width = `${progresso}%`;
  salvarEstado();
}

carregarEstado();

const btnReset = document.getElementById("resetJornada");

btnReset.addEventListener("click", () => {
  const confirmar = confirm(
    "Tem certeza que deseja resetar toda a jornada?"
  );

  if (!confirmar) return;

  // Limpa localStorage
  localStorage.removeItem(STORAGE_KEY);

  // Reseta conquistas
  conquistasDesbloqueadas.clear();
  renderConquistas();

  // Reseta fases visitadas
  fasesVisitadas.clear();
  atualizarProgresso();

  // Reseta barra de progresso
  const barra = document.getElementById("barraProgresso");
  barra.style.width = "0%";

  // Reseta bosses
  document.querySelectorAll(".card.boss").forEach(card => {
    card.dataset.derrotado = "false";

    const icon = card.querySelector(".boss-icon");
    if (icon) {
      icon.classList.remove("fa-skull");
      icon.classList.add("fa-dragon");
      icon.style.color = "";
    }

    card.style.opacity = "1";
    card.style.borderColor = "";
  });

  // Volta para o início
  window.scrollTo({ top: 0, behavior: "smooth" });

  alert("Jornada resetada com sucesso!");
});