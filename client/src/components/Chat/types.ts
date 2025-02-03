import type { ReactNode } from 'react';
import type { TAgentsMap, TAssistantsMap, TConversation } from 'librechat-data-provider';
import type { Prompt } from './Messages/PromptGenerator';
import type { AssistantInfo } from '~/hooks/useAssistantsInfo';

export interface LandingProps {
  Header?: ReactNode;
  setSelectedPrompt: React.Dispatch<React.SetStateAction<Prompt | null>>;
  setSelectedAssist: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentAssistId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedQuestion: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface LandingHeaderProps {
  Header?: ReactNode;
  conversation: TConversation | null;
  agentsMap: TAgentsMap | undefined;
  assistantMap: TAssistantsMap | undefined;
  endpointsConfig: any;
  startupConfig: any;
}

export interface AssistantContentProps {
  conversation: TConversation | null;
  assistantMap: TAssistantsMap | undefined;
  assistantList: AssistantInfo[] | null;
  setSelectedAssist: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedPrompt: React.Dispatch<React.SetStateAction<Prompt | null>>;
  setCurrentAssistId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedQuestion: React.Dispatch<React.SetStateAction<string | null>>;
}
