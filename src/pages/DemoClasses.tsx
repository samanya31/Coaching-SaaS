import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, User, Filter } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { demoClasses, categories } from '@/data/mockData';

const DemoClasses = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const filteredClasses = demoClasses.filter(
    (demo) => selectedCategory === 'All' || demo.category === selectedCategory
  );

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
              Free Demo Classes
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              Experience Our <span className="text-gradient-primary">Teaching Quality</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Watch free demo classes from our expert faculty before making your decision. 
              Get a taste of our teaching methodology and course content.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-border">
        <div className="container-custom">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
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
        </div>
      </section>

      {/* Demo Classes Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {filteredClasses.map((demo, index) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-elevated overflow-hidden"
              >
                {/* Video Thumbnail */}
                <div className="relative -mx-6 -mt-6 mb-6 aspect-video bg-foreground/5">
                  {playingVideo === demo.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${demo.videoId}?autoplay=1`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={demo.thumbnail}
                        alt={demo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                        <button
                          onClick={() => setPlayingVideo(demo.id)}
                          className="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-accent 
                                   hover:scale-110 transition-transform"
                        >
                          <Play className="w-8 h-8 text-accent-foreground fill-accent-foreground ml-1" />
                        </button>
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="course-badge">{demo.category}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">{demo.title}</h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {demo.instructor}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {demo.duration}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready for Full Access?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Unlock hundreds of hours of quality content, live classes, and personalized mentoring.
            </p>
            <button className="btn-hero-accent">
              Explore Full Courses
            </button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default DemoClasses;
