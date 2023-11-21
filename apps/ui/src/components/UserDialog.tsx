/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Button } from 'flowbite-react';
import { useState } from 'react';
import ManifestForm from './ManifestForm';
import { FormDataMap, FormManifest } from '../models/common';

function UserDialog({
  handleButton,
  data,
  currentUser,
}: {
  currentUser?: boolean;
  data?: any;
  handleButton: (
    id: string,
    data: { [name: string]: string } | null,
    errFn: (err: string) => void
  ) => void;
}) {
  const [openModal, setOpenModal] = useState(true);
  const [error, setError] = useState<string>();
  const [formData] = useState<FormDataMap>(data || {});
  function doHandleButton(id: string, data: { [name: string]: string } | null) {
    handleButton(id, data, (err: string) => {
      setError(err);
    });
  }
  const manifest: FormManifest = {
    buttons: [],
    id: 'new_user',
    fieldGroups: [
      {
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Full Name',
            extraOptions: { placeholder: 'Full Name' },
          },
          {
            name: 'email',
            type: 'text',
            label: 'Email',
            extraOptions: { placeholder: 'Email' },
          },
          {
            name: 'password',
            type: 'password',
            label: 'Password',
            extraOptions: { placeholder: 'Password' },
          },
          {
            name: 'admin',
            type: 'checkbox',
            label: 'Admin',
          },
        ],
      },
    ],
  };
  if (currentUser) {
    const fieldsToFilter = ['admin'];
    manifest.fieldGroups[0].fields = manifest.fieldGroups[0].fields.filter(
      (field) => {
        return !fieldsToFilter.includes(field.name);
      }
    );
  }
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header>
        {currentUser ? 'Update Profile' : data ? 'Update User' : 'Create User'}
      </Modal.Header>
      <Modal.Body>
        {error ? <div className="text-red-500 text-sm pb-3">{error}</div> : ''}
        <div className="space-y-6">
          <ManifestForm data={formData} manifest={manifest} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => doHandleButton(data ? 'update' : 'create', formData)}
        >
          {data ? 'Update' : 'Create'}
        </Button>
        <Button color="gray" onClick={() => doHandleButton('cancel', null)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UserDialog;
