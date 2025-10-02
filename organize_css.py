import os
import re
import sys

# Define a estrutura de arquivos e seus marcadores exatos.
# O script buscará por "/* START: NomeDaSecao */" e "/* END: NomeDaSecao */"
# Tupla: (caminho_do_arquivo, NOME_DA_SECAO)
CSS_STRUCTURE = [
    # --- Base ---
    ("css/base/_variables.css", "Variables"),
    ("css/base/_base.css", "Base"),
    ("css/base/_typography.css", "Typography"),
    
    # --- Themes ---
    ("css/themes/_dark-mode.css", "DarkMode"),

    # --- Layout ---
    ("css/layout/_container.css", "Container"),
    ("css/layout/_layout.css", "Layout"), # Renomeado de Header para Layout geral
    ("css/layout/_matrix.css", "Matrix"),

    # --- Components ---
    ("css/components/_buttons.css", "Buttons"),
    ("css/components/_cards.css", "Card"),
    ("css/components/_forms.css", "Forms"),
    ("css/components/_modal.css", "Modal"),
    ("css/components/_sheet.css", "SheetMenu"),
    ("css/components/_task-card.css", "TaskCard"),
    ("css/components/_task-list.css", "TaskList"),
    ("css/components/_add-task-button.css", "AddTaskButton"),
    ("css/components/_task-input.css", "TaskInput"),
    ("css/components/_subtask-form.css", "SubtaskForm"),
    ("css/components/_archive-modal.css", "ArchiveModal"),
    ("css/components/_navigation.css", "MainNavigation"),
    ("css/components/_toast.css", "Toast"),
    ("css/components/_planned-task-card.css", "PlannedTaskCard"),
    ("css/components/_project-card.css", "ProjectCard"),
    ("css/components/_badges.css", "ProjectBadge"), # Agrupando badges

    # --- Utils ---
    ("css/utils/_animations.css", "Animations"),
    ("css/utils/_helpers.css", "Utils"),
    ("css/utils/_accessibility.css", "Accessibility"),
    ("css/utils/_loading.css", "LoadingState"),
    
    # --- Media Queries ---
    ("css/responsive/_tablet.css", "MediaTablet"),
    ("css/responsive/_desktop.css", "MediaDesktop"),
    ("css/responsive/_small-screen.css", "MediaSmallScreen"),
    ("css/responsive/_touch.css", "MediaTouch"),
    ("css/responsive/_reduced-motion.css", "MediaReducedMotion"),
]

# Ordem de importação para o main.css, garantindo a cascata correta
MAIN_CSS_IMPORTS = [
    "base/_variables.css",
    "base/_base.css",
    "base/_typography.css",
    "themes/_dark-mode.css",
    "layout/_container.css",
    "layout/_layout.css",
    "layout/_matrix.css",
    "components/_buttons.css",
    "components/_cards.css",
    "components/_forms.css",
    "components/_modal.css",
    "components/_sheet.css",
    "components/_toast.css",
    "components/_task-list.css",
    "components/_task-card.css",
    "components/_add-task-button.css",
    "components/_task-input.css",
    "components/_subtask-form.css",
    "components/_planned-task-card.css",
    "components/_project-card.css",
    "components/_archive-modal.css",
    "components/_navigation.css",
    "components/_badges.css",
    "utils/_animations.css",
    "utils/_helpers.css",
    "utils/_accessibility.css",
    "utils/_loading.css",
    "responsive/_tablet.css",
    "responsive/_desktop.css",
    "responsive/_small-screen.css",
    "responsive/_touch.css",
    "responsive/_reduced-motion.css",
]


def extract_css_block(content, section_name):
    """Extrai um bloco de texto do CSS entre marcadores START e END."""
    # Constrói a expressão regular para encontrar o bloco exato
    start_marker = f"/* START: {section_name} */"
    end_marker = f"/* END: {section_name} */"
    
    # Escapa caracteres especiais para a regex
    pattern = re.escape(start_marker) + r"(.*?)" + re.escape(end_marker)
    
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        # Retorna o conteúdo encontrado entre os marcadores, removendo espaços extras
        return match.group(1).strip()
    else:
        return None

def pre_run_check(content, structure):
    """Verifica se todos os marcadores definidos existem no arquivo antes de processar."""
    print("--- Iniciando verificação pré-execução ---")
    all_markers_ok = True
    for _, section_name in structure:
        start_marker = f"/* START: {section_name} */"
        end_marker = f"/* END: {section_name} */"
        if start_marker not in content:
            print(f"[FALHA] Marcador de início não encontrado: {start_marker}")
            all_markers_ok = False
        if end_marker not in content:
            print(f"[FALHA] Marcador de fim não encontrado: {end_marker}")
            all_markers_ok = False
    
    if all_markers_ok:
        print("[SUCESSO] Todos os marcadores foram encontrados no arquivo 'style.css'.")
    else:
        print("\n[ERRO] Corrija os marcadores ausentes no 'style.css' antes de continuar.")
    
    return all_markers_ok

def main():
    """Função principal para organizar o arquivo CSS."""
    original_css_path = "style.css"
    
    print("==========================================")
    print("=== SCRIPT DE REFATORAÇÃO CSS INICIADO ===")
    print("==========================================")

    # 1. Ler o arquivo original
    try:
        with open(original_css_path, "r", encoding="utf-8") as f:
            original_content = f.read()
        print(f"\n[PASSO 1] Arquivo '{original_css_path}' lido com sucesso.")
    except FileNotFoundError:
        print(f"\n[ERRO FATAL] O arquivo '{original_css_path}' não foi encontrado.")
        sys.exit(1) # Encerra o script se o arquivo principal não existir

    # 2. Verificação pré-execução
    if not pre_run_check(original_content, CSS_STRUCTURE):
        sys.exit(1) # Encerra se houver problemas com marcadores

    # 3. Criar a estrutura de pastas
    print("\n[PASSO 2] Verificando e criando a nova estrutura de pastas...")
    all_dirs = set(os.path.dirname(path) for path, _ in CSS_STRUCTURE)
    for dirname in all_dirs:
        if not os.path.exists(dirname):
            os.makedirs(dirname)
            print(f"  - Diretório criado: {dirname}")
    print("  - Estrutura de pastas OK.")

    # 4. Extrair e escrever os arquivos
    print("\n[PASSO 3] Extraindo e escrevendo os novos arquivos CSS...")
    success_count = 0
    failure_count = 0
    for path, section_name in CSS_STRUCTURE:
        block_content = extract_css_block(original_content, section_name)
        
        if block_content:
            try:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(block_content)
                line_count = len(block_content.splitlines())
                print(f"  [SUCESSO] '{path}' criado com {line_count} linhas.")
                success_count += 1
            except IOError as e:
                print(f"  [ERRO] Não foi possível escrever o arquivo '{path}': {e}")
                failure_count += 1
        else:
            print(f"  [FALHA] Nenhum conteúdo encontrado para a seção '{section_name}'.")
            failure_count += 1
            
    print("\n--- Resumo da Extração ---")
    print(f"Arquivos criados com sucesso: {success_count}")
    print(f"Falhas na extração: {failure_count}")

    if failure_count > 0:
        print("\n[ATENÇÃO] Algumas seções não puderam ser extraídas. Verifique os logs acima.")
        sys.exit(1)

    # 5. Gerar main.css
    print("\n[PASSO 4] Gerando o arquivo 'main.css'...")
    main_css_path = "css/main.css"
    try:
        with open(main_css_path, "w", encoding="utf-8") as f:
            f.write("/* Arquivo principal - Importa todos os módulos CSS na ordem correta */\n\n")
            current_category = ""
            for import_path in MAIN_CSS_IMPORTS:
                category = import_path.split('/')[0]
                if category != current_category:
                    if current_category: f.write("\n")
                    f.write(f"/* --- {category.capitalize()} --- */\n")
                    current_category = category
                f.write(f'@import url("{import_path}");\n')
        print(f"  - Sucesso: '{main_css_path}' criado.")
    except IOError as e:
        print(f"  - Erro ao criar '{main_css_path}': {e}")
        sys.exit(1)

    # 6. Verificação final
    print("\n[PASSO 5] Verificando se todos os arquivos foram criados...")
    final_check_ok = True
    all_generated_files = [path for path, _ in CSS_STRUCTURE] + [main_css_path]
    for f_path in all_generated_files:
        if not os.path.exists(f_path):
            print(f"  [FALHA] Arquivo esperado não encontrado: {f_path}")
            final_check_ok = False
    
    if final_check_ok:
        print("  - [SUCESSO] Todos os arquivos foram gerados corretamente.")

    print("\n==========================================")
    print("===      PROCESSO CONCLUÍDO!         ===")
    print("==========================================")
    print("\nPróximos passos manuais:")
    print("1. No seu arquivo 'index.html', troque a linha:")
    print('   <link rel="stylesheet" href="style.css">')
    print("   POR:")
    print('   <link rel="stylesheet" href="css/main.css">')
    print("2. Teste a aplicação no navegador.")
    print("3. Se tudo estiver funcionando, delete o 'style.css' original.")

if __name__ == "__main__":
    main()  
