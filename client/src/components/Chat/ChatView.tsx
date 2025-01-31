import { useMemo, memo, useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetMessagesByConvoId } from 'librechat-data-provider/react-query';
import type { TMessage } from 'librechat-data-provider';
import type { ChatFormValues } from '~/common';
import { ChatContext, AddedChatContext, useFileMapContext, ChatFormProvider } from '~/Providers';
import { useChatHelpers, useAddedResponse, useSSE, useSelectAssistant, useLocalStorage, GetPromptFiltersLists } from '~/hooks';
import MessagesView from './Messages/MessagesView';
import { Spinner } from '~/components/svg';
import Presentation from './Presentation';
import ChatForm from './Input/ChatForm';
import { buildTree } from '~/utils';
import Landing from './Landing';
import Header from './Header';
import Footer from './Footer';
import store from '~/store';
import { Prompt } from './Messages/PromptGenerator';
import GetAssistantsInfo, { AssistantInfo } from '~/hooks/useAssistantsInfo';
import AssistantSelector from './AssistantSelector';
import { useChatContext } from '~/Providers';

// Types and Interfaces
interface ChatViewProps {
  index?: number;
}

interface AssistantQuestion {
  text: string;
  id: string;
}

// Component
function ChatView({ index = 0 }: ChatViewProps) {
  // Hooks and Context
  const { conversationId } = useParams();
  const fileMap = useFileMapContext();
  const methods = useForm<ChatFormValues>({
    defaultValues: { text: '' },
  });

  // Recoil State
  const rootSubmission = useRecoilValue(store.submissionByIndex(index));
  const addedSubmission = useRecoilValue(store.submissionByIndex(index + 1));

  // Local State
  const [loadingPrompts, setLoadingPrompts] = useState<boolean>(false);
  const [isAssistantSelected, setIsAssistantSelected] = useState<boolean>(false);
  const [currentAssistId, setCurrentAssistId] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const { conversation } = useChatContext();
  
  let { endpoint, assistant_id } = conversation ?? { endpoint: '', assistant_id: null };

  // Assistant Data
  const [assistantList] = useLocalStorage<AssistantInfo[] | null>('AssistantList', []);
  const currentAssistant = assistantList?.find((item) => item.Id === currentAssistId);
  const questions = useMemo(() => 
    currentAssistant?.['Perguntas do dia']
      ?.split('\n')
      .filter((q) => q.trim() !== '')
      .map((question) => question.replace(/^\d+\.\s*/, ''))
      .slice(0, 2) || [],
    [currentAssistant]
  );

  // Messages Data
  const { data: messagesTree = null, isLoading } = useGetMessagesByConvoId(conversationId ?? '', {
    select: useCallback(
      (data: TMessage[]) => {
        const dataTree = buildTree({ messages: data, fileMap });
        return dataTree?.length === 0 ? null : dataTree ?? null;
      },
      [fileMap],
    ),
    enabled: !!fileMap,
  });

  const updatedMessagesTree = useMemo(() => 
    messagesTree?.map((message) => {
      if (
        message.text.includes('CNAE:') &&
        message.parentMessageId === '00000000-0000-0000-0000-000000000000'
      ) {
        return {
          ...message,
          text: 'Gerando...',
        };
      }
      return message;
    }),
    [messagesTree]
  );

  // Chat Helpers and Effects
  const chatHelpers = useChatHelpers(index, conversationId);
  const addedChatHelpers = useAddedResponse({ rootIndex: index });

  useSSE(rootSubmission, chatHelpers, false);
  useSSE(addedSubmission, addedChatHelpers, true);

  // Initialize Data
  GetPromptFiltersLists();
  GetAssistantsInfo();

  // Effects
  useEffect(() => {
    if (!isAssistantSelected) {
      setIsAssistantSelected(true);
    }
  }, [isAssistantSelected]);

  // Helper Functions
  const shuffleArray = useCallback((array: []) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  // Render Content
  const content = (() => {
    if (isLoading && conversationId !== 'new') {
      return (
        <div className="flex h-screen items-center justify-center">
          <Spinner className="opacity-0" />
        </div>
      );
    }

    if (messagesTree && messagesTree.length !== 0) {
      return <MessagesView messagesTree={updatedMessagesTree} Header={<Header />} />;
    }

    if (conversationId === 'new' && !currentAssistant) {
      return (
        <AssistantSelector
          Header={<Header />}
          setIsAssistantSelected={setIsAssistantSelected}
          setCurrentAssistId={setCurrentAssistId}
          setSelectedQuestion={setSelectedQuestion}
        />
      );
    }

    return (
      <Landing
        Header={<Header />}
        setSelectedAssist={setIsAssistantSelected}
        setCurrentAssistId={setCurrentAssistId}
        setSelectedPrompt={setSelectedPrompt}
        setSelectedQuestion={setSelectedQuestion}
      />
    );
  })();

  return (
    <ChatFormProvider {...methods}>
      <ChatContext.Provider value={chatHelpers}>
        <AddedChatContext.Provider value={addedChatHelpers}>
          <Presentation useSidePanel={true}>
            {content}
            <div className="w-full border-t-0 pl-0 pt-2 dark:border-white/20 md:w-[calc(100%-.5rem)] md:border-t-0 md:border-transparent md:pl-0 md:pt-0 md:dark:border-transparent">
              <ChatForm 
                index={index}
                selectedPrompt={selectedPrompt}
                loadingPrompts={setLoadingPrompts}
                selectedQuestion={selectedQuestion}
                assistantQuestions={questions}
                setAssistant={setCurrentAssistId}
              />
              <Footer />
            </div>
          </Presentation>
        </AddedChatContext.Provider>
      </ChatContext.Provider>
    </ChatFormProvider>
  );
}

export default memo(ChatView);
