import './Login.css';
import Header from '../components/Header';
import { PublicHeaderItems } from '../models/common';
import { Button, Card, Label, TextInput } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ChangeEvent, FormEvent, useState } from 'react';
import { LoginRequest } from '@tma/shared/api-model';

function LoginPage() {
  const links = PublicHeaderItems.filter((link) => link.label === 'Home');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loginDetails: any = {};
  function onChange(e: ChangeEvent) {
    const el = e.target as HTMLInputElement;
    loginDetails[el.name] = el.value;
  }
  function doLogin(e: FormEvent) {
    e.preventDefault();
    login(loginDetails as LoginRequest)
      .then((res) => {
        navigate('/app');
      })
      .catch((err) => {
        setError(err);
      });
  }
  return (
    <>
      <Header items={links} />
      <div className="h-screen w-full flex justify-center items-center">
      <div className="w-96 mx-1">
        <h3 className="mb-4 text-xl font-extrabold tracking-tight leading-none text-gray-900 md:text-xl lg:text-2xl dark:text-white">
          Login
        </h3>
        <Card className="max-w-sm">
          {error ? <div className="login-error">{error}</div> : ''}
          <form className="flex flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email1" value="Email" />
              </div>
              <TextInput
                id="username"
                name="username"
                type="text"
                placeholder="Username"
                onChange={onChange}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Password" />
              </div>
              <TextInput
                name="password"
                id="password"
                type="password"
                onChange={onChange}
                required
              />
            </div>
            <Button type="submit" onClick={doLogin}>
              Submit
            </Button>
          </form>
        </Card>
      </div>
      </div>
    </>
  );
}
export default LoginPage;
