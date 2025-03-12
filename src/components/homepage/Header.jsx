import React from 'react';
import { Button, Container, Form, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from "react-i18next";
import '../../styles/languages.css';
import "../../i18n"; 


function Header() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = () => {
    const newLang = i18n.language === "en" ? "uk" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand onClick={() => navigate('/homepage')}>FlashCards</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <Nav.Link onClick={() => navigate('/homepage')}>Home</Nav.Link>
            <Nav.Link onClick={() => navigate('/profile')}>Profile</Nav.Link>
            <NavDropdown title="Create" id="navbarScrollingDropdown">
              <NavDropdown.Item onClick={() => navigate('/create-folder')}>Folder</NavDropdown.Item>
              <NavDropdown.Item onClick={() => navigate('/create-deck')}>Deck</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Form className="d-flex">
            <div className="switch">
              <input 
                id="language-toggle" 
                className="check-toggle check-toggle-round-flat" 
                type="checkbox" 
                checked={i18n.language === "en"} 
                onChange={changeLanguage} 
              />
              <label htmlFor="language-toggle"></label>
              <span className="on">UKR</span>
              <span className="off">ENG</span>
            </div>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
