# Santander BI - API

API em Node.js para servir dados do banco SQLite para o frontend do projeto Santander BI.

## Instalação

1. Instalar dependências:
```bash
npm install
```

2. Iniciar o servidor:
```bash
npm start
```

Para desenvolvimento (com auto-restart):
```bash
npm run dev
```

## Endpoints da API

### Clientes
- `GET /api/clientes` - Lista todos os clientes
- `GET /api/clientes/:id` - Busca um cliente específico

### Transações
- `GET /api/transacoes` - Lista todas as transações com dados dos clientes
- `GET /api/transacoes/cliente/:id` - Lista transações de um cliente específico

### Análises
- `GET /api/estatisticas` - Estatísticas gerais do sistema
- `GET /api/analise/cnae` - Análise agrupada por CNAE

### Utilitários
- `GET /api/health` - Status da API

## Estrutura dos Dados

### Cliente (Tabela ID)
```json
{
  "ID": "string",
  "VL_FATU": "integer",
  "VL_SLDO": "integer", 
  "DT_ABRT": "date",
  "DS_CNAE": "string",
  "DT_REFE": "date"
}
```

### Transação
```json
{
  "ID": "integer",
  "ID_PGTO": "string",
  "ID_RCBE": "string",
  "VL": "integer",
  "DS_TRAN": "string",
  "DT_REFE": "date"
}
```

## Exemplos de Uso

### JavaScript (Frontend)
```javascript
// Buscar todos os clientes
fetch('/api/clientes')
  .then(response => response.json())
  .then(data => console.log(data.data));

// Buscar transações de um cliente
fetch('/api/transacoes/cliente/12345')
  .then(response => response.json())
  .then(data => console.log(data.data));

// Buscar estatísticas
fetch('/api/estatisticas')
  .then(response => response.json())
  .then(data => console.log(data.data));
```

## Configuração

- **Porta**: 3000 (padrão) ou variável de ambiente PORT
- **Banco**: banco.db (SQLite)
- **CORS**: Habilitado para todos os domínios

## Frontend

O servidor também serve os arquivos estáticos do frontend. Acesse:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api