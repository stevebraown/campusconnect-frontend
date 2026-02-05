import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActions, setShowActions] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getUsers(page, 20, search);
      setUsers(res.data?.users || []);
      setPagination(res.data?.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid, newRole) => {
    try {
      await adminAPI.updateUserRole(uid, newRole);
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      setShowActions(null);
    } catch (err) {
      alert('Error updating role: ' + err.message);
    }
  };

  const handleDisableUser = async (uid) => {
    if (!confirm('Are you sure? This cannot be easily undone.')) return;
    try {
      await adminAPI.disableUser(uid, true);
      setUsers(users.map(u => u.uid === uid ? { ...u, disabled: true } : u));
      setShowActions(null);
    } catch (err) {
      alert('Error disabling user: ' + err.message);
    }
  };

  const handleEnableUser = async (uid) => {
    try {
      await adminAPI.disableUser(uid, false);
      setUsers(users.map(u => u.uid === uid ? { ...u, disabled: false } : u));
      setShowActions(null);
    } catch (err) {
      alert('Error enabling user: ' + err.message);
    }
  };

  const handleSetPassword = async (uid) => {
    const password = prompt('Enter a temporary password (min 6 chars):');
    if (!password) return;
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      await adminAPI.setUserPassword(uid, password);
      alert('Password updated');
      setShowActions(null);
    } catch (err) {
      alert('Error setting password: ' + err.message);
    }
  };

  const handleEditProfile = async (user) => {
    const name = prompt('Name', user.name || '');
    const major = prompt('Major', user.major || '');
    const year = prompt('Year', user.year || '');
    const interests = prompt('Interests (comma separated)', Array.isArray(user.interests) ? user.interests.join(', ') : '');
    const avatarUrl = prompt('Avatar URL (optional)', user.avatarUrl || '');

    try {
      await adminAPI.updateUserProfile(user.uid, {
        name: name || '',
        major: major || '',
        year: year || '',
        interests: interests ? interests.split(',').map((i) => i.trim()).filter(Boolean) : [],
        avatarUrl: avatarUrl || '',
      });

      setUsers(users.map((u) => (u.uid === user.uid ? { ...u, name, major, year, interests: interests.split(',').map((i) => i.trim()).filter(Boolean), avatarUrl } : u)));
      setShowActions(null);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!confirm('This will permanently delete the user. Are you absolutely sure?')) return;
    try {
      await adminAPI.deleteUser(uid);
      setUsers(users.filter(u => u.uid !== uid));
      setShowActions(null);
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const handleCreateUser = async () => {
    const email = prompt('Enter email for new user:');
    if (!email) return;
    const password = prompt('Enter temporary password (min 6 chars):');
    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    const name = prompt('Name (optional):') || '';
    const roleInput = prompt("Role ('user' or 'admin'):", 'user') || 'user';
    const role = roleInput === 'admin' ? 'admin' : 'user';
    try {
      const res = await adminAPI.createUser(email, password, role, name);
      const newUser = res.data?.user;
      if (newUser) {
        setUsers([newUser, ...users]);
        alert('User created');
      }
    } catch (err) {
      alert('Error creating user: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-2)]/10 to-[var(--accent)]/20 rounded-lg p-8 border border-[var(--accent)]/30">
        <h1 className="text-4xl font-bold mb-2 text-[var(--text-heading)]">Manage Users</h1>
        <p className="text-[var(--text-primary)]">View, edit, disable, or delete user accounts</p>
      </div>

      {/* Search + Create */}
      <div className="glass-panel p-6">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-[var(--text-primary)] placeholder:text-white/50 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent backdrop-blur-xl"
          />
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--success)] shadow-glow transition"
          >
            + Create User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-[var(--text-heading)]">Error: {error}</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-[var(--text-muted)]">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-6 py-4 text-sm font-medium text-[var(--text-heading)]">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">{user.name || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.disabled
                          ? 'bg-white/10 text-[var(--text-muted)] border border-white/10'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {user.disabled ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === user.uid ? null : user.uid)}
                          className="text-[var(--accent)] hover:text-[var(--success)] font-semibold"
                        >
                          ⋮
                        </button>
                        {showActions === user.uid && (
                          <div className="absolute right-0 mt-2 w-48 glass-panel p-2 z-10">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleRoleChange(user.uid, 'admin')}
                                className="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-[var(--text-primary)] rounded"
                              >
                                Make Admin
                              </button>
                            )}
                            {user.role === 'admin' && (
                              <button
                                onClick={() => handleRoleChange(user.uid, 'user')}
                                className="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-[var(--text-primary)] rounded"
                              >
                                Revoke Admin
                              </button>
                            )}
                            <button
                              onClick={() => handleEditProfile(user)}
                              className="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-[var(--text-primary)] rounded"
                            >
                              Edit Profile
                            </button>
                            <button
                              onClick={() => handleSetPassword(user.uid)}
                              className="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-[var(--text-primary)] rounded"
                            >
                              Set Temp Password
                            </button>
                            {!user.disabled ? (
                              <button
                                onClick={() => handleDisableUser(user.uid)}
                                className="block w-full text-left px-4 py-2 hover:bg-orange-500/10 text-sm text-orange-300 rounded"
                              >
                                Freeze (Disable)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnableUser(user.uid)}
                                className="block w-full text-left px-4 py-2 hover:bg-emerald-500/10 text-sm text-emerald-300 rounded"
                              >
                                Unfreeze (Enable)
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.uid)}
                              className="block w-full text-left px-4 py-2 hover:bg-red-500/10 text-sm text-red-300 border-t border-white/10 rounded"
                            >
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 hover:bg-[var(--success)] transition"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--text-primary)]">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 hover:bg-[var(--success)] transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;

