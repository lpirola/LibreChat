import React from 'react';

export const CurrentAssistant = (name: string) => {
  return (
    <div
      className="rounded-lg bg-gray-50 p-5
      dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
    >
      <div>
        <div>
          <span className="text-md ml-2 text-left">Você está em: </span>
          <span className="text-md ml-2 text-left font-semibold">{name}</span>
        </div>
      </div>
    </div>
  );
};