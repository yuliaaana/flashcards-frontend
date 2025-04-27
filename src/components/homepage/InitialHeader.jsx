import React from 'react';
import { Navbar, Container, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from "react-i18next";
import '../../styles/languages.css';
import "../../i18n";

function InitialHeader() {
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    const newLang = i18n.language === "en" ? "uk" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid className="d-flex justify-content-between">
        <Navbar.Brand>FlashCards</Navbar.Brand>
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
      </Container>
    </Navbar>
  );
}

export default InitialHeader;
