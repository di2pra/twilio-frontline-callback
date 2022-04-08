import Container from "react-bootstrap/Container";
import { Outlet } from "react-router-dom";
import Header from './components/Header';

export default function AppLayout() {

  return (
    <>
      <Header />
      <Container className="mt-3" fluid>
        <Outlet />
      </Container>
    </>
  )

}