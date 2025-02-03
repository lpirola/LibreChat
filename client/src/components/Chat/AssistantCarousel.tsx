import { useState } from 'react';
import { AssistantInfo } from '~/hooks/useAssistantsInfo';

const AssistantCarousel = (list: AssistantInfo[])=> {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const visibleCount = 3; // Quantos itens exibir por vez

  const next = () => {
    if (currentIndex < list.length - visibleCount) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="relative w-full overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Botão Anterior */}
      <button
        onClick={prev}
        className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 shadow hover:bg-gray-300 z-10 transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        ◀ Anterior
      </button>

      {/* Carrossel */}
      <div className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
      >
        {list.map((assistant, index) => (
          <div
            key={index}
            className="flex-shrink-0 px-2 px-2" // Cada item ocupa 1/3 do container
          >
            {assistant} {/* Renderiza o componente */}
          </div>
        ))}
      </div>

      {/* Botão Próximo */}
      <button
        onClick={next}
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 shadow hover:bg-gray-300 ${
          hovered ? 'opacity-100' : 'opacity-0'}`}
      >
        Próximo ▶
      </button>
    </div>
  );
};

export default AssistantCarousel;