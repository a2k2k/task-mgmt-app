import { Button, Modal } from 'flowbite-react';

function ConfirmDialog({
  msg,
  actionHandler,
  title,
  buttonLabels,
}: {
  buttonLabels?: { [key: string]: string };
  msg: string;
  title?: string;
  actionHandler: (id: string) => void;
}) {
  return (
    <Modal size="lg" show={true} onClose={() => actionHandler('close')}>
      <Modal.Header>{title || 'Confirm'}</Modal.Header>
      <Modal.Body>
        <div className="space-y-6 p-6">
          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            {msg}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => actionHandler('ok')}>
          {(buttonLabels && buttonLabels['ok']) || 'OK'}
        </Button>
        <Button color="gray" onClick={() => actionHandler('cancel')}>
          {(buttonLabels && buttonLabels['cancel']) || 'CANCEL'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmDialog;