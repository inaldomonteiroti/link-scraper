import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Table,
  Alert,
  Spinner,
  Badge,
  Button,
  Row,
  Col,
} from "react-bootstrap";
import { pagesAPI } from "../services/api";
import { Link as LinkType, Page } from "../types";
import Pagination from "../components/Pagination";

const PageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPageDetails = async (pageNum = 1) => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await pagesAPI.getPageDetails(Number(id), pageNum);
      setPage(response.data.page);
      setLinks(response.data.links);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(pageNum);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch page details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageDetails();
  }, [id]);

  const handlePageChange = (pageNum: number) => {
    fetchPageDetails(pageNum);
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

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/dashboard" variant="primary">
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!page) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Page not found</Alert>
        <Button as={Link} to="/dashboard" variant="primary">
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button as={Link} to="/dashboard" variant="outline-primary" className="mb-4">
        &larr; Back to Dashboard
      </Button>

      <h1 className="mb-3">{page.title || "No Title"}</h1>

      <Row className="mb-4">
        <Col md={6}>
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Page Information</h5>
              <Table borderless>
                <tbody>
                  <tr>
                    <th style={{ width: "120px" }}>URL:</th>
                    <td>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {page.url}
                      </a>
                    </td>
                  </tr>
                  {page.finalUrl && page.finalUrl !== page.url && (
                    <tr>
                      <th>Final URL:</th>
                      <td>
                        <a
                          href={page.finalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {page.finalUrl}
                        </a>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <th>Status:</th>
                    <td>{getStatusBadge(page.status)}</td>
                  </tr>
                  <tr>
                    <th>Links Found:</th>
                    <td>{page.linkCount}</td>
                  </tr>
                  <tr>
                    <th>Scraped On:</th>
                    <td>
                      {page.finishedAt
                        ? new Date(page.finishedAt).toLocaleString()
                        : "Not completed"}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </Col>
      </Row>

      <h2 className="mb-3">Links ({page.linkCount})</h2>

      {links.length === 0 ? (
        <Alert variant="info">No links found on this page.</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive className="link-table">
            <thead>
              <tr>
                <th style={{ width: "60%" }}>URL</th>
                <th style={{ width: "40%" }}>Link Text</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id}>
                  <td>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.href}
                    </a>
                  </td>
                  <td className="link-name">{link.name || "(No text)"}</td>
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

export default PageDetail;