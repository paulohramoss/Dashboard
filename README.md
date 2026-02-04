# FinanceDash - Painel Financeiro Pessoal

O **FinanceDash** é uma aplicação web completa para gestão financeira pessoal, desenvolvida com tecnologias modernas para oferecer uma experiência de usuário fluida, responsiva e segura. O projeto permite o controle detalhado de receitas, despesas, contas e metas orçamentárias.

![Status do Projeto](https://img.shields.io/badge/status-em_desenvolvimento-yellow)
![Licença](https://img.shields.io/badge/license-MIT-blue)

## 📋 Sobre o Projeto

Este painel foi criado para simplificar o acompanhamento financeiro diário. Com ele, você pode registrar transações manualmente ou importar extratos bancários, visualizar gráficos intuitivos sobre seus gastos, definir orçamentos para categorias específicas e gerenciar múltiplas contas/carteiras.

A aplicação é um **PWA (Progressive Web App)**, o que significa que pode ser instalada no seu computador ou celular e funcionar como um aplicativo nativo.

## 🚀 Funcionalidades Principais

- **📊 Dashboard Interativo:** Visão geral do saldo total, receitas, despesas e últimas atividades.
- **💸 Gestão de Transações:**
  - Adicionar, editar e excluir receitas e despesas.
  - Suporte a transações recorrentes.
  - **Importação de Arquivos:** Suporte nativo para arquivos `.csv`, `.xlsx` (Excel) e `.ofx` (Extrato Bancário).
  - **Exportação:** Gere relatórios em PDF ou exporte dados para Excel.
- **🎯 Metas e Orçamentos:** Defina limites de gastos por categoria e acompanhe o progresso visualmente para não estourar o orçamento.
- **💳 Múltiplas Contas:** Gerencie diferentes carteiras (Conta Corrente, Poupança, Cartão de Crédito, Dinheiro) com saldos independentes.
- **📈 Relatórios e Análises:** Gráficos detalhados (Pizza, Barras, Área) para entender para onde seu dinheiro está indo.
- **⚙️ Configurações Personalizáveis:**
  - Gerenciamento de perfil de usuário.
  - Criação e edição de categorias personalizadas com cores.
  - Configurações de notificação e segurança.
- **🌍 Internacionalização (i18n):** Suporte completo para **Português (BR)** e **Inglês (EN)**.
- **📱 PWA:** Instalável e otimizado para dispositivos móveis.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias e bibliotecas:

- **Core:** [React](https://react.dev/) (v19), [Vite](https://vitejs.dev/)
- **Linguagem:** JavaScript (ES6+)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) (baseado em Radix UI)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Backend & Auth:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage, AI Logic)
- **AI/ML:** [Firebase AI Logic](https://firebase.google.com/docs/ai-logic) (Gemini API)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Utilitários:**
  - `i18next` para internacionalização.
  - `jspdf` e `jspdf-autotable` para geração de PDF.
  - `xlsx` e `papaparse` para manipulação de planilhas e CSV.
  - `ofx-js` para leitura de arquivos bancários.
  - `sonner` para notificações toast.

## ⚙️ Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## 📦 Instalação

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/financial-dashboard.git
    cd financial-dashboard
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure o Firebase:**
    - Crie um projeto no [Console do Firebase](https://console.firebase.google.com/).
    - Habilite o **Authentication** e o **Firestore Database**.
    - Crie um arquivo `.env` na raiz do projeto com as suas credenciais:

    ```env
    VITE_FIREBASE_API_KEY=sua_api_key
    VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=seu_project_id
    VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
    VITE_FIREBASE_APP_ID=seu_app_id
    ```

4.  **Execute o projeto:**
    ```bash
    npm run dev
    ```

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Compila o projeto para produção.
- `npm run preview`: Visualiza a versão de produção localmente.
- `npm run lint`: Executa a verificação de código com ESLint.

## 🤖 Firebase AI Logic (Gemini)

O projeto inclui integração com o **Firebase AI Logic** para acesso aos modelos **Gemini**. Isso permite adicionar recursos de IA generativa à aplicação.

### Configuração

A biblioteca já está instalada e configurada em `src/lib/firebase.js`:

```javascript
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// Inicializar o serviço Gemini Developer API
export const ai = getAI(app, { backend: new GoogleAIBackend() });

// Criar instância do modelo
export const geminiModel = getGenerativeModel(ai, {
  model: "gemini-2.0-flash-exp",
});
```

### Uso Básico

Utilize o módulo auxiliar `src/lib/gemini.js`:

```javascript
import { generateText, generateTextStream } from "./lib/gemini";

// Geração simples de texto
const text = await generateText(
  "Crie um resumo financeiro baseado nos dados...",
);
console.log(text);

// Geração com streaming (resposta incremental)
await generateTextStream(
  "Analise meus gastos do mês...",
  (chunk) => console.log(chunk), // Callback para cada pedaço
);
```

### Funções Disponíveis

- **`generateText(prompt)`**: Gera texto de forma completa.
- **`generateTextStream(prompt, onChunk)`**: Gera texto com streaming (útil para UIs interativas).
- **`runExample()`**: Função de demonstração.

### Casos de Uso no Projeto

- 📊 Análise inteligente de gastos
- 💡 Sugestões personalizadas de economia
- 📝 Categorização automática de transações
- 🎯 Recomendações de metas financeiras

## 📱 PWA (Progressive Web App)

Este projeto está configurado como PWA. Isso significa que ao acessar pelo navegador (Chrome, Edge, Safari), você verá um ícone na barra de endereço para instalar o aplicativo.

- Funciona offline (cache de assets).
- Parece um aplicativo nativo.
- Ícone na área de trabalho/home screen.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com 💜 por [Seu Nome/Flexpro]
