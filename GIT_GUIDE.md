# 🚀 Guia de Comandos Git - Sem Depender de Créditos

Este guia mostra como fazer commits, push e pull diretamente via terminal, sem gastar créditos da IA.

## 📋 Comandos Básicos

### 1. Verificar Status do Repositório
```bash
cd /home/ubuntu/apr-app
git status
```

### 2. Adicionar Arquivos ao Staging
```bash
# Adicionar arquivo específico
git add caminho/do/arquivo.ts

# Adicionar todos os arquivos modificados
git add .

# Adicionar todos os arquivos de uma pasta
git add client/src/pages/
```

### 3. Fazer Commit
```bash
# Commit simples
git commit -m "Mensagem descritiva do commit"

# Commit com descrição detalhada
git commit -m "Título do commit

- Detalhe 1
- Detalhe 2
- Detalhe 3"
```

### 4. Fazer Push para GitHub
```bash
# Push para branch main
git push github main

# Forçar push (use com cuidado!)
git push github main --force
```

### 5. Fazer Pull do GitHub
```bash
# Pull da branch main
git pull github main

# Pull com rebase
git pull github main --rebase
```

### 6. Ver Histórico de Commits
```bash
# Ver últimos 10 commits
git log --oneline -10

# Ver histórico completo
git log

# Ver diferenças do último commit
git show
```

### 7. Ver Diferenças Antes de Commitar
```bash
# Ver todas as mudanças não commitadas
git diff

# Ver mudanças de arquivo específico
git diff caminho/do/arquivo.ts

# Ver mudanças já adicionadas ao staging
git diff --staged
```

## 🔄 Fluxo de Trabalho Típico

```bash
# 1. Verificar status
git status

# 2. Adicionar arquivos modificados
git add .

# 3. Fazer commit
git commit -m "feat: Adiciona nova funcionalidade X"

# 4. Fazer push
git push github main
```

## 📥 Sincronizar com GitHub

```bash
# 1. Fazer fetch para ver atualizações
git fetch github

# 2. Ver diferenças entre local e remoto
git log HEAD..github/main --oneline

# 3. Fazer pull para trazer atualizações
git pull github main

# 4. Resolver conflitos se houver
# (editar arquivos manualmente)

# 5. Adicionar arquivos resolvidos
git add .

# 6. Finalizar merge
git commit -m "Merge remote changes"

# 7. Fazer push
git push github main
```

## 🎯 Convenções de Mensagens de Commit

Use prefixos para organizar commits:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação, espaços
- `refactor:` - Refatoração de código
- `test:` - Adicionar testes
- `chore:` - Manutenção, build

**Exemplos:**
```bash
git commit -m "feat: Adiciona questionário interativo na criação de APR"
git commit -m "fix: Corrige indentação no NewApr.tsx"
git commit -m "docs: Atualiza README com instruções de instalação"
```

## 🔧 Comandos Úteis

### Desfazer Mudanças
```bash
# Desfazer mudanças não commitadas em arquivo
git restore caminho/do/arquivo.ts

# Remover arquivo do staging (manter mudanças)
git restore --staged caminho/do/arquivo.ts

# Desfazer último commit (manter mudanças)
git reset --soft HEAD~1

# Desfazer último commit (descartar mudanças)
git reset --hard HEAD~1
```

### Ver Branches
```bash
# Listar branches locais
git branch

# Listar branches remotas
git branch -r

# Criar nova branch
git checkout -b nome-da-branch

# Mudar de branch
git checkout nome-da-branch
```

### Limpar Arquivos Não Rastreados
```bash
# Ver o que seria removido
git clean -n

# Remover arquivos não rastreados
git clean -f

# Remover arquivos e diretórios
git clean -fd
```

## 🚨 Dicas Importantes

1. **Sempre faça `git status` antes de commit** para ver o que será commitado
2. **Faça commits pequenos e frequentes** em vez de grandes commits
3. **Escreva mensagens descritivas** que expliquem o "porquê" da mudança
4. **Faça pull antes de push** para evitar conflitos
5. **Nunca force push** em branch compartilhada sem necessidade
6. **Use `.gitignore`** para não commitar arquivos desnecessários

## 📍 Atalhos Úteis

```bash
# Ver status resumido
git status -s

# Adicionar e commitar em um comando
git commit -am "Mensagem"

# Ver log em uma linha
git log --oneline --graph --all

# Ver quem modificou cada linha
git blame caminho/do/arquivo.ts
```

## 🔗 Repositório Atual

- **URL:** https://github.com/ManoFardo-PR/APRapp
- **Remote:** github
- **Branch:** main

---

**💡 Dica:** Você pode executar todos esses comandos diretamente no terminal do sandbox sem gastar créditos da IA!
