import { Button, Modal, Pagination, Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { ListResponse, UserDetails } from '@tma/shared/api-model';
import { HiPencilAlt, HiTrash, HiPlus } from 'react-icons/hi';

import { FormDataMap, FormManifest, LIMIT } from '../models/common';
import ManifestForm from '../components/ManifestForm';
import { formatDate } from '../utils/Utils';
import Loader from '../components/Loader';
import { UsersAPIService } from '../services/UsersAPIService';

function Users() {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    setError(null);
    setLoading(true);
    const abortController = new AbortController();
    const offset = (page - 1) * LIMIT;
    UsersAPIService.getUsers(offset, LIMIT, abortController.signal)
      .then((userList: ListResponse<UserDetails>) => {
        setUsers(userList.items);
        setTotalPages(Math.floor((userList.totalItems - 1) / LIMIT) + 1);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (page === 0) {
          setTotalPages(0);
        }
        setError('There was a problem loading users. Please try again.');
      });
    return () => {
      abortController.abort();
    };
  }, [page]);
  function onPageChange(page: number) {
    setPage(page);
  }
  function handleDialogButton(
    id: string,
    data: { [name: string]: string } | null
  ) {
    setShowCreate(false);
    if (id === 'create') {
      UsersAPIService.createUser(data as any);
    }
  }
  function openCreateDialog() {
    setShowCreate(true);
  }
  return (
    <div className="h-full relative">
      <div className="flex flex-wrap bg-white gap-2 pb-[20px]">
        <h2 className="text-xl font-extrabold align-middle">Users</h2>
        <Button className="ml-auto" onClick={openCreateDialog}>
          <HiPlus className="mr-2 h-5 w-5" />
          Create
        </Button>
      </div>
      <br />
      {loading ? (
        <Loader />
      ) : error != null || users.length === 0 ? (
        <div className="h-96 w-full flex justify-center items-center">
          <div className="mb-4 text-xl font-extrabold text-center pt-12">
            {error != null ? error : 'No Users Found'}
          </div>
        </div>
      ) : (
        <TableView users={users} />
      )}
      <br />
      {totalPages > 0 ? (
        <div className="flex overflow-x-auto sm:justify-center mb-3">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      ) : (
        ''
      )}
      {showCreate ? (
        <CreateUserDialog handleButton={handleDialogButton}></CreateUserDialog>
      ) : (
        ''
      )}
    </div>
  );
}

function TableView({ users }: { users: UserDetails[] }) {
  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Email</Table.HeadCell>
        <Table.HeadCell>Username</Table.HeadCell>
        <Table.HeadCell>Date Created</Table.HeadCell>
        <Table.HeadCell>
          <span className="sr-only">Modify</span>
        </Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y">
        {users.map((user, index) => {
          return (
            <Table.Row
              key={`table-row-${index}`}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {user.name}
              </Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{user.username}</Table.Cell>
              <Table.Cell>{formatDate(user.dateCreated)}</Table.Cell>
              <Table.Cell>
                <HiPencilAlt className="mr-2 h-5 w-5" />
                <HiTrash className="mr-2 h-5 w-5" />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

function CreateUserDialog({
  handleButton,
}: {
  handleButton: (id: string, data: { [name: string]: string } | null) => void;
}) {
  const [openModal, setOpenModal] = useState(true);
  function doHandleButton(id: string, data: { [name: string]: string } | null) {
    setOpenModal(false);
    handleButton(id, data);
  }
  const formData: FormDataMap = {};
  const manifest: FormManifest = {
    buttons: [],
    id: 'signup',
    fieldGroups: [
      {
        fields: [
          {
            name: 'fullname',
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
            name: 'username',
            type: 'text',
            label: 'Username',
            extraOptions: { placeholder: 'Username' },
          },
          {
            name: 'password',
            type: 'password',
            label: 'Password',
            extraOptions: { placeholder: 'Password' },
          },
          {
            name: 'company',
            type: 'text',
            label: 'Company',
            extraOptions: { placeholder: 'Company' },
          },
        ],
      },
    ],
  };
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header>Create User</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          <ManifestForm data={formData} manifest={manifest} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => doHandleButton('create', formData)}>
          Create
        </Button>
        <Button color="gray" onClick={() => doHandleButton('cancel', null)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Users;
