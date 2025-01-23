import { AssistantsEndpoint } from 'librechat-data-provider';
import type { ReactNode } from 'react';
import { useLocalize, useLocalStorage, useSelectAssistant } from '~/hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { AssistantCard } from '../ui/AssistantCard';
import PromptCard from '../ui/PromptCard';
import { AssistantInfo } from '~/hooks/useAssistantsInfo';
import { useChatContext } from '~/Providers';
import { AssistentesGrid } from './AssistantGrid';

export default function AssistantSelector({
  setIsAssistantSelected,
  setSelectedQuestion,
  setCurrentAssistId,
}: {
  Header?: ReactNode;
  setIsAssistantSelected: any;
  setSelectedQuestion: any;
  setCurrentAssistId: any;
}) {
  const { conversation } = useChatContext();
  const { endpoint } = conversation ?? {};

  const { onSelect } = useSelectAssistant(endpoint as AssistantsEndpoint);

  const [assistantList] = useLocalStorage<AssistantInfo[] | null>('AssistantList', []);
  const [hoveredAssistant, setHoveredAssistant] = useState<string>();

  useEffect(() => {
    if (assistantList && assistantList.length > 0 && !hoveredAssistant) {
      setHoveredAssistant(assistantList[0].Id);
    }
  }, [assistantList, hoveredAssistant]);

  if (assistantList === null) {
    return <></>;
  }

  function SelectAssistant(assistant_id: string) {
    onSelect(assistant_id);
    setIsAssistantSelected(true);
    setSelectedQuestion(null);
  }

  function HandleSelectQuestion(assistant_id: string, question: string) {
    onSelect(assistant_id);
    setIsAssistantSelected(true);
    setSelectedQuestion(question);
  }
  const renderAssistants = (list: AssistantInfo[]) => {
    return list.map((assistant, index) => (
      <AssistantCard
        id={assistant.Id}
        name={assistant.Nome}
        key={index}
        handleSelectAssistant={SelectAssistant}
        setCurrentAssistId={setCurrentAssistId}
      />
    ));
  };

  const renderQuestions = () => {
    if (!assistantList || assistantList.length === 0) {
      return <></>;
    }

    return (
      <>
        {assistantList.map((assistant, assistantIndex) => {
          // Filtra as perguntas do assistente atual
          const questions = assistant['Perguntas do dia']
            .split('\n')
            .filter((q) => q.trim() !== '')
            .map((question) => question.replace(/^\d+\.\s*/, ''))
            .slice(0, 3);

          const assistIcons = {
            'PIS/COFINS - dúvidas gerais': '📝',
            'PIS/COFINS - Supermercado - Não Cumulativo': '🛒',
            'PIS/COFINS - Supermercado - Cumulativo': '💰',
            'Desoneração e Reoneração da Folha': '📊',
            'Direito Empresarial': '⚖️',
            'Fiscal': '💼',
            'Dr Cafuringa': '🧑‍⚖️',
            'Reforma Tributaria': '🔄',
            'Mentores': '🎓',
            'Apoio em Defesas': '🙋',
          };

          const assistBarColors = {
            'PIS/COFINS - dúvidas gerais': 'bg-red-200',
            'PIS/COFINS - Supermercado - Não Cumulativo': 'bg-yellow-200',
            'PIS/COFINS - Supermercado - Cumulativo': 'bg-green-200',
            'Desoneração e Reoneração da Folha': 'bg-blue-200',
            'Direito Empresarial': 'bg-indigo-200',
            'Fiscal': 'bg-purple-200',
            'Dr Cafuringa': 'bg-pink-200',
            'Reforma Tributaria': 'bg-teal-200',
            'Mentores': 'bg-fuchsia-200',
            'Apoio em Defesas': 'bg-amber-200',
          };

          const assistBackgroundColors = {
            'PIS/COFINS - dúvidas gerais': 'bg-red-50',
            'PIS/COFINS - Supermercado - Não Cumulativo': 'bg-yellow-50',
            'PIS/COFINS - Supermercado - Cumulativo': 'bg-green-50',
            'Desoneração e Reoneração da Folha': 'bg-blue-50',
            'Direito Empresarial': 'bg-indigo-50',
            'Fiscal': 'bg-purple-50',
            'Dr Cafuringa': 'bg-pink-50',
            'Reforma Tributaria': 'bg-teal-50',
            'Mentores': 'bg-fuchsia-50',
            'Apoio em Defesas': 'bg-amber-50',
          };

          const getIcon = (assistName) => assistIcons[assistName.trim()] || '📃';

          return (
            <div key={`assistant-${assistantIndex}`} className={`flex rounded-lg ${assistBackgroundColors[assistant.Nome.trim()]}`}>
              <div className={`w-2 rounded-l-lg ${assistBarColors[assistant.Nome.trim()]}`}></div>
              <div className="flex-1 py-5 pl-4">
                <div className="mb-4 flex items-center">
                  <span className="text-lg font-semibold dark:text-gray-300">
                    {getIcon(assistant.Nome) + ' ' + assistant.Nome}
                  </span>
                </div>
                {questions.map((question, index) => (
                  <div
                    key={`${assistant.Nome}-${index}`}
                    className={
                      'animate__animated animate__fadeInLeft transform opacity-0 transition duration-700 ease-in-out'
                    }
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <PromptCard
                      assistant_id={assistant.Id}
                      question={question}
                      handleSelectQuestion={HandleSelectQuestion}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="flex-1 overflow-hidden overflow-y-auto">
      <div className="ml-[5vw] mr-[5vw]">
        {AssistentesGrid(renderAssistants(assistantList), SelectAssistant)}
      </div>
      <div className="ml-[25px] mr-[25px] grid grid-cols-3 gap-4 overflow-y-scroll">
        {renderQuestions()}
      </div>
      {/* <div>{paginatedQuestions()}</div> */}
    </div>
  );
}