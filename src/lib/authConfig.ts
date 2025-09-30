// src/authConfig.ts
import { Configuration } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_MSAL_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_MSAL_TENANT_ID}`,
    redirectUri: '/',
  },
  cache: {
    cacheLocation: 'localStorage', // This keeps the user logged in across sessions
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['User.Read'],
};
