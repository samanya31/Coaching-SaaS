import { motion } from 'framer-motion';
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Award, 
  BookOpen,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Button } from '@/components/ui/button';

const achievements = [
  { value: 50000, suffix: '+', label: 'Students Trained' },
  { value: 1200, suffix: '+', label: 'Selections' },
  { value: 15, suffix: '+', label: 'Years Experience' },
  { value: 50, suffix: '+', label: 'Expert Faculty' },
];

const values = [
  {
    icon: Target,
    title: 'Result-Oriented Approach',
    description: 'Every strategy, material, and class is designed with one goal: your success in competitive exams.',
  },
  {
    icon: Heart,
    title: 'Student-First Philosophy',
    description: 'We believe in personalized attention and understanding each student\'s unique learning needs.',
  },
  {
    icon: BookOpen,
    title: 'Quality Content',
    description: 'Our study materials are meticulously researched and regularly updated to match exam patterns.',
  },
  {
    icon: Users,
    title: 'Community Learning',
    description: 'Learn alongside motivated peers who share your aspirations and drive for excellence.',
  },
];

const milestones = [
  { year: '2009', title: 'Foundation', description: 'EduMentor was founded with a vision to provide quality education.' },
  { year: '2012', title: 'First 100 Selections', description: 'Achieved a milestone of 100 successful selections across exams.' },
  { year: '2015', title: 'Online Launch', description: 'Expanded to online learning to reach students across India.' },
  { year: '2018', title: '500+ Selections', description: 'Crossed 500 selections with multiple top rankers.' },
  { year: '2021', title: 'App Launch', description: 'Launched our mobile app for seamless learning experience.' },
  { year: '2024', title: '1200+ Selections', description: 'Record-breaking year with 1200+ selections in various exams.' },
];

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-muted to-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold rounded-full bg-accent/15 text-accent-dark">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6">
              Shaping India's Future <span className="text-gradient-primary">Leaders</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              For over 15 years, EduMentor has been the trusted partner for aspirants 
              preparing for India's most prestigious competitive examinations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-primary-foreground/70 text-sm uppercase tracking-wide font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-feature"
            >
              <div className="w-16 h-16 mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-lg text-muted-foreground mb-6">
                To be India's most trusted and impactful institution for competitive exam preparation, 
                known for transforming aspirants into successful civil servants and professionals.
              </p>
              <ul className="space-y-3">
                {['Accessible quality education for all', 'Innovation in teaching methods', 'Pan-India reach through technology'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground/80">
                    <CheckCircle className="w-5 h-5 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card-feature"
            >
              <div className="w-16 h-16 mb-6 rounded-2xl bg-accent/15 flex items-center justify-center">
                <Target className="w-8 h-8 text-accent-dark" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                To provide comprehensive, result-oriented coaching with personalized mentoring, 
                quality study materials, and innovative teaching methods that empower every student to succeed.
              </p>
              <ul className="space-y-3">
                {['Personalized learning paths', '100% exam-focused curriculum', 'Continuous support & guidance'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground/80">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionHeader
            badge="Our Values"
            title="What We Stand For"
            subtitle="Our core values guide everything we do and shape the experience we create for our students."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-elevated text-center"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-primary/10 flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            badge="Our Journey"
            title="15+ Years of Excellence"
            subtitle="From a small classroom to India's leading coaching institute - our story of growth and impact."
          />

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden lg:block" />

            <div className="space-y-8 lg:space-y-0">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative lg:flex items-center ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                    <div className="card-elevated">
                      <span className="text-3xl font-extrabold text-accent mb-2 block">{milestone.year}</span>
                      <h3 className="text-xl font-bold text-foreground mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-background hidden lg:block" />

                  <div className="lg:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Message */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-feature text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-accent/20">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200"
                  alt="Director"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Dr. Vinod Sharma</h3>
              <p className="text-accent-dark font-semibold mb-6">Founder & Director</p>
              <blockquote className="text-lg text-muted-foreground italic leading-relaxed mb-8">
                "Education is not just about passing exams; it's about building character, 
                developing critical thinking, and preparing future leaders who will serve our nation. 
                At EduMentor, we are committed to nurturing not just successful candidates, 
                but responsible citizens who will make a difference."
              </blockquote>
              <Award className="w-12 h-12 mx-auto text-accent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Join the EduMentor Family?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Take the first step towards your dream career. Explore our courses and start your journey today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/courses">
                <Button className="btn-hero-accent gap-2">
                  Explore Courses
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button className="btn-hero-outline">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
