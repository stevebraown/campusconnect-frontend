// Compact status panel for signed-in users
import { useAuth } from '../../context/AuthContext';

function UserStatus() {
  // Pull auth state and actions
  const { currentUser, logout } = useAuth();

  // Trigger a logout and log success
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      console.log('Logged out successfully');
    }
  };

  // Show a placeholder when no user is signed in
  if (!currentUser) {
    return (
      <div className="bg-campus-gray-100 border border-campus-gray-300 rounded-lg p-4 text-center">
        <p className="text-campus-gray-700">
          Not logged in
        </p>
      </div>
    );
  }

  // Render the current user's session details
  return (
    <div className="bg-campus-green-50 border border-campus-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-campus-gray-600">Logged in as:</p>
          <p className="font-semibold text-campus-green-700">{currentUser.email}</p>
          <p className="text-xs text-campus-gray-500 mt-1">
            User ID: {currentUser.uid.substring(0, 8)}...
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn-secondary text-sm px-4 py-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default UserStatus;