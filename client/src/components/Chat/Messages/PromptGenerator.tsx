import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { cn } from '~/utils';
import store from '~/store';
import axios, { AxiosResponse } from 'axios';
import HelpDialog from '../HelpDialog';

export interface Prompt {
  question: string;
  topic: string;
  cnae: string;
  regime: string;
}

export interface PromptGeneratorFilters {
  CNAE: string;
  topic: string;
  opiton: string;
}

interface ApiResponse {
  message: {
    content: string;
  };
}

export default function PromptGenerator({
  promptFilters,
  setSelectedPrompt,
}: {
  promptFilters: PromptGeneratorFilters;
  setSelectedPrompt: React.Dispatch<React.SetStateAction<Prompt | null>>;
}) {
  const fontSize = useRecoilValue(store.fontSize);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDiolog, setOpenDiolog] = useState<boolean>(false);
  const storedDontShowAgain = localStorage.getItem('dontShowAgain');

  const handleSubmit = async () => {
    try {
      const response: AxiosResponse<ApiResponse[]> = await axios.post(
        'https://automacao.sacwa.eu.org/webhook/fd59e99f-77cf-4134-8c06-abe334b8cb69',
        promptFilters,
      );

      const responseData = response.data;
      const parsedPrompts = responseData.map((item) => {
        try {
          const parsedContent = JSON.parse(item.message.content);
          setLoading(false);

          return parsedContent.prompts; // Extrai o array de prompts
        } catch (error) {
          console.error('Erro ao parsear o JSON:', error);
          setLoading(false);
          return [];
        }
      });
      setPrompts(parsedPrompts.flat());
    } catch (error) {
      setError('Erro ao buscar dados da API.');
    }
  };

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    alert('Texto copiado!');
  };

  useEffect(() => {
    if (promptFilters.CNAE && promptFilters.topic && promptFilters.opiton) {
      setLoading(true);
      handleSubmit();
    }
  }, [promptFilters]);

  useEffect(() => {
    if (prompts.length > 0) {
      setOpenDiolog(true);
    }
  }, [prompts, setPrompts]);

  return (
    <div className="flex-1 overflow-hidden overflow-y-auto">
      <div className="relative">
        <div className="flex flex-col pb-9 dark:bg-transparent">
          <div
            className={cn(
              'flex w-full items-center justify-center gap-1 bg-gray-50 p-3 text-gray-500 dark:border-gray-800/50 dark:bg-gray-800 dark:text-gray-300',
              fontSize,
            )}
          >
            <div className="container mx-auto p-4">
              {error && <p className="text-red-500">{error}</p>}
              {loading ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse rounded-lg bg-gray-200 p-4 shadow-md"
                      >
                        <div className="mb-4 h-6 rounded bg-gray-300"></div>
                        <div className="h-10 rounded bg-gray-300"></div>
                      </div>
                    ))}
                  </div>
                  <h1 className="mt-4 text-center text-4xl font-bold">
                    Aguarde um momento por favor...
                  </h1>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {prompts.map((prompt, index) => (
                    <div
                      key={`CustomQuestion-${prompt.topic}-${index}`}
                      className={
                        'animate__animated animate__fadeInLeft transform opacity-0 transition duration-700 ease-in-out'
                      }
                      style={{
                        animationDelay: `${index * 100}ms`, // Delay para cada pergunta aparecer um pouco depois
                      }}
                    >
                      <button
                        key={index}
                        onClick={() => setSelectedPrompt(prompt)}
                        className="cursor-pointer rounded-lg border p-4 shadow-md transition-shadow duration-300 hover:shadow-xl dark:bg-transparent"
                      >
                        <p className="text-sm">{prompt.question}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar que o clique no botão acione o clique no card
                            handleCopy(prompt.question);
                            setOpenDiolog(true);
                          }}
                          className="mt-2 rounded bg-yellow-400 px-4 py-2 text-black transition-colors duration-300 hover:bg-yellow-300"
                        >
                          Copiar
                        </button>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {loading ? (
                <></>
              ) : (
                <button
                  onClick={() => {
                    setLoading(true);
                    handleSubmit();
                  }}
                  className="mt-2 rounded bg-yellow-400 px-4 py-2 text-black transition-colors duration-300 hover:bg-yellow-300"
                >
                  Mais
                </button>
              )}
            </div>
          </div>
        </div>
        {storedDontShowAgain !== 'true' && !loading && (
          <HelpDialog showHelpDialog={openDiolog} setShowHelpDialog={setOpenDiolog} />
        )}
      </div>
    </div>
  );
}