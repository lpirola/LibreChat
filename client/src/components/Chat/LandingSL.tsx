import { cn } from '~/utils';
import { useLocalize } from '~/hooks';
import { TooltipAnchor } from '~/components/ui';
import ConvoIcon from '~/components/Endpoints/ConvoIcon';
import { BirthdayIcon } from '~/components/svg';
import type { LandingHeaderProps } from './types';

export default function LandingHeader({
  Header,
  conversation,
  agentsMap,
  assistantMap,
  endpointsConfig,
  startupConfig,
}: LandingHeaderProps) {
  const localize = useLocalize();
  const containerClassName = 'shadow-stroke relative flex h-full items-center justify-center rounded-full bg-white text-black';

  return (
    <>
      <div className="absolute left-0 right-0">{Header != null ? Header : null}</div>
      <div className="flex flex-col items-center justify-center">
        <div className="relative h-12 w-12 mb-3">
          <ConvoIcon
            agentsMap={agentsMap}
            assistantMap={assistantMap}
            conversation={conversation}
            endpointsConfig={endpointsConfig}
            containerClassName={containerClassName}
            context="landing"
            className="h-2/3 w-2/3"
            size={41}
          />
          {startupConfig?.showBirthdayIcon === true ? (
            <TooltipAnchor
              className="absolute bottom-8 right-2.5"
              description={localize('com_ui_happy_birthday')}
            >
              <BirthdayIcon />
            </TooltipAnchor>
          ) : null}
        </div>
      </div>
    </>
  );
}
