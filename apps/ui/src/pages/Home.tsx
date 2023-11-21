import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { PublicHeaderItems } from '../models/common';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { UserDetails } from '@tma/shared/api-model';
import Loader from '../components/Loader';

function Home() {
  const { checkUser } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

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
  return (
    <>
      <Header
        items={userDetails ? [] : PublicHeaderItems.slice(1)}
        user={userDetails}
      />
      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Boost your productivity by efficiently managing your tasks
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-400">
            Task Management application enables you to effectively plan and
            execute your projects by smartly managing your tasks.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
            {loggedIn ? (
              <Link
                to="/app/projects"
                className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
              >
                Go to portal
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex justify-center items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
export default Home;
