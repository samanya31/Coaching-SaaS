import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FacultyCard } from '@/components/cards/FacultyCard';
import { useInstructors } from '@/hooks/data/useInstructors';

const Faculty = () => {
  const { data: instructors = [] } = useInstructors();

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
              Our Faculty
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              Learn from India's <span className="text-gradient-primary">Top Educators</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Our faculty comprises experienced educators who have mentored thousands of successful candidates
              across UPSC, SSC, Judiciary, and other competitive examinations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Faculty Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructors.filter((i: any) => i.status === 'active').map((member: any, index: number) => (
              <FacultyCard key={member.id} faculty={member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="py-16 bg-primary">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Join Our Team of Educators
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Are you passionate about teaching and shaping the future of India?
              We're always looking for talented educators to join our team.
            </p>
            <button className="btn-hero-accent">
              Apply Now
            </button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Faculty;
