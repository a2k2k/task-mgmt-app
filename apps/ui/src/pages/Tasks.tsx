import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dropdown,
  Label,
  Modal,
  Pagination,
} from 'flowbite-react';
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { ProjectsAPIService } from '../services/ProjectsAPIService';
import {
  ListResponse,
  ProjectDTO,
  TaskDTO,
  TaskStatus,
} from '@tma/shared/api-model';
import {
  HiPlus,
  HiFilter,
  HiOutlineTrash,
  HiOutlinePencil,
} from 'react-icons/hi';

import { FormDataMap, FormManifest, LIMIT } from '../models/common';
import ManifestForm from '../components/ManifestForm';
import { formatDate } from '../utils/Utils';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';

interface TaskFilterData {
  status: string[];
}
function buildTaskFilterParam(filter: TaskFilterData) {
  if (filter == null) {
    return null;
  }
  const filters = [];
  if (filter.status && filter.status.length) {
    filters.push(['status', filter.status.join(',')].join('='));
  }
  return filters.length === 0 ? null : filters.join('::');
}
function Tasks({ project }: { project: ProjectDTO }) {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>();
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskDialogMode, setTaskDialogMode] = useState<string>();
  const [needRefresh, setNeedRefresh] = useState(false);
  const [editData, setEditData] = useState<TaskDTO | null>();
  const [filter, setFilter] = useState<TaskFilterData>();
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    setLoading(true);
    let unmounted = false;
    const abortController = new AbortController();
    const offset = (page - 1) * LIMIT;
    setNeedRefresh(false);
    const filterParam = buildTaskFilterParam(filter as TaskFilterData);
    ProjectsAPIService.getTasks(
      project.id,
      offset,
      LIMIT,
      filterParam as string,
      abortController.signal
    )
      .then((taskList: ListResponse<TaskDTO>) => {
        if (unmounted) {
          return;
        }
        setTasks(taskList.items);
        setTotalPages(Math.floor((taskList.totalItems - 1) / LIMIT) + 1);
        setLoading(false);
      })
      .catch((err) => {
        if (unmounted) {
          return;
        }
        if (err.statusCode === 401) {
          setTimeout(() => {
            navigate('/login');
          });
        }
        setLoading(false);
        if (page === 0) {
          setTotalPages(0);
        }
        setError('There was a problem loading your tasks. Please try again.');
      });
    return () => {
      unmounted = true;
      abortController.abort();
    };
  }, [page, needRefresh, navigate, project, filter]);
  function onPageChange(page: number) {
    setPage(page);
  }
  function handleDialogButton(
    id: string,
    data: { [name: string]: string } | null
  ) {
    setShowTaskDialog(false);
    setEditData(null);
    setTaskDialogMode('');
    if (id === 'cancel') {
      return;
    }
    if (data) {
      if (!data.status) {
        data.status = TaskStatus.NotStarted;
      }
      if (id === 'create') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ProjectsAPIService.createTask(project.id as string, data as any).then(
          () => {
            setPage(1);
            setNeedRefresh(true);
          }
        );
      } else if (id === 'edit') {
        ProjectsAPIService.updateTask(
          project.id,
          data.id as string,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data as any
        ).then(() => {
          setPage(1);
          setNeedRefresh(true);
        });
      }
    }
  }
  function openCreateDialog() {
    setTaskDialogMode('create');
    setShowTaskDialog(true);
    setEditData(null);
  }
  function editTask(task: TaskDTO) {
    setShowTaskDialog(true);
    setTaskDialogMode('edit');
    setEditData(task);
  }
  function handleTaskDeleteConfirm(id: string) {
    setShowConfirm(false);
    if (id === 'ok') {
      const dto: TaskDTO = editData as TaskDTO;
      setEditData(null);
      ProjectsAPIService.deleteTask(project.id, dto.id).then(() => {
        setPage(1);
        setNeedRefresh(true);
      });
    }
  }
  function clickHandler(action: string, taskDTO: TaskDTO) {
    return function (e: MouseEvent) {
      switch (action) {
        case 'edit':
          editTask(taskDTO);
          break;
        case 'delete':
          setShowConfirm(true);
          setEditData(taskDTO);
          break;
      }
      e.stopPropagation();
    };
  }
  function taskStatusBadge(task: TaskDTO) {
    switch (task.status) {
      case TaskStatus.Completed:
        return 'success';
      case TaskStatus.InProgress:
        return 'info';
      case TaskStatus.NotStarted:
        return 'pink';
    }
  }
  function renderLoading() {
    const arr = Array(LIMIT).fill(0);
    return arr.map((i, index) => {
      return (
        <Card key={`skeleton-${index}`} className="max-w-sm">
          <div role="status" className="max-w-sm animate-pulse">
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
            <span className="sr-only">Loading...</span>
          </div>
        </Card>
      );
    });
  }
  function applyFilter(filter: TaskFilterData) {
    setFilter(filter);
    setNeedRefresh(true);
  }
  return (
    <div className="h-full relative flex flex-col">
      <div className="flex flex-wrap bg-white gap-2 pb-[20px] h-18">
        <div className="text-lg ml-5 font-bold align-middle">
          Project: <span className="font-normal">{project.name}</span>
        </div>
        <div className="ml-auto flex flex-cols gap-4">
          <TaskFilter onFilterApply={applyFilter} />
          <Button onClick={openCreateDialog}>
            <HiPlus className="mr-2 h-5 w-5" />
            Create
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 p-4 md:p-2 xl:p-5">
          {renderLoading()}
        </div>
      ) : error != null || tasks == null || tasks.length === 0 ? (
        <div className="h-96 w-full flex justify-center items-center">
          <div className="mb-4 text-xl font-extrabold text-center pt-12">
            {error != null ? error : 'No Tasks Found'}
          </div>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 p-4 md:p-2 xl:p-5 grow auto-rows-auto">
          {tasks.map((task: TaskDTO, index) => {
            return (
              <Card
                className="max-w-sm h-full flex flex-col"
                key={`task-${index}`}
              >
                <div className="flex flex-wrap bg-white gap-2 h-10">
                  <span className="whitespace-nowrap text-xl font-bold dark:text-white truncate">
                    {task.name}
                  </span>
                  <div className="ml-auto flex flex-row gap-4 cursor-pointer">
                    <span onClick={clickHandler('delete', task)}>
                      <HiOutlineTrash className="h-5 w-5" />
                    </span>
                    <HiOutlinePencil
                      className="h-5 w-5"
                      onClick={clickHandler('edit', task)}
                    />
                  </div>
                </div>
                <p className="font-normal text-gray-700 dark:text-gray-400 text-sm line-clamp-3 grow">
                  {task.description}
                </p>
                <div className="grid grid-cols-2 text-xs h-10">
                  <div>
                    <span className="font-bold">Created</span>
                    <div className="text-gray-500 dark:text-gray-400">
                      {formatDate(task.dateCreated)}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold">Updated</span>
                    <div className="text-gray-500 dark:text-gray-400">
                      {formatDate(task.dateModified)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 text-xs">
                  <div>
                    <span className="font-bold">Created by:</span>
                    <div className="truncate text-gray-500 dark:text-gray-400">
                      {task.createdBy.name}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold">Updated by:</span>
                    <div className="truncate text-gray-500 dark:text-gray-400">
                      {task.modifiedBy.name}
                    </div>
                  </div>
                </div>
                <Badge className="w-1/3" color={taskStatusBadge(task)}>
                  {task.status}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}
      <br />
      {totalPages > 0 ? (
        <div className="flex overflow-x-auto sm:justify-center mb-3 h-14">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      ) : (
        ''
      )}
      {showTaskDialog ? (
        <TaskDialog
          handleButton={handleDialogButton}
          mode={taskDialogMode as string}
          data={editData as TaskDTO}
        />
      ) : (
        ''
      )}
      {showConfirm ? (
        <ConfirmDialog
          msg={'Are you sure you want to delete the selected task?'}
          actionHandler={handleTaskDeleteConfirm}
        />
      ) : (
        ''
      )}
    </div>
  );
}

function TaskFilter({
  onFilterApply,
  currentFilter,
}: {
  currentFilter?: TaskFilterData;
  onFilterApply: (selected: TaskFilterData) => void;
}) {
  const [filterDismiss, setFilterDismiss] = useState(false);
  const [statusFilter] = useState<{ [key: string]: boolean }>({});

  function applyFilter() {
    setFilterDismiss(true);
    const filter = Object.keys(statusFilter).filter(
      (key) => statusFilter[key] === true
    );
    const taskFilter = { status: filter };
    onFilterApply(taskFilter);
  }
  function handleChange(e: ChangeEvent) {
    const cb = e.target as HTMLInputElement;
    statusFilter[cb.id] = cb.checked === true;
  }
  return (
    <Dropdown
      label=""
      inline
      dismissOnClick={filterDismiss}
      className="w-[150px]"
      renderTrigger={() => (
        <div
          className="pt-2 text-cyan-700"
          onClickCapture={() => setFilterDismiss(false)}
        >
          <HiFilter className="text-3xl cursor-pointer" />
        </div>
      )}
    >
      <Dropdown.Item className="px-2 focus:bg-transparent hover:bg-transparent">
        <div className="flex items-center gap-2">
          <Checkbox
            id={TaskStatus.NotStarted}
            onChange={handleChange}
            defaultChecked={statusFilter[TaskStatus.NotStarted] === true}
          />
          <Label htmlFor={TaskStatus.NotStarted}>Not Started</Label>
        </div>
      </Dropdown.Item>
      <Dropdown.Item className="px-2 focus:bg-transparent hover:bg-transparent">
        <div className="flex items-center gap-2">
          <Checkbox
            id={TaskStatus.InProgress}
            onChange={handleChange}
            defaultChecked={statusFilter[TaskStatus.InProgress] === true}
          />
          <Label htmlFor={TaskStatus.InProgress}>In Progress</Label>
        </div>
      </Dropdown.Item>
      <Dropdown.Item className="px-2 focus:bg-transparent hover:bg-transparent">
        <div className="flex items-center gap-2">
          <Checkbox
            id={TaskStatus.Completed}
            onChange={handleChange}
            defaultChecked={statusFilter[TaskStatus.Completed] === true}
          />
          <Label htmlFor={TaskStatus.Completed}>Completed</Label>
        </div>
      </Dropdown.Item>
      <Dropdown.Item className="focus:bg-transparent hover:bg-transparent">
        <span
          onClickCapture={applyFilter}
          className="px-3 py-1 cursor-pointer ml-auto group flex items-center justify-center p-0.5 text-center font-medium relative focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800 focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2"
        >
          Apply
        </span>
      </Dropdown.Item>
    </Dropdown>
  );
}

function TaskDialog({
  handleButton,
  mode,
  data,
}: {
  data?: TaskDTO;
  mode: string;
  handleButton: (id: string, data: { [name: string]: string } | null) => void;
}) {
  const [openModal, setOpenModal] = useState(true);
  function doHandleButton(id: string, data: { [name: string]: string } | null) {
    setOpenModal(false);
    handleButton(id, data);
  }
  const formData: FormDataMap = {};
  if (data) {
    Object.assign(formData, data);
  }
  const manifest: FormManifest = {
    buttons: [],
    id: 'task-form',
    fieldGroups: [
      {
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Task Name',
            extraOptions: { placeholder: 'Task Name' },
          },
          {
            name: 'description',
            type: 'textarea',
            label: 'Description',
            extraOptions: { placeholder: 'Description' },
          },
          {
            name: 'assignee',
            type: 'text',
            label: 'Assignee',
            extraOptions: { placeholder: 'Assignee' },
          },
        ],
      },
    ],
  };
  if (mode === 'edit') {
    manifest.fieldGroups[0].fields.push({
      name: 'status',
      type: 'combo',
      label: 'Status',
      data: [
        {
          label: 'Not Started',
          value: TaskStatus.NotStarted,
        },
        {
          label: 'In Progress',
          value: TaskStatus.InProgress,
        },
        {
          label: 'Completed',
          value: TaskStatus.Completed,
        },
      ],
    });
  }
  return (
    <Modal show={openModal} onClose={() => doHandleButton('cancel', null)}>
      <Modal.Header>
        {mode === 'create' ? 'Create' : 'Update'} Task
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          <ManifestForm data={formData} manifest={manifest} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => doHandleButton(mode, formData)}>
          {mode === 'create' ? 'Create' : 'Update'}
        </Button>
        <Button color="gray" onClick={() => doHandleButton('cancel', null)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Tasks;
