import { HeaderItem } from '../models/common';
import logo from '../assets/react.svg';
import { Avatar, Dropdown, Navbar } from 'flowbite-react';
import { useLinkClickHandler, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UpdateUserDTO, UserDetails } from '@tma/shared/api-model';
import UserDialog from './UserDialog';
import { useState } from 'react';
import { UsersAPIService } from '../services/UsersAPIService';

function Header({
  items,
  user,
}: {
  items: HeaderItem[];
  user?: UserDetails | null;
}) {
  const [editProfile, setEditProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const { signout } = useAuth();
  function handleProfileUpdate(actionId: string, data: any) {
    setEditProfile(false);
    if (actionId === 'update') {
      UsersAPIService.updateUser(
        currentUser?.id as string,
        data as UpdateUserDTO
      ).then((userInfo: UserDetails) => {
        setCurrentUser(userInfo);
      });
    }
  }

  return (
    <>
      <Navbar fluid rounded>
        <Navbar.Brand href="/">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="TMA LOGO" />
          <span className="self-center whitespace-nowrap text-xl font-bold dark:text-white">
            TMA
          </span>
        </Navbar.Brand>
        {currentUser ? (
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
                <span className="block text-sm font-bold">
                  {currentUser.name}
                </span>
                <span className="block truncate text-xs font-medium">
                  {currentUser.email || currentUser.username}
                </span>
              </Dropdown.Header>
              <Dropdown.Item
                onClick={() => {
                  setEditProfile(true);
                }}
              >
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
      {editProfile ? (
        <UserDialog
          data={currentUser}
          currentUser={true}
          handleButton={handleProfileUpdate}
        />
      ) : (
        ''
      )}
    </>
  );
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
