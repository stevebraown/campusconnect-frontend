import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';

function AdminContent() {
  const [content, setContent] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [page]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getContent(page, 20);
      setContent(res.data?.content || []);
      setPagination(res.data?.pagination);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      await adminAPI.moderateContent(postId, true);
      setContent(content.map(c => c.id === postId ? { ...c, approved: true } : c));
    } catch (err) {
      alert('Error approving content: ' + err.message);
    }
  };

  const handleReject = async (postId) => {
    try {
      await adminAPI.moderateContent(postId, false);
      setContent(content.map(c => c.id === postId ? { ...c, approved: false } : c));
    } catch (err) {
      alert('Error rejecting content: ' + err.message);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this content?')) return;
    try {
      await adminAPI.deleteContent(postId);
      setContent(content.filter(c => c.id !== postId));
    } catch (err) {
      alert('Error deleting content: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-2)]/10 to-[var(--accent)]/20 rounded-lg p-8 border border-[var(--accent)]/30">
        <h1 className="text-4xl font-bold mb-2 text-[var(--text-heading)]">Content Moderation</h1>
        <p className="text-[var(--text-primary)]">Review and manage user-generated content</p>
      </div>

      {/* Content List */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-[var(--text-heading)]">Error: {error}</div>
        ) : content.length === 0 ? (
          <div className="p-6 text-center text-[var(--text-muted)]">
            <p className="text-lg font-semibold text-[var(--text-heading)]">No content found</p>
            <p className="text-sm mt-2">All user-generated content will appear here for moderation</p>
          </div>
        ) : (
          <div className="divide-y divide-campus-gray-200">
            {content.map((post) => (
              <div key={post.id} className="p-6 hover:bg-campus-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-campus-gray-900">{post.title}</h3>
                    <p className="text-campus-gray-600 text-sm mt-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-campus-gray-600">
                      <span>By: {post.authorEmail}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full font-semibold ${
                        post.approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!post.approved && (
                      <button
                        onClick={() => handleApprove(post.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition"
                      >
                        Approve
                      </button>
                    )}
                    {post.approved && (
                      <button
                        onClick={() => handleReject(post.id)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded transition"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-campus-green-600 text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-campus-gray-600">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-campus-green-600 text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminContent;

