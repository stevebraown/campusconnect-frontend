import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { helpAPI } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import MagneticCard from '../components/ui/MagneticCard';
import Skeleton from '../components/ui/Skeleton';
import Icon from '../components/ui/Icon';
import CategoryDetailPanel from '../components/help/CategoryDetailPanel';
import HelpAIChat from '../components/help/HelpAIChat';
import { HelpCircle, BookOpen, GraduationCap, Heart, Home, FileText, AlertCircle, RefreshCw } from '../components/ui/icons';

// Icon mapping for categories
const CATEGORY_ICONS = {
  coursework: BookOpen,
  exams: GraduationCap,
  money: FileText,
  accommodation: Home,
  wellbeing: Heart,
  visas: FileText,
  accessibility: FileText,
};

function Help() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadCategories();
    }
  }, [currentUser]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await helpAPI.getCategories();
      if (result.success && result.data?.categories) {
        setCategories(result.data.categories);
      } else {
        setError(result.error?.message || 'Failed to load help categories');
      }
    } catch (err) {
      console.error('Load categories error:', err);
      setError(err?.message || 'Failed to load help categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleClosePanel = () => {
    setSelectedCategory(null);
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-8 space-y-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-2">
            <Icon icon={HelpCircle} size={24} className="text-[var(--accent)]" decorative />
            <h2 className="text-2xl font-bold text-white">Help & Support</h2>
          </div>
        </GlassCard>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-8 space-y-6">
        <GlassCard>
          <div className="flex items-center gap-2 text-red-200">
            <Icon icon={AlertCircle} size={18} decorative />
            <span className="text-sm">Unable to load help categories: {error}</span>
          </div>
          <button
            type="button"
            onClick={loadCategories}
            className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white mt-3"
          >
            <Icon icon={RefreshCw} size={14} decorative />
            Retry
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto mt-8 space-y-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-2">
            <Icon icon={HelpCircle} size={24} className="text-[var(--accent)]" decorative />
            <h2 className="text-2xl font-bold text-white">Help & Support</h2>
          </div>
          <p className="text-white/70 mb-6">
            Explore self-help resources, connect with peers, and get instant AI-powered help for university questions.
          </p>
        </GlassCard>

        {/* Side-by-side layout: Categories on left, AI Chat on right */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Help Categories Section */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Help Categories</h3>
            {categories.length === 0 ? (
              <GlassCard>
                <p className="text-white/70 text-center py-8">
                  No help categories available yet. Please check back later.
                </p>
              </GlassCard>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-4">
                {categories.map((category) => {
                  const IconComponent = CATEGORY_ICONS[category.id] || HelpCircle;
                  return (
                    <MagneticCard
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] hover:border-white/20 cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
                      <div className="relative">
                        <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                          <Icon
                            icon={IconComponent}
                            size={32}
                            className="text-[var(--accent)]"
                            decorative
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{category.label}</h3>
                        <p className="text-sm text-white/60">
                          Self-help, peer support, and professional resources
                        </p>
                      </div>
                    </MagneticCard>
                  );
                })}
              </div>
            )}
          </section>

          {/* AI Chat Section */}
          <section className="lg:sticky lg:top-6 h-fit">
            <HelpAIChat userId={currentUser?.uid} />
          </section>
        </div>
      </div>

      {selectedCategory && (
        <CategoryDetailPanel category={selectedCategory} onClose={handleClosePanel} />
      )}
    </>
  );
}

export default Help;
