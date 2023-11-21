/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge, Button, Card, Modal, Pagination } from 'flowbite-react';
import { MouseEvent, useEffect, useState } from 'react';
import { ProjectsAPIService } from '../services/ProjectsAPIService';
import { ListResponse, ProjectDTO } from '@tma/shared/api-model';
import { HiPlus, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';

import { FormManifest, LIMIT } from '../models/common';
import ManifestForm from '../components/ManifestForm';
import { formatDate } from '../utils/Utils';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';

function Projects() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>();
  const [showDialog, setShowDialog] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [editData, setEditData] = useState<ProjectDTO | null>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    setLoading(true);
    let unmounted = false;
    const abortController = new AbortController();
    const offset = (page - 1) * LIMIT;
    setNeedRefresh(false);
    ProjectsAPIService.getProjects(offset, LIMIT, abortController.signal)
      .then((projectList: ListResponse<ProjectDTO>) => {
        if (unmounted) {
          return;
        }
        setProjects(projectList.items);
        setTotalPages(Math.floor((projectList.totalItems - 1) / LIMIT) + 1);
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
        setError(
          'There was a problem loading your projects. Please try again.'
        );
      });
    return () => {
      unmounted = true;
      abortController.abort();
    };
  }, [page, needRefresh, navigate]);
  function onPageChange(page: number) {
    setPage(page);
  }
  function handleDialogButton(
    id: string,
    data: { [name: string]: string } | null
  ) {
    setShowDialog(false);
    if (id === 'create') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ProjectsAPIService.createProject(data as any).then(() => {
        setPage(1);
        setNeedRefresh(true);
      });
    } else if (id === 'update') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ProjectsAPIService.updateProject(data?.id as string, data as any).then(
        () => {
          setPage(1);
          setNeedRefresh(true);
        }
      );
    }
  }
  function openCreateDialog() {
    setShowDialog(true);
  }
  function clickHandler(action: string, project: ProjectDTO) {
    return function (e: MouseEvent) {
      switch (action) {
        case 'edit':
          setEditData(project);
          setShowDialog(true);
          break;
        case 'delete':
          setEditData(project);
          setShowDeleteConfirm(true);
          break;
      }
      e.stopPropagation();
    };
  }
  function handleProjectDeleteConfirm(action: string) {
    setShowDeleteConfirm(false);
    const data = editData;
    setEditData(null);
    if (action === 'ok') {
      ProjectsAPIService.deleteProject(data?.id as string).then(() => {
        setPage(1);
        setNeedRefresh(true);
      });
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
  return (
    <div className="h-full relative flex flex-col mb-10">
      <div className="flex flex-wrap bg-white gap-2 pb-[20px] h-18 border-b">
        <h2 className="text-xl font-extrabold align-middle">Projects</h2>
        <Button className="ml-auto" onClick={openCreateDialog}>
          <HiPlus className="mr-2 h-5 w-5" />
          Create
        </Button>
      </div>
      <br />
      {loading ? (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 p-4 md:p-2 xl:p-5">
          {renderLoading()}
        </div>
      ) : error != null || projects == null || projects.length === 0 ? (
        <div className="h-96 w-full flex justify-center items-center">
          <div className="mb-4 text-xl font-extrabold text-center pt-12">
            {error != null ? error : 'No Projects Found'}
          </div>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 p-4 md:p-2 xl:p-5 grow auto-rows-auto">
          {projects.map((project: ProjectDTO, index) => {
            return (
              <Card
                className="max-w-sm h-full cursor-pointer flex flex-col"
                key={`project-${index}`}
                onClick={() => navigate(`/app/projects/${project.id}`)}
              >
                <div className="flex flex-wrap bg-white gap-2 h-10">
                  <span className="whitespace-nowrap text-xl font-bold dark:text-white">
                    {project.name}
                  </span>
                  <div className="ml-auto flex flex-row gap-4">
                    <span onClick={clickHandler('delete', project)}>
                      <HiOutlineTrash className="h-5 w-5" />
                    </span>
                    <HiOutlinePencil
                      className="h-5 w-5"
                      onClick={clickHandler('edit', project)}
                    />
                  </div>
                </div>
                <p className="font-normal text-gray-700 dark:text-gray-400 text-sm line-clamp-3 grow">
                  {project.description}
                </p>
                <div className="grid grid-cols-2 text-xs h-10">
                  <div>
                    <span className="font-bold">Created</span>
                    <div className="text-gray-500 dark:text-gray-400">
                      {formatDate(project.dateCreated)}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold">Updated</span>
                    <div className="text-gray-500 dark:text-gray-400">
                      {formatDate(project.dateModified)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 text-xs h-10">
                  <div>
                    <span className="font-bold">Created by:</span>
                    <div className="truncate text-gray-500 dark:text-gray-400">
                      {project.createdBy.name}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold">Updated by:</span>
                    <div className="truncate text-gray-500 dark:text-gray-400">
                      {project.modifiedBy.name}
                    </div>
                  </div>
                </div>
                <Badge
                  className="w-1/3 h-7"
                  color={project.active ? 'info' : 'pink'}
                >
                  Status: {project.active ? 'Active' : 'Inactive'}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}
      <br />
      {totalPages > 0 ? (
        <div className="flex sm:justify-center pb-5 h-24">
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
        <ProjectDialog
          handleButton={handleDialogButton}
          editData={editData as ProjectDTO}
        ></ProjectDialog>
      ) : (
        ''
      )}
      {showDeleteConfirm ? (
        <ConfirmDialog
          msg={'Are you sure you want to delete the selected project?'}
          actionHandler={handleProjectDeleteConfirm}
        />
      ) : (
        ''
      )}
    </div>
  );
}

function ProjectDialog({
  handleButton,
  editData,
}: {
  editData?: ProjectDTO;
  handleButton: (id: string, data: { [name: string]: string } | null) => void;
}) {
  const [openModal, setOpenModal] = useState(true);
  function doHandleButton(id: string, data: { [name: string]: string } | null) {
    setOpenModal(false);
    handleButton(id, data);
  }
  const [formData] = useState<any>(editData || {});
  const manifest: FormManifest = {
    buttons: [],
    id: 'project-form',
    fieldGroups: [
      {
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Project Name',
            extraOptions: { placeholder: 'Project Name' },
          },
          {
            name: 'description',
            type: 'textarea',
            label: 'Description',
            extraOptions: { placeholder: 'Description' },
          },
          {
            name: 'category',
            type: 'text',
            label: 'Category',
            extraOptions: { placeholder: 'Category' },
          },
        ],
      },
    ],
  };
  return (
    <Modal show={openModal} onClose={() => doHandleButton('cancel', null)}>
      <Modal.Header>Create Project</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          <ManifestForm data={formData} manifest={manifest} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() =>
            doHandleButton(editData ? 'update' : 'create', formData)
          }
        >
          {editData ? 'Update' : 'Create'}
        </Button>
        <Button color="gray" onClick={() => doHandleButton('cancel', null)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Projects;
