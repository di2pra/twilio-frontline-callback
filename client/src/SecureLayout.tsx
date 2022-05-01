import { createContext, FC, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useOktaAuth } from '@okta/okta-react';
import { Container, Spinner } from "react-bootstrap";
import Header from "./components/Header";
import { IDToken } from "@okta/okta-auth-js";

export const UserContext = createContext<{
  loggedInUser?: IDToken["claims"];
}>({});

const SecureLayout: FC = () => {

  const { oktaAuth, authState } = useOktaAuth();

  const [loggedInUser, setLoggedInUser] = useState<IDToken["claims"]>();

  useEffect(() => {

    if (authState?.isAuthenticated) {
      setLoggedInUser(authState.idToken?.claims);
    }

  }, [oktaAuth, authState?.isAuthenticated])

  if (!authState) {
    return (
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <Spinner className="mb-3" animation="border" variant="danger" />
        <h3>Checking authentication status...</h3>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (!loggedInUser) {
    return (
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <Spinner className="mb-3" animation="border" variant="danger" />
        <h3>Loading user information...</h3>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{
      loggedInUser: loggedInUser
    }}>
      <Header />
      <Container className="mt-3" fluid>
        <Outlet />
      </Container>
    </UserContext.Provider>
  )

}

export default SecureLayout;