import openai
import json
from bs4 import BeautifulSoup
import requests
import os
from datetime import datetime

class ChatAgent:
    def __init__(self):
        # SUA API KEY
        self.api_key = "Coloque a chave"
        openai.api_key = self.api_key
        
        self.conversation_history = []
        self.html_context = ""
        self.current_data = {}
        
    def read_html_file(self, file_path):
        """Lê arquivo HTML local"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                html_content = file.read()
            
            # Parse do HTML
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extrair texto visível
            text_content = soup.get_text()
            
            # Extrair informações estruturadas
            self.html_context = f"""
HTML ANALISADO:
Título: {soup.title.string if soup.title else 'Sem título'}
Texto principal: {text_content[:1000]}...

Elementos encontrados:
- Formulários: {len(soup.find_all('form'))}
- Tabelas: {len(soup.find_all('table'))}
- Imagens: {len(soup.find_all('img'))}
- Links: {len(soup.find_all('a'))}
"""
            
            print("✅ HTML carregado com sucesso!")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao ler HTML: {e}")
            return False
    
    def read_html_url(self, url):
        """Lê HTML de uma URL"""
        try:
            response = requests.get(url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            text_content = soup.get_text()
            
            self.html_context = f"""
PÁGINA WEB ANALISADA: {url}
Título: {soup.title.string if soup.title else 'Sem título'}
Conteúdo: {text_content[:1000]}...
"""
            
            print("✅ Página web carregada!")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao carregar URL: {e}")
            return False
    
    def set_data_context(self, data):
        """Define dados para contexto da conversa"""
        self.current_data = data
        print("✅ Dados carregados para contexto!")
    
    def ask_chatgpt(self, user_message):
        """Faz pergunta para ChatGPT com contexto"""
        
        # Criar contexto completo
        context = f"""
CONTEXTO HTML:
{self.html_context}

DADOS ATUAIS:
{json.dumps(self.current_data, indent=2, ensure_ascii=False)}

HISTÓRICO DA CONVERSA:
{self._format_history()}
"""
        
        system_prompt = """Você é um assistente inteligente especializado em análise de dados e páginas web.

Você tem acesso a:
1. Conteúdo HTML de páginas/arquivos
2. Dados estruturados (JSON, APIs, etc.)
3. Histórico completo da conversa

Suas responsabilidades:
- Responder sobre o conteúdo HTML analisado
- Explicar dados e métricas de forma clara
- Manter contexto da conversa
- Dar insights práticos e actionáveis
- Ser amigável e profissional

SEMPRE baseie suas respostas no contexto fornecido."""

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Contexto:\n{context}\n\nPergunta: {user_message}"}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            answer = response.choices[0].message.content
            
            # Salvar no histórico
            self.conversation_history.append({
                'timestamp': datetime.now().strftime('%H:%M:%S'),
                'user': user_message,
                'assistant': answer
            })
            
            return answer
            
        except Exception as e:
            return f"Erro ao processar pergunta: {str(e)}"
    
    def _format_history(self):
        """Formata histórico para contexto"""
        if not self.conversation_history:
            return "Nenhuma conversa anterior."
        
        history = ""
        for item in self.conversation_history[-5:]:  # Últimas 5 interações
            history += f"[{item['timestamp']}]\n"
            history += f"Usuário: {item['user']}\n"
            history += f"Assistente: {item['assistant']}\n\n"
        
        return history
    
    def start_chat(self):
        """Inicia conversa interativa"""
        print("🤖 Chat Agente Iniciado!")
        print("Digite 'sair' para encerrar")
        print("Digite 'html <caminho>' para carregar arquivo HTML")
        print("Digite 'url <link>' para carregar página web")
        print("Digite 'dados <json>' para definir dados")
        print("-" * 50)
        
        while True:
            user_input = input("\n👤 Você: ").strip()
            
            if user_input.lower() == 'sair':
                print("👋 Até logo!")
                break
            
            elif user_input.startswith('html '):
                file_path = user_input[5:].strip()
                self.read_html_file(file_path)
                continue
            
            elif user_input.startswith('url '):
                url = user_input[4:].strip()
                self.read_html_url(url)
                continue
            
            elif user_input.startswith('dados '):
                try:
                    data_str = user_input[6:].strip()
                    data = json.loads(data_str)
                    self.set_data_context(data)
                except:
                    print("❌ Erro: JSON inválido")
                continue
            
            elif user_input:
                print("🧠 Pensando...")
                response = self.ask_chatgpt(user_input)
                print(f"\n🤖 Assistente: {response}")
            
    def save_conversation(self, filename="conversa.json"):
        """Salva conversa em arquivo"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.conversation_history, f, indent=2, ensure_ascii=False)
        print(f"💾 Conversa salva em {filename}")


# EXEMPLO DE USO DIRETO
def exemplo_uso():
    """Exemplo de como usar sem interface"""
    agent = ChatAgent()
    
    # Exemplo 1: Carregar HTML
    agent.read_html_file("index.html")  # Coloque o caminho do seu arquivo
    
    # Exemplo 2: Definir dados
    dados_exemplo = {
        "vendas": 150000,
        "meta": 120000,
        "crescimento": "25%",
        "top_produtos": ["Notebook", "Mouse", "Teclado"]
    }
    agent.set_data_context(dados_exemplo)
    
    # Exemplo 3: Fazer perguntas
    resposta = agent.ask_chatgpt("O que você pode me dizer sobre esta página?")
    print("Resposta:", resposta)
    
    resposta = agent.ask_chatgpt("Como estão as vendas?")
    print("Resposta:", resposta)


if __name__ == "__main__":
    # Escolha como usar:
    
    # Opção 1: Chat interativo
    agent = ChatAgent()
    agent.start_chat()
    
    # Opção 2: Uso direto (descomente para testar)
    # exemplo_uso()´´