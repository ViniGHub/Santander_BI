# 🏦 Santander BI - Guia Completo da API

## 📋 Resumo do Projeto

Foi criado com sucesso um serviço completo em Node.js para ler dados do banco SQLite e servir para o frontend. O projeto inclui:

### 🎯 Componentes Principais

1. **Servidor Node.js** (`server.js`)
2. **Cliente JavaScript** (`js/api-client.js`)
3. **Interface Web Atualizada** (`index.html` com nova aba "Dados Reais")
4. **Página de Demonstração** (`exemplo-api.html`)

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js instalado
- Banco de dados SQLite (`banco.db`) no diretório raiz

### Inicialização
```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Ou para desenvolvimento com auto-restart
npm run dev
```

O servidor estará disponível em: http://localhost:3000

---

## 📡 Endpoints da API

### 🏥 Health Check
- **GET** `/api/health`
- Verifica se a API está funcionando

### 👥 Clientes
- **GET** `/api/clientes` - Lista todos os clientes
- **GET** `/api/clientes/:id` - Busca cliente específico

### 💳 Transações
- **GET** `/api/transacoes` - Lista todas as transações
- **GET** `/api/transacoes/cliente/:id` - Transações de um cliente

### 📊 Análises
- **GET** `/api/estatisticas` - Estatísticas gerais do sistema
- **GET** `/api/analise/cnae` - Análise agrupada por CNAE

---

## 🌐 Páginas Disponíveis

1. **Dashboard Principal**: http://localhost:3000
   - Interface original com nova aba "Dados Reais"
   - Integração com API para dados em tempo real

2. **Exemplo de API**: http://localhost:3000/exemplo-api.html
   - Demonstração prática de todos os endpoints
   - Interface simplificada para testes

---

## 💻 Exemplos de Uso

### JavaScript (Frontend)
```javascript
// Buscar estatísticas
const stats = await fetch('/api/estatisticas')
  .then(response => response.json())
  .then(data => data.data);

// Buscar cliente específico
const cliente = await fetch('/api/clientes/CNPJ_09999')
  .then(response => response.json())
  .then(data => data.data);

// Listar transações
const transacoes = await fetch('/api/transacoes')
  .then(response => response.json())
  .then(data => data.data);
```

### PowerShell
```powershell
# Testar API
Invoke-WebRequest -Uri "http://localhost:3000/api/health"

# Buscar estatísticas
(Invoke-WebRequest -Uri "http://localhost:3000/api/estatisticas").Content

# Buscar cliente
(Invoke-WebRequest -Uri "http://localhost:3000/api/clientes/CNPJ_09999").Content
```

---

## 📊 Dados do Banco

### Tabela ID (Clientes)
- **50.000 registros de clientes**
- Campos: ID, VL_FATU, VL_SLDO, DT_ABRT, DS_CNAE, DT_REFE

### Tabela TRANSACOES
- **Milhares de transações**
- Relacionamento entre clientes
- Valores, datas e descrições

---

## 🛠️ Funcionalidades Implementadas

### ✅ API REST Completa
- [x] Conexão com SQLite
- [x] CORS habilitado
- [x] Tratamento de erros
- [x] Consultas otimizadas
- [x] Formatação JSON

### ✅ Frontend Integrado
- [x] Cliente JavaScript para consumir API
- [x] Interface para busca de clientes
- [x] Exibição de estatísticas em tempo real
- [x] Tabela de transações
- [x] Gráficos com dados reais

### ✅ Páginas Web
- [x] Dashboard principal atualizado
- [x] Nova aba "Dados Reais"
- [x] Página de exemplo/demonstração
- [x] Design responsivo

---

## 🔧 Configurações

### Servidor
- **Porta**: 3000 (configurável via PORT)
- **Banco**: `banco.db` (SQLite)
- **CORS**: Habilitado para todos os domínios
- **Arquivos estáticos**: Servidos automaticamente

### Dependências
- `express`: Framework web
- `sqlite3`: Driver SQLite
- `cors`: Cross-origin resource sharing

---

## 🧪 Como Testar

### 1. Verificar se o servidor está rodando
```bash
curl http://localhost:3000/api/health
```

### 2. Testar endpoints principais
- Abrir http://localhost:3000/exemplo-api.html
- Usar a busca por cliente (ex: CNPJ_09999)
- Verificar estatísticas em tempo real

### 3. Testar integração no dashboard
- Abrir http://localhost:3000
- Navegar para aba "Dados Reais"
- Verificar carregamento automático dos dados

---

## 🚀 Próximos Passos Sugeridos

1. **Autenticação**: Implementar JWT ou similar
2. **Cache**: Redis para melhor performance
3. **Paginação**: Para grandes volumes de dados
4. **Websockets**: Para atualizações em tempo real
5. **Logs**: Sistema de logging estruturado
6. **Testes**: Suíte de testes automatizados
7. **Docker**: Containerização da aplicação

---

## 🎉 Status do Projeto

✅ **COMPLETO E FUNCIONANDO**

- ✅ Servidor Node.js rodando
- ✅ API REST funcional
- ✅ Banco SQLite conectado
- ✅ Frontend integrado
- ✅ Exemplos funcionais
- ✅ Documentação completa

**O projeto está pronto para uso e desenvolvimento!**