// Form for creating or editing a user profile
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
// API helpers including AI-driven onboarding validation.
import { userAPI, onboardingAPI } from '../../services/api';
import Icon from '../ui/Icon';
import { User, CheckCircle, AlertCircle } from '../ui/icons';

// Academic year options
const ACADEMIC_YEARS = ['Level 4', 'Level 5', 'Level 6', 'Masters', 'PHD', 'Alumni'];

// Popular interests (users can add more)
const POPULAR_INTERESTS = [
  'AI & Machine Learning',
  'Web Development',
  'Mobile Development',
  'Gaming',
  'Sports',
  'Music',
  'Art & Design',
  'Photography',
  'Reading',
  'Entrepreneurship',
  'Data Science',
  'Robotics',
];

function ProfileForm({ existingProfile, onComplete }) {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    major: '',
    year: '',
    bio: '',
    interests: [],
  });
  
  const [customInterest, setCustomInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load existing profile data if editing
  useEffect(() => {
    if (existingProfile) {
      setFormData({
        name: existingProfile.name || '',
        major: existingProfile.major || '',
        year: existingProfile.year || '',
        bio: existingProfile.bio || '',
        interests: existingProfile.interests || [],
      });
    }
  }, [existingProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, customInterest.trim()],
      }));
      setCustomInterest('');
    }
  };

  const removeInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.major.trim()) {
      setError('Please enter your major');
      return;
    }

    if (!formData.year) {
      setError('Please select your academic year');
      return;
    }

    if (formData.interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setLoading(true);

    // AI-driven onboarding validation (campusconnect-ai) before saving profile.
    try {
      const onboardingRes = await onboardingAPI.step({
        formData,
      });

      if (onboardingRes.success && onboardingRes.data?.isValid === false) {
        const firstError = Object.values(onboardingRes.data?.validationErrors || {})[0];
        setError(firstError || 'Please review your profile details.');
        setLoading(false);
        return;
      }
    } catch (err) {
      // AI validation is advisory; fall back to existing local validation if it fails.
      console.warn('Onboarding AI validation failed, proceeding with local validation.', err);
    }

    const profileData = {
      // Note: email is not part of profile data per backend sanitizeProfile
      name: formData.name.trim(),
      major: formData.major.trim(),
      year: formData.year,
      bio: formData.bio.trim(),
      interests: formData.interests,
    };

    // userAPI.updateProfile uses PUT which handles both create and update (backend uses merge: true)
    const result = await userAPI.updateProfile(currentUser.uid, profileData);

    if (result.success) {
      setSuccess(true);
      
      if (onComplete) {
        setTimeout(() => {
          // Pass the profile data to onComplete
          onComplete(result.data?.profile || profileData);
        }, 1500);
      }
    } else {
      setError(result.error?.message || result.error || 'Failed to save profile. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="glass-panel max-w-2xl mx-auto mt-8 p-6">
      <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-2 flex items-center gap-2">
        <Icon icon={User} size={24} className="text-[var(--accent)]" decorative />
        {existingProfile ? 'Edit Your Profile' : 'Create Your Profile'}
      </h2>
      <p className="text-[var(--text-primary)] mb-6">
        Tell us about yourself to connect with like-minded students
      </p>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <Icon icon={CheckCircle} size={20} className="text-emerald-400" decorative />
            <p className="font-semibold text-[var(--text-heading)]">
              Profile {existingProfile ? 'updated' : 'created'} successfully!
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/15 border border-red-500/30 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <Icon icon={AlertCircle} size={20} className="text-red-400" decorative />
            <p className="font-semibold text-[var(--text-heading)]">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-[var(--text-primary)] placeholder:text-white/50 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent backdrop-blur-xl"
            disabled={loading}
          />
        </div>

        {/* Major Field */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Major / Field of Study *
          </label>
          <input
            type="text"
            name="major"
            value={formData.major}
            onChange={handleChange}
            placeholder="Computer Science"
            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-[var(--text-primary)] placeholder:text-white/50 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent backdrop-blur-xl"
            disabled={loading}
          />
        </div>

        {/* Academic Year */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Academic Year *
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent backdrop-blur-xl"
            disabled={loading}
          >
            <option value="">Select your year</option>
            {ACADEMIC_YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Bio Field */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Bio (Optional)
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-[var(--text-primary)] placeholder:text-white/50 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent backdrop-blur-xl resize-none"
            disabled={loading}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formData.bio.length}/500 characters
          </p>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Interests * (Select at least one)
          </label>
          
          {/* Popular Interests */}
          <div className="flex flex-wrap gap-2 mb-3">
            {POPULAR_INTERESTS.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  formData.interests.includes(interest)
                    ? 'bg-[var(--accent)] text-white shadow-glow'
                    : 'bg-white/10 text-[var(--text-primary)] hover:bg-white/20 border border-white/10'
                }`}
                disabled={loading}
              >
                {interest}
              </button>
            ))}
          </div>

          {/* Selected Interests (including custom) */}
          {formData.interests.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Selected:</p>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map(interest => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-[var(--text-heading)] rounded-full text-sm border border-emerald-500/30"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="hover:text-[var(--accent)] transition-colors"
                      disabled={loading}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Interest */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Add custom interest..."
              className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-[var(--text-primary)] placeholder:text-white/50 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent backdrop-blur-xl"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomInterest();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomInterest}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[var(--text-primary)] rounded-lg border border-white/10 transition-colors font-medium"
              disabled={loading || !customInterest.trim()}
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-[var(--accent)] hover:bg-[var(--success)] text-white font-semibold rounded-lg shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Saving Profile...
            </span>
          ) : (
            existingProfile ? 'Update Profile' : 'Create Profile'
          )}
        </button>
      </form>
    </div>
  );
}

export default ProfileForm;