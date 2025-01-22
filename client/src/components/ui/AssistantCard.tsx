import React, { ReactNode } from 'react';

export const AssistantCard = ({
  id,
  name,
  handleSelectAssistant,
  setCurrentAssistId,
}: {
  id: string;
  name: string;
  handleSelectAssistant: any;
  setCurrentAssistId: any
}) => {
  const assistIcons = {
    'PIS/COFINS - dúvidas gerais': '📝',
    'PIS/COFINS - Supermercado - Não Cumulativo': '🛒',
    'PIS/COFINS - Supermercado - Cumulativo': '💰',
    'Desoneração e Reoneração da Folha': '📊',
    'Direito Empresarial': '⚖️',
    'Fiscal': '💼',
    'Dr Cafuringa': '🧑‍⚖️',
    'Reforma Tributaria': '🔄',
    'Apoio em Defesas': '🙋',
  };

  const getIcon = (assistName) => assistIcons[assistName.trim()] || '📃';

  const colorTitle = name.includes('PIS/COFINS') ? 'bg-green-50' : 'bg-orange-50';
  const colorTitleHover = name.includes('PIS/COFINS') ? 'hover:bg-blue-200' : 'hover:bg-orange-200';

  return (
    <button
      className={`flex w-full rounded-lg ${colorTitle} p-4 transtion duration-300 hover:scale-105 ${colorTitleHover}`}
      onClick={() => {handleSelectAssistant(id); setCurrentAssistId(id)}}
    >
      <div>{getIcon(name)}</div>
      <div className="relative flex flex-1 flex-col items-start">
        <div className="grid gap-1">
          <span className="text-md ml-2 text-left">{name}</span>
        </div>
      </div>
    </button>
  );
};