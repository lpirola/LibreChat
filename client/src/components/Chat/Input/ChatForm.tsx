import { memo, useRef, useMemo, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  supportsFiles,
  mergeFileConfig,
  isAssistantsEndpoint,
  fileConfig as defaultFileConfig,
} from 'librechat-data-provider';
import {
  useChatContext,
  useChatFormContext,
  useAddedChatContext,
  useAssistantsMapContext,
} from '~/Providers';
import {
  useTextarea,
  useAutoSave,
  useRequiresKey,
  useHandleKeyUp,
  useQueryParams,
  useSubmitMessage,
} from '~/hooks';
import { cn, removeFocusRings, checkIfScrollable } from '~/utils';
import FileFormWrapper from './Files/FileFormWrapper';
import { TextareaAutosize } from '~/components/ui';
import { useGetFileConfig } from '~/data-provider';
import TextareaHeader from './TextareaHeader';
import PromptsCommand from './PromptsCommand';
import AudioRecorder from './AudioRecorder';
import { mainTextareaId } from '~/common';
import CollapseChat from './CollapseChat';
import StreamAudio from './StreamAudio';
import StopButton from './StopButton';
import SendButton from './SendButton';
import Mention from './Mention';
import store from '~/store';

const ChatForm = ({ index = 0, selectedPrompt, loadingPrompts, selectedQuestion, assistantQuestions, setAssistant }) => {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  useQueryParams({ textAreaRef });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const SpeechToText = useRecoilValue(store.speechToText);
  const TextToSpeech = useRecoilValue(store.textToSpeech);
  const automaticPlayback = useRecoilValue(store.automaticPlayback);
  const maximizeChatSpace = useRecoilValue(store.maximizeChatSpace);

  const isSearching = useRecoilValue(store.isSearching);
  const [showStopButton, setShowStopButton] = useRecoilState(store.showStopButtonByIndex(index));
  const [showPlusPopover, setShowPlusPopover] = useRecoilState(store.showPlusPopoverFamily(index));
  const [showMentionPopover, setShowMentionPopover] = useRecoilState(
    store.showMentionPopoverFamily(index),
  );

  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);

  const [questions, setQuestions] = useState<string[]>([]);
  const [selectedResume, setSelectedResume] = useState('');

  const handleResumeButtonClick = (value) => {
    setSelectedResume(value);
  };

  const chatDirection = useRecoilValue(store.chatDirection).toLowerCase();
  const isRTL = chatDirection === 'rtl';

  const { requiresKey } = useRequiresKey();
  const handleKeyUp = useHandleKeyUp({
    index,
    textAreaRef,
    setShowPlusPopover,
    setShowMentionPopover,
  });
  const { handlePaste, handleKeyDown, handleCompositionStart, handleCompositionEnd } = useTextarea({
    textAreaRef,
    submitButtonRef,
    setIsScrollable,
    disabled: !!(requiresKey ?? false),
  });

  const {
    files,
    setFiles,
    conversation,
    isSubmitting,
    filesLoading,
    setFilesLoading,
    newConversation,
    handleStopGenerating,
    getMessages,
  } = useChatContext();
  const methods = useChatFormContext();
  const {
    addedIndex,
    generateConversation,
    conversation: addedConvo,
    setConversation: setAddedConvo,
    isSubmitting: isSubmittingAdded,
  } = useAddedChatContext();
  const showStopAdded = useRecoilValue(store.showStopButtonByIndex(addedIndex));

  const { clearDraft } = useAutoSave({
    conversationId: useMemo(() => conversation?.conversationId, [conversation]),
    textAreaRef,
    files,
    setFiles,
  });

  const assistantMap = useAssistantsMapContext();
  const { submitMessage, submitPrompt } = useSubmitMessage({ clearDraft });

  const { endpoint: _endpoint, endpointType } = conversation ?? { endpoint: null };
  const endpoint = endpointType ?? _endpoint;

  const { data: fileConfig = defaultFileConfig } = useGetFileConfig({
    select: (data) => mergeFileConfig(data),
  });

  const handleCreateQuestions = async () => {
    const latestMessages = getMessages() ?? [];
    const lastMessage = latestMessages
      .filter((conversation) => conversation.isCreatedByUser == false)
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt as string).getTime();
        const dateB = new Date(b.updatedAt as string).getTime();
        return dateB - dateA;
      })
      .slice(0, 1);

    try {
      let body = {
        question: lastMessage[0]?.content[0]?.text.value,
        assitantId: conversation?.assistant_id,
      };
      const response: AxiosResponse = await axios.post(
        'https://automacao.iasolaris.com.br/webhook/0d035650-3fc3-4954-8f3d-3b83f3855bf8',
        body,
      );

      const responseData = response.data;
      const parsedContent: string[] = JSON.parse(responseData.content);
      setQuestions(parsedContent);
      setLoadingQuestions(false);
    } catch (error) {
      setLoadingQuestions(false);
    }
  };

  const buttons = [
    {
      id: 'faq',
      text: '❔ Perguntas Frequentes (FAQ)',
      onClick: () => {
        handleCreateQuestions();
        setLoadingQuestions(true);
      },
      condition: conversation?.assistant_id !== 'asst_IHtM4Sr24vOGt3b434xV8vmW',
    },
    {
      id: 'assistants',
      text: '🤝 Preciso dos assistentes',
      onClick: () => handleResumeButtonClick('Preciso dos assistentes'),
      condition: !['asst_VMIucXRGsKSFRKzHHO7m9pNl', 'asst_ZSUVlFGrKY3fI5MrfBdS5ayg', 'asst_i8yF9pYTi0EbcmFaTFtUrD9S', 'asst_IHtM4Sr24vOGt3b434xV8vmW', 'asst_mLfYHanhjVXsHoctIJIWcE1h'].includes(conversation?.assistant_id),
    },
    {
      id: 'cafuringa',
      text: '🤵 Parecer do Dr. Cafuringa',
      onClick: () => handleResumeButtonClick('Parecer do Dr. Cafuringa'),
      condition: !['asst_i8yF9pYTi0EbcmFaTFtUrD9S', 'asst_mLfYHanhjVXsHoctIJIWcE1h'].includes(conversation?.assistant_id),
    },
    {
      id: 'cafuringa',
      text: '🤵 Parecer especialista',
      onClick: () => handleResumeButtonClick('Gere uma tabela com 3 pareceres'),
      condition: conversation?.assistant_id == 'asst_mLfYHanhjVXsHoctIJIWcE1h',
    },
    {
      id: 'missing-info',
      text: '🧐 Informações que faltam',
      onClick: () => handleResumeButtonClick('Informações que faltam'),
      condition: conversation?.assistant_id !== 'asst_IHtM4Sr24vOGt3b434xV8vmW',
    },
    {
      id: 'simulate-case',
      text: '🖊️ Simule um caso',
      onClick: () => handleResumeButtonClick('Simule um caso'),
      condition: conversation?.assistant_id !== 'asst_IHtM4Sr24vOGt3b434xV8vmW',
    },
    {
      id: 'experts-citation',
      text: '👨‍🎓 Citação de especialistas',
      onClick: () => handleResumeButtonClick('Citação de especialistas'),
      condition: !['asst_i8yF9pYTi0EbcmFaTFtUrD9S', 'asst_mLfYHanhjVXsHoctIJIWcE1h'].includes(conversation?.assistant_id),
    },
    {
      id: 'different-approaches',
      text: '💭 Abordagens diferentes',
      onClick: () => handleResumeButtonClick('Abordagens diferentes'),
      condition: conversation?.assistant_id !== 'asst_IHtM4Sr24vOGt3b434xV8vmW',
    },
    {
      id: 'defense-citation',
      text: '🛡️ Simular',
      onClick: () => handleResumeButtonClick('Simular um cenário de defesa fiscal e testar argumentos contra possíveis contra-argumentos do Fisco.'),
      condition: conversation?.assistant_id == 'asst_IHtM4Sr24vOGt3b434xV8vmW',
    },
    {
      id: 'documents',
      text: '📁 Documento',
      onClick: () => handleResumeButtonClick('Fazer o documento de petições para impugnação, recurso, revisão administrativa. Ou outro com os dados do caso e no padrão normatizado no contexto apresentado.'),
      condition: conversation?.assistant_id == 'asst_IHtM4Sr24vOGt3b434xV8vmW',
    },
    {
      id: 'plans',
      text: '💡 Estratégias',
      onClick: () => handleResumeButtonClick('Listar diferentes estratégias para impugnação ou recurso.'),
      condition: conversation?.assistant_id == 'asst_IHtM4Sr24vOGt3b434xV8vmW',
    },
    {
      id: 'find-erros',
      text: '🚨 Apontar Erros',
      onClick: () => handleResumeButtonClick('Apontar erros comuns da defesa e do fisco para este caso. Formate em tabela em ordem de poderação'),
      condition: conversation?.assistant_id == 'asst_IHtM4Sr24vOGt3b434xV8vmW',
    },
    {
      id: 'complement-defense',
      text: '📑 Complementar Defesa',
      onClick: () => handleResumeButtonClick('Sugerir argumentos adicionais para reforçar a defesa apresentada'),
      condition: conversation?.assistant_id == 'asst_IHtM4Sr24vOGt3b434xV8vmW',
    },
    {
      id: 'reverse-defense',
      text: '🔄 "Intepretação ao contrário"',
      onClick: () => handleResumeButtonClick('Faça "Intepretação ao contrário" de uma norma ou jurisdição'),
      condition: conversation?.assistant_id == 'asst_IHtM4Sr24vOGt3b434xV8vmW',
    },
  ];


  const endpointFileConfig = fileConfig.endpoints[endpoint ?? ''];
  const invalidAssistant = useMemo(
    () =>
      isAssistantsEndpoint(conversation?.endpoint) &&
      (!(conversation?.assistant_id ?? '') ||
        !assistantMap?.[conversation?.endpoint ?? ''][conversation?.assistant_id ?? '']),
    [conversation?.assistant_id, conversation?.endpoint, assistantMap],
  );
  const disableInputs = useMemo(
    () => !!((requiresKey ?? false) || invalidAssistant),
    [requiresKey, invalidAssistant],
  );

  const { ref, ...registerProps } = methods.register('text', {
    required: true,
    onChange: (e) => {
      methods.setValue('text', e.target.value, { shouldValidate: true });
    },
  });

  useEffect(() => {
    if (!isSearching && textAreaRef.current && !disableInputs) {
      textAreaRef.current.focus();
    }
  }, [isSearching, disableInputs]);

  useEffect(() => {
    if (textAreaRef.current) {
      checkIfScrollable(textAreaRef.current);
    }
  }, []);

  const endpointSupportsFiles: boolean = supportsFiles[endpointType ?? endpoint ?? ''] ?? false;
  const isUploadDisabled: boolean = endpointFileConfig?.disabled ?? false;

  const baseClasses = cn(
    'md:py-3.5 m-0 w-full resize-none bg-surface-tertiary py-[13px] placeholder-black/50 dark:placeholder-white/50 [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)]',
    isCollapsed ? 'max-h-[52px]' : 'max-h-[65vh] md:max-h-[75vh]',
  );

  const uploadActive = endpointSupportsFiles && !isUploadDisabled;
  const speechClass = isRTL
    ? `pr-${uploadActive ? '12' : '4'} pl-12`
    : `pl-${uploadActive ? '12' : '4'} pr-12`;


  useEffect(() => {
    if (selectedPrompt) {
      const data = {
        text: `Regime: ${selectedPrompt.regime};
                CNAE: ${selectedPrompt.cnae};
                Tópico: ${selectedPrompt.topic};
                ${selectedPrompt.question}`,
      };
      submitMessage(data);
      loadingPrompts(false);
    }
  }, [selectedPrompt]);

  useEffect(() => {
    if (selectedQuestion) {
      const data = {
        text: selectedQuestion,
      };
      submitMessage(data);
    }
  }, [selectedQuestion]);

  useEffect(() => {
    if (selectedResume !== '') {
      const data = {
        text: selectedResume,
      };
      submitMessage(data);
      setSelectedResume('');
    }
  }, [selectedResume]);

  useEffect(() => {
    setQuestions([]);
    setLoadingQuestions(false);
  }, [conversation?.conversationId]);

  
  return (
    <>
      {loadingQuestions ? (
        <h1 className="text-center text-2xl font-bold dark:text-white">
          Aguarde elaborar as perguntas...
        </h1>
      ) : (
        <div className="relative flex flex-col items-center justify-center gap-2">
          {questions.map((item, index) => (
            <button
              key={index}
              className="border-black-400 dark:border-white-400 flex items-center rounded-full border px-4 py-2 text-black hover:bg-yellow-400 dark:text-white dark:hover:text-black"
              onClick={() => {
                setQuestions([]);
                const data = {
                  text: item,
                };
                submitMessage(data);
              }}
            >
              <span className="text-black dark:text-white dark:hover:text-black">{item}</span>
            </button>
          ))}
        </div>
      )}
      {conversation?.conversationId !== 'new' && (
        <div className="flex items-center justify-center">
          <div className="flex w-[100vw] flex-wrap items-center justify-center gap-2 rounded-md p-4">
            {buttons
              .filter(button => button.condition)
              .map(button => (
                <button
                  key={button.id}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-black"
                  onClick={button.onClick}
                >
                  {button.text}
                </button>
              ))}
          </div>
        </div>
      )}

      <form
      onSubmit={methods.handleSubmit((data) => submitMessage(data))}
      className={cn(
        'mx-auto flex flex-row gap-3 pl-2 transition-all duration-200 last:mb-2',
        maximizeChatSpace ? 'w-full max-w-full' : 'md:max-w-2xl xl:max-w-3xl',
      )}  
      >
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="flex w-full items-center">
            {showPlusPopover && !isAssistantsEndpoint(endpoint) && (
              <Mention
                setShowMentionPopover={setShowPlusPopover}
                newConversation={generateConversation}
                textAreaRef={textAreaRef}
                commandChar="+"
                placeholder="com_ui_add_model_preset"
                includeAssistants={false}
              />
            )}
            {showMentionPopover && (
              <Mention
                setShowMentionPopover={setShowMentionPopover}
                newConversation={newConversation}
                textAreaRef={textAreaRef}
              />
            )}
            <PromptsCommand index={index} textAreaRef={textAreaRef} submitPrompt={submitPrompt} />
            <div className="transitional-all relative flex w-full flex-grow flex-col overflow-hidden rounded-3xl bg-surface-tertiary text-text-primary duration-200">
              <TextareaHeader addedConvo={addedConvo} setAddedConvo={setAddedConvo} />
              <FileFormWrapper disableInputs={disableInputs}>
                {endpoint && (
                  <>
                    <CollapseChat
                      isCollapsed={isCollapsed}
                      isScrollable={isScrollable}
                      setIsCollapsed={setIsCollapsed}
                    />
                    <TextareaAutosize
                      {...registerProps}
                      ref={(e) => {
                        ref(e);
                        textAreaRef.current = e;
                      }}
                      disabled={disableInputs}
                      onPaste={handlePaste}
                      onKeyDown={handleKeyDown}
                      onKeyUp={handleKeyUp}
                      onHeightChange={() => {
                        if (textAreaRef.current) {
                          const scrollable = checkIfScrollable(textAreaRef.current);
                          setIsScrollable(scrollable);
                        }
                      }}
                      onCompositionStart={handleCompositionStart}
                      onCompositionEnd={handleCompositionEnd}
                      id={mainTextareaId}
                      tabIndex={0}
                      data-testid="text-input"
                      rows={1}
                      onFocus={() => isCollapsed && setIsCollapsed(false)}
                      onClick={() => isCollapsed && setIsCollapsed(false)}
                      style={{ height: 44, overflowY: 'auto' }}
                      className={cn(
                        baseClasses,
                        speechClass,
                        removeFocusRings,
                        'transition-[max-height] duration-200',
                      )}
                    />
                  </>
                )}
              </FileFormWrapper>
              {SpeechToText && (
                <AudioRecorder
                  isRTL={isRTL}
                  methods={methods}
                  ask={submitMessage}
                  textAreaRef={textAreaRef}
                  disabled={!!disableInputs}
                  isSubmitting={isSubmitting}
                />
              )}
              {TextToSpeech && automaticPlayback && <StreamAudio index={index} />}
            </div>
            <div
              className={cn(
                'mb-[5px] ml-[8px] flex flex-col items-end justify-end',
                isRTL && 'order-first mr-[8px]',
              )}
              style={{ alignSelf: 'flex-end' }}
            >
              {(isSubmitting || isSubmittingAdded) && (showStopButton || showStopAdded) ? (
                <StopButton stop={handleStopGenerating} setShowStopButton={setShowStopButton} />
              ) : (
                endpoint && (
                  <SendButton
                    ref={submitButtonRef}
                    control={methods.control}
                    disabled={!!(filesLoading || isSubmitting || disableInputs)}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default memo(ChatForm);
