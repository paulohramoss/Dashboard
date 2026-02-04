import { geminiModel } from "./firebase";

/**
 * Gera texto baseado em um prompt usando o modelo Gemini
 * @param {string} prompt - O texto do prompt para enviar ao modelo
 * @returns {Promise<string>} - O texto gerado pelo modelo
 * @throws {Error} - Se houver erro na geração
 */
export async function generateText(prompt) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt deve ser uma string não vazia");
  }

  try {
    // Envia o prompt para o modelo e aguarda resposta
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Erro ao gerar texto com Gemini:", error);
    throw new Error(`Falha ao gerar texto: ${error.message}`);
  }
}

/**
 * Gera texto com streaming (resposta incremental)
 * @param {string} prompt - O texto do prompt para enviar ao modelo
 * @param {function} onChunk - Callback chamado para cada chunk de texto recebido
 * @returns {Promise<string>} - O texto completo gerado pelo modelo
 * @throws {Error} - Se houver erro na geração
 */
export async function generateTextStream(prompt, onChunk) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt deve ser uma string não vazia");
  }

  if (typeof onChunk !== "function") {
    throw new Error("onChunk deve ser uma função");
  }

  try {
    const result = await geminiModel.generateContentStream(prompt);
    let fullText = "";

    // Processa cada chunk de resposta
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(chunkText);
    }

    return fullText;
  } catch (error) {
    console.error("Erro ao gerar texto com streaming:", error);
    throw new Error(`Falha ao gerar texto com streaming: ${error.message}`);
  }
}

/**
 * Função de exemplo que demonstra o uso básico do modelo Gemini
 * @example
 * const story = await runExample();
 * console.log(story);
 */
export async function runExample() {
  try {
    const prompt = "Escreva uma história curta sobre uma mochila mágica.";
    console.log("Enviando prompt:", prompt);

    const text = await generateText(prompt);
    console.log("Resposta do modelo:", text);

    return text;
  } catch (error) {
    console.error("Erro no exemplo:", error);
    throw error;
  }
}

// ==================== FUNÇÕES ESPECIALIZADAS PARA FINANÇAS ====================

/**
 * Sugere uma categoria apropriada baseada na descrição da transação
 * @param {string} description - Descrição da transação
 * @param {Array} availableCategories - Lista de categorias disponíveis [{name, type}]
 * @param {string} language - Idioma para resposta ('pt' ou 'en')
 * @returns {Promise<{category: string, confidence: string}>} - Categoria sugerida e nível de confiança
 */
export async function suggestCategory(
  description,
  availableCategories = [],
  language = "pt",
) {
  if (!description || typeof description !== "string") {
    throw new Error("Descrição da transação é obrigatória");
  }

  const categoryList =
    availableCategories.length > 0
      ? availableCategories.map((c) => `${c.name} (${c.type})`).join(", ")
      : "Food, Transport, Utilities, Entertainment, Salary, Freelance, Other, General";

  const prompt =
    language === "pt"
      ? `Você é um assistente de finanças pessoais. Com base na descrição da transação abaixo, sugira a categoria mais apropriada.

Descrição: "${description}"

Categorias disponíveis: ${categoryList}

Responda APENAS no formato JSON exato abaixo, sem texto adicional:
{"category": "nome_da_categoria", "confidence": "high|medium|low", "reasoning": "breve explicação"}`
      : `You are a personal finance assistant. Based on the transaction description below, suggest the most appropriate category.

Description: "${description}"

Available categories: ${categoryList}

Respond ONLY in the exact JSON format below, with no additional text:
{"category": "category_name", "confidence": "high|medium|low", "reasoning": "brief explanation"}`;

  try {
    const result = await generateText(prompt);

    // Tenta extrair JSON da resposta
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        category: parsed.category || "General",
        confidence: parsed.confidence || "medium",
        reasoning: parsed.reasoning || "",
      };
    }

    // Fallback se não conseguir parsear
    return {
      category: "General",
      confidence: "low",
      reasoning: "Não foi possível determinar a categoria",
    };
  } catch (error) {
    console.error("Erro ao sugerir categoria:", error);
    throw error;
  }
}

/**
 * Gera insights personalizados sobre gastos do mês
 * @param {Array} transactions - Transações do mês [{description, amount, category, type, date}]
 * @param {Array} categories - Categorias disponíveis
 * @param {string} language - Idioma para resposta
 * @returns {Promise<{summary: string, topCategories: Array, insights: Array}>}
 */
export async function generateMonthlyInsights(
  transactions = [],
  categories = [],
  language = "pt",
) {
  if (!transactions || transactions.length === 0) {
    return {
      summary:
        language === "pt"
          ? "Não há transações suficientes para gerar insights este mês."
          : "Not enough transactions to generate insights this month.",
      topCategories: [],
      insights: [],
    };
  }

  // Calcular estatísticas básicas
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const categoryBreakdown = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const cat = t.category || "Other";
      categoryBreakdown[cat] =
        (categoryBreakdown[cat] || 0) + parseFloat(t.amount || 0);
    });

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

  const prompt =
    language === "pt"
      ? `Você é um consultor financeiro experiente. Analise os dados financeiros do mês e gere insights úteis e acionáveis.

**Dados do Mês:**
- Total de Receitas: R$ ${totalIncome.toFixed(2)}
- Total de Despesas: R$ ${totalExpense.toFixed(2)}
- Saldo: R$ ${(totalIncome - totalExpense).toFixed(2)}
- Número de Transações: ${transactions.length}

**Top 5 Categorias de Despesa:**
${topCategories.map((c, i) => `${i + 1}. ${c.name}: R$ ${c.amount.toFixed(2)}`).join("\n")}

Forneça:
1. Um resumo breve (2-3 frases) sobre a situação financeira geral
2. 3-4 insights específicos e acionáveis baseados nos dados

Seja objetivo, positivo e construtivo. Formato de resposta em português claro.`
      : `You are an experienced financial consultant. Analyze the monthly financial data and generate useful, actionable insights.

**Monthly Data:**
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpense.toFixed(2)}
- Balance: $${(totalIncome - totalExpense).toFixed(2)}
- Number of Transactions: ${transactions.length}

**Top 5 Expense Categories:**
${topCategories.map((c, i) => `${i + 1}. ${c.name}: $${c.amount.toFixed(2)}`).join("\n")}

Provide:
1. A brief summary (2-3 sentences) about the overall financial situation
2. 3-4 specific, actionable insights based on the data

Be objective, positive, and constructive. Response in clear English.`;

  try {
    const insightsText = await generateText(prompt);

    return {
      summary: insightsText,
      topCategories,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
    };
  } catch (error) {
    console.error("Erro ao gerar insights mensais:", error);
    throw error;
  }
}

/**
 * Analisa padrões de gastos e sugere oportunidades de economia
 * @param {Array} transactions - Transações recentes
 * @param {number} daysBack - Número de dias para análise (padrão: 30)
 * @param {string} language - Idioma
 * @returns {Promise<{suggestions: Array}>}
 */
export async function analyzeSavingsOpportunities(
  transactions = [],
  daysBack = 30,
  language = "pt",
) {
  if (!transactions || transactions.length === 0) {
    return {
      suggestions: [
        language === "pt"
          ? "Comece a registrar suas transações para receber sugestões personalizadas de economia!"
          : "Start recording your transactions to receive personalized savings suggestions!",
      ],
    };
  }

  // Filtrar transações dos últimos N dias
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const recentTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= cutoffDate && t.type === "expense";
  });

  // Agrupar por categoria
  const categorySpending = {};
  recentTransactions.forEach((t) => {
    const cat = t.category || "Other";
    if (!categorySpending[cat]) {
      categorySpending[cat] = { total: 0, count: 0, transactions: [] };
    }
    categorySpending[cat].total += parseFloat(t.amount || 0);
    categorySpending[cat].count += 1;
    categorySpending[cat].transactions.push(t);
  });

  const categoryList = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5)
    .map(
      ([name, data]) =>
        `${name}: R$ ${data.total.toFixed(2)} (${data.count} transações)`,
    )
    .join("\n");

  const totalSpent = recentTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount || 0),
    0,
  );

  const prompt =
    language === "pt"
      ? `Você é um consultor financeiro especializado em economia pessoal. Analise os gastos dos últimos ${daysBack} dias e sugira 4-5 oportunidades práticas e realistas de economia.

**Resumo dos Gastos (${daysBack} dias):**
- Total Gasto: R$ ${totalSpent.toFixed(2)}
- Número de Transações: ${recentTransactions.length}

**Top Categorias:**
${categoryList}

**Instruções:**
- Seja específico e prático
- Sugira mudanças pequenas e alcançáveis
- Evite sugestões genéricas
- Foque em áreas com maior impacto
- Mantenha um tom motivador e positivo

Forneça 4-5 sugestões numeradas, cada uma com 1-2 frases.`
      : `You are a financial consultant specialized in personal savings. Analyze spending from the last ${daysBack} days and suggest 4-5 practical, realistic savings opportunities.

**Spending Summary (${daysBack} days):**
- Total Spent: $${totalSpent.toFixed(2)}
- Number of Transactions: ${recentTransactions.length}

**Top Categories:**
${categoryList}

**Instructions:**
- Be specific and practical
- Suggest small, achievable changes
- Avoid generic suggestions
- Focus on high-impact areas
- Keep a motivating, positive tone

Provide 4-5 numbered suggestions, each with 1-2 sentences.`;

  try {
    const suggestionsText = await generateText(prompt);

    // Tentar extrair sugestões numeradas
    const suggestions = suggestionsText
      .split(/\n/)
      .filter((line) => /^\d+[\.\):]/.test(line.trim()))
      .map((line) => line.replace(/^\d+[\.\):]/, "").trim())
      .filter((s) => s.length > 0);

    return {
      suggestions: suggestions.length > 0 ? suggestions : [suggestionsText],
      totalSpent,
      analyzedDays: daysBack,
      transactionCount: recentTransactions.length,
    };
  } catch (error) {
    console.error("Erro ao analisar oportunidades de economia:", error);
    throw error;
  }
}

/**
 * Responde perguntas sobre finanças pessoais com contexto do usuário
 * @param {string} question - Pergunta do usuário
 * @param {Object} userContext - Contexto financeiro do usuário {balance, income, expense, recentTransactions}
 * @param {string} language - Idioma
 * @returns {Promise<string>} - Resposta personalizada
 */
export async function answerFinancialQuestion(
  question,
  userContext = {},
  language = "pt",
) {
  if (!question || typeof question !== "string") {
    throw new Error("Pergunta é obrigatória");
  }

  const {
    balance = 0,
    income = 0,
    expense = 0,
    recentTransactions = [],
    topCategory = "N/A",
  } = userContext;

  const contextInfo =
    language === "pt"
      ? `**Contexto Financeiro do Usuário:**
- Saldo Atual: R$ ${balance.toFixed(2)}
- Receitas (mês): R$ ${income.toFixed(2)}
- Despesas (mês): R$ ${expense.toFixed(2)}
- Categoria com Maior Gasto: ${topCategory}
- Transações Recentes: ${recentTransactions.length}`
      : `**User Financial Context:**
- Current Balance: $${balance.toFixed(2)}
- Income (month): $${income.toFixed(2)}
- Expenses (month): $${expense.toFixed(2)}
- Top Spending Category: ${topCategory}
- Recent Transactions: ${recentTransactions.length}`;

  const prompt =
    language === "pt"
      ? `Você é um assistente financeiro pessoal amigável e experiente. Responda a pergunta do usuário de forma clara, prática e educativa.

${contextInfo}

**Pergunta do Usuário:**
"${question}"

**Instruções:**
- Use o contexto financeiro para personalizar sua resposta quando relevante
- Seja específico e prático
- Mantenha a resposta concisa (2-4 parágrafos)
- Use tom amigável e motivador
- Se a pergunta for sobre os dados do usuário, use as informações fornecidas
- Se for uma pergunta genérica sobre finanças, forneça orientação educativa`
      : `You are a friendly and experienced personal financial assistant. Answer the user's question clearly, practically, and educationally.

${contextInfo}

**User Question:**
"${question}"

**Instructions:**
- Use the financial context to personalize your answer when relevant
- Be specific and practical
- Keep the response concise (2-4 paragraphs)
- Use a friendly and motivating tone
- If the question is about the user's data, use the provided information
- If it's a generic finance question, provide educational guidance`;

  try {
    const answer = await generateText(prompt);
    return answer;
  } catch (error) {
    console.error("Erro ao responder pergunta financeira:", error);
    throw error;
  }
}
