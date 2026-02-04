import { useState } from "react";
import { generateText } from "../lib/gemini";

/**
 * Componente de demonstração do Firebase AI Logic / Gemini
 * Este é um exemplo básico de como usar a integração com Gemini
 */
export default function GeminiDemo() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Por favor, insira um prompt");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const text = await generateText(prompt);
      setResponse(text);
    } catch (err) {
      setError(err.message || "Erro ao gerar texto");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          🤖 Firebase AI Logic - Demonstração Gemini
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Digite seu prompt:
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Escreva uma história sobre uma mochila mágica..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       resize-y min-h-[100px]"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                     font-semibold py-3 px-6 rounded-lg
                     hover:from-blue-600 hover:to-purple-700 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Gerando...
              </span>
            ) : (
              "✨ Gerar com Gemini"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">❌ {error}</p>
          </div>
        )}

        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📝 Resposta:
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {response}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            💡 Exemplos de prompts:
          </h3>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• "Escreva uma história sobre uma mochila mágica"</li>
            <li>• "Me dê 5 dicas para economizar dinheiro"</li>
            <li>• "Explique o que é um orçamento pessoal"</li>
            <li>
              • "Crie uma lista de categorias de despesa para finanças pessoais"
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
