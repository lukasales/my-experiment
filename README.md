# Sistema Web de Criação, Geração e Correção de Provas

## Visão geral

Este projeto foi desenvolvido como parte de um experimento prático sobre o uso de agentes de IA no desenvolvimento de software. O sistema implementa um fluxo completo de criação, organização, geração e correção de provas objetivas, cobrindo desde o cadastro de questões até a geração de relatórios finais de notas.

O sistema foi construído em etapas pequenas e verificáveis, com foco em manter rastreabilidade das decisões, validação contínua e revisão crítica das entregas produzidas com apoio de agente.

## Objetivo do sistema

O objetivo principal é permitir:

- gerenciamento de questões fechadas;
- gerenciamento de provas;
- geração de PDFs individuais de provas;
- geração de CSV de gabarito;
- correção a partir de CSVs de gabarito e respostas dos alunos;
- geração de relatório final de notas.

---

## Funcionalidades implementadas

### 1. Gerenciamento de questões
- listar questões
- criar questão
- editar questão
- remover questão

Cada questão possui:
- enunciado
- alternativas
- indicação de alternativa correta

### 2. Gerenciamento de provas
- listar provas
- criar prova
- editar prova
- remover prova
- vincular questões a uma prova
- definir modo de resposta:
  - `letters`
  - `powersOfTwo`

### 3. Geração de provas
- gerar PDF individual
- gerar lote de provas em ZIP
- randomizar ordem de questões
- randomizar ordem de alternativas
- incluir cabeçalho
- incluir rodapé com número da prova
- incluir espaço para nome e CPF
- gerar CSV de gabarito por prova

### 4. Correção e relatório
- importar CSV de gabarito
- importar CSV de respostas dos alunos
- executar correção rigorosa
- executar correção menos rigorosa
- gerar relatório final de notas

---

## Stack utilizada

### Frontend
- React
- TypeScript
- Vite

### Backend
- Node.js
- Express
- TypeScript

### Testes de aceitação
- Gherkin
- Cucumber

### Geração de artefatos
- PDF
- ZIP
- CSV

### Deploy
- Frontend: Vercel
- Backend: Railway

---

## Estrutura do projeto

```text
sistema/
  client/      # frontend React + TypeScript
  server/      # backend Node + TypeScript
  features/    # cenários Gherkin/Cucumber  
