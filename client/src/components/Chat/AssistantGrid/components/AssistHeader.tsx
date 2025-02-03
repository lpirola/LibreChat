export const AssistHeader = ({
  handleSelectAssistant,
  handleOpenContent,
}: {
  handleSelectAssistant: any;
  handleOpenContent: any;
}) => {
  return (
    <div className="flex items-center space-x-6 rounded-lg bg-gray-50 p-3">
      <button
        className="rounded-lg bg-white px-4 py-2 hover:scale-105 transtion duration-300 hover:bg-blue-200 hover:text-blue-500 group"
        onClick={() => handleOpenContent()}
      >
        🤖 Assistentes
        <span className="absolute rounded-b-lg bottom-[0.3px] left-0 w-0 h-[6px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
      </button>
      <button
        className="rounded-lg bg-white px-4 py-2 hover:scale-105 transtion duration-300 hover:bg-blue-200 hover:text-blue-500 group"
        onClick={() => {handleSelectAssistant('asst_i8yF9pYTi0EbcmFaTFtUrD9S');}}
      >
        🤵 Dr. Cafuringa
        <span className="absolute rounded-b-lg bottom-[0.3px] left-0 w-0 h-[6px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
      </button>
      <button
        className="rounded-lg bg-white px-4 py-2 hover:scale-105 transtion duration-300 hover:bg-blue-200 hover:text-blue-500 group"
        onClick={() => {handleSelectAssistant('asst_9VFRraeUAtBnqubrtzbhpuZp');}}
      >
      🎓 Mentores
      <span className="absolute rounded-b-lg bottom-[0.3px] left-0 w-0 h-[6px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
      </button>
    </div>
  );
};