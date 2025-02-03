/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo } from 'react';
import PromptGenerator, { PromptGeneratorFilters } from './Chat/Messages/PromptGenerator';
import ControlCombobox from './ui/ControlCombobox';
import RadioButton from './ui/RadioButton';
import { useLocalize, useLocalStorage } from '~/hooks';
import { EModelEndpoint } from 'librechat-data-provider';
import { useGetEndpointsQuery, useGetStartupConfig } from 'librechat-data-provider/react-query';
import { CNAE, Topic } from '~/hooks/usePromptFilters';
import { getIconEndpoint } from '~/utils';
import { OptionWithIcon } from '~/common';

interface LandingAssistContainerProps {
  assistant: any;
  endpoint: any;
  conversation: any;
  setSelectedPrompt: any;
}

export const LandingAssistContainer = ({
  assistant,
  endpoint,
  conversation,
  setSelectedPrompt,
}: LandingAssistContainerProps) => {
  const assistantDesc = assistant?.description || '';
  const avatar = assistant?.metadata?.avatar || '';

  const { data: startupConfig } = useGetStartupConfig();
  const { data: endpointsConfig } = useGetEndpointsQuery();

  const [selectedValue, setSelectedValue] = React.useState('option1');
  const [CNAE, setCNAE] = React.useState<CNAE | undefined>();
  const [Topic, setTopic] = React.useState('');
  const [loadingPrompts, setLoadingPrompts] = React.useState<boolean>(false);
  const [promptFilters, setFilters] = React.useState<PromptGeneratorFilters>({
    CNAE: '',
    topic: '',
    opiton: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  const localize = useLocalize();

  if (
    endpoint === EModelEndpoint.chatGPTBrowser ||
    endpoint === EModelEndpoint.azureOpenAI ||
    endpoint === EModelEndpoint.gptPlugins
  ) {
    endpoint = EModelEndpoint.openAI;
  }

  const iconURL = conversation?.iconURL;
  endpoint = getIconEndpoint({ endpointsConfig, iconURL, endpoint });

  const [topicList] = useLocalStorage<Topic[] | null>('TopicList', []);
  const [cnaeList] = useLocalStorage<CNAE[] | null>('CNAEList', []);

  const assistantOptions: OptionWithIcon[] = useMemo(() => {
    if (cnaeList) {
      const groupedCNAE = {};
      cnaeList.forEach((item) => {
        const { 'Codigo CNAE': code, Descrição: description } = item;
        if (!groupedCNAE[code]) {
          groupedCNAE[code] = {
            label: `${code} - ${description}`,
            value: code,
          };
        } else {
          groupedCNAE[code].label += `, ${description}`;
        }
      });
      return Object.values(groupedCNAE);
    }
    return [];
  }, [cnaeList]);

  const topicOpition = useMemo(() => {
    if (topicList) {
      return topicList.map((name) => {
        return {
          label: name.Tópico,
          value: name.Tópico,
        };
      });
    }
    return [];
  }, [topicList]);

  const setCNAEValue = useCallback(
    (model: string) => {
      if (cnaeList) {
        setCNAE(cnaeList.find((item) => item['Codigo CNAE'] === model));
      }
    },
    [setCNAE, cnaeList],
  );

  const setTopicValue = useCallback(
    (model: string) => {
      setTopic(model);
    },
    [setTopic],
  );

  useEffect(() => {
    if (Topic && CNAE && selectedValue) {
      setFilters({
        CNAE: `${CNAE['Codigo CNAE']} ${CNAE.Descrição}`,
        topic: Topic,
        opiton: selectedValue,
      });
    }
  }, [Topic, CNAE, selectedValue]);

  const containerClassName =
    'shadow-stroke relative flex h-full items-center justify-center rounded-full bg-white text-black';

  return (
    <div className="justify-top mt-20 flex h-full flex-col items-center">
      <div className="mb-10 flex gap-6">
        <span>Regime:</span>
        <RadioButton
          id="option1"
          name="Cumulativo"
          value="Cumulativo"
          checked={selectedValue === 'Cumulativo'}
          onChange={handleChange}
        />
        <RadioButton
          id="option2"
          name="Não Cumulativo"
          value="Não Cumulativo"
          checked={selectedValue === 'Não Cumulativo'}
          onChange={handleChange}
        />
        <RadioButton
          id="option3"
          name="Misto"
          value="Misto"
          checked={selectedValue === 'Misto'}
          onChange={handleChange}
        />
      </div>
      <div className="grid auto-cols-max grid-flow-col">
        <ControlCombobox
          selectedValue={CNAE == null ? '' : CNAE['Codigo CNAE']}
          displayValue={CNAE == null ? 'Selecione o CNAE' : CNAE['Codigo CNAE']}
          selectPlaceholder={'Selecione o CNAE'}
          searchPlaceholder={'Selecione o CNAE'}
          isCollapsed={false}
          ariaLabel={'CNAE'}
          setValue={setCNAEValue}
          items={assistantOptions}
        />
        <ControlCombobox
          selectedValue={Topic}
          displayValue={Topic == '' ? 'Selecione o topico' : Topic}
          selectPlaceholder={'Selecione o topico'}
          searchPlaceholder={'Selecione o topico'}
          isCollapsed={false}
          ariaLabel={'Topic'}
          setValue={setTopicValue}
          items={topicOpition}
        />
      </div>
      <div className="mt-10 flex flex-row space-x-7"></div>
      {promptFilters.topic === '' && promptFilters.CNAE === '' && promptFilters.opiton === '' ? (
        <div className="flex items-center justify-center">
          <div className="my-6 flex flex-col items-center justify-center">
            <i className="fa-solid fa-circle-question text-4xl text-gray-700 dark:text-white"></i>
            <p className="mt-2 text-xl font-semibold text-gray-700 dark:text-white">
              Preencha os campos acima para gerar prompts
            </p>
          </div>
        </div>
      ) : (
        <PromptGenerator promptFilters={promptFilters} setSelectedPrompt={setSelectedPrompt} />
      )}
    </div>
  );
};