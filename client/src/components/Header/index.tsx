import { useContext } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { TwilioLogo } from "../../Icons";
import { UserContext } from "../../SecureLayout";
import NavbarItem from "./NavbarItem";
import { useOktaAuth } from "@okta/okta-react";

export default function Header() {

  const { authState } = useOktaAuth();
  const { loggedInUser } = useContext(UserContext);

  return (
    <Navbar bg="white" expand="md">
      <Container fluid>
        <Navbar.Brand>
          <div
            className="navbar-logo d-inline-block align-top">
            <TwilioLogo />
          </div>
          <Link className="navbar-brand" to='/'>Twilio Frontline SE France</Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            navbarScroll
          >
            <NavbarItem to="/" title="Accueil" />
            {(authState && authState.isAuthenticated && loggedInUser) ? <NavbarItem to="/logout" title="Se déconnecter" /> : null}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );

}