import { createContext, FC, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useOktaAuth } from '@okta/okta-react';
import { Container, Spinner } from "react-bootstrap";
import { IUser } from "./Types";
import Header from "./components/Header";

export const UserContext = createContext<{
  loggedInUser?: IUser;
}>({});

const SecureLayout: FC = () => {

  const { oktaAuth, authState } = useOktaAuth();

  const [loggedInUser, setLoggedInUser] = useState<IUser>();

  useEffect(() => {

    if (authState?.isAuthenticated) {
      oktaAuth.getUser().then((data) => {
        setLoggedInUser(data as IUser);
      }).catch((error) => {
        oktaAuth.signOut()
      });
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