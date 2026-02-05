// Search and filter controls for the directory
import { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import { Search, X } from '../ui/icons';

function SearchFilters({ onSearch, onFilterChange, allInterests, allMajors, allYears }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleMajorChange = (e) => {
    const value = e.target.value;
    setSelectedMajor(value);
    onFilterChange({ major: value, year: selectedYear, interest: selectedInterest });
  };

  const handleYearChange = (e) => {
    const value = e.target.value;
    setSelectedYear(value);
    onFilterChange({ major: selectedMajor, year: value, interest: selectedInterest });
  };

  const handleInterestChange = (e) => {
    const value = e.target.value;
    setSelectedInterest(value);
    onFilterChange({ major: selectedMajor, year: selectedYear, interest: value });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMajor('');
    setSelectedYear('');
    setSelectedInterest('');
    onSearch('');
    onFilterChange({ major: '', year: '', interest: '' });
  };

  const hasActiveFilters = searchTerm || selectedMajor || selectedYear || selectedInterest;

  return (
    <GlassCard className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon icon={Search} size={20} className="text-[var(--accent)]" decorative />
        <h3 className="text-lg font-semibold text-white">
          Search & Filter
        </h3>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          label="Search by name"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Major Filter */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Major
          </label>
          <select
            value={selectedMajor}
            onChange={handleMajorChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          >
            <option value="">All Majors</option>
            {allMajors.map(major => (
              <option key={major} value={major} className="bg-[var(--bg-obsidian)]">{major}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          >
            <option value="">All Years</option>
            {allYears.map(year => (
              <option key={year} value={year} className="bg-[var(--bg-obsidian)]">{year}</option>
            ))}
          </select>
        </div>

        {/* Interest Filter */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Interest
          </label>
          <select
            value={selectedInterest}
            onChange={handleInterestChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          >
            <option value="">All Interests</option>
            {allInterests.map(interest => (
              <option key={interest} value={interest} className="bg-[var(--bg-obsidian)]">{interest}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-white/70 hover:text-white font-medium flex items-center gap-1"
          >
            <Icon icon={X} size={14} decorative />
            Clear all filters
          </button>
        </div>
      )}
    </GlassCard>
  );
}

export default SearchFilters;