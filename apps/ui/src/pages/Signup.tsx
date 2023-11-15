import Header from '../components/Header';
import {
  ButtonDescriptor,
  FormDataMap,
  FormManifest,
  PublicHeaderItems,
} from '../models/common';
import ManifestForm from '../components/ManifestForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import { CreateUserDTO } from '@tma/shared/api-model';

function SignupPage() {
  const links = PublicHeaderItems.filter((link) => link.label === 'Home');
  const manifest: FormManifest = {
    buttons: [
      {
        id: 'signup',
        label: 'Sign up',
        primary: true,
      },
    ],
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
            label: 'Company Name',
            extraOptions: { placeholder: 'Company' },
          },
        ],
      },
    ],
  };
  const formData = {};
  const { signup } = useAuth();
  const navigate = useNavigate();
  function handleClick(_btn: ButtonDescriptor, fd: FormDataMap) {
    if (_btn.id === 'signup') {
      signup(fd as unknown as CreateUserDTO).then(() => {
        navigate('/login');
      });
    }
  }
  return (
    <>
      <Header items={links} />
      <div className="h-screen w-full flex justify-center items-center">
        <div className="w-96 mx-1">
          <h3 className="mb-4 text-xl font-extrabold tracking-tight leading-none text-gray-900 md:text-xl lg:text-2xl dark:text-white">
            Signup
          </h3>
          <ManifestForm
            manifest={manifest}
            data={formData}
            onButtonClick={handleClick}
          />
        </div>
      </div>
    </>
  );
}
export default SignupPage;
