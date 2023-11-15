import { Spinner } from 'flowbite-react';

function Loader() {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Spinner
        className="h-32 w-32"
        aria-label="Extra large spinner example"
        size="xl"
      />
    </div>
  );
}
export default Loader;