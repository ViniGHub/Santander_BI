import pandas as pd
import sqlite3

def xlsx_to_sqlite(arquivo_excel, banco_sqlite):
    """
    Transfere dados específicos de um arquivo Excel para SQLite
    
    Args:
        arquivo_excel (str): Caminho para o arquivo .xlsx
        banco_sqlite (str): Caminho para o banco SQLite
    """
    
    try:
        # Conectar ao banco SQLite
        conn = sqlite3.connect(banco_sqlite)
        print(f"Conectado ao banco: {banco_sqlite}")
        
        # Ler a aba "Base 1 - ID"
        print("Lendo aba 'Base 1 - ID'...")
        df_ids = pd.read_excel(arquivo_excel, sheet_name='Base 1 - ID')
        print(f"Registros encontrados na Base 1: {len(df_ids)}")
        
        # Ler a aba "Base 2 - Transações"
        print("Lendo aba 'Base 2 - Transações'...")
        df_transacoes = pd.read_excel(arquivo_excel, sheet_name='Base 2 - Transações')
        print(f"Registros encontrados na Base 2: {len(df_transacoes)}")
        
        # Limpar nomes das colunas (remover espaços extras, etc.)
        df_ids.columns = df_ids.columns.str.strip()
        df_transacoes.columns = df_transacoes.columns.str.strip()
        
        # Inserir dados na tabela ID
        print("Inserindo dados na tabela ID...")
        df_ids.to_sql('ID', conn, if_exists='replace', index=False)
        print(f"✓ {len(df_ids)} registros inseridos na tabela ID")
        
        # Inserir dados na tabela TRANSACOES
        print("Inserindo dados na tabela TRANSACOES...")
        df_transacoes.to_sql('TRANSACOES', conn, if_exists='replace', index=False)
        print(f"✓ {len(df_transacoes)} registros inseridos na tabela TRANSACOES")
        
        # Verificar as tabelas criadas
        print("\n=== Verificação das tabelas ===")
        cursor = conn.cursor()
        
        # Verificar tabela ID
        cursor.execute("SELECT COUNT(*) FROM ID")
        count_id = cursor.fetchone()[0]
        print(f"Total de registros na tabela ID: {count_id}")
        
        # Verificar tabela TRANSACOES
        cursor.execute("SELECT COUNT(*) FROM TRANSACOES")
        count_transacoes = cursor.fetchone()[0]
        print(f"Total de registros na tabela TRANSACOES: {count_transacoes}")
        
        # Mostrar estrutura das tabelas
        print("\n=== Estrutura da tabela ID ===")
        cursor.execute("PRAGMA table_info(ID)")
        colunas_id = cursor.fetchall()
        for coluna in colunas_id:
            print(f"- {coluna[1]} ({coluna[2]})")
        
        print("\n=== Estrutura da tabela TRANSACOES ===")
        cursor.execute("PRAGMA table_info(TRANSACOES)")
        colunas_transacoes = cursor.fetchall()
        for coluna in colunas_transacoes:
            print(f"- {coluna[1]} ({coluna[2]})")
            
        conn.close()
        print("\n✅ Processo concluído com sucesso!")
        
    except FileNotFoundError:
        print(f"❌ Erro: Arquivo {arquivo_excel} não encontrado")
    except ValueError as e:
        if "Worksheet" in str(e):
            print(f"❌ Erro: Uma das abas não foi encontrada. Verifique os nomes: {e}")
        else:
            print(f"❌ Erro de valor: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

# Versão com mais opções de configuração
def xlsx_to_sqlite_avancado(arquivo_excel, banco_sqlite, 
                           substituir_tabelas=True, 
                           mostrar_preview=True):
    """
    Versão avançada com mais opções
    
    Args:
        arquivo_excel (str): Caminho para o arquivo .xlsx
        banco_sqlite (str): Caminho para o banco SQLite
        substituir_tabelas (bool): Se True usa 'replace', se False usa 'append'
        mostrar_preview (bool): Se deve mostrar preview dos dados
    """
    
    try:
        conn = sqlite3.connect(banco_sqlite)
        
        # Definir comportamento ao inserir dados
        comportamento = 'replace' if substituir_tabelas else 'append'
        
        # Ler as abas específicas
        df_ids = pd.read_excel(arquivo_excel, sheet_name='Base 1 - ID')
        df_transacoes = pd.read_excel(arquivo_excel, sheet_name='Base 2 - Transações')
        
        # Limpar dados (opcional)
        df_ids = df_ids.dropna(how='all')  # Remove linhas completamente vazias
        df_transacoes = df_transacoes.dropna(how='all')
        
        # Preview dos dados
        if mostrar_preview:
            print("=== PREVIEW - Base 1 ID ===")
            print(df_ids.head())
            print(f"\nInfo da Base 1: {df_ids.shape[0]} linhas, {df_ids.shape[1]} colunas")
            
            print("\n=== PREVIEW - Base 2 Transações ===")
            print(df_transacoes.head())
            print(f"\nInfo da Base 2: {df_transacoes.shape[0]} linhas, {df_transacoes.shape[1]} colunas")
        
        # Inserir no banco
        df_ids.to_sql('ID', conn, if_exists=comportamento, index=False)
        df_transacoes.to_sql('TRANSACOES', conn, if_exists=comportamento, index=False)
        
        conn.close()
        print(f"\n✅ Dados inseridos com sucesso! (Modo: {comportamento})")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

# Exemplo de uso
if __name__ == "__main__":
    # Uso básico
    xlsx_to_sqlite('Challenge FIAP - Bases.xlsx', 'banco.db')
    
    # Ou uso avançado
    # xlsx_to_sqlite_avancado('Challenge FIAP - Bases.xlsx', 'banco.db', 
    #                        substituir_tabelas=False, 
    #                        mostrar_preview=True)