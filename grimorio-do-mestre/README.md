# 📜 O Grimório do Mestre (RPG Master Hub)

Um sistema completo, elegante e imersivo para Mestres de RPG organizarem suas campanhas, sessões, segredos, NPCs, tesouros, mapas e rolagens de dados com o visual clássico de **Pergaminho & Couro Envelhecido**.

---

## 🚀 Como Abrir e Usar

O projeto foi construído como uma aplicação web nativa, sem necessidade de instalar Node.js, servidores ou dependências externas. Ele roda diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Brave) e salva tudo de forma persistente no seu próprio computador.

### Maneira 1: Direto pelo Navegador
- Basta dar um **duplo clique no arquivo [`index.html`](index.html)** na pasta do projeto.
- Ou clique com o botão direito e selecione **"Abrir com" -> Google Chrome / Microsoft Edge**.

### Maneira 2: Pelo PowerShell
Execute no terminal:
```powershell
Start-Process "C:\Users\bidik\.gemini\antigravity\scratch\grimorio-do-mestre\index.html"
```

---

## 📌 Recomendação de Workspace
Para facilitar o desenvolvimento e modificações futuras deste projeto no **Antigravity**, defina a pasta abaixo como o seu **Workspace Ativo**:

📂 Caminho: `C:\Users\bidik\.gemini\antigravity\scratch\grimorio-do-mestre`

---

## ⚔️ Funcionalidades Incluídas

### 1. 📜 Painel de Campanhas & Aventureiros
- Suporte a múltiplas campanhas simultâneas (D&D 5e, Tormenta20, Ordem Paranormal, Chamado de Cthulhu, Pathfinder, 3D&T, etc.).
- Sinopse do mundo, sistema e descrição dos conflitos principais.
- Gerenciamento dos personagens dos jogadores (PJ), níveis, classes e anotações individuais do Mestre.

### 2. 📖 Diário de Sessões (Adventure Log)
- Registro cronológico de cada sessão (`Sessão #1`, `Sessão #2`, etc.).
- Data, título, resumo detalhado dos acontecimentos da mesa.
- Recompensas distribuídas, XP / marcos concedidos e **Ganchos pendentes para a próxima aventura**.

### 3. 🤫 Cofre de Segredos do Mestre & Modo "Mestre Oculto"
- Espaço seguro para guardar a verdade por trás dos vilões, mistérios dos jogadores e reviravoltas futuras.
- **Botão "Mestre Oculto" (Anti-Spoiler):** com um único clique (ou se os jogadores olharem na sua tela), todos os segredos são imediatamente borrados com selos de confidencialidade!
- Checkbox para marcar segredos já revelados à mesa.

### 4. 👥 Gerenciador de NPCs & Facções
- Fichas rápidas com status (Aliado, Hostil, Neutro), alianças de facção, localização e ficha de combate compacta (CA, PV, Ataques).
- **🎲 Gerador de NPCs em 1 Clique:** Gera instantaneamente NPCs medievais convincentes com nomes, maneirismos, ocupações e motivações ocultas.

### 5. ⚔️ Arsenal & Relíquias Arcanas
- Catálogo de itens com cores de raridade temáticas (Comum, Incomum, Raro, Muito Raro, Lendário, Artefato).
- Controle de valor de mercado (PO), necessidade de sintonização e propriedades mágicas.

### 6. 🗺️ Atlas & Geografia (Mapas e Locais)
- Mapeamento de masmorras, cidades, ruínas e reinos.
- Pontos de interesse e níveis de perigo.
- Suporte a imagens de mapas regionais e battlemaps com visualizador ampliado.

### 7. 🎲 Rolador de Dados Integrado com Áudio Sintetizado
- Suporte aos dados clássicos: **d4, d6, d8, d10, d12, d20, d100, d2 (moeda)**.
- Quantidade configurável de dados e modificador numérico (+/- bônus).
- **Efeitos de Áudio Procedural:** Simula o barulho dos dados na madeira através da Web Audio API sem precisar de arquivos de áudio externos!
- Destaque especial animado para **Acertos Críticos (20 natural)** e **Falhas Críticas (1 natural)**.
- Histórico completo das últimas 20 rolagens com horário.

### 8. 💾 Backup & Restauração Completa em JSON
- Todos os dados são salvos em tempo real no `localStorage` do seu navegador.
- **Botão "Backup":** Baixa um arquivo `.json` com todas as suas anotações, campanhas e NPCs para você guardar no Google Drive, pen-drive ou compartilhar.
- **Botão "Importar":** Restaura suas campanhas em outro computador instantaneamente.
- **Botão "Resetar":** Permite voltar para os dados de demonstração a qualquer momento.

---

## 📁 Estrutura de Arquivos

```
grimorio-do-mestre/
├── index.html        # Estrutura do portal e layout do livro
├── style.css         # Estilo imersivo de pergaminho, couro e selos
├── app.js            # Lógica interativa, rolagens, som, persistência e modais
├── sample-data.js    # Dados de exemplo ricos pré-carregados (Valoria)
└── README.md         # Documentação e guia de uso
```
