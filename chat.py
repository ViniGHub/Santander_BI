import openai
import json
from datetime import datetime

class ChatAgentSimples:
    def __init__(self):
        # SUA API KEY
        self.client = openai.OpenAI(
            api_key="Coloque a chave"
        )
        
        self.conversation_history = []
        
        # CONFIGURE AQUI O QUE SUA IA DEVE SABER SOBRE O SITE/SISTEMA
        self.site_info = """
🏢 INFORMAÇÕES DO SISTEMA/SITE:

NOME DO SISTEMA: Dashboard Santander BI
DESCRIÇÃO: Sistema de análise de dados e relatórios para o banco Santander

FUNCIONALIDADES PRINCIPAIS:
- Dashboards de vendas e performance
- Relatórios financeiros em tempo real  
- Análise de clientes e produtos
- Gráficos interativos de métricas
- Filtros por período, região, produto

COMO NAVEGAR:
- Menu principal no topo da página
- Sidebar esquerda com categorias (Vendas, Financeiro, Clientes)
- Filtros no canto superior direito
- Gráficos clicáveis para drill-down
- Exportar relatórios no botão "Download"

DADOS DISPONÍVEIS:
- Vendas por período (diário, mensal, anual)
- Performance por região (Norte, Sul, Sudeste, Nordeste, Centro-Oeste)
- Top produtos mais vendidos
- Análise de clientes (novos vs recorrentes)
- Métricas financeiras (receita, margem, lucro)
- KPIs principais (conversão, ticket médio, satisfação)

FILTROS DISPONÍVEIS:
- Período: Hoje, Última semana, Último mês, Trimestre, Ano
- Região: Todas, Norte, Sul, Sudeste, Nordeste, Centro-Oeste
- Produto: Todos, Conta Corrente, Cartão de Crédito, Empréstimos, Investimentos
- Canal: Agência, Internet Banking, App Mobile, ATM

PROBLEMAS COMUNS E SOLUÇÕES:
- Dados não carregam: Verificar filtros aplicados
- Gráfico vazio: Selecionar período com dados
- Lentidão: Reduzir intervalo de tempo do filtro
- Erro de acesso: Verificar permissões com administrador

CONTATOS DE SUPORTE:
- TI: ti@santander.com.br
- BI: bi-suporte@santander.com.br  
- Telefone: (11) 4004-3535
"""

        # DADOS ATUAIS DO SISTEMA (atualize conforme necessário)
        self.current_data = {
            "data_atual": "15/01/2024",
            "usuario_logado": "Analista",
            "tela_atual": "Dashboard Principal",
            "filtros_ativos": {
                "periodo": "Último mês",
                "regiao": "Todas",
                "produto": "Todos"
            },
            "metricas_visiveis": {
                "receita_total": "R$ 2.8M",
                "vendas": "12.450",
                "crescimento": "+15.3%",
                "clientes_ativos": "45.230",
                "ticket_medio": "R$ 225",
                "satisfacao": "4.2/5"
            },
            "alertas": [
                "Meta de vendas atingida em 110%",
                "Região Norte com baixa performance",
                "Novo produto de investimento disponível"
            ]
        }

    def perguntar_ia(self, pergunta_usuario):
        """Processa pergunta do usuário"""
        
        # Contexto completo que a IA conhece
        contexto_completo = f"""
{self.site_info}

DADOS ATUAIS NA TELA:
{json.dumps(self.current_data, indent=2, ensure_ascii=False)}

HISTÓRICO DA CONVERSA:
{self._formatar_historico()}
"""

        system_prompt = """Você é a assistente virtual do Dashboard Santander BI.

SUA PERSONALIDADE:
- Amigável e prestativa (como atendente do banco)
- Responde de forma simples e clara
- Sempre tenta ajudar o usuário
- Usa informações específicas do sistema
- Quando não souber algo, admite e oferece alternativas

SUAS RESPONSABILIDADES:
- Explicar funcionalidades do dashboard
- Ajudar com navegação e filtros
- Explicar dados e métricas mostrados
- Dar dicas de uso do sistema
- Resolver problemas comuns
- Indicar contatos quando necessário

REGRAS:
- Sempre baseie respostas nas informações do sistema fornecidas
- Use dados específicos quando disponíveis
- Seja concisa (máximo 3 parágrafos)
- Se não souber algo específico, diga "Não tenho essa informação" e ofereça alternativa
- Sempre termine perguntando se precisa de mais ajuda

FORMATO DE RESPOSTA:
- Resposta direta à pergunta
- Informação adicional útil (se relevante)
- Pergunta se precisa de mais ajuda
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt + "\n\nCONTEXTO DO SISTEMA:\n" + contexto_completo},
                    {"role": "user", "content": pergunta_usuario}
                ],
                max_tokens=800,
                temperature=0.7
            )
            
            resposta = response.choices[0].message.content
            
            # Salvar no histórico
            self.conversation_history.append({
                'timestamp': datetime.now().strftime('%H:%M:%S'),
                'usuario': pergunta_usuario,
                'assistente': resposta
            })
            
            return resposta
            
        except Exception as e:
            return f"Desculpe, ocorreu um erro técnico. Tente novamente em alguns segundos. Se persistir, entre em contato com o suporte TI: (11) 4004-3535"

    def _formatar_historico(self):
        """Formata histórico das últimas conversas"""
        if not self.conversation_history:
            return "Primeira conversa."
        
        historico = ""
        for item in self.conversation_history[-3:]:  # Últimas 3 interações
            historico += f"[{item['timestamp']}] Usuário: {item['usuario']}\n"
            historico += f"Assistente: {item['assistente']}\n\n"
        
        return historico

    def atualizar_dados_tela(self, novos_dados):
        """Atualiza dados da tela atual (para quando usuário muda filtros, página, etc.)"""
        self.current_data.update(novos_dados)
        print("📊 Dados da tela atualizados!")

    def start_chat(self):
        """Inicia chat com o usuário final"""
        print("🏦 Assistente Virtual Santander BI")
        print("Olá! Sou sua assistente virtual. Posso te ajudar a navegar pelo dashboard e entender os dados.")
        print("Digite 'sair' para encerrar a conversa.")
        print("-" * 60)
        
        # Apresentação inicial
        print("🤖 Assistente: Olá! Vejo que você está no Dashboard Principal do Santander BI.")
        print(f"    Atualmente mostrando dados de '{self.current_data['filtros_ativos']['periodo']}' para '{self.current_data['filtros_ativos']['regiao']}'.")
        print("    Como posso te ajudar hoje? 😊")
        
        while True:
            user_input = input("\n👤 Você: ").strip()
            
            if user_input.lower() in ['sair', 'tchau', 'bye']:
                print("\n🤖 Assistente: Foi um prazer te ajudar! Até logo! 👋")
                break
            
            elif user_input:
                print("🧠 Processando...")
                resposta = self.perguntar_ia(user_input)
                print(f"\n🤖 Assistente: {resposta}")

    def resposta_rapida(self, pergunta):
        """Para usar em outros sistemas - retorna resposta direta"""
        return self.perguntar_ia(pergunta)


# EXEMPLO DE COMO ATUALIZAR DADOS QUANDO USUÁRIO MUDA ALGO NA TELA
def exemplo_atualizacao_dados():
    """Exemplo de como atualizar quando usuário interage com o dashboard"""
    
    chat = ChatAgentSimples()
    
    # Simular usuário mudando filtros
    print("📊 Simulando mudança de filtros...")
    novos_dados = {
        "tela_atual": "Dashboard de Vendas",
        "filtros_ativos": {
            "periodo": "Hoje",
            "regiao": "Sudeste", 
            "produto": "Cartão de Crédito"
        },
        "metricas_visiveis": {
            "vendas_hoje": "R$ 125k",
            "meta_diaria": "R$ 100k",
            "performance": "125%",
            "transacoes": "1.247"
        }
    }
    
    chat.atualizar_dados_tela(novos_dados)
    
    # Agora a IA sabe dos novos dados
    resposta = chat.resposta_rapida("Como estão as vendas de cartão hoje no Sudeste?")
    print("Resposta:", resposta)


if __name__ == "__main__":
    # Para usar como chat interativo
    chat = ChatAgentSimples()
    chat.start_chat()
    
    # Para testar atualização de dados (descomente a linha abaixo)
    # exemplo_atualizacao_dados()