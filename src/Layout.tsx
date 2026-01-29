import { Outlet } from 'react-router-dom';
import { Navbar } from './components/common';

export function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
