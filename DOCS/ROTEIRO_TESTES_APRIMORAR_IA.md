# Roteiro de Testes: Fluxo "Aprimorar com IA"

**Versão:** 1.0  
**Data:** 01/01/2026  
**Autor:** Manus AI  
**Sistema:** APRFix - Análise Preliminar de Riscos

---

## 1. Visão Geral

Este documento apresenta o roteiro completo de testes para validar o novo fluxo de aprimoramento de descrições de APR com Inteligência Artificial. O fluxo integra um questionário estruturado de Normas Regulamentadoras em quatro etapas, seguido de um chat contextual, gerando uma descrição completa e enriquecida da atividade.

### 1.1. Objetivo dos Testes

O objetivo principal é garantir que o fluxo "Aprimorar com IA" funcione corretamente em todos os cenários possíveis, desde a entrada de dados até a geração da descrição final, validando a qualidade das respostas da IA, a integridade dos dados salvos no banco e a experiência do usuário durante todo o processo.

### 1.2. Escopo

Os testes cobrem as seguintes áreas do sistema:

| Área | Descrição | Prioridade |
|------|-----------|------------|
| **Interface do Usuário** | Validação de botões, dialogs, formulários e navegação entre etapas | Alta |
| **Validações de Entrada** | Verificação de campos obrigatórios, limites de caracteres e formatos | Alta |
| **Integração Backend** | Testes de procedures tRPC, funções de IA e salvamento no banco | Crítica |
| **Qualidade da IA** | Avaliação da relevância, completude e precisão das descrições geradas | Alta |
| **Performance** | Medição de tempos de resposta e comportamento sob carga | Média |
| **Compatibilidade** | Testes em diferentes navegadores e dispositivos | Média |

---

## 2. Pré-requisitos

Antes de iniciar os testes, certifique-se de que os seguintes requisitos estão atendidos:

### 2.1. Ambiente de Testes

O ambiente de testes deve estar configurado com as seguintes características: servidor de desenvolvimento rodando na porta 3000, banco de dados MySQL/TiDB com schema atualizado contendo as tabelas `aprs`, `apr_images`, `apr_ai_interviews`, `apr_risk_analysis` e `apr_epi_analysis`, e API de LLM configurada com credenciais válidas. Além disso, é necessário ter pelo menos uma empresa cadastrada no sistema e um usuário com role `company_admin` ou `requester` para realizar os testes.

### 2.2. Dados de Teste

Para executar os testes de forma abrangente, prepare os seguintes dados de teste:

| Tipo de Dado | Descrição | Exemplo |
|--------------|-----------|---------|
| **APR Simples** | Descrição básica com 50-100 caracteres, sem imagens | "Manutenção preventiva em bomba centrífuga do setor de utilidades" |
| **APR Completa** | Descrição detalhada com 200+ caracteres, 3-5 imagens | "Instalação de sistema de ar condicionado split 24.000 BTUs no escritório administrativo, incluindo perfuração de parede, passagem de tubulação frigorífica, instalação de suporte metálico e conexões elétricas" |
| **APR com Imagens** | Descrição básica com 2-3 imagens de boa qualidade | Descrição + fotos do local, equipamentos e ferramentas |
| **APR sem Imagens** | Descrição básica sem imagens anexadas | "Troca de lâmpadas LED em corredor administrativo" |
| **Descrição Curta** | Texto com menos de 50 caracteres (deve falhar validação) | "Manutenção" |
| **Descrição Longa** | Texto com mais de 500 caracteres | Descrição detalhada de atividade complexa |

### 2.3. Ferramentas Necessárias

Para executar e documentar os testes, utilize as seguintes ferramentas: navegador web moderno (Chrome, Firefox, Edge ou Safari), ferramentas de desenvolvedor do navegador para inspecionar requisições e respostas, cronômetro ou ferramenta de medição de performance, e planilha ou documento para registrar resultados dos testes.

---

## 3. Casos de Teste

### 3.1. CT01 - Validação de Acesso ao Botão "Aprimorar com IA"

**Objetivo:** Verificar se o botão "Aprimorar com IA" é exibido corretamente na página de edição de APR.

**Pré-condições:**
- Usuário autenticado com role `company_admin` ou `requester`
- APR criada e salva no sistema
- Navegação para a página `/aprs/:id/edit`

**Passos:**

1. Acesse o sistema com credenciais válidas
2. Navegue até a lista de APRs (`/aprs`)
3. Clique no botão "Editar" de uma APR existente
4. Localize a seção de botões de ação no final do formulário
5. Verifique a presença do botão "Aprimorar com IA"

**Resultado Esperado:**

O botão "Aprimorar com IA" deve estar visível entre os botões "Cancelar" e "Salvar Alterações". O botão deve ter design com gradiente roxo/azul, ícone de estrelas (Sparkles) e texto "Aprimorar com IA". Se a descrição da atividade tiver menos de 50 caracteres, o botão deve estar desabilitado (opacidade reduzida, cursor not-allowed).

**Critérios de Aceitação:**
- Botão visível na posição correta
- Design conforme especificação (gradiente roxo/azul)
- Ícone Sparkles presente
- Estado desabilitado quando descrição < 50 caracteres

---

### 3.2. CT02 - Validação de Descrição Mínima

**Objetivo:** Verificar se o sistema valida corretamente descrições com menos de 50 caracteres.

**Pré-condições:**
- Usuário na página de edição de APR
- Campo "Descrição da Atividade" preenchido com menos de 50 caracteres

**Passos:**

1. No campo "Descrição da Atividade", digite um texto curto (exemplo: "Manutenção")
2. Observe o estado do botão "Aprimorar com IA"
3. Tente clicar no botão
4. Verifique se aparece mensagem de erro

**Resultado Esperado:**

O botão "Aprimorar com IA" deve permanecer desabilitado enquanto a descrição tiver menos de 50 caracteres. Ao tentar clicar no botão desabilitado, nenhuma ação deve ocorrer. Se o botão for clicado (caso esteja habilitado por algum bug), deve aparecer um toast de erro com a mensagem: "Adicione uma descrição da atividade com pelo menos 50 caracteres antes de aprimorar com IA".

**Critérios de Aceitação:**
- Botão desabilitado com descrição < 50 caracteres
- Mensagem de erro clara e objetiva
- Nenhum dialog aberto ao clicar

---

### 3.3. CT03 - Abertura do Dialog de Aprimoramento

**Objetivo:** Verificar se o dialog de aprimoramento abre corretamente ao clicar no botão.

**Pré-condições:**
- Usuário na página de edição de APR
- Campo "Descrição da Atividade" preenchido com pelo menos 50 caracteres
- Pelo menos 1 imagem anexada à APR (recomendado)

**Passos:**

1. Preencha o campo "Descrição da Atividade" com texto de pelo menos 50 caracteres
2. Clique no botão "Aprimorar com IA"
3. Aguarde o carregamento (botão mostra "Preparando...")
4. Observe a abertura do dialog

**Resultado Esperado:**

Ao clicar no botão, o texto deve mudar para "Preparando..." e um indicador de loading deve aparecer. Após alguns segundos (geralmente 3-10 segundos), um dialog modal deve abrir ocupando a maior parte da tela. O dialog deve exibir o título "Análise Contextual com IA" e o subtítulo "Responda às perguntas para que a IA possa entender melhor a atividade e gerar uma análise de riscos mais precisa". A barra de progresso deve mostrar "Etapa 1 de 5" e o título da etapa deve ser "EPIs e Proteção Individual (NR-6)". As quatro perguntas da Etapa 1 devem estar visíveis com campos de texto (Textarea) vazios.

**Critérios de Aceitação:**
- Dialog abre sem erros
- Título e subtítulo corretos
- Barra de progresso mostra "Etapa 1 de 5"
- 4 perguntas da Etapa 1 visíveis
- Botão "Próxima Etapa" desabilitado (campos vazios)

---

### 3.4. CT04 - Navegação pela Etapa 1 (EPIs - NR-6)

**Objetivo:** Validar o preenchimento e navegação da Etapa 1 do questionário de NRs.

**Pré-condições:**
- Dialog de aprimoramento aberto na Etapa 1

**Passos:**

1. Leia as 4 perguntas da Etapa 1:
   - "Quais EPIs serão necessários para esta atividade?"
   - "Há necessidade de EPIs especiais (ex: respirador PFF2, luvas específicas)?"
   - "Todos os trabalhadores possuem treinamento para uso correto dos EPIs?"
   - "Os EPIs estão dentro do prazo de validade e com CA (Certificado de Aprovação) válido?"
2. Preencha cada campo de texto com respostas relevantes (mínimo 10 caracteres cada)
3. Observe o estado do botão "Próxima Etapa"
4. Clique em "Próxima Etapa"

**Resultado Esperado:**

Enquanto houver campos vazios, o botão "Próxima Etapa" deve permanecer desabilitado. Após preencher todos os 4 campos com pelo menos 10 caracteres cada, o botão deve ficar habilitado (cor verde, cursor pointer). Ao clicar em "Próxima Etapa", as respostas devem ser salvas automaticamente e o dialog deve avançar para a Etapa 2. A barra de progresso deve atualizar para "Etapa 2 de 5" e o título deve mudar para "Eletricidade e Trabalho em Altura (NR-10/NR-35)".

**Critérios de Aceitação:**
- Todas as 4 perguntas preenchidas
- Botão "Próxima Etapa" habilitado após preenchimento
- Transição suave para Etapa 2
- Barra de progresso atualizada corretamente

---

### 3.5. CT05 - Navegação pela Etapa 2 (Eletricidade/Altura - NR-10/NR-35)

**Objetivo:** Validar o preenchimento e navegação da Etapa 2 do questionário de NRs.

**Pré-condições:**
- Dialog de aprimoramento aberto na Etapa 2

**Passos:**

1. Leia as 5 perguntas da Etapa 2:
   - "A atividade envolve trabalho com eletricidade? Se sim, qual tensão?"
   - "A atividade será realizada em altura superior a 2 metros?"
   - "Há necessidade de desenergização ou bloqueio elétrico?"
   - "Os trabalhadores possuem NR-10 e/ou NR-35 atualizada?"
   - "Há sistema de proteção contra quedas instalado (linha de vida, guarda-corpo)?"
2. Preencha cada campo com respostas relevantes
3. Clique no botão "Anterior" para voltar à Etapa 1
4. Verifique se as respostas da Etapa 1 foram mantidas
5. Clique em "Próxima Etapa" para voltar à Etapa 2
6. Verifique se as respostas da Etapa 2 foram mantidas
7. Clique em "Próxima Etapa" para avançar

**Resultado Esperado:**

O botão "Anterior" deve estar visível e funcional, permitindo voltar à Etapa 1 sem perder dados. As respostas da Etapa 1 devem estar preservadas ao voltar. As respostas da Etapa 2 devem estar preservadas ao retornar da Etapa 1. Ao clicar em "Próxima Etapa", o dialog deve avançar para a Etapa 3 com título "Máquinas e Espaços Confinados (NR-12/NR-33)".

**Critérios de Aceitação:**
- Navegação bidirecional funcional (Anterior/Próxima)
- Respostas preservadas ao navegar entre etapas
- 5 perguntas da Etapa 2 preenchidas
- Transição para Etapa 3 sem erros

---

### 3.6. CT06 - Navegação pela Etapa 3 (Máquinas/Espaços - NR-12/NR-33)

**Objetivo:** Validar o preenchimento e navegação da Etapa 3 do questionário de NRs.

**Pré-condições:**
- Dialog de aprimoramento aberto na Etapa 3

**Passos:**

1. Leia as 5 perguntas da Etapa 3:
   - "A atividade envolve operação ou manutenção de máquinas?"
   - "Será realizada em espaço confinado (tanques, silos, galerias)?"
   - "Há necessidade de permissão de entrada em espaço confinado?"
   - "As máquinas possuem proteções e dispositivos de segurança adequados?"
   - "Há necessidade de vigia e equipe de resgate para espaço confinado?"
2. Preencha todos os campos
3. Clique em "Próxima Etapa"

**Resultado Esperado:**

Todas as 5 perguntas devem ser preenchidas com respostas relevantes. O botão "Próxima Etapa" deve ficar habilitado após preenchimento completo. Ao avançar, o dialog deve mostrar a Etapa 4 com título "Outras NRs Aplicáveis (NR-26, NR-11, NR-34, NR-15)".

**Critérios de Aceitação:**
- 5 perguntas da Etapa 3 preenchidas
- Transição para Etapa 4 sem erros
- Barra de progresso mostra "Etapa 4 de 5"

---

### 3.7. CT07 - Navegação pela Etapa 4 (Outras NRs)

**Objetivo:** Validar o preenchimento e navegação da Etapa 4 do questionário de NRs.

**Pré-condições:**
- Dialog de aprimoramento aberto na Etapa 4

**Passos:**

1. Leia as 5 perguntas da Etapa 4:
   - "A atividade envolve produtos químicos? (NR-26)"
   - "Há movimentação de cargas pesadas? (NR-11)"
   - "Envolve trabalho a quente (solda, corte)? (NR-34)"
   - "Há exposição a ruído ou vibrações? (NR-15)"
   - "Há outras NRs aplicáveis não mencionadas anteriormente?"
2. Preencha todos os campos
3. Clique em "Próxima Etapa"

**Resultado Esperado:**

Todas as 5 perguntas devem ser preenchidas. Ao avançar, o dialog deve mostrar a Etapa 5 (final) com título "Chat Contextual" e interface de chat com a primeira pergunta gerada pela IA baseada nas respostas anteriores e nas imagens da APR.

**Critérios de Aceitação:**
- 5 perguntas da Etapa 4 preenchidas
- Transição para Etapa 5 (chat) sem erros
- Barra de progresso mostra "Etapa 5 de 5"
- Interface de chat visível

---

### 3.8. CT08 - Chat Contextual (Etapa 5)

**Objetivo:** Validar a funcionalidade do chat contextual na Etapa 5.

**Pré-condições:**
- Dialog de aprimoramento aberto na Etapa 5
- Todas as 4 etapas anteriores de NRs preenchidas

**Passos:**

1. Observe a primeira pergunta gerada pela IA no chat
2. Digite uma resposta detalhada no campo de texto (mínimo 20 caracteres)
3. Pressione Enter ou clique no botão de enviar
4. Aguarde a próxima pergunta da IA
5. Repita os passos 2-4 até responder todas as perguntas (5-7 perguntas no total)
6. Observe o botão final "Gerar Descrição Completa"
7. Clique no botão

**Resultado Esperado:**

A primeira pergunta da IA deve ser contextual e relevante, baseada nas respostas das etapas anteriores e nas imagens anexadas. O campo de texto deve aceitar Enter para enviar e Shift+Enter para nova linha. Cada resposta enviada deve aparecer como mensagem do usuário (alinhada à direita, fundo azul). A próxima pergunta da IA deve aparecer após alguns segundos (2-5 segundos) como mensagem da IA (alinhada à esquerda, fundo cinza). O chat deve ter scroll automático para a última mensagem. Após responder todas as perguntas (5-7 no total), o botão "Gerar Descrição Completa" deve aparecer no lugar do campo de texto. Ao clicar no botão, deve aparecer um indicador de loading com texto "Gerando descrição enriquecida...".

**Critérios de Aceitação:**
- 5-7 perguntas contextuais respondidas
- Interface de chat funcional (Enter, scroll automático)
- Botão "Gerar Descrição Completa" visível após última resposta
- Loading exibido ao processar

---

### 3.9. CT09 - Geração da Descrição Enriquecida

**Objetivo:** Validar a geração e qualidade da descrição enriquecida pela IA.

**Pré-condições:**
- Chat contextual completo (5-7 perguntas respondidas)
- Botão "Gerar Descrição Completa" clicado

**Passos:**

1. Aguarde o processamento da IA (geralmente 10-30 segundos)
2. Observe o fechamento automático do dialog
3. Verifique se aparece toast de sucesso
4. Localize o campo "Descrição da Atividade" no formulário
5. Leia a descrição gerada
6. Conte o número de palavras (deve ser >300)
7. Verifique se a descrição menciona:
   - EPIs citados nas respostas
   - NRs aplicáveis mencionadas
   - Detalhes técnicos fornecidos nas respostas
   - Medidas de segurança descritas
   - Informações visuais das imagens (se houver)

**Resultado Esperado:**

Após 10-30 segundos de processamento, o dialog deve fechar automaticamente. Um toast de sucesso deve aparecer com a mensagem: "Descrição aprimorada com sucesso! Revise e salve as alterações." O campo "Descrição da Atividade" deve estar preenchido com um texto completamente novo, substituindo a descrição inicial. A descrição deve ter no mínimo 300 palavras e estar estruturada em parágrafos corridos (não usar bullet points). O texto deve integrar de forma fluida todas as informações fornecidas nas 24-26 perguntas respondidas (19 NRs + 5-7 chat). A descrição deve citar naturalmente os EPIs necessários, as NRs aplicáveis, os equipamentos e ferramentas mencionados, as medidas de controle e segurança, e os detalhes visuais observados nas imagens. O texto deve ser profissional, técnico e adequado para uso direto no documento de APR.

**Critérios de Aceitação:**
- Descrição gerada com >300 palavras
- Texto estruturado em parágrafos (não bullet points)
- Integração de informações das 4 etapas de NRs
- Integração de respostas do chat contextual
- Menção a EPIs, NRs, equipamentos e medidas de segurança
- Qualidade profissional e técnica do texto
- Toast de sucesso exibido

---

### 3.10. CT10 - Salvamento da APR com Descrição Enriquecida

**Objetivo:** Verificar se a descrição enriquecida é salva corretamente no banco de dados.

**Pré-condições:**
- Descrição enriquecida gerada e exibida no campo
- Usuário ainda na página de edição

**Passos:**

1. Revise a descrição enriquecida no campo "Descrição da Atividade"
2. Clique no botão "Salvar Alterações"
3. Aguarde o toast de confirmação
4. Navegue para a página de detalhes da APR
5. Verifique se a descrição enriquecida está presente
6. Abra o banco de dados e consulte a tabela `aprs`
7. Verifique o campo `activityDescription` da APR editada

**Resultado Esperado:**

Ao clicar em "Salvar Alterações", deve aparecer um toast de sucesso com a mensagem "APR atualizada com sucesso". O sistema deve redirecionar automaticamente para a página de detalhes da APR (`/aprs/:id`). Na página de detalhes, o card "Descrição da Atividade" deve exibir a descrição enriquecida completa. No banco de dados, o campo `activityDescription` da tabela `aprs` deve conter o texto completo da descrição enriquecida (>300 palavras).

**Critérios de Aceitação:**
- APR salva com sucesso
- Descrição enriquecida visível na página de detalhes
- Descrição persistida corretamente no banco de dados
- Redirecionamento automático funcionando

---

### 3.11. CT11 - Validação do Histórico de Interview no Banco

**Objetivo:** Verificar se o histórico completo de perguntas e respostas foi salvo no banco de dados.

**Pré-condições:**
- Fluxo completo de aprimoramento concluído
- APR salva com descrição enriquecida

**Passos:**

1. Acesse o banco de dados
2. Consulte a tabela `apr_ai_interviews`
3. Localize o registro mais recente relacionado à APR testada
4. Verifique os campos:
   - `aprId`: Deve corresponder ao ID da APR
   - `questions`: Deve conter JSON com todas as perguntas (19 NRs + 5-7 chat)
   - `answers`: Deve conter JSON com todas as respostas
   - `stage`: Deve indicar "completed"
   - `createdAt` e `completedAt`: Devem ter timestamps válidos

**Resultado Esperado:**

Deve existir um registro na tabela `apr_ai_interviews` com `aprId` correspondente. O campo `questions` deve conter um array JSON com 24-26 objetos (19 perguntas de NRs + 5-7 perguntas de chat), cada um com os campos `stage`, `order`, `question`. O campo `answers` deve conter um array JSON com 24-26 objetos correspondentes, cada um com `question`, `answer`, `order`. O campo `stage` deve estar marcado como "completed". Os timestamps `createdAt` e `completedAt` devem estar preenchidos e `completedAt` deve ser posterior a `createdAt`.

**Critérios de Aceitação:**
- Registro de interview criado no banco
- 24-26 perguntas salvas no campo `questions`
- 24-26 respostas salvas no campo `answers`
- Stage marcado como "completed"
- Timestamps válidos

---

### 3.12. CT12 - Teste com APR sem Imagens

**Objetivo:** Validar o comportamento do fluxo quando a APR não possui imagens anexadas.

**Pré-condições:**
- APR criada sem imagens anexadas
- Descrição básica preenchida (>50 caracteres)

**Passos:**

1. Acesse a página de edição da APR sem imagens
2. Clique em "Aprimorar com IA"
3. Complete todas as 5 etapas do questionário
4. Observe se as perguntas do chat contextual são adaptadas
5. Verifique a descrição gerada

**Resultado Esperado:**

O fluxo deve funcionar normalmente mesmo sem imagens. As perguntas do chat contextual devem ser geradas baseadas apenas nas respostas das etapas de NRs e na descrição inicial, sem mencionar análise visual. A descrição enriquecida deve ser gerada com sucesso, porém sem menções a detalhes visuais observados em imagens. O texto deve ter >300 palavras e integrar todas as informações fornecidas nas respostas.

**Critérios de Aceitação:**
- Fluxo completo sem erros
- Perguntas de chat adaptadas (sem referência a imagens)
- Descrição gerada com >300 palavras
- Nenhuma menção a análise visual no texto

---

### 3.13. CT13 - Teste de Cancelamento do Dialog

**Objetivo:** Verificar o comportamento ao fechar o dialog antes de concluir o fluxo.

**Pré-condições:**
- Dialog de aprimoramento aberto em qualquer etapa

**Passos:**

1. Preencha parcialmente uma ou mais etapas
2. Clique no botão "X" (fechar) no canto superior direito do dialog
3. Observe se aparece confirmação
4. Confirme o fechamento
5. Verifique o estado do campo "Descrição da Atividade"
6. Clique novamente em "Aprimorar com IA"
7. Verifique se as respostas anteriores foram perdidas

**Resultado Esperado:**

Ao clicar no "X", o dialog deve fechar imediatamente sem confirmação (comportamento padrão). O campo "Descrição da Atividade" deve permanecer com o texto original (não modificado). Ao abrir o dialog novamente, todas as etapas devem estar vazias (respostas anteriores não são salvas até conclusão). O usuário deve começar do zero.

**Critérios de Aceitação:**
- Dialog fecha ao clicar no "X"
- Descrição original preservada
- Respostas não salvas ao cancelar
- Novo dialog inicia vazio

---

### 3.14. CT14 - Teste de Performance

**Objetivo:** Medir os tempos de resposta em cada etapa do fluxo.

**Pré-condições:**
- APR com descrição e 3 imagens
- Cronômetro ou ferramenta de medição

**Passos:**

1. Clique em "Aprimorar com IA" e inicie o cronômetro
2. Registre o tempo até o dialog abrir (T1)
3. Preencha as 4 etapas de NRs e registre o tempo (T2)
4. Registre o tempo de geração de cada pergunta do chat (T3)
5. Clique em "Gerar Descrição Completa" e registre o tempo até conclusão (T4)
6. Calcule o tempo total do fluxo

**Resultado Esperado:**

Os tempos esperados para cada etapa são os seguintes: abertura do dialog e geração de perguntas de NRs e chat (T1) deve ocorrer entre 3 a 10 segundos, preenchimento manual das 4 etapas de NRs (T2) varia de 5 a 15 minutos dependendo do usuário, geração de cada pergunta do chat contextual (T3) deve levar de 2 a 5 segundos por pergunta, e geração da descrição enriquecida final (T4) deve ocorrer entre 10 a 30 segundos. O tempo total do fluxo, excluindo o tempo de preenchimento manual, deve ser inferior a 60 segundos.

**Critérios de Aceitação:**
- T1 < 10 segundos
- T3 < 5 segundos por pergunta
- T4 < 30 segundos
- Tempo total de IA < 60 segundos

---

### 3.15. CT15 - Teste de Compatibilidade de Navegadores

**Objetivo:** Validar o funcionamento do fluxo em diferentes navegadores.

**Pré-condições:**
- Acesso aos navegadores: Chrome, Firefox, Edge, Safari

**Passos:**

1. Execute o fluxo completo no Google Chrome
2. Execute o fluxo completo no Mozilla Firefox
3. Execute o fluxo completo no Microsoft Edge
4. Execute o fluxo completo no Safari (se disponível)
5. Registre qualquer diferença de comportamento

**Resultado Esperado:**

O fluxo deve funcionar de forma idêntica em todos os navegadores testados. O layout do dialog deve ser responsivo e bem formatado em todas as resoluções. Os botões, campos de texto e navegação entre etapas devem funcionar corretamente. A geração de descrição deve produzir resultados consistentes independentemente do navegador.

**Critérios de Aceitação:**
- Funcionalidade completa em Chrome, Firefox e Edge
- Layout responsivo e consistente
- Nenhum erro de JavaScript no console
- Resultados idênticos em todos os navegadores

---

## 4. Cenários de Erro

### 4.1. CE01 - Erro na API de LLM

**Cenário:** A API de LLM retorna erro ou está indisponível.

**Passos para Simular:**
1. Desabilite temporariamente a API de LLM ou use credenciais inválidas
2. Tente clicar em "Aprimorar com IA"

**Comportamento Esperado:**
- Toast de erro deve aparecer com mensagem clara: "Erro ao iniciar aprimoramento com IA. Tente novamente mais tarde."
- Dialog não deve abrir
- Botão deve voltar ao estado normal (não ficar travado em "Preparando...")
- Usuário deve poder tentar novamente

---

### 4.2. CE02 - Timeout na Geração de Perguntas

**Cenário:** A geração de perguntas de NRs ou chat demora mais de 30 segundos.

**Passos para Simular:**
1. Adicione delay artificial na função `generateNRQuestions` ou `generateContextualQuestions`
2. Clique em "Aprimorar com IA"

**Comportamento Esperado:**
- Após 30 segundos, deve aparecer toast de erro: "Tempo limite excedido. Tente novamente."
- Dialog não deve abrir ou deve fechar se já estiver aberto
- Estado do formulário deve ser preservado
- Usuário deve poder tentar novamente

---

### 4.3. CE03 - Erro na Geração da Descrição Final

**Cenário:** A API de LLM falha ao gerar a descrição enriquecida.

**Passos para Simular:**
1. Complete todas as 5 etapas do questionário
2. Force um erro na função `generateEnhancedDescriptionWithNRs`
3. Clique em "Gerar Descrição Completa"

**Comportamento Esperado:**
- Toast de erro deve aparecer: "Erro ao processar respostas. Tente novamente."
- Dialog deve permanecer aberto
- Botão "Gerar Descrição Completa" deve voltar ao estado normal
- Usuário deve poder tentar novamente sem perder as respostas

---

### 4.4. CE04 - Perda de Conexão Durante o Fluxo

**Cenário:** A conexão com a internet é perdida durante o preenchimento.

**Passos para Simular:**
1. Inicie o fluxo e preencha 2-3 etapas
2. Desabilite a conexão de rede
3. Tente avançar para a próxima etapa

**Comportamento Esperado:**
- Toast de erro deve aparecer: "Erro de conexão. Verifique sua internet."
- Respostas já preenchidas devem ser mantidas em memória (não perdidas)
- Ao restaurar a conexão, usuário deve poder continuar de onde parou
- Se o dialog for fechado, as respostas serão perdidas (comportamento atual)

---

### 4.5. CE05 - Descrição Gerada Vazia ou Inválida

**Cenário:** A IA retorna uma descrição vazia ou com menos de 100 palavras.

**Passos para Simular:**
1. Complete o fluxo com respostas muito curtas ou genéricas
2. Observe a descrição gerada

**Comportamento Esperado:**
- Se a descrição tiver menos de 100 palavras, o sistema deve rejeitar e mostrar erro: "Descrição gerada muito curta. Tente fornecer respostas mais detalhadas."
- Dialog deve permanecer aberto
- Usuário deve poder revisar e melhorar as respostas
- Se a descrição for válida mas de baixa qualidade, deve ser aceita (validação manual do usuário)

---

## 5. Checklist de Validação

Use este checklist para validar rapidamente se o fluxo está funcionando corretamente:

### 5.1. Interface do Usuário

- [ ] Botão "Aprimorar com IA" visível na página de edição
- [ ] Botão com design correto (gradiente roxo/azul, ícone Sparkles)
- [ ] Botão desabilitado quando descrição < 50 caracteres
- [ ] Toast de erro ao tentar clicar com descrição curta
- [ ] Dialog abre corretamente ao clicar no botão
- [ ] Título e subtítulo do dialog corretos
- [ ] Barra de progresso funcional (1-5)
- [ ] Indicadores visuais de etapa (concluída/atual/pendente)

### 5.2. Etapas de NRs (1-4)

- [ ] Etapa 1: 4 perguntas sobre EPIs (NR-6) visíveis
- [ ] Etapa 2: 5 perguntas sobre Eletricidade/Altura (NR-10/35) visíveis
- [ ] Etapa 3: 5 perguntas sobre Máquinas/Espaços (NR-12/33) visíveis
- [ ] Etapa 4: 5 perguntas sobre Outras NRs visíveis
- [ ] Campos de texto (Textarea) funcionais
- [ ] Validação de campos obrigatórios
- [ ] Botão "Próxima Etapa" desabilitado com campos vazios
- [ ] Botão "Anterior" funcional (a partir da Etapa 2)
- [ ] Respostas preservadas ao navegar entre etapas

### 5.3. Chat Contextual (Etapa 5)

- [ ] Interface de chat visível na Etapa 5
- [ ] Primeira pergunta da IA contextual e relevante
- [ ] Campo de texto aceita Enter para enviar
- [ ] Shift+Enter cria nova linha
- [ ] Mensagens do usuário alinhadas à direita (azul)
- [ ] Mensagens da IA alinhadas à esquerda (cinza)
- [ ] Scroll automático para última mensagem
- [ ] 5-7 perguntas geradas pela IA
- [ ] Botão "Gerar Descrição Completa" aparece após última resposta

### 5.4. Geração de Descrição

- [ ] Loading exibido ao processar ("Gerando descrição enriquecida...")
- [ ] Tempo de processamento < 30 segundos
- [ ] Dialog fecha automaticamente após conclusão
- [ ] Toast de sucesso exibido
- [ ] Campo "Descrição da Atividade" atualizado
- [ ] Descrição com >300 palavras
- [ ] Texto estruturado em parágrafos (não bullet points)
- [ ] Integração de informações das 4 etapas de NRs
- [ ] Integração de respostas do chat contextual
- [ ] Menção a EPIs, NRs, equipamentos e medidas de segurança

### 5.5. Persistência de Dados

- [ ] Descrição enriquecida salva ao clicar em "Salvar Alterações"
- [ ] Redirecionamento para página de detalhes
- [ ] Descrição visível na página de detalhes
- [ ] Campo `activityDescription` atualizado no banco
- [ ] Registro criado na tabela `apr_ai_interviews`
- [ ] 24-26 perguntas salvas no campo `questions`
- [ ] 24-26 respostas salvas no campo `answers`
- [ ] Stage marcado como "completed"

### 5.6. Tratamento de Erros

- [ ] Erro de API exibe toast claro
- [ ] Timeout exibe mensagem apropriada
- [ ] Erro na geração permite tentar novamente
- [ ] Perda de conexão tratada adequadamente
- [ ] Descrição inválida rejeitada com mensagem

---

## 6. Critérios de Aceitação Geral

O fluxo "Aprimorar com IA" será considerado aprovado se atender aos seguintes critérios gerais:

### 6.1. Funcionalidade

O sistema deve permitir que o usuário complete todo o fluxo de aprimoramento sem erros, desde a abertura do dialog até a geração da descrição enriquecida. Todas as 5 etapas (4 NRs + 1 chat) devem funcionar corretamente, com validação de campos obrigatórios, navegação bidirecional entre etapas e preservação de respostas ao navegar. A descrição gerada deve ter no mínimo 300 palavras e integrar todas as informações fornecidas nas 24-26 perguntas respondidas.

### 6.2. Usabilidade

A interface deve ser intuitiva e fácil de usar, com instruções claras em cada etapa. O usuário deve conseguir navegar entre as etapas sem dificuldades, com botões bem posicionados e estados visuais claros (habilitado/desabilitado). O tempo total de interação do usuário (excluindo tempo de preenchimento manual) deve ser inferior a 60 segundos. Mensagens de erro devem ser claras e orientar o usuário sobre como corrigir o problema.

### 6.3. Performance

A abertura do dialog e geração de perguntas deve ocorrer em menos de 10 segundos. Cada pergunta do chat contextual deve ser gerada em menos de 5 segundos. A geração da descrição enriquecida final deve ocorrer em menos de 30 segundos. O sistema deve suportar pelo menos 10 usuários simultâneos realizando o fluxo sem degradação de performance.

### 6.4. Qualidade da IA

As perguntas do chat contextual devem ser relevantes e específicas, baseadas nas respostas das etapas de NRs e nas imagens anexadas. A descrição gerada deve ser profissional, técnica e adequada para uso direto no documento de APR. O texto deve integrar de forma fluida e natural todas as informações fornecidas, sem repetições ou contradições. A descrição deve citar corretamente os EPIs, NRs, equipamentos e medidas de segurança mencionados nas respostas.

### 6.5. Confiabilidade

O sistema deve tratar adequadamente todos os cenários de erro (API indisponível, timeout, perda de conexão). Os dados do usuário (respostas) devem ser preservados ao navegar entre etapas. O salvamento no banco de dados deve ser consistente e confiável. O sistema deve permitir que o usuário tente novamente em caso de erro, sem perder o progresso.

---

## 7. Registro de Resultados

Use a tabela abaixo para registrar os resultados dos testes executados:

| ID do Teste | Data | Testador | Status | Observações |
|-------------|------|----------|--------|-------------|
| CT01 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT02 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT03 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT04 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT05 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT06 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT07 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT08 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT09 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT10 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT11 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT12 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT13 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT14 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CT15 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CE01 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CE02 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CE03 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CE04 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |
| CE05 | ___/___/___ | _________ | ☐ Passou ☐ Falhou | |

---

## 8. Conclusão

Este roteiro de testes fornece uma cobertura abrangente do novo fluxo "Aprimorar com IA", incluindo casos de teste funcionais, cenários de erro e validações de qualidade. A execução completa deste roteiro garantirá que o sistema esteja pronto para uso em produção, oferecendo uma experiência confiável e de alta qualidade aos usuários do APRFix.

Para dúvidas ou sugestões de melhorias neste roteiro, entre em contato com a equipe de desenvolvimento.

---

**Documento gerado por:** Manus AI  
**Última atualização:** 01/01/2026
