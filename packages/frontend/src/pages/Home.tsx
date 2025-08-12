import React from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={8}>
          <h1 className="display-4 mb-4">Link Scraper</h1>
          <p className="lead mb-4">
            Extract and analyze links from any web page. Submit a URL and get a
            comprehensive list of all links on that page.
          </p>
          {isAuthenticated ? (
            <Button as={Link} to="/dashboard" variant="primary" size="lg">
              Go to Dashboard
            </Button>
          ) : (
            <div>
              <Button as={Link} to="/login" variant="primary" size="lg" className="me-3">
                Login
              </Button>
              <Button as={Link} to="/register" variant="outline-primary" size="lg">
                Register
              </Button>
            </div>
          )}
        </Col>
      </Row>
      <Row className="mt-5 pt-5">
        <Col md={4} className="mb-4">
          <h3>Easy to Use</h3>
          <p>
            Simply enter a URL and our system will extract all links from the
            page. No complex setup required.
          </p>
        </Col>
        <Col md={4} className="mb-4">
          <h3>Comprehensive Results</h3>
          <p>
            Get detailed information about each link, including the URL and link
            text.
          </p>
        </Col>
        <Col md={4} className="mb-4">
          <h3>Secure & Private</h3>
          <p>
            Your scraped data is stored securely and is only accessible to you.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;