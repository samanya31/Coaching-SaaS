import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Download,
  Play,
  GraduationCap,
  Target,
  BookOpen,
  Users,
  Monitor,
  Trophy,
  Smartphone,
  CheckCircle,
  Star
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/Hero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { CourseCard } from '@/components/cards/CourseCard';
import { FacultyCard } from '@/components/cards/FacultyCard';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { Button } from '@/components/ui/button';
import { stats, courses, faculty, testimonials, whyChooseUs } from '@/data/mockData';

// New Landing Page Components
import { TrustStats } from '@/components/landing/TrustStats';
import { ResultsSection } from '@/components/landing/ResultsSection';
import { ExamCategories } from '@/components/landing/ExamCategories';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Target,
  BookOpen,
  Users,
  Monitor,
  Trophy,
};

const Index = () => {
  return (
    <Layout>
      {/* Hero Section - Contains: Carousel + Value Prop + Features Grid */}
      <Hero />

      {/* NEW: Exam Categories - Features Grid overlaps this section */}
      <ExamCategories />





      {/* Popular Courses */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionHeader
            badge="Our Courses"
            title="Popular Courses"
            subtitle="Choose from our wide range of courses designed by experts for various competitive examinations."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.slice(0, 6).map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/courses">
              <Button size="lg" className="btn-hero-primary gap-2">
                View All Courses
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* NEW: Results Section */}
      <ResultsSection />

      {/* NEW: Trust Stats Section */}
      <TrustStats />

      {/* Faculty Section */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            badge="Expert Faculty"
            title="Learn from the Best"
            subtitle="Our faculty comprises experienced educators who have mentored thousands of successful candidates."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {faculty.slice(0, 3).map((member, index) => (
              <FacultyCard key={member.id} faculty={member} index={index} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/faculty">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2">
                Meet All Faculty
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* App Promotion */}
      <section className="section-padding bg-primary overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-accent text-accent-foreground">
                Download Now
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                Learn Anytime, Anywhere with Our App
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8">
                Get access to all courses, live classes, mock tests, and study materials
                right on your smartphone. Download now and start your preparation journey.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  'Live interactive classes',
                  'Offline video downloads',
                  'Daily practice questions',
                  'Progress tracking & analytics',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-primary-foreground/90">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent-light shadow-accent gap-3">
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-xs opacity-70">Get it on</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-light gap-3">
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-xs opacity-70">Download on</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative">
                <div className="w-64 h-auto bg-foreground rounded-[3rem] p-3 shadow-large">
                  <div className="w-full aspect-[9/19] bg-gradient-to-b from-muted to-background rounded-[2.5rem] flex items-center justify-center">
                    <div className="text-center px-6">
                      <Smartphone className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <h3 className="font-bold text-foreground mb-2">EduMentor App</h3>
                      <p className="text-sm text-muted-foreground">
                        Your complete exam preparation companion
                      </p>
                    </div>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-2xl bg-accent/20 blur-xl" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent/30 blur-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>


    </Layout>
  );
};

export default Index;
