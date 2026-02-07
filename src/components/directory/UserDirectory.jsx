// Directory search and filtering for student profiles
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import UserCard from './UserCard';
import SearchFilters from './SearchFilters';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import Icon from '../ui/Icon';
import { Search, GraduationCap, RefreshCw } from '../ui/icons';
import Button from '../ui/Button';

function UserDirectory({ onUserClick }) {
  const { currentUser } = useAuth();
  const [allProfiles, setAllProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    major: '',
    year: '',
    interest: '',
  });

  const loadProfiles = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await userAPI.getAllUsers(50, 0);

      // userAPI.getAllUsers returns { success, profiles, total, returned, limit, offset }
      // Backend already excludes current user, so no need to filter
      if (result.success && result.data?.profiles) {
        setAllProfiles(result.data.profiles);
        setFilteredProfiles(result.data.profiles);
      } else {
        setError(result.error?.message || result.error || 'Failed to load profiles');
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles. Please try again.');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const applyFilters = () => {
    let filtered = [...allProfiles];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by major
    if (filters.major) {
      filtered = filtered.filter(profile =>
        profile.major.toLowerCase() === filters.major.toLowerCase()
      );
    }

    // Filter by year
    if (filters.year) {
      filtered = filtered.filter(profile =>
        profile.year === filters.year
      );
    }

    // Filter by interest
    if (filters.interest) {
      filtered = filtered.filter(profile =>
        profile.interests?.some(interest =>
          interest.toLowerCase() === filters.interest.toLowerCase()
        )
      );
    }

    setFilteredProfiles(filtered);
  };

  // Apply filters whenever profiles or filters change
  useEffect(() => {
    applyFilters();
  }, [allProfiles, searchTerm, filters]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Get unique values for filter dropdowns
  const uniqueMajors = useMemo(() => {
    return [...new Set(allProfiles.map(p => p.major))].sort();
  }, [allProfiles]);

  const uniqueYears = useMemo(() => {
    return [...new Set(allProfiles.map(p => p.year))].sort();
  }, [allProfiles]);

  const uniqueInterests = useMemo(() => {
    const allInterests = allProfiles.flatMap(p => p.interests || []);
    return [...new Set(allInterests)].sort();
  }, [allProfiles]);

  if (!currentUser) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Authentication Required"
        description="Please log in to browse users"
        actionLabel="Go to Login"
        action={() => window.location.href = '/login'}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Icon icon={Search} size={28} className="text-[var(--accent)]" decorative />
          Discover Students
        </h2>
        <p className="text-white/70">
          Connect with students who share your interests
        </p>
      </div>

      {/* Search & Filters */}
      {!loading && allProfiles.length > 0 && (
        <SearchFilters
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          allInterests={uniqueInterests}
          allMajors={uniqueMajors}
          allYears={uniqueYears}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-48" />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <GlassCard className="mb-4 border-red-500/50">
          <p className="font-semibold text-red-300">{error}</p>
        </GlassCard>
      )}

      {/* Empty State - No Users */}
      {!loading && !error && allProfiles.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No Students Yet"
          description="Be the first to create a profile and start connecting!"
        />
      )}

      {/* Empty State - No Results */}
      {!loading && !error && allProfiles.length > 0 && filteredProfiles.length === 0 && (
        <EmptyState
          icon={Search}
          title="No Results Found"
          description="Try adjusting your search or filters"
          actionLabel="Clear Filters"
          action={() => {
            setSearchTerm('');
            setFilters({ major: '', year: '', interest: '' });
          }}
        />
      )}

      {/* User Grid */}
      {!loading && !error && filteredProfiles.length > 0 && (
        <>
          {/* Stats */}
          <GlassCard className="mb-6">
            <p className="text-white/80">
              Showing{' '}
              <span className="font-bold text-[var(--accent)] text-2xl">
                {filteredProfiles.length}
              </span>{' '}
              of{' '}
              <span className="font-bold text-[var(--accent)]">
                {allProfiles.length}
              </span>{' '}
              {allProfiles.length === 1 ? 'student' : 'students'}
            </p>
          </GlassCard>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <UserCard
                key={profile.id}
                profile={profile}
                onClick={onUserClick}
              />
            ))}
          </div>
        </>
      )}

      {/* Refresh Button */}
      {!loading && allProfiles.length > 0 && (
        <div className="text-center mt-8">
          <Button
            onClick={loadProfiles}
            variant="ghost"
            disabled={loading}
            icon={<Icon icon={RefreshCw} size={16} className={loading ? 'animate-spin' : ''} decorative />}
          >
            Refresh List
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserDirectory;