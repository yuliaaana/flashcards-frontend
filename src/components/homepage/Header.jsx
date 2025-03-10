import React from 'react';
import { Button, Container, Form, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; 
import 'bootstrap/dist/css/bootstrap.min.css';

function Header() {
  const navigate = useNavigate(); 

  const handleCreateDeckClick = () => {
    navigate('/create-deck'); 
  };

  const handleCreateFolderClick = () => {
    navigate('/create-folder'); 
  };

  const handleHomeClick = () => {
    navigate('/homepage');
  };

  const handleProfileClick = () => {
    navigate('/profile'); 
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand href="#" onClick={handleHomeClick}>FlashCards</Navbar.Brand> 
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
            <Nav.Link onClick={handleHomeClick}>Home</Nav.Link> 
            <Nav.Link onClick={handleProfileClick}>Profile</Nav.Link> 
            <NavDropdown title="Create" id="navbarScrollingDropdown">
              <NavDropdown.Item onClick={handleCreateFolderClick}>Folder</NavDropdown.Item>
              <NavDropdown.Item onClick={handleCreateDeckClick}>Deck</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
            />
            <Button variant="outline-success">Search</Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
