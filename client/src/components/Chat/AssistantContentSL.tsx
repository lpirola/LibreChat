import { useState, useEffect } from 'react';
import { EModelEndpoint } from 'librechat-data-provider';
import { useSubmitMessage, useSelectAssistant } from '~/hooks';
import { AssistentesGrid } from './AssistantGrid';
import { CurrentAssistant } from '../ui/CurrentAssistant';
import { AssistantCard } from '../ui/AssistantCard';
import { LandingAssistContainer } from '../LandingAssistContainer';
import HelpDialog from './HelpDialog';
import type { AssistantContentProps } from './types';

export default function AssistantContent({
  conversation,
  assistantMap,
  assistantList,
  setSelectedAssist,
  setSelectedPrompt,
  setCurrentAssistId,
  setSelectedQuestion,
}: AssistantContentProps) {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [shuffleToggle, setShuffleToggle] = useState<boolean>(false);
  const { submitMessage } = useSubmitMessage();
  const { onSelect } = useSelectAssistant(conversation?.endpoint as any);

  let { endpoint, assistant_id } = conversation ?? { endpoint: '', assistant_id: null };
  if (
    endpoint === EModelEndpoint.chatGPTBrowser ||
    endpoint === EModelEndpoint.azureOpenAI ||
    endpoint === EModelEndpoint.gptPlugins
  ) {
    endpoint = EModelEndpoint.openAI;
  }

  const assistant = assistantMap?.[endpoint || '']?.[assistant_id ?? ''];
  const assistantName = assistant?.name || '';

  const currentAssistant = assistantList?.find((item) => item.Id === assistant_id);
  const [randomQuestions, setRandomQuestions] = useState<string[]>(
    currentAssistant?.['Perguntas do dia']
      ?.split('\n')
      .filter((q) => q.trim() !== '')
      .map((question) => question.replace(/^\d+\.\s*/, '')) || []
  );

  const others = [
    'asst_VMIucXRGsKSFRKzHHO7m9pNl',
    'asst_ZSUVlFGrKY3fI5MrfBdS5ayg',
    'asst_i8yF9pYTi0EbcmFaTFtUrD9S',
    'asst_WZf5wtzqysM4vlJ1WLTJrASj',
    'asst_etTZeaPgTnTHWaWVTyzWRFfk',
    'asst_mLfYHanhjVXsHoctIJIWcE1h',
    'asst_4zSYHOCxudLlfFcHSIqSzP93',
    'asst_9VFRraeUAtBnqubrtzbhpuZp',
    'asst_IHtM4Sr24vOGt3b434xV8vmW',
  ];

  const customPISCOFINS = ['asst_VMIucXRGsKSFRKzHHO7m9pNl', 'asst_ZSUVlFGrKY3fI5MrfBdS5ayg'];

  const isOthers = others.includes(assistant_id || '');
  const isCustomPISCOFINS = customPISCOFINS.includes(assistant_id || '');

  useEffect(() => {
    if (currentAssistant) {
      setRandomQuestions(shuffleArray(
        currentAssistant['Perguntas do dia']
          ?.split('\n')
          .filter((q) => q.trim() !== '')
          .map((question) => question.replace(/^\d+\.\s*/, ''))
      ));
    }
  }, [currentAssistant, shuffleToggle]);

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    alert('Texto copiado!');
  };

  function shuffleArray(array: string[]) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const renderAssistants = (list: typeof assistantList) => {
    if (!list) return [];
    return list.map((assistant, index) => (
      <AssistantCard
        id={assistant.Id}
        name={assistant.Nome}
        key={index}
        handleSelectAssistant={onSelect}
        setCurrentAssistId={setCurrentAssistId}
      />
    ));
  };

  const CustomPrompts = () => (
    <div className="grid mx-[6vw] mt-10 grid-cols-1 gap-4">
      {randomQuestions
        .map((question, index) => (
          <div
            key={`CustomQuestion-${index}-${assistant_id}-${shuffleToggle}`}
            className="animate__animated animate__fadeInLeft transform transition duration-700 ease-in-out grid grid-cols-2 gap-10"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`flex items-center space-x-4 rounded-lg border p-4 shadow-md transition-shadow duration-300 dark:bg-transparent ${
              index % 3 === 0 ? "bg-yellow-400" : index % 3 === 1 ? "bg-blue-400" : "bg-green-400"
            }`}>
              <div className={`rounded-full px-4 py-2 h-10 w-30 text-white ${
                index % 3 === 0 ? "bg-yellow-600" : index % 3 === 1 ? "bg-blue-600" : "bg-green-600"
              }`}>
                {index + 1}
              </div>
              <p className={`text-base font-medium ${index === 0 ? 'text-black' : 'text-white'}`}>{question}</p>
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => setSelectedQuestion(question)}
                className="rounded-full h-10 w-30 bg-green-500 px-4 py-2 hover:text-black text-white transition-colors duration-300 hover:bg-yellow-400"
              >
                ➤ Executar
              </button>
              <button
                onClick={() => handleCopy(question)}
                className="rounded-full bg-gray-300 px-4 py-2 text-black transition-colors duration-300 hover:bg-gray-200 h-10 w-30"
              >
                Copiar
              </button>
            </div>
          </div>
        ))
        .slice(0, 3)}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShuffleToggle(!shuffleToggle)}
          className="rounded-full bg-blue-500 px-6 py-2 text-white transition-colors duration-300 hover:bg-blue-600 w-20"
        >
          Mais
        </button>
      </div>
    </div>
  );

  const CustomButtons = () => (
    <div className="flex justify-center">
      <div className="mt-10 grid grid-cols-2 gap-2">
        <div className="flex flex-col rounded-lg bg-white shadow-lg">
          <div className="flex">
            <div className="h-full w-2 rounded-l-lg bg-green-300"></div>
            <div className="flex-1 px-4">
              <div className="flex items-center mt-5">
                <div className="mr-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                  <span>🗨️</span>
                </div>
                <span className="text-lg font-semibold ml-3">Perguntas gerais</span>
              </div>
              <p className="text-md mt-2 max-w-[500px]">
                Respondo dúvidas gerais sobre o PIS/COFINS. Posso sugerir perguntas frequentes, como:
                Quais despesas geram crédito no regime não cumulativo? Como calcular o PIS/COFINS no
                regime não cumulativo? Quais receitas devem ser excluídas da base de cálculo? Qual a
                diferença entre regime cumulativo e não cumulativo?
              </p>
              <button
                onClick={() => setSelectedQuestion('Perguntas gerais')}
                className="mt-5 cursor-pointer rounded-lg border bg-green-500 p-2 text-white shadow-md transition-all duration-300 hover:scale-105"
              >
                Ver Perguntas
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-lg bg-white shadow-lg">
          <div className="flex">
            <div className="h-full w-2 rounded-l-lg bg-blue-300"></div>
            <div className="flex-1 px-4">
              <div className="flex items-center mt-5">
                <div className="mr-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                  <span>📈</span>
                </div>
                <span className="text-lg font-semibold ml-3">Simular</span>
              </div>
              <p className="text-md mt-2 max-w-[500px]">
                Realizo uma simulação interativa, coletando dados necessários, realizando cálculos
                e gerando um relatório detalhado sobre o PIS/COFINS.
              </p>
              <button
                onClick={() => setSelectedQuestion('Simular')}
                className="mt-5 cursor-pointer rounded-lg border bg-blue-500 p-2 text-white shadow-md transition-all duration-300 hover:scale-105"
              >
                Acessar Simulação
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!isOthers) {
      return (
        <LandingAssistContainer
          assistant={assistant}
          conversation={conversation}
          endpoint={endpoint}
          setSelectedPrompt={setSelectedPrompt}
        />
      );
    } else if (isCustomPISCOFINS) {
      return <CustomButtons />;
    } else {
      return <CustomPrompts />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mx-[5vw]">
        {AssistentesGrid(renderAssistants(assistantList) || [], onSelect)}
      </div>
      <div className="mx-[6vw]">{CurrentAssistant(assistantName)}</div>
      {renderContent()}
      <HelpDialog showHelpDialog={openDialog} setShowHelpDialog={setOpenDialog} />
    </div>
  );
}
