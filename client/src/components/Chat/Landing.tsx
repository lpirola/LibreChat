import { useMemo } from 'react';
import { EModelEndpoint, Constants, AssistantsEndpoint } from 'librechat-data-provider';
import { useGetEndpointsQuery, useGetStartupConfig } from 'librechat-data-provider/react-query';
import type * as t from 'librechat-data-provider';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useChatContext, useAgentsMapContext, useAssistantsMapContext } from '~/Providers';
import { useGetAssistantDocsQuery } from '~/data-provider';
import ConvoIcon from '~/components/Endpoints/ConvoIcon';
import { getIconEndpoint, getEntity, cn } from '~/utils';
import { useLocalize, useSubmitMessage, useSelectAssistant, useLocalStorage } from '~/hooks';
import { TooltipAnchor } from '~/components/ui';
import { BirthdayIcon } from '~/components/svg';
import ConvoStarter from './ConvoStarter';
import { AssistentesGrid } from './AssistantGrid';
import { Prompt, PromptGeneratorFilters } from './Messages/PromptGenerator';
import { LandingAssistContainer } from '../LandingAssistContainer';
import HelpDialog from './HelpDialog';
import { AssistantInfo } from '~/hooks/useAssistantsInfo';
import { CurrentAssistant } from '../ui/CurrentAssistant';
import { AssistantCard } from '../ui/AssistantCard'

export default function Landing({
  Header,
  setSelectedAssist,
  setSelectedPrompt,
  setCurrentAssistId,
  setSelectedQuestion,
}: {
  Header?: ReactNode;
  setSelectedPrompt: React.Dispatch<React.SetStateAction<Prompt | null>>;
  setSelectedAssist: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentAssistId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedQuestion: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { conversation } = useChatContext();
  const agentsMap = useAgentsMapContext();
  const assistantMap = useAssistantsMapContext();
  const { data: startupConfig } = useGetStartupConfig();
  const { data: endpointsConfig } = useGetEndpointsQuery();

  const localize = useLocalize();

  let { endpoint, assistant_id } = conversation ?? { endpoint: '', assistant_id: null };

  if (
    endpoint === EModelEndpoint.chatGPTBrowser ||
    endpoint === EModelEndpoint.azureOpenAI ||
    endpoint === EModelEndpoint.gptPlugins
  ) {
    endpoint = EModelEndpoint.openAI;
  }

  const iconURL = conversation?.iconURL;
  const { data: documentsMap = new Map() } = useGetAssistantDocsQuery(getIconEndpoint({ endpointsConfig, iconURL, endpoint }), {
    select: (data) => new Map(data.map((dbA) => [dbA.assistant_id, dbA])),
  });

  const { entity, isAgent, isAssistant } = getEntity({
    endpoint,
    agentsMap,
    assistantMap,
    agent_id: conversation?.agent_id,
    assistant_id: conversation?.assistant_id,
  });

  const name = entity?.name ?? '';
  const description = entity?.description ?? '';
  const avatar = isAgent
    ? (entity as t.Agent | undefined)?.avatar?.filepath ?? ''
    : ((entity as t.Assistant | undefined)?.metadata?.avatar as string | undefined) ?? '';
  const conversation_starters = useMemo(() => {
    /* The user made updates, use client-side cache, or they exist in an Agent */
    if (entity && (entity.conversation_starters?.length ?? 0) > 0) {
      return entity.conversation_starters;
    }
    if (isAgent) {
      return entity?.conversation_starters ?? [];
    }

    /* If none in cache, we use the latest assistant docs */
    const entityDocs = documentsMap.get(entity?.id ?? '');
    return entityDocs?.conversation_starters ?? [];
  }, [documentsMap, isAgent, entity]);

  const containerClassName =
    'shadow-stroke relative flex h-full items-center justify-center rounded-full bg-white text-black';

  const { submitMessage } = useSubmitMessage();
  const sendConversationStarter = (text: string) => submitMessage({ text });

  const getWelcomeMessage = () => {
    const greeting = conversation?.greeting ?? '';
    if (greeting) {
      return greeting;
    }

    if (isAssistant) {
      return localize('com_nav_welcome_assistant');
    }

    if (isAgent) {
      return localize('com_nav_welcome_agent');
    }

    return localize('com_nav_welcome_message');
  };

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

  const assistantId = assistant_id || null;

  // const isAssistant = isAssistantsEndpoint(endpoint);
  const assistant = isAssistant ? assistantMap?.[endpoint || ''][assistantId ?? ''] : undefined;
  const { onSelect } = useSelectAssistant(endpoint as AssistantsEndpoint);
  const [assistantList] = useLocalStorage<AssistantInfo[] | null>('AssistantList', []);
  const assistantName = assistant?.name || '';
  const [openDiolog, setOpenDiolog] = useState<boolean>(false);
  const currentAssistant = assistantList?.find((item) => item.Id == assistantId);
  const [randomQuestions, setRandomQuestions] = useState<string[]>(
    currentAssistant?.['Perguntas do dia']
      ?.split('\n')
      .filter((q) => q.trim() !== '')
      .map((question) => question.replace(/^\d+\.\s*/, '')) || []);
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

  useEffect(() => {
    if (currentAssistant != undefined) {
      setRandomQuestions(shuffleArray(currentAssistant['Perguntas do dia']
        ?.split('\n')
        .filter((q) => q.trim() !== '')
        .map((question) => question.replace(/^\d+\.\s*/, ''))));
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
              className="animate__animated animate__fadeInLeft transform opacity-0 transition duration-700 ease-in-out grid grid-cols-2 gap-10"
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
                    ? "bg-yellow-600" // Tom mais escuro para o fundo
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
                  className="rounded-full h-10 w-30 bg-green-500 px-4 py-2 hover:text-black text-white transition-colors duration-300 hover:bg-yellow-400 "
                >
                ➤ Executar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(question);
                    // setOpenDialog(true);
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
    <div className="relative">
      <div className="absolute left-0 right-0">{Header != null ? Header : null}</div>
      <div className="flex flex-col items-center justify-center">
        <div className={cn('relative h-12 w-12', name && avatar ? 'mb-0' : 'mb-3')}>
          <ConvoIcon
            agentsMap={agentsMap}
            assistantMap={assistantMap}
            conversation={conversation}
            endpointsConfig={endpointsConfig}
            containerClassName={containerClassName}
            context="landing"
            className="h-2/3 w-2/3"
            size={41}
          />
          {startupConfig?.showBirthdayIcon === true ? (
            <TooltipAnchor
              className="absolute bottom-8 right-2.5"
              description={localize('com_ui_happy_birthday')}
            >
              <BirthdayIcon />
            </TooltipAnchor>
          ) : null}
        </div>
        {/* {name ? (
          <div className="flex flex-col items-center gap-0 p-2">
            <div className="text-center text-2xl font-medium dark:text-white">{name}</div>
            <div className="max-w-md text-center text-sm font-normal text-text-primary ">
              {description ? description : localize('com_nav_welcome_message')}
            </div>
            {/* <div className="mt-1 flex items-center gap-1 text-token-text-tertiary">
            <div className="text-sm text-token-text-tertiary">By Daniel Avila</div>
          </div> }
          </div>
        ) : (
          <h2 className="mb-5 max-w-[75vh] px-12 text-center text-lg font-medium dark:text-white md:px-0 md:text-2xl">
            {getWelcomeMessage()}
          </h2>
        )} */}
        <div className="mx-[5vw]">
          {AssistentesGrid(renderAssistants(assistantList || []), onSelect)}
        </div>
        <div className="mx-[6vw]">{CurrentAssistant(assistantName)}</div>
        {content()}
        <HelpDialog showHelpDialog={openDiolog} setShowHelpDialog={setOpenDiolog} />
        <div className="mt-8 flex flex-wrap justify-center gap-3 px-4">
          {conversation_starters.length > 0 &&
            conversation_starters
              .slice(0, Constants.MAX_CONVO_STARTERS)
              .map((text: string, index: number) => (
                <ConvoStarter
                  key={index}
                  text={text}
                  onClick={() => sendConversationStarter(text)}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
