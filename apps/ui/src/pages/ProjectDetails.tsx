/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/style-prop-object */
import { FaTasks } from 'react-icons/fa';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { Button, Modal, Spinner, Table, Tabs } from 'flowbite-react';
import { useParams } from 'react-router-dom';
import Tasks from './Tasks';
import {
  ProjectDTO,
  ProjectMemberDTO,
  Role,
  UserDetails,
} from '@tma/shared/api-model';
import { HiPencilAlt, HiTrash, HiPlus } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import { ProjectsAPIService } from '../services/ProjectsAPIService';
import './ProjectDetails.css';
import { FormManifest } from '../models/common';
import ManifestForm from '../components/ManifestForm';
import { UsersAPIService } from '../services/UsersAPIService';

function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState<ProjectDTO>();
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    setLoading(true);
    ProjectsAPIService.getProject(projectId as string)
      .then((dto: ProjectDTO) => {
        setLoading(false);
        setProject(dto);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [projectId]);
  return (
    <div className="project-details">
      <Tabs aria-label="Project tabs" style="underline">
        <Tabs.Item active title="Tasks" icon={FaTasks}>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Spinner className="h-24 w-24" />
            </div>
          ) : (
            project && <Tasks project={project as ProjectDTO} />
          )}
        </Tabs.Item>
        <Tabs.Item title="Members" icon={HiOutlineUserGroup}>
          {loading ? (
            <Spinner />
          ) : (
            project && <ProjectMembers project={project as ProjectDTO} />
          )}
        </Tabs.Item>
      </Tabs>
    </div>
  );
}

function ProjectMembers({ project }: { project: ProjectDTO }) {
  const [members, setMembers] = useState<ProjectMemberDTO[]>();
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [editData, setEditData] = useState<any>();
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    setRefresh(false);
    ProjectsAPIService.getMembers(project.id).then(
      (members: ProjectMemberDTO[]) => {
        setMembers(members);
      }
    );
  }, [project, refresh]);
  function modifyMember(id: string, data: any) {
    //add code here
    if (id === 'cancel') {
      setShowMemberDialog(false);
      return;
    } else if (id === 'delete') {
      ProjectsAPIService.deleteMember(project.id, data.user.id).then(() => {
        setRefresh(true);
      });
    } else if (id === 'add') {
      UsersAPIService.getUser(data['userId']).then((udetails: UserDetails) => {
        setShowMemberDialog(false);
        ProjectsAPIService.addMember(project.id, {
          userId: udetails.id,
          role: data.role || Role.Member,
        }).then(() => {
          setRefresh(true);
        });
      });
    } else if (id === 'update') {
      setShowMemberDialog(false);
      ProjectsAPIService.addMember(project.id, {
        userId: data.userId,
        role: data.role || Role.Member,
      }).then(() => {
        setRefresh(true);
      });
    }
  }
  return (
    <div>
      <div className="flex flex-wrap bg-white gap-2 pb-[20px] h-18">
        <div className="text-lg ml-1 font-bold align-middle">
          Project: <span className="font-normal">{project.name}</span>
        </div>
        <Button
          className="ml-auto"
          onClick={() => {
            setEditData(null);
            setShowMemberDialog(true);
          }}
        >
          <HiPlus className="mr-2 h-5 w-5" />
          Add
        </Button>
      </div>
      {showMemberDialog ? (
        <ProjectMemberDialog
          doHandleButton={modifyMember}
          userData={editData}
        />
      ) : (
        ''
      )}
      <Table>
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>UserName</Table.HeadCell>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">Modify</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {members
            ?.filter((member) => member.user != null)
            .map((member, index) => {
              return (
                <Table.Row
                  key={`table-row-${index}`}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {member.user.name}
                  </Table.Cell>
                  <Table.Cell>
                    {member.user.email || member.user.username}
                  </Table.Cell>
                  <Table.Cell>{member.role}</Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-row gap-2">
                      <HiPencilAlt
                        className="mr-2 h-5 w-5"
                        onClick={() => {
                          setEditData(member as any);
                          setShowMemberDialog(true);
                        }}
                      />
                      <HiTrash
                        className="mr-2 h-5 w-5"
                        onClick={() => {
                          modifyMember('delete', member);
                        }}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
        </Table.Body>
      </Table>
    </div>
  );
}

function ProjectMemberDialog({
  userData,
  doHandleButton,
}: {
  doHandleButton: (id: string, data?: any) => void;
  userData?: ProjectMemberDTO;
}) {
  const [data] = useState<any>(userData || {});
  const manifest: FormManifest = {
    buttons: [],
    id: 'project_member',
    fieldGroups: [
      {
        fields: [
          {
            name: 'userId',
            type: 'text',
            label: 'User ID',
            disabled: data?.user != null,
            defaultValue: data.userId || data?.user?.email,
            extraOptions: { placeholder: 'User ID' },
          },
          {
            name: 'role',
            type: 'combo',
            label: 'Role',
            defaultValue: data['role'],
            data: [
              { label: 'Member', value: Role.Member },
              {
                label: 'Owner',
                value: Role.Owner,
              },
            ],
          },
        ],
      },
    ],
  };
  return (
    <Modal show={true} onClose={() => doHandleButton('cancel')}>
      <Modal.Header>Add/Update Member</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          <ManifestForm data={data} manifest={manifest} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() =>
            doHandleButton(userData == null ? 'add' : 'update', data)
          }
        >
          Ok
        </Button>
        <Button color="gray" onClick={() => doHandleButton('cancel')}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProjectDetails;
