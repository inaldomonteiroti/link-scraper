import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 offset-md-2 text-center">
          <h1 className="display-4 mb-4">Welcome to Link Scraper</h1>
          <p className="lead mb-4">
            A simple application that allows you to scrape links from any web page.
            Submit a URL, and we'll extract all the links for you.
          </p>
          
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Features</h5>
              <ul className="list-group list-group-flush text-start">
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Submit any URL and get all links from that page
                </li>
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  View a list of all pages you've scraped
                </li>
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  See detailed information about each link
                </li>
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Track the status of your scraping jobs in real-time
                </li>
              </ul>
            </div>
          </div>
          
          <div className="d-grid gap-2 d-md-block">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg px-4 me-md-2">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg px-4 me-md-2">
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline-primary btn-lg px-4">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
