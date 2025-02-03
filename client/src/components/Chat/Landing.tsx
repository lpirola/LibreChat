import { useGetEndpointsQuery, useGetStartupConfig } from 'librechat-data-provider/react-query';
import { useChatContext, useAgentsMapContext, useAssistantsMapContext } from '~/Providers';
import { useLocalStorage } from '~/hooks';
import type { LandingProps } from './types';
import AssistantContent from './AssistantContentSL';
import LandingHeader from './LandingSL';


export default function Landing({ 
  Header,
  setSelectedAssist,
  setSelectedPrompt,
  setCurrentAssistId,
  setSelectedQuestion,
}: LandingProps) {
  const { conversation } = useChatContext();
  const agentsMap = useAgentsMapContext();
  const assistantMap = useAssistantsMapContext();
  const { data: startupConfig } = useGetStartupConfig();
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const [assistantList] = useLocalStorage<AssistantInfo[] | null>('AssistantList', []);

  return (
    <div className="relative">
      <LandingHeader 
        Header={Header}
        conversation={conversation}
        agentsMap={agentsMap}
        assistantMap={assistantMap}
        endpointsConfig={endpointsConfig}
        startupConfig={startupConfig}
      />
      <AssistantContent
        conversation={conversation}
        assistantMap={assistantMap}
        assistantList={assistantList}
        setSelectedAssist={setSelectedAssist}
        setSelectedPrompt={setSelectedPrompt}
        setCurrentAssistId={setCurrentAssistId}
        setSelectedQuestion={setSelectedQuestion}
      />
    </div>
  );
}
