import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { achievements } from '@/data/mockData';

const resultStats = [
  { value: 1200, suffix: '+', label: 'Total Selections' },
  { value: 45, suffix: '', label: 'Top 100 Ranks' },
  { value: 98, suffix: '%', label: 'Success Rate' },
  { value: 15, suffix: '+', label: 'State Toppers' },
];

const examResults = [
  { exam: 'UPSC CSE 2024', selections: 156, topRank: 'AIR 7' },
  { exam: 'SSC CGL 2024', selections: 450, topRank: 'AIR 1' },
  { exam: 'Judiciary 2024', selections: 85, topRank: 'Rank 3' },
  { exam: 'State PCS 2024', selections: 230, topRank: 'Rank 2' },
  { exam: 'CUET 2024', selections: 320, topRank: '99.9%tile' },
];

const Results = () => {
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
              Our Results
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              Celebrating <span className="text-gradient-primary">Success Stories</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Our students' achievements are a testament to our commitment to excellence. 
              Here are some of our proud success stories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {resultStats.map((stat, index) => (
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

      {/* Exam-wise Results */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            badge="2024 Results"
            title="Exam-wise Performance"
            subtitle="A breakdown of our students' outstanding performance across various competitive examinations."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-elevated"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{result.exam}</h3>
                    <p className="text-sm text-muted-foreground">Selection Exam</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-accent-dark" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted">
                    <p className="text-2xl font-bold text-primary">{result.selections}</p>
                    <p className="text-sm text-muted-foreground">Selections</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/10">
                    <p className="text-2xl font-bold text-accent-dark">{result.topRank}</p>
                    <p className="text-sm text-muted-foreground">Top Rank</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Achievers */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionHeader
            badge="Top Achievers"
            title="Our Star Performers"
            subtitle="Meet the students who achieved remarkable ranks and made us proud."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <AchievementCard key={achievement.id} achievement={achievement} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Year-wise Trend */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            badge="Growth"
            title="Our Journey of Success"
            subtitle="Consistent improvement in our results over the years."
          />

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {[
                { year: '2024', selections: 1200, percentage: 100 },
                { year: '2023', selections: 980, percentage: 82 },
                { year: '2022', selections: 750, percentage: 62 },
                { year: '2021', selections: 620, percentage: 52 },
                { year: '2020', selections: 480, percentage: 40 },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="w-16 font-bold text-foreground">{item.year}</span>
                  <div className="flex-1 h-12 bg-muted rounded-xl overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-end pr-4"
                    >
                      <span className="text-primary-foreground font-bold">{item.selections}+</span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-accent/10">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Award className="w-16 h-16 mx-auto mb-6 text-accent" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Name Could Be Here Next Year
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join EduMentor and become a part of our success story. 
              Start your journey towards your dream career today.
            </p>
            <button className="btn-hero-accent">
              Start Your Journey
            </button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Results;
