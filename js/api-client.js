// API Client - Funções para consumir a API do banco de dados

class SantanderBIAPI {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  // Método auxiliar para fazer requests
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data; // Retorna apenas os dados
    } catch (error) {
      console.error(`Erro na API (${endpoint}):`, error);
      throw error;
    }
  }

  // Clientes
  async getClientes() {
    return this.request('/clientes');
  }

  async getCliente(id) {
    return this.request(`/clientes/${id}`);
  }

  // Transações
  async getTransacoes() {
    return this.request('/transacoes');
  }

  async getTransacoesCliente(id) {
    return this.request(`/transacoes/cliente/${id}`);
  }

  // Estatísticas
  async getEstatisticas() {
    return this.request('/estatisticas');
  }

  // Análises
  async getAnaliseCNAE() {
    return this.request('/analise/cnae');
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }
}

// Instância global da API
const api = new SantanderBIAPI();

// Funções utilitárias para formatação
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100); // Assumindo que os valores estão em centavos
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Funções para carregar dados nos dashboards
async function loadDashboardData() {
  try {
    // Carregar estatísticas gerais
    const stats = await api.getEstatisticas();
    updateStatistics(stats);

    // Carregar análise por CNAE
    const cnaeData = await api.getAnaliseCNAE();
    updateCNAECharts(cnaeData);

    // Carregar últimas transações
    const transacoes = await api.getTransacoes();
    updateTransactionsTable(transacoes.slice(0, 10)); // Últimas 10

  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
    showError('Erro ao carregar dados. Verifique se o servidor está rodando.');
  }
}

// Atualizar estatísticas na tela
function updateStatistics(stats) {
  const elements = {
    totalClientes: document.getElementById('totalClientes'),
    totalTransacoes: document.getElementById('totalTransacoes'),
    valorTotalTransacoes: document.getElementById('valorTotalTransacoes'),
    faturamentoTotal: document.getElementById('faturamentoTotal'),
    saldoTotal: document.getElementById('saldoTotal')
  };

  if (elements.totalClientes) {
    elements.totalClientes.textContent = stats.totalClientes?.total || '0';
  }
  if (elements.totalTransacoes) {
    elements.totalTransacoes.textContent = stats.totalTransacoes?.total || '0';
  }
  if (elements.valorTotalTransacoes) {
    elements.valorTotalTransacoes.textContent = formatCurrency(stats.valorTotalTransacoes?.total || 0);
  }
  if (elements.faturamentoTotal) {
    elements.faturamentoTotal.textContent = formatCurrency(stats.faturamentoTotal?.total || 0);
  }
  if (elements.saldoTotal) {
    elements.saldoTotal.textContent = formatCurrency(stats.saldoTotal?.total || 0);
  }
}

// Atualizar gráficos com dados de CNAE
function updateCNAECharts(cnaeData) {
  if (!cnaeData || cnaeData.length === 0) return;

  // Preparar dados para os gráficos
  const labels = cnaeData.map(item => item.DS_CNAE?.substring(0, 20) + '...' || 'N/A');
  const faturamentos = cnaeData.map(item => item.FATURAMENTO_TOTAL || 0);
  const quantidades = cnaeData.map(item => item.QUANTIDADE_CLIENTES || 0);

  // Atualizar gráfico de faturamento por CNAE (se existir)
  const faturamentoChart = Chart.getChart('faturamentoCNAE');
  if (faturamentoChart) {
    faturamentoChart.data.labels = labels.slice(0, 10);
    faturamentoChart.data.datasets[0].data = faturamentos.slice(0, 10);
    faturamentoChart.update();
  }

  // Criar novo gráfico se não existir
  const ctx = document.getElementById('faturamentoCNAE');
  if (ctx && !Chart.getChart('faturamentoCNAE')) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.slice(0, 10),
        datasets: [{
          label: 'Faturamento Total',
          data: faturamentos.slice(0, 10),
          backgroundColor: '#FF4757'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Faturamento por CNAE (Top 10)'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          }
        }
      }
    });
  }
}

// Atualizar tabela de transações
function updateTransactionsTable(transacoes) {
  const tableBody = document.getElementById('transacoesTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  
  transacoes.forEach(transacao => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${transacao.ID}</td>
      <td>${transacao.ID_PGTO}</td>
      <td>${transacao.ID_RCBE}</td>
      <td>${formatCurrency(transacao.VL)}</td>
      <td>${transacao.DS_TRAN || 'N/A'}</td>
      <td>${formatDate(transacao.DT_REFE)}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Buscar dados de um cliente específico
async function searchCliente() {
  const clienteId = document.getElementById('clienteSearch')?.value;
  if (!clienteId) {
    alert('Por favor, insira um ID de cliente');
    return;
  }

  try {
    const cliente = await api.getCliente(clienteId);
    const transacoes = await api.getTransacoesCliente(clienteId);
    
    displayClienteInfo(cliente, transacoes);
  } catch (error) {
    alert('Cliente não encontrado ou erro na busca');
  }
}

// Exibir informações do cliente
function displayClienteInfo(cliente, transacoes) {
  const infoDiv = document.getElementById('clienteInfo');
  if (!infoDiv) return;

  const totalEntradas = transacoes
    .filter(t => t.TIPO_TRANSACAO === 'ENTRADA')
    .reduce((sum, t) => sum + (t.VL || 0), 0);
    
  const totalSaidas = transacoes
    .filter(t => t.TIPO_TRANSACAO === 'SAÍDA')
    .reduce((sum, t) => sum + (t.VL || 0), 0);

  infoDiv.innerHTML = `
    <div class="cliente-card">
      <h3>Cliente: ${cliente.ID}</h3>
      <p><strong>CNAE:</strong> ${cliente.DS_CNAE || 'N/A'}</p>
      <p><strong>Faturamento:</strong> ${formatCurrency(cliente.VL_FATU || 0)}</p>
      <p><strong>Saldo:</strong> ${formatCurrency(cliente.VL_SLDO || 0)}</p>
      <p><strong>Data Abertura:</strong> ${formatDate(cliente.DT_ABRT)}</p>
      <hr>
      <h4>Resumo de Transações</h4>
      <p><strong>Total de Transações:</strong> ${transacoes.length}</p>
      <p><strong>Total Entradas:</strong> ${formatCurrency(totalEntradas)}</p>
      <p><strong>Total Saídas:</strong> ${formatCurrency(totalSaidas)}</p>
      <p><strong>Saldo Transações:</strong> ${formatCurrency(totalEntradas - totalSaidas)}</p>
    </div>
  `;
}

// Mostrar erro na tela
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  } else {
    alert(message);
  }
}

// Inicializar dados quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  // Carregar dados iniciais
  loadDashboardData();
  
  // Configurar event listeners
  const searchButton = document.getElementById('searchClienteBtn');
  if (searchButton) {
    searchButton.addEventListener('click', searchCliente);
  }

  const searchInput = document.getElementById('clienteSearch');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchCliente();
      }
    });
  }

  console.log('API Client carregado. Servidor deve estar rodando na porta 3000.');
});

// Exportar para uso global
window.SantanderBIAPI = SantanderBIAPI;
window.api = api;