import { HeaderItem } from '../models/common';
import logo from '../assets/react.svg';
import { Avatar, Dropdown, Navbar } from 'flowbite-react';
import { useLinkClickHandler, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserDetails } from '@tma/shared/api-model';

function Header({ items, user }: { items: HeaderItem[]; user?: UserDetails | null}) {
  const navigate = useNavigate();
  const { signout } = useAuth();
  function navigateTo(id: string) {
    return function () {
      navigate(id);
    };
  }

  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="https://flowbite-react.com">
        <img src={logo} className="mr-3 h-6 sm:h-9" alt="TMA LOGO" />
        <span className="self-center whitespace-nowrap text-xl font-bold dark:text-white">
          TMA
        </span>
      </Navbar.Brand>
      {user ? (
        <div className="flex md:order-2">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">John Doe</span>
              <span className="block truncate text-sm font-medium">
                abc@xyz.com
              </span>
            </Dropdown.Header>
            <Dropdown.Item onClick={navigateTo('/app/user-profile')}>
              Edit Profile
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={signout}>Sign out</Dropdown.Item>
          </Dropdown>
          <Navbar.Toggle />
        </div>
      ) : (
        ''
      )}
      <Navbar.Collapse>
        {items.map((item: HeaderItem, index: number) => {
          return <NavItem key={`navbar-item-${index}`} item={item} />;
        })}
      </Navbar.Collapse>
    </Navbar>
  );
  // items = [...items];
  // return (
  //   <nav className="bg-white border-gray-200 dark:bg-gray-900">
  //     <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
  //       <a
  //         href="https://flowbite.com/"
  //         className="flex items-center space-x-3 rtl:space-x-reverse"
  //       >
  //         <img src={logo} className="h-8" alt="TASK Logo" />
  //         <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
  //           TASK
  //         </span>
  //       </a>

  //       <div className="hidden w-full md:block md:w-auto" id="navbar-default">
  //         <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
  //           {items.map((link: HeaderItem) => {
  //             return (
  //               <li>
  //                 <a
  //                   href={link.url}
  //                   className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500"
  //                   aria-current="page"
  //                 >
  //                   {link.label}
  //                 </a>
  //               </li>
  //             );
  //           })}
  //         </ul>
  //       </div>
  //     </div>
  //   </nav>
  // );
}
function NavItem({ item }: { item: HeaderItem }) {
  const clickHandler = useLinkClickHandler(item.url);
  return (
    <Navbar.Link
      className="font-semibold text-lg"
      href={item.url}
      onClick={clickHandler}
    >
      {item.label}
    </Navbar.Link>
  );
}
export default Header;
