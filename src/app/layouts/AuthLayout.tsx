import { Outlet } from 'react-router-dom';

/** Auth routes use AuthShell for their own full-screen layout. */
export function AuthLayout() {
  return <Outlet />;
}
