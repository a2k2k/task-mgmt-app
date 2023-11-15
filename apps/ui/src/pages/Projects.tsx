import { Badge, Button, Card, Modal, Pagination } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { ProjectsAPIService } from '../services/ProjectsAPIService';
import { ListResponse, ProjectDTO } from '@tma/shared/api-model';
import { HiPlus } from 'react-icons/hi';

import moment from 'moment';
import { FormDataMap, FormManifest } from '../models/common';
import ManifestForm from '../components/ManifestForm';
import { formatDate } from '../utils/Utils';
const LIMIT = 9;

function Projects() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
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
    ProjectsAPIService.getProjects(offset, LIMIT, abortController.signal)
      .then((projectList: ListResponse<ProjectDTO>) => {
        setProjects(projectList.items);
        setTotalPages(Math.floor((projectList.totalItems - 1) / LIMIT) + 1);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        if (page === 0) {
          setTotalPages(0);
        }
        setError(
          'There was a problem loading your projects. Please try again.'
        );
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
      ProjectsAPIService.createProject(data as any);
    }
  }
  function openCreateDialog() {
    setShowCreate(true);
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
    <div className="h-full relative">
      <div className="flex flex-wrap bg-white gap-2 pb-[20px]">
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
      ) : error != null || projects.length === 0 ? (
        <div className="h-96 w-full flex justify-center items-center">
          <div className="mb-4 text-xl font-extrabold text-center pt-12">
            {error != null ? error : 'No Projects Found'}
          </div>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 p-4 md:p-2 xl:p-5">
          {projects.map((project: ProjectDTO) => {
            return (
              <Card className="max-w-sm">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {project.name}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <div>{formatDate(project.dateCreated)}</div>
                  <div>{formatDate(project.dateModified)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div>{project.createdBy}</div>
                  <div>{project.modifiedBy}</div>
                </div>
                <Badge color={project.active ? 'info' : 'pink'}>Default</Badge>
              </Card>
            );
          })}
        </div>
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
        <CreateProjectDialog
          handleButton={handleDialogButton}
        ></CreateProjectDialog>
      ) : (
        ''
      )}
    </div>
  );
}

function CreateProjectDialog({
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
    <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header>Create Project</Modal.Header>
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

export default Projects;
