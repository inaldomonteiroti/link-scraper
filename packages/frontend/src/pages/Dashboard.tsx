import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pagesAPI } from '../services/api';
import { Page, PagesResponse } from '../types';
import Pagination from '../components/Pagination';

const Dashboard: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchPages = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await pagesAPI.getPages(page);
      const data = response.data as PagesResponse;
      setPages(data.pages);
      setTotalPages(data.pagination.pages);
      setCurrentPage(data.pagination.page);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching pages:', err);
      setError('Failed to load pages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      await pagesAPI.submitUrl(url);
      setUrl('');
      fetchPages(1);
    } catch (err: any) {
      console.error('Error submitting URL:', err);
      setError(err.response?.data?.message || 'Failed to submit URL. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPages(page);
  };

  useEffect(() => {
    const hasProcessingPages = pages.some(
      page => page.status === 'queued' || page.status === 'processing'
    );
    
    if (hasProcessingPages) {
      const interval = setInterval(() => {
        fetchPages(currentPage);
      }, 5000);
      
      setRefreshInterval(interval);
      
      return () => {
        if (refreshInterval) clearInterval(refreshInterval);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [pages]);

  useEffect(() => {
    fetchPages();
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-secondary';
      case 'processing':
        return 'bg-warning text-dark';
      case 'done':
        return 'bg-success';
      case 'failed':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Submit a URL for Scraping</h5>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="url"
                className="form-control"
                placeholder="Enter a URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Your Scraped Pages</h5>
          <button
            className="btn btn-sm btn-light"
            onClick={() => fetchPages(currentPage)}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="alert alert-info">
              You haven't submitted any URLs yet. Use the form above to get started.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
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
                      <td>{page.title || 'No title'}</td>
                      <td>
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: '200px' }}
                        >
                          {page.url}
                        </a>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(page.status)}`}>
                          {page.status}
                        </span>
                      </td>
                      <td>{page.linkCount}</td>
                      <td>{new Date(page.createdAt).toLocaleString()}</td>
                      <td>
                        <Link
                          to={`/pages/${page.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          View Links
                        </Link>
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
};

export default Dashboard;
