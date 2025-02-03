interface AssistSectionProps {
  title: string;
  assistants: any[];
  handleOpenContent: any;
}

export const AssistSection = ({ title, assistants, handleOpenContent }: AssistSectionProps) => {
  const colorTitle = title == '📊 PIS/COFINS' ? 'bg-green-50' : 'bg-orange-50';
  const colorBar = title == '📊 PIS/COFINS' ? 'bg-green-300' : 'bg-orange-300';

  return (
    <div className={`flex rounded-lg ${colorTitle} shadow-lg`}>
      {/* Linha verde do lado esquerdo */}
      <div className={`w-2 rounded-l-lg ${colorBar}`}></div>

      {/* Conteúdo principal */}
      <div className="flex-1 pl-4 py-5">
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-bold">{title}</h2>
          <span className="rounded-lg bg-gray-200 p-2 text-sm">
            {assistants.length} ferramentas
          </span>
        </div>
        <div className="space-y-2 pr-4">
          {assistants.map((assistant, index) => (
            <div key={index} onClick={() => handleOpenContent()}>
              {assistant}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};