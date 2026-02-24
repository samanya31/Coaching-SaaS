import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CourseCard } from '@/components/cards/CourseCard';
import { Button } from '@/components/ui/button';
import { courses, categories } from '@/data/mockData';

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = !selectedMode || course.mode === selectedMode;
    return matchesCategory && matchesSearch && matchesMode;
  });

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedMode(null);
  };

  const hasActiveFilters = selectedCategory !== 'All' || searchQuery || selectedMode;

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-muted to-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold rounded-full bg-accent/15 text-accent-dark">
              Our Courses
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              Find Your Perfect <span className="text-gradient-primary">Course</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore our comprehensive range of courses designed for various competitive examinations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[72px] md:top-[120px] z-40 bg-background/95 backdrop-blur-md border-b border-border py-4">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card 
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                         transition-all"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Mode Filter */}
            <div className="flex gap-2">
              {['Online', 'Offline', 'Hybrid'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(selectedMode === mode ? null : mode)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    selectedMode === mode
                      ? 'border-accent bg-accent/15 text-accent-dark'
                      : 'border-border text-muted-foreground hover:border-accent/50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('All')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedMode && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/15 text-accent-dark text-sm">
                    {selectedMode}
                    <button onClick={() => setSelectedMode(null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-foreground text-sm">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-destructive hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Course Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {filteredCourses.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-8">
                Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">No courses found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
              <Button onClick={clearFilters} className="btn-hero-outline">
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* App CTA */}
      <section className="py-16 bg-accent/10">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Get Full Course Access on Our App
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Download the EduMentor app for the best learning experience with offline access, 
              live classes, and more.
            </p>
            <Button className="btn-hero-accent">
              View in App
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Courses;
