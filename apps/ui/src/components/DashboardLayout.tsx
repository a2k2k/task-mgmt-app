import { Sidebar } from 'flowbite-react';
import { HiChartPie, HiUser, HiViewBoards } from 'react-icons/hi';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { UserDetails } from '@tma/shared/api-model';
import Header from './Header';
import Loader from './Loader';

function DashboardLayout() {
  const { checkUser } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function handleNavigate(e: Event, url: string) {
    e.preventDefault();
    navigate(url);
  }

  useEffect(() => {
    (async () => {
      const user: UserDetails | null = await checkUser();
      setLoggedIn(user != null);
      setUserDetails(user);
      setLoading(false);
    })();
  });
  if (loading) {
    return <Loader />;
  }
  if (!loggedIn) {
    navigate('/login');
    return '';
  }
  return (
    <>
      <Header items={[]} user={userDetails} />
      <div className="flex gap-x-4 flex-row items-start mx-12 mt-12">
        <div className="w-max h-min">
          <Sidebar aria-label="App Sidebar">
            <Sidebar.Items>
              <Sidebar.ItemGroup>
                <Sidebar.Item
                  href="/app"
                  onClick={(e: Event) => handleNavigate(e, '/app')}
                  icon={HiChartPie}
                >
                  Dashboard
                </Sidebar.Item>
                <Sidebar.Item
                  href="/app/projects"
                  onClick={(e: Event) => handleNavigate(e, '/app/projects')}
                  icon={HiViewBoards}
                >
                  Projects
                </Sidebar.Item>
                <Sidebar.Item
                  href="/app/users"
                  onClick={(e: Event) => handleNavigate(e, '/app/users')}
                  icon={HiUser}
                >
                  Users
                </Sidebar.Item>
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </Sidebar>
        </div>
        <div className="bg-slate-50 min-h-[600px] block w-3/4">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default DashboardLayout;
