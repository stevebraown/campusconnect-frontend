// Container for the directory list and selected profile detail
import { useState } from 'react';
import UserDirectory from './UserDirectory';
import UserDetailModal from './UserDetailModal';

function DirectoryManager() {
  // Track the user profile currently selected
  const [selectedUser, setSelectedUser] = useState(null);

  // Open the modal with the selected profile
  const handleUserClick = (profile) => {
    setSelectedUser(profile);
  };

  // Close the profile modal
  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <UserDirectory onUserClick={handleUserClick} />
      <UserDetailModal profile={selectedUser} onClose={handleCloseModal} />
    </>
  );
}

export default DirectoryManager;