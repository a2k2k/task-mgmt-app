/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Modal, Pagination, Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { ListResponse, UserDetails } from '@tma/shared/api-model';
import { HiPencilAlt, HiTrash, HiPlus } from 'react-icons/hi';

import { FormDataMap, FormManifest, LIMIT } from '../models/common';
import ManifestForm from '../components/ManifestForm';
import { formatDate } from '../utils/Utils';
import Loader from '../components/Loader';
import { UsersAPIService } from '../services/UsersAPIService';
import ConfirmDialog from '../components/ConfirmDialog';
import UserDialog from '../components/UserDialog';

function Users() {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editData, setEditData] = useState<any>();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setError(null);
    setLoading(true);
    setRefresh(false);
    const abortController = new AbortController();
    const offset = (page - 1) * LIMIT;
    let unmounted = false;
    UsersAPIService.getUsers(offset, LIMIT, abortController.signal)
      .then((userList: ListResponse<UserDetails>) => {
        if (unmounted) {
          return;
        }
        setUsers(userList.items);
        setTotalPages(Math.floor((userList.totalItems - 1) / LIMIT) + 1);
        setLoading(false);
      })
      .catch((err) => {
        if (unmounted) {
          return;
        }
        setLoading(false);
        if (page === 0) {
          setTotalPages(0);
        }
        setError('There was a problem loading users. Please try again.');
      });
    return () => {
      unmounted = true;
      abortController.abort();
    };
  }, [page, refresh]);
  function onPageChange(page: number) {
    setPage(page);
  }
  function handleDialogButton(
    id: string,
    data: any,
    errFn: (errorMsg: string) => void
  ) {
    if (id === 'create') {
      data.username = data.email;
      data.admin = data.admin === true || data.admin === 'true';
      UsersAPIService.createUser(data)
        .then(() => {
          setShowDialog(false);
          setRefresh(true);
        })
        .catch((err) => {
          errFn(err.message);
        });
    } else if (id === 'update') {
      data.username = data.email;
      data.admin = data.admin === true || data.admin === 'true';
      UsersAPIService.updateUser(data.id, data)
        .then(() => {
          setShowDialog(false);
          setRefresh(true);
        })
        .catch((err) => {
          errFn(err.message);
        });
    } else {
      setShowDialog(false);
    }
  }
  function openCreateDialog() {
    setShowDialog(true);
  }
  function handleAction(id: string, user: UserDetails) {
    switch (id) {
      case 'edit':
        setEditData(user);
        setShowDialog(true);
        break;
      case 'delete':
        setEditData(user);
        setShowConfirm(true);
        break;
    }
  }
  function handleDeleteConfirm(id: string) {
    const user = editData;
    setEditData(null);
    setShowConfirm(false);
    if (id === 'ok') {
      UsersAPIService.deleteUser(user.id).then(() => {
        setPage(1);
        setRefresh(true);
      });
    }
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
        <TableView users={users} actionHandler={handleAction} />
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
      {showDialog ? (
        <UserDialog
          data={editData}
          handleButton={handleDialogButton}
        ></UserDialog>
      ) : (
        ''
      )}
      {showConfirm ? (
        <ConfirmDialog
          msg={'Are you sure you want to delete the selected user?'}
          actionHandler={handleDeleteConfirm}
        />
      ) : (
        ''
      )}
    </div>
  );
}

function TableView({
  users,
  actionHandler,
}: {
  users: UserDetails[];
  actionHandler: (aId: string, user: UserDetails) => void;
}) {
  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Email</Table.HeadCell>
        <Table.HeadCell>Admin</Table.HeadCell>
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
              <Table.Cell>{user.admin ? 'Yes' : 'No'}</Table.Cell>
              <Table.Cell>{formatDate(user.dateCreated)}</Table.Cell>
              <Table.Cell>
                <div className="flex flex-row gap-2 cursor-pointer">
                  <HiPencilAlt
                    className="mr-2 h-5 w-5"
                    onClick={() => actionHandler('edit', user)}
                  />
                  <HiTrash
                    className="mr-2 h-5 w-5"
                    onClick={() => actionHandler('delete', user)}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

export default Users;
