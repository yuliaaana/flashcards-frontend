import React, { useContext } from 'react';
import { Button, Container, Form, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from "react-i18next";
// If you have a UserContext, import it. Otherwise, adjust as needed.
// import { UserContext } from '../../UserContext';
import '../../styles/languages.css';
import "../../i18n"; 



function Header({ user }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("header");
  // If using context:
  // const { user } = useContext(UserContext);

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
            <Nav.Link onClick={() => navigate('/homepage')}>{t("home")}</Nav.Link>
            <Nav.Link onClick={() => navigate('/edit-profile')}>{t("profile")}</Nav.Link>
            <NavDropdown title={t("create")} id="navbarScrollingDropdown">
              <NavDropdown.Item onClick={() => navigate('/create-folder')}>{t("folder")}</NavDropdown.Item>
              <NavDropdown.Item onClick={() => navigate('/create-deck')}>{t("deck")}</NavDropdown.Item>
              {user && user.role === 'teacher' && (
                <NavDropdown.Item onClick={() => navigate('/study-groups')}>
                  {t("Create Study Group")}
                </NavDropdown.Item>
              )}
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
