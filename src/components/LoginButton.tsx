// src/components/LoginButton.tsx
'use client';

import { loginRequest } from '@/lib/authConfig';
import { useMsal } from '@azure/msal-react';

export default function LoginButton() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return <button onClick={handleLogin}>Log in with Azure AD</button>;
}
