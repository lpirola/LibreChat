import React, { useEffect, useState } from 'react';
import { OGDialog, Label, Checkbox } from '~/components/ui';
import OGDialogTemplate from '~/components/ui/OGDialogTemplate';

type DeleteButtonProps = {
  showHelpDialog?: boolean;
  setShowHelpDialog?: (value: boolean) => void;
};

export default function HelpDialog({ showHelpDialog, setShowHelpDialog }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const storedDontShowAgain = localStorage.getItem('dontShowAgain');
    if (storedDontShowAgain !== null) {
      setDontShowAgain(JSON.parse(storedDontShowAgain));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dontShowAgain', JSON.stringify(dontShowAgain));
  }, [dontShowAgain]);

  const dialogContent = (
    <OGDialogTemplate
      showCloseButton={false}
      title={'Como usar ?'}
      className="z-[1000] max-w-[450px]"
      main={
        <>
          <div className="flex w-full flex-col items-center gap-2">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="dialog-confirm-delete" className="text-left text-sm font-medium">
                {
                  'Selecione uma das pergutas ou copie e cole no campo abaixo. Você também pode digitar sua própia pergunta no campo disponível.'
                }
              </Label>
            </div>
          </div>
        </>
      }
      selection={{
        selectHandler: () => setOpen(false),
        selectClasses:
          'bg-yellow-700 dark:bg-yellow-600 hover:bg-yellow-300 dark:hover:bg-yellow-300 text-black',
        selectText: 'Compreendo',
      }}
      leftButtons={
        <div className="flex items-center">
          <Checkbox
            checked={dontShowAgain}
            onCheckedChange={(value) => setDontShowAgain(!!value)}
            aria-label="Select all"
          />
          <h1 className="ml-2">Não exibir esse aviso novamente</h1>
        </div>
      }
      showCancelButton={false}
    />
  );

  if (showHelpDialog !== undefined && setShowHelpDialog !== undefined) {
    return (
      <OGDialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        {dialogContent}
      </OGDialog>
    );
  }

  return (
    <OGDialog open={open} onOpenChange={setOpen}>
      {dialogContent}
    </OGDialog>
  );
}