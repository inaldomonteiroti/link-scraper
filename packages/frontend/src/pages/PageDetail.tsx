import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { pagesAPI } from "../services/api";
import { Page, Link as LinkType, PageDetailsResponse } from "../types";
import Pagination from "../components/Pagination";

const PageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchPageDetails = async (pageNum: number = 1) => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await pagesAPI.getPageDetails(parseInt(id), pageNum);
      const data = response.data as PageDetailsResponse;

      setPage(data.page);
      setLinks(data.links);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching page details:", err);
      setError("Failed to load page details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    fetchPageDetails(pageNum);
  };

  useEffect(() => {
    if (page && (page.status === "queued" || page.status === "processing")) {
      const interval = setInterval(() => {
        fetchPageDetails(currentPage);
      }, 5000);

      setRefreshInterval(interval);

      return () => {
        if (refreshInterval) clearInterval(refreshInterval);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [page]);

  useEffect(() => {
    fetchPageDetails();

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [id]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "queued":
        return "bg-secondary";
      case "processing":
        return "bg-warning text-dark";
      case "done":
        return "bg-success";
      case "failed":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Page Details</h1>
        <Link to="/dashboard" className="btn btn-outline-primary">
          Back to Dashboard
        </Link>
      </div>

      {loading && !page ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading page details...</p>
        </div>
      ) : error && !page ? (
        <div className="alert alert-danger">{error}</div>
      ) : page ? (
        <>
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Page Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <h4>{page.title || "No title"}</h4>
                  <p>
                    <strong>Original URL:</strong>{" "}
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-break"
                    >
                      {page.url}
                    </a>
                  </p>

                  {page.finalUrl && page.finalUrl !== page.url && (
                    <p>
                      <strong>Final URL:</strong>{" "}
                      <a
                        href={page.finalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-break"
                      >
                        {page.finalUrl}
                      </a>
                      <span className="ms-2 badge bg-info">Redirected</span>
                    </p>
                  )}
                </div>
                <div className="col-md-4">
                  <div className="d-flex flex-column align-items-end">
                    <span
                      className={`badge ${getStatusBadgeClass(
                        page.status
                      )} mb-2`}
                    >
                      {page.status}
                    </span>
                    <p className="mb-1">
                      <strong>Links found:</strong> {page.linkCount}
                    </p>
                    <p className="mb-1">
                      <strong>Submitted:</strong>{" "}
                      {new Date(page.queuedAt).toLocaleString()}
                    </p>
                    {page.finishedAt && (
                      <p className="mb-0">
                        <strong>Completed:</strong>{" "}
                        {new Date(page.finishedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {page.error && (
                <div className="alert alert-danger mt-3">
                  <strong>Error:</strong> {page.error}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Links Found ({page.linkCount})</h5>
              <button
                className="btn btn-sm btn-light"
                onClick={() => fetchPageDetails(currentPage)}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>
            <div className="card-body">
              {page.status === "queued" || page.status === "processing" ? (
                <div className="alert alert-warning">
                  <div className="d-flex align-items-center">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span>
                      This page is currently being processed. Links will appear
                      here once scraping is complete.
                    </span>
                  </div>
                </div>
              ) : loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading links...</p>
                </div>
              ) : links.length === 0 ? (
                <div className="alert alert-info">
                  No links were found on this page.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Link URL</th>
                        <th>Link Text</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map((link, index) => {
                        const startIndex = (currentPage - 1) * 20; // Assuming 20 per page
                        return (
                          <tr key={link.id}>
                            <td>{startIndex + index + 1}</td>
                            <td>
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-break"
                              >
                                {link.href}
                              </a>
                            </td>
                            <td>{link.name || "No text"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-danger">Page not found</div>
      )}
    </div>
  );
};

export default PageDetail;
