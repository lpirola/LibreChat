import { memo, useCallback, useEffect, useState } from 'react';
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

function ChatView({ index = 0 }: { index?: number }) {
  const { conversationId } = useParams();
  const rootSubmission = useRecoilValue(store.submissionByIndex(index));
  const addedSubmission = useRecoilValue(store.submissionByIndex(index + 1));

  const [loadingPrompts, setLoadingPrompts] = useState<boolean>(false);
  const [isAssistantSelected, setIsAssistantSelected] = useState<boolean>(false);
  const [currentAssistId, setCurrentAssistId] = useState<string>('');

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const [assistantList] = useLocalStorage<AssistantInfo[] | null>('AssistantList', []);
  const currentAssistant = assistantList?.find((item) => item.Id == currentAssistId);
  const questions =
    currentAssistant?.['Perguntas do dia']
      ?.split('\n')
      .filter((q) => q.trim() !== '')
      .map((question) => question.replace(/^\d+\.\s*/, ''))
      .slice(0, 2) || [];

  const fileMap = useFileMapContext();

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

  const updatedMessagesTree = messagesTree?.map((message) => {
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
  });

  const chatHelpers = useChatHelpers(index, conversationId);
  const addedChatHelpers = useAddedResponse({ rootIndex: index });

  GetPromptFiltersLists();
  GetAssistantsInfo();

  useSSE(rootSubmission, chatHelpers, false);
  useSSE(addedSubmission, addedChatHelpers, true);

  const methods = useForm<ChatFormValues>({
    defaultValues: { text: '' },
  });

  useEffect(() => {
    if (!isAssistantSelected) {
      setIsAssistantSelected(true);
    }
  }, [isAssistantSelected]);

  function shuffleArray(array: []) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  let content: JSX.Element | null | undefined;
  if (isLoading && conversationId !== 'new') {
    content = (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="opacity-0" />
      </div>
    );
  } else if (messagesTree && messagesTree.length !== 0) {
    content = <MessagesView messagesTree={updatedMessagesTree} Header={<Header />} />;
  } else if (conversationId == 'new' && !isAssistantSelected) {
    content = (
      <AssistantSelector
        Header={<Header />}
        setIsAssistantSelected={setIsAssistantSelected}
        setCurrentAssistId={setCurrentAssistId}
        setSelectedQuestion={setSelectedQuestion}
      />
    );
  } else {
    content = (
      <Landing
        Header={<Header />}
        setSelectedAssist={setIsAssistantSelected}
        setCurrentAssistId={setCurrentAssistId}
        setSelectedPrompt={setSelectedPrompt}
        setSelectedQuestion={setSelectedQuestion}
      />
    );
  }


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
