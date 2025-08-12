import React, { useState, useEffect } from "react";
import { Container, Table, Button, Form, Alert, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { pagesAPI } from "../services/api";
import { Page } from "../types";
import Pagination from "../components/Pagination";

const Dashboard: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPages = async (page = 1) => {
    try {
      setLoading(true);
      const response = await pagesAPI.getPages(page);
      setPages(response.data.pages);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await pagesAPI.submitUrl(url);
      setSuccess("URL submitted successfully! It will be processed shortly.");
      setUrl("");
      fetchPages(1); // Refresh the list
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit URL");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchPages(page);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "queued":
        return <Badge bg="secondary">Queued</Badge>;
      case "processing":
        return <Badge bg="warning" text="dark">Processing</Badge>;
      case "done":
        return <Badge bg="success">Done</Badge>;
      case "failed":
        return <Badge bg="danger">Failed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Dashboard</h1>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Submit a URL to Scrape</h5>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="url">
              <Form.Label>URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Enter a valid URL with http:// or https:// protocol
              </Form.Text>
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                "Submit URL"
              )}
            </Button>
          </Form>
        </div>
      </div>

      <h2 className="mb-3">Your Pages</h2>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : pages.length === 0 ? (
        <Alert variant="info">
          You haven't submitted any URLs yet. Use the form above to get started.
        </Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>URL</th>
                <th>Status</th>
                <th>Links</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td>{page.title || "No title"}</td>
                  <td className="text-truncate" style={{ maxWidth: "200px" }}>
                    <a href={page.url} target="_blank" rel="noopener noreferrer">
                      {page.url}
                    </a>
                  </td>
                  <td>{getStatusBadge(page.status)}</td>
                  <td>{page.linkCount}</td>
                  <td>
                    {new Date(page.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Button
                      as={Link}
                      to={`/pages/${page.id}`}
                      variant="outline-primary"
                      size="sm"
                      disabled={page.status !== "done"}
                    >
                      View Links
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </Container>
  );
};

export default Dashboard;