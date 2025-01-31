import { useState, useEffect } from 'react';
import { useSubmitMessage, useSelectAssistant } from '~/hooks';
import { AssistentesGrid } from './AssistantGrid';
import { CurrentAssistant } from '../ui/CurrentAssistant';
import { AssistantCard } from '../ui/AssistantCard';
import { LandingAssistContainer } from '../LandingAssistContainer';
import HelpDialog from './HelpDialog';
import type { AssistantContentProps } from './types';
import { AssistantInfo } from '~/hooks/useAssistantsInfo';
import { AssistantsEndpoint, EModelEndpoint, isAssistantsEndpoint } from 'librechat-data-provider';

export default function AssistantContent({
  conversation,
  assistantMap,
  assistantList,
  setSelectedAssist,
  setSelectedPrompt,
  setCurrentAssistId,
  setSelectedQuestion,
}: AssistantContentProps) {
  const renderAssistants = (list: AssistantInfo[]) => {
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

  let { endpoint, assistant_id } = conversation ?? { endpoint: '', assistant_id: null };
  const assistantId = assistant_id || null;

  const isAssistant = isAssistantsEndpoint(endpoint);
  const assistant = isAssistant ? assistantMap?.[endpoint || ''][assistantId ?? ''] : undefined;
  const { onSelect } = useSelectAssistant(endpoint as AssistantsEndpoint);
  const assistantName = assistant?.name || '';
  const [openDiolog, setOpenDiolog] = useState<boolean>(false);
  const currentAssistant = assistantList?.find((item) => item.Id === assistantId);
  const [randomQuestions, setRandomQuestions] = useState<string[]>([]);
  const [shuffleToggle, setShuffleToggle] = useState<boolean>(false);
  const storedDontShowAgain = localStorage.getItem('dontShowAgain');

  const others = [
    'asst_VMIucXRGsKSFRKzHHO7m9pNl',
    'asst_ZSUVlFGrKY3fI5MrfBdS5ayg',
    'asst_i8yF9pYTi0EbcmFaTFtUrD9S',
    'asst_WZf5wtzqysM4vlJ1WLTJrASj',
    'asst_etTZeaPgTnTHWaWVTyzWRFfk',
    'asst_mLfYHanhjVXsHoctIJIWcE1h',
    'asst_WZf5wtzqysM4vlJ1WLTJrASj',
    'asst_4zSYHOCxudLlfFcHSIqSzP93',
    'asst_9VFRraeUAtBnqubrtzbhpuZp',
    'asst_IHtM4Sr24vOGt3b434xV8vmW',
  ];

  const customPISCOFINS = ['asst_VMIucXRGsKSFRKzHHO7m9pNl', 'asst_ZSUVlFGrKY3fI5MrfBdS5ayg'];

  const isOthers = others.includes(assistantId || '');
  const isCustomPISCOFINS = customPISCOFINS.includes(assistantId || '');

  // Effect to sync assistantId with currentAssistId
  useEffect(() => {
    if (assistantId) {
      setCurrentAssistId(assistantId);
    }
  }, [assistantId, setCurrentAssistId]);

  // Effect to update questions when currentAssistant changes
  useEffect(() => {
    if (currentAssistant?.['Perguntas do dia']) {
      const questions = currentAssistant['Perguntas do dia']
        .split('\n')
        .filter((q) => q.trim() !== '')
        .map((question) => question.replace(/^\d+\.\s*/, ''));
      setRandomQuestions(shuffleArray(questions));
    }
  }, [currentAssistant, shuffleToggle]);

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    alert('Texto copiado!');
  };

  function shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const customPrompts = () => {
    return (
      <div className="grid mx-[6vw] mt-10 grid-cols-1 gap-4">
        {randomQuestions
          .map((question, index) => (
            <div
              key={`CustomQuestion-${index}-${assistantId}-${shuffleToggle}`}
              className="animate__animated animate__fadeInLeft transform transition duration-700 ease-in-out grid grid-cols-2 gap-10"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className={`flex items-center space-x-4 rounded-lg border p-4 shadow-md transition-shadow duration-300 dark:bg-transparent ${
                index % 3 === 0
                  ? "bg-yellow-400"
                  : index % 3 === 1
                  ? "bg-blue-400"
                  : "bg-green-400"
              }`}>
                <div className={`rounded-full px-4 py-2 h-10 w-30 text-white ${
                  index % 3 === 0
                    ? "bg-yellow-600"
                    : index % 3 === 1
                    ? "bg-blue-600"
                    : "bg-green-600"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(question);
                  }}
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
  };

  const customButtons = () => {
    return (
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
  };

  const content = () => {
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
      return customButtons();
    } else {
      return customPrompts();
    }
  };

  return (
    <div className="">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            {CurrentAssistant(assistantName)}
          </div>
          <div className="flex items-center justify-end">
            {AssistentesGrid(renderAssistants(assistantList || []), onSelect)}
          </div>
        </div>
        {content()}
      {storedDontShowAgain !== 'true' && (
        <HelpDialog showHelpDialog={openDiolog} setShowHelpDialog={setOpenDiolog} />
      )}
    </div>
  );
}
