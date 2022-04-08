import React from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from './routes/Home';
import NotFound from './routes/NotFound';
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import oktaConfig from "./oktaConfig";
import { Security, LoginCallback } from '@okta/okta-react';
import Login from './routes/Login';
import Logout from './routes/Logout';
import SecureLayout from './SecureLayout';

export default function App() {

  let navigate = useNavigate();

  const oktaAuth = new OktaAuth(oktaConfig.oidc);

  const restoreOriginalUri = async (_oktaAuth: any, originalUri: string) => {

    navigate(toRelativeUrl(originalUri || '/', window.location.origin));
  };

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <Routes>
        <Route path="/login/callback" element={<LoginCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<SecureLayout />}>
          <Route index element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Security>

  );
}