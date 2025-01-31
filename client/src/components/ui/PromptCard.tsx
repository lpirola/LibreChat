import React from 'react';

const PromptCard = ({
  assistant_id,
  question,
  handleSelectQuestion,
}: {
  assistant_id: string;
  question: string;
  handleSelectQuestion: any;
}) => {
  return (
      <span className="flex-1
      transform rounded-lg text-left text-black p-2 mb-1
      transition duration-500 hover:scale-110">
        <button
         onClick={() => handleSelectQuestion(assistant_id, question)}
         className="bg-transparent border-none text-blue-500 underline cursor-pointer text-left">{question}</button>
      </span>
  );
};

export default PromptCard;
