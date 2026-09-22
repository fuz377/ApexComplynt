import React, { useState, useEffect } from 'react';
import { complaintApi } from '../services/api';

interface AnalyticsData {
  totalComplaints: number;
  statusBreakdown: Array<{ _id: string; count: number }>;
  priorityBreakdown: Array<{ _id: string; count: number }>;
  categoryBreakdown: Array<{ _id: string; count: number }>;
  anonymousCount: number;
  identifiedCount: number;
  trendData: Array<{ _id: string; count: number }>;
  avgResolutionTime: number;
  topComplainers: Array<{
    userId: string;
    name: string;
    email: string;
    complaintCount: number;
  }>;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await complaintApi.getAnalytics();
      setAnalytics(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      const response = await complaintApi.downloadAnalyticsPDF();
      
      // Create a blob from the response and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download failed:', err);
      const errorMsg = err?.message || err?.data?.message || 'Failed to download PDF';
      alert(errorMsg);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {downloading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={fetchAnalytics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Complaints */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.totalComplaints}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 3v2H5v14h14V5h-4V3H9zm3 4v4h4v-4h-4z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Anonymous Complaints */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Anonymous</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.anonymousCount}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Identified Complaints */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Identified</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.identifiedCount}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Avg Resolution Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Resolution</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.avgResolutionTime}d
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-4">
                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdowns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Status Breakdown</h2>
            <div className="space-y-3">
              {analytics.statusBreakdown.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-gray-600">{item._id || 'Unknown'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.totalComplaints) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-900 font-medium w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Priority Breakdown</h2>
            <div className="space-y-3">
              {analytics.priorityBreakdown.map((item) => {
                const getColorClass = (priority: string) => {
                  switch (priority) {
                    case 'CRITICAL':
                      return 'bg-red-600';
                    case 'HIGH':
                      return 'bg-orange-600';
                    case 'MEDIUM':
                      return 'bg-yellow-600';
                    case 'LOW':
                      return 'bg-green-600';
                    default:
                      return 'bg-gray-600';
                  }
                };
                return (
                  <div key={item._id} className="flex items-center justify-between">
                    <span className="text-gray-600">{item._id || 'Unknown'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getColorClass(item._id)}`}
                          style={{
                            width: `${(item.count / analytics.totalComplaints) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-gray-900 font-medium w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Category Breakdown</h2>
            <div className="space-y-3">
              {analytics.categoryBreakdown.slice(0, 5).map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-gray-600 truncate">{item._id || 'Unknown'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.totalComplaints) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-900 font-medium w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Complainers */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Complainers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Complaints</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topComplainers.map((complainer) => (
                  <tr key={complainer.userId} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{complainer.name}</td>
                    <td className="py-3 px-4 text-gray-600">{complainer.email}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {complainer.complaintCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend Chart */}
        {analytics.trendData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">30-Day Trend</h2>
            <div className="flex items-end gap-1 h-40">
              {analytics.trendData.map((day) => {
                const maxCount = Math.max(...analytics.trendData.map((d) => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div
                    key={day._id}
                    className="flex-1 flex flex-col items-center"
                    title={`${day._id}: ${day.count} complaints`}
                  >
                    <div
                      className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors"
                      style={{ height: `${height}%` }}
                    ></div>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      {new Date(day._id).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
