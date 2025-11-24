"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Play, CheckCircle, AlertCircle, FileText, Clock, TrendingUp, XCircle, Database } from "lucide-react";
import './style.css';

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState({ 
    total: 0, 
    success: 0, 
    failed: 0,
    totalFetched: 0,
    totalProcessed: 0 
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/logs");
      const json = await res.json();
      setLogs(json || []);
      
      // Calculate stats
      const total = json?.length || 0;
      const success = json?.filter((l: any) => l.failedJobs === 0).length || 0;
      const failed = json?.filter((l: any) => l.failedJobs > 0).length || 0;
      
      // Calculate totals from all logs
      const totalFetched = json?.reduce((sum: number, l: any) => sum + (l.totalFetched || 0), 0) || 0;
      const totalProcessed = json?.reduce((sum: number, l: any) => sum + (l.totalProcessed || 0), 0) || 0;
      
      setStats({ total, success, failed, totalFetched, totalProcessed });
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleManualImport() {
    try {
      setImporting(true);
      await fetch("http://localhost:5000/api/import/manual", { method: "POST" });
      alert("Manual import started successfully!");
      setTimeout(fetchLogs, 2000);
    } catch (err) {
      alert("Failed to start import");
    } finally {
      setImporting(false);
    }
  }

  const getStatusColor = (log: any) => {
    if (log.failedJobs > 0) return "color-red-600";
    if (log.updatedJobs > 0) return "color-blue-600";
    return "color-green-600";
  };

  const getSuccessRate = (log: any) => {
    const processed = log.totalProcessed || (log.newJobs + log.updatedJobs + log.skippedJobs + log.failedJobs);
    if (processed === 0) return 0;
    const successful = log.newJobs + log.updatedJobs + log.skippedJobs;
    return ((successful / processed) * 100).toFixed(1);
  };

  const getProgressClass = (log: any) => {
    const rate = parseFloat(getSuccessRate(log).toString());
    if (rate === 100) return "progress-green";
    if (rate >= 80) return "progress-blue";
    return "progress-orange";
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="header-section">
          <div className="header-top">
            <div className="header-title-section">
              <h1>Import History</h1>
              <p>Track and monitor your job import operations</p>
            </div>
            <div className="header-buttons">
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="btn btn-secondary"
              >
                <RefreshCw className={`btn-icon ${loading ? 'loading' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleManualImport}
                disabled={importing}
                className="btn btn-primary"
              >
                <Play className="btn-icon" />
                {importing ? "Starting..." : "Run Import"}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-text">
                  <p>Total Imports</p>
                  <p className="text-indigo">{stats.total}</p>
                </div>
                <div className="stat-card-icon stat-icon-indigo">
                  <FileText />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-text">
                  <p>Total Fetched</p>
                  <p style={{color: '#6366f1'}}>{stats.totalFetched}</p>
                  <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                    From all feeds
                  </p>
                </div>
                <div className="stat-card-icon" style={{background: '#f3e8ff'}}>
                  <Database style={{color: '#9333ea'}} />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-text">
                  <p>Successful</p>
                  <p className="text-green">{stats.success}</p>
                </div>
                <div className="stat-card-icon stat-icon-green">
                  <CheckCircle />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-text">
                  <p>With Failures</p>
                  <p className="text-red">{stats.failed}</p>
                </div>
                <div className="stat-card-icon stat-icon-red">
                  <AlertCircle />
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: '#1e40af'
          }}>
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'start'}}>
              <AlertCircle style={{width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.125rem'}} />
              <div>
                <strong>Understanding the counts:</strong>
                <ul style={{margin: '0.5rem 0 0 1.25rem', paddingLeft: 0}}>
                  <li><strong>Total:</strong> Raw items found in all RSS feeds (may include items without required fields)</li>
                  <li><strong>Skipped:</strong> Items skipped because no item update</li>
                  <li><strong>Invalid:</strong> Items skipped because they lack a GUID (unique identifier) - cannot be saved to database</li>
                  <li><strong>New:</strong> Valid items with GUID that were successfully created in the database</li>
                  <li><strong>Updated:</strong> Existing items that had content changes and were updated</li>
                  <li><strong>Failed:</strong> Items that encountered errors during database operations</li>
                </ul>
                <p style={{marginTop: '0.75rem', fontStyle: 'italic'}}>
                  Example: If Total=238 and New=234, it means 4 items (Invalid) were missing GUIDs and couldn't be saved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>List Of File Name / URL</th>
                  <th>
                    <div className="table-header-with-icon">
                      <Clock />
                      Imported At
                    </div>
                  </th>
                  <th className="text-center" title="Total items found in feeds">Total</th>
                  <th className="text-center" title="Items without GUID (skipped)">
                    <span style={{color: '#f59e0b'}}>Invalid</span>
                  </th>
                  <th className="text-center">
                    <span className="color-green-600">New</span>
                  </th>
                  <th className="text-center">
                    <span className="color-blue-600">Updated</span>
                  </th>
                  <th className="text-center">
                    <span style={{color: '#9333ea'}}>Skipped</span>
                  </th>
                  <th className="text-center">
                    <span className="color-red-600">Failed</span>
                  </th>
                  <th className="text-center">
                    <div className="table-header-centered">
                      <TrendingUp />
                      Success Rate
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="state-cell">
                      <div className="state-content">
                        <RefreshCw className="loading" />
                        <p>Loading import history...</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="state-cell">
                      <div className="state-content">
                        <FileText className="empty" />
                        <p>No import logs found</p>
                        <p>Start your first import to see history here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={log._id || idx}>
                      <td>
                        <div className="file-name-cell">
                          <FileText />
                          <div className="file-name-wrapper">
                            <p className="file-name-text" title={log.filename?.join(', ')}>
                              {log.filename?.length > 0 
                                ? `${log.filename.length} feed${log.filename.length > 1 ? 's' : ''}`
                                : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="date-text">
                        {log.finishedAt ? new Date(log.finishedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </td>
                      <td className="text-center">
                        <span className="badge badge-gray" title="Total items from feeds">
                          {log.totalFetched || 0}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge" style={{background: '#fef3c7', color: '#92400e'}} title="Items without GUID">
                          {log.invalidJobs || 0}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-green">
                          {log.newJobs || 0}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-blue">
                          {log.updatedJobs || 0}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge" style={{background: '#f3e8ff', color: '#6b21a8'}}>
                          {log.skippedJobs || 0}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${log.failedJobs > 0 ? 'badge-red' : 'badge-gray'}`}>
                          {log.failedJobs || 0}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="success-rate-cell">
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${getProgressClass(log)}`}
                              style={{ width: `${getSuccessRate(log)}%` }}
                            />
                          </div>
                          <span className={`success-rate-text ${getStatusColor(log)}`}>
                            {getSuccessRate(log)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        {!loading && logs.length > 0 && (
          <div className="table-footer">
            Showing {logs.length} import {logs.length === 1 ? 'record' : 'records'}
          </div>
        )}
      </div>
    </div>
  );
}
