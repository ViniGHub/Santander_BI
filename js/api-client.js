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

// Variáveis globais para controle do dropdown
let todosClientes = [];
let dropdownVisible = false;
let searchTimeout = null;

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

// Carregar todos os clientes para o filtro
async function carregarTodosClientes() {
  if (todosClientes.length === 0) {
    try {
      const clientesData = await api.getClientes();
      
      // Remover duplicatas baseado no ID do cliente
      todosClientes = clientesData.filter((cliente, index, array) => 
        array.findIndex(c => c.ID === cliente.ID) === index
      );
      
      console.log(`${todosClientes.length} clientes únicos carregados para filtro (de ${clientesData.length} registros totais)`);
      
      // Log para debug - verificar se há duplicatas
      const totalOriginal = clientesData.length;
      const totalUnicos = todosClientes.length;
      if (totalOriginal !== totalUnicos) {
        console.warn(`⚠️ Removidas ${totalOriginal - totalUnicos} duplicatas de clientes`);
      }
      
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showError('Erro ao carregar lista de clientes');
    }
  }
}

// Filtrar e exibir clientes no dropdown
function filtrarClientesDropdown(searchTerm) {
  const dropdown = document.getElementById('clientesDropdown');
  if (!dropdown) return;

  // Limpar timeout anterior
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Se não há termo de busca, esconder dropdown
  if (!searchTerm || searchTerm.length < 2) {
    esconderDropdown();
    return;
  }

  // Filtrar clientes
  searchTimeout = setTimeout(() => {
    const termoBusca = searchTerm.toLowerCase();
    
    // Filtrar e remover duplicatas baseado no ID
    const clientesFiltrados = todosClientes
      .filter(cliente => 
        cliente.ID.toLowerCase().includes(termoBusca) ||
        (cliente.DS_CNAE && cliente.DS_CNAE.toLowerCase().includes(termoBusca))
      )
      .filter((cliente, index, array) => 
        // Remover duplicatas - manter apenas a primeira ocorrência de cada ID
        array.findIndex(c => c.ID === cliente.ID) === index
      )
      .slice(0, 10); // Limitar a 10 resultados

    console.log(`Filtro aplicado: "${searchTerm}" - ${clientesFiltrados.length} clientes únicos encontrados`);
    mostrarDropdown(clientesFiltrados);
  }, 300); // Delay de 300ms para evitar muitas chamadas
}

// Mostrar dropdown com clientes filtrados
function mostrarDropdown(clientes) {
  const dropdown = document.getElementById('clientesDropdown');
  if (!dropdown) return;

  if (clientes.length === 0) {
    dropdown.innerHTML = '<div class="dropdown-no-results">Nenhum cliente encontrado</div>';
  } else {
    // Garantir que não há duplicatas pelo ID (proteção extra)
    const clientesUnicos = clientes.filter((cliente, index, array) => 
      array.findIndex(c => c.ID === cliente.ID) === index
    );
    
    dropdown.innerHTML = clientesUnicos.map(cliente => `
      <div class="cliente-dropdown-item" onclick="selecionarClienteDropdown('${cliente.ID.replace(/'/g, "\\'")}')">
        <div class="cliente-dropdown-id">${cliente.ID}</div>
        <div class="cliente-dropdown-info">
          CNAE: ${cliente.DS_CNAE || 'N/A'} | 
          Faturamento: ${formatCurrency(cliente.VL_FATU || 0)} | 
          Saldo: ${formatCurrency(cliente.VL_SLDO || 0)}
        </div>
      </div>
    `).join('');
    
    // Log para debug
    if (clientes.length !== clientesUnicos.length) {
      console.warn(`⚠️ Removidas ${clientes.length - clientesUnicos.length} duplicatas na exibição do dropdown`);
    }
  }

  dropdown.style.display = 'block';
  dropdownVisible = true;
}

// Esconder dropdown
function esconderDropdown() {
  const dropdown = document.getElementById('clientesDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
    dropdownVisible = false;
  }
}

// Selecionar cliente do dropdown
function selecionarClienteDropdown(clienteId) {
  const searchInput = document.getElementById('clienteSearch');
  if (searchInput) {
    searchInput.value = clienteId;
  }
  esconderDropdown();
  
  // Executar busca automaticamente
  searchCliente();
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
  
  // Carregar lista de clientes para filtro
  carregarTodosClientes();
  
  // Configurar event listeners
  const searchButton = document.getElementById('searchClienteBtn');
  if (searchButton) {
    searchButton.addEventListener('click', searchCliente);
  }

  const searchInput = document.getElementById('clienteSearch');
  if (searchInput) {
    // Enter para buscar
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        esconderDropdown();
        searchCliente();
      }
    });

    // Input para filtrar dropdown
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.trim();
      filtrarClientesDropdown(searchTerm);
    });

    // Focus para mostrar dropdown se há texto
    searchInput.addEventListener('focus', function(e) {
      const searchTerm = e.target.value.trim();
      if (searchTerm.length >= 2) {
        filtrarClientesDropdown(searchTerm);
      }
    });

    // Esconder dropdown ao clicar fora
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-input-wrapper')) {
        esconderDropdown();
      }
    });

    // Teclas de navegação no dropdown
    searchInput.addEventListener('keydown', function(e) {
      if (dropdownVisible) {
        const dropdown = document.getElementById('clientesDropdown');
        const items = dropdown?.querySelectorAll('.cliente-dropdown-item');
        
        if (e.key === 'Escape') {
          esconderDropdown();
        } else if (e.key === 'ArrowDown' && items?.length > 0) {
          e.preventDefault();
          items[0].focus();
        }
      }
    });
  }

  console.log('API Client carregado. Servidor deve estar rodando na porta 3000.');
});

// Exportar para uso global
window.SantanderBIAPI = SantanderBIAPI;
window.api = api;
window.selecionarClienteDropdown = selecionarClienteDropdown;