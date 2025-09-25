const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao banco SQLite
const dbPath = path.join(__dirname, 'banco.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Rota para buscar todos os clientes
app.get('/api/clientes', (req, res) => {
  const sql = `SELECT * FROM ID ORDER BY ID`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// Rota para buscar um cliente específico
app.get('/api/clientes/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM ID WHERE ID = ?`;
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

// Rota para buscar todas as transações
app.get('/api/transacoes', (req, res) => {
  const sql = `
    SELECT 
      
      t.ID_PGTO,
      t.ID_RCBE,
      t.VL,
      t.DS_TRAN,
      t.DT_REFE,
      p.DS_CNAE as CNAE_PAGADOR,
      r.DS_CNAE as CNAE_RECEBEDOR
    FROM TRANSACOES t
    LEFT JOIN ID p ON t.ID_PGTO = p.ID
    LEFT JOIN ID r ON t.ID_RCBE = r.ID
    ORDER BY t.DT_REFE DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// Rota para buscar transações por cliente
app.get('/api/transacoes/cliente/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      
      t.ID_PGTO,
      t.ID_RCBE,
      t.VL,
      t.DS_TRAN,
      t.DT_REFE,
      CASE 
        WHEN t.ID_PGTO = ? THEN 'SAÍDA'
        WHEN t.ID_RCBE = ? THEN 'ENTRADA'
      END as TIPO_TRANSACAO
    FROM TRANSACOES t
    WHERE t.ID_PGTO = ? OR t.ID_RCBE = ?
    ORDER BY t.DT_REFE DESC
  `;
  
  db.all(sql, [id, id, id, id], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// Rota para estatísticas gerais
app.get('/api/estatisticas', (req, res) => {
  const queries = {
    totalClientes: `SELECT COUNT(*) as total FROM ID`,
    totalTransacoes: `SELECT COUNT(*) as total FROM TRANSACOES`,
    valorTotalTransacoes: `SELECT SUM(VL) as total FROM TRANSACOES`,
    faturamentoTotal: `SELECT SUM(VL_FATU) as total FROM ID`,
    saldoTotal: `SELECT SUM(VL_SLDO) as total FROM ID`
  };

  const resultados = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.get(queries[key], [], (err, row) => {
      if (err) {
        resultados[key] = { error: err.message };
      } else {
        resultados[key] = row;
      }
      
      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json({
          message: 'success',
          data: resultados
        });
      }
    });
  });
});

// Rota para análise por CNAE
app.get('/api/analise/cnae', (req, res) => {
  const sql = `
    SELECT 
      DS_CNAE,
      COUNT(*) as QUANTIDADE_CLIENTES,
      SUM(VL_FATU) as FATURAMENTO_TOTAL,
      AVG(VL_FATU) as FATURAMENTO_MEDIO,
      SUM(VL_SLDO) as SALDO_TOTAL,
      AVG(VL_SLDO) as SALDO_MEDIO
    FROM ID 
    WHERE DS_CNAE IS NOT NULL
    GROUP BY DS_CNAE
    ORDER BY FATURAMENTO_TOTAL DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// Rota para servir arquivos estáticos (seu frontend atual)
app.use(express.static('.'));

// Rota de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em: http://localhost:${PORT}/api`);
  console.log(`Frontend disponível em: http://localhost:${PORT}`);
});

// Fechar conexão com banco ao encerrar aplicação
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conexão com banco de dados fechada.');
    process.exit(0);
  });
});