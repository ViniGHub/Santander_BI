// Função para alternar entre tabs
function showTab(tabName) {
  // Esconder todos os conteúdos
  const contents = document.querySelectorAll(".dashboard-content");
  contents.forEach((content) => content.classList.remove("active"));

  // Remover classe active de todas as tabs
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => tab.classList.remove("active"));

  // Mostrar conteúdo selecionado
  document.getElementById(tabName).classList.add("active");

  // Ativar tab selecionada
  event.target.classList.add("active");
}

// Gráfico de Distribuição por Região
const regionCtx = document.getElementById("regionChart").getContext("2d");
new Chart(regionCtx, {
  type: "doughnut",
  data: {
    labels: ["Sudeste", "Sul", "Nordeste", "Norte", "Centro-Oeste"],
    datasets: [
      {
        data: [45, 25, 15, 8, 7],
        backgroundColor: [
          "#FF4757",
          "#2ED573",
          "#3742FA",
          "#FFA502",
          "#747d8c",
        ],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  },
});

// Gráfico de Evolução Temporal
const timelineCtx = document.getElementById("timelineChart").getContext("2d");
new Chart(timelineCtx, {
  type: "line",
  data: {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai"],
    datasets: [
      {
        label: "Declínio",
        data: [2500, 2600, 2750, 2800, 2847],
        borderColor: "#FF4757",
        tension: 0.1,
      },
      {
        label: "Expansão",
        data: [4800, 4950, 5100, 5180, 5234],
        borderColor: "#2ED573",
        tension: 0.1,
      },
      {
        label: "Início",
        data: [1650, 1720, 1800, 1850, 1892],
        borderColor: "#3742FA",
        tension: 0.1,
      },
      {
        label: "Madura",
        data: [8200, 8350, 8500, 8650, 8756],
        borderColor: "#FFA502",
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  },
});

// Gráfico de Precisão por Perfil
const precisionCtx = document.getElementById("precisionChart").getContext("2d");
new Chart(precisionCtx, {
  type: "bar",
  data: {
    labels: ["Declínio", "Expansão", "Início", "Madura"],
    datasets: [
      {
        label: "Precisão (%)",
        data: [91.2, 96.8, 89.5, 95.3],
        backgroundColor: ["#FF4757", "#2ED573", "#3742FA", "#FFA502"],
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  },
});

// Gráfico de Sazonalidade
const seasonalityCtx = document
  .getElementById("seasonalityChart")
  .getContext("2d");
new Chart(seasonalityCtx, {
  type: "radar",
  data: {
    labels: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    datasets: [
      {
        label: "Varejo",
        data: [65, 59, 80, 81, 56, 55, 40, 45, 67, 89, 95, 100],
        borderColor: "#FF4757",
        backgroundColor: "rgba(255, 71, 87, 0.2)",
      },
      {
        label: "Tecnologia",
        data: [85, 80, 75, 70, 72, 78, 82, 85, 88, 90, 85, 80],
        borderColor: "#2ED573",
        backgroundColor: "rgba(46, 213, 115, 0.2)",
      },
    ],
  },
  options: {
    responsive: true,
  },
});

// Inicializar Mapa
const map = L.map("map").setView([-14.235, -51.9253], 4);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Adicionar marcadores no mapa (simulando empresas)
const companies = [
  { lat: -23.5505, lng: -46.6333, profile: "Expansão", count: 1250 },
  { lat: -20.5505, lng: -50.6333, profile: "Expansão", count: 1250 },
  { lat: -22.9068, lng: -43.1729, profile: "Madura", count: 980 },
  { lat: -30.0346, lng: -51.2177, profile: "Início", count: 450 },
  { lat: -8.0476, lng: -34.877, profile: "Declínio", count: 320 },
  { lat: -8.0476, lng: -50.877, profile: "Declínio", count: 700 },
];

companies.forEach((company) => {
  const color =
    company.profile === "Expansão"
      ? "#2ED573"
      : company.profile === "Madura"
      ? "#FFA502"
      : company.profile === "Início"
      ? "#3742FA"
      : "#FF4757";

  L.circleMarker([company.lat, company.lng], {
    radius: Math.sqrt(company.count / 10),
    fillColor: color,
    color: color,
    weight: 2,
    opacity: 1,
    fillOpacity: 0.6,
  })
    .bindPopup(`<b>${company.profile}</b><br>${company.count} empresas`)
    .addTo(map);
});

// Gerar pontos no plano cartesiano
function generateCartesianPoints() {
  const plane = document.getElementById("cartesianPlane");
  const companies = [
    { x: 0.7, y: 0.3, profile: "expansao" },
    { x: 0.3, y: 0.7, profile: "inicio" },
    { x: 0.8, y: 0.8, profile: "madura" },
    { x: 0.2, y: 0.2, profile: "declinio" },
    { x: 0.6, y: 0.4, profile: "madura" },
    { x: 0.4, y: 0.6, profile: "inicio" },
    { x: 0.9, y: 0.1, profile: "declinio" },
    { x: 0.1, y: 0.9, profile: "expansao" },
  ];

  companies.forEach((company, index) => {
    const dot = document.createElement("div");
    dot.className = `company-dot ${company.profile}`;
    dot.style.left = `${company.x * 100}%`;
    dot.style.top = `${(1 - company.y) * 100}%`;
    dot.title = `Empresa ${index + 1} - ${
      company.profile.charAt(0).toUpperCase() + company.profile.slice(1)
    }`;
    plane.appendChild(dot);
  });
}

// Inicializar pontos no plano cartesiano
generateCartesianPoints();
