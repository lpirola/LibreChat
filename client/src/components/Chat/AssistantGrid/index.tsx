import { useState } from 'react';
import { AssistHeader } from './components/AssistHeader';
import { AssistSection } from './components/AssistSection';
import classNames from '~/utils/classNames';

export const AssistentesGrid = (list: any[], handleSelectAssistant: any) => {
  const [openContent, setOpenContent] = useState(false);

  const handleOpenContent = () => {
    //console.log(openContent);
    setOpenContent(!openContent);
  };

  const PIS_COFINS_IDS = [
    'asst_VMIucXRGsKSFRKzHHO7m9pNl',
    'asst_ZSUVlFGrKY3fI5MrfBdS5ayg',
    'asst_CimPwcq5HWBED288gWuOs6dp',
  ];
  const OTHER_IDS = [
    'asst_4zSYHOCxudLlfFcHSIqSzP93',
    'asst_WZf5wtzqysM4vlJ1WLTJrASj',
    'asst_mLfYHanhjVXsHoctIJIWcE1h',
    'asst_etTZeaPgTnTHWaWVTyzWRFfk',
    'asst_IHtM4Sr24vOGt3b434xV8vmW',
  ];

  const PIS_COFINS_Assistants = list.filter((item) => PIS_COFINS_IDS.includes(item.props.id));
  const OTHER_Assistants = list.filter((item) => OTHER_IDS.includes(item.props.id));

  return (
    <div className="relative">
      <AssistHeader
        handleSelectAssistant={handleSelectAssistant}
        handleOpenContent={handleOpenContent}
      />

      {/* Content Grid */}
      <div
        className={classNames([
          'absolute z-10 mt-2 grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-6 shadow-lg dark:bg-gray-600 md:grid-cols-2',
          !openContent && 'hidden',
        ])}
      >
        <AssistSection
          title="📊 PIS/COFINS"
          assistants={PIS_COFINS_Assistants}
          handleOpenContent={handleOpenContent}
        />
        <AssistSection
          title="⚡ Mais Assistentes"
          assistants={OTHER_Assistants}
          handleOpenContent={handleOpenContent}
        />
      </div>
    </div>
  );
};
