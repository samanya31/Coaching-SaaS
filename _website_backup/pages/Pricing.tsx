import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { pricingPlans } from '@/data/mockData';

const Pricing = () => {
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
              Pricing Plans
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              Invest in Your <span className="text-gradient-primary">Future</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose a plan that fits your needs. All plans include access to our comprehensive 
              study materials and expert guidance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-primary text-primary-foreground shadow-large scale-105'
                    : 'bg-card border border-border shadow-soft'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-bold shadow-accent">
                      <Star className="w-4 h-4 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-5xl font-extrabold ${plan.popular ? 'text-primary-foreground' : 'text-foreground'}`}>
                      ₹{plan.price.toLocaleString()}
                    </span>
                    <span className={`text-lg ${plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'bg-accent/20' : 'bg-success/20'
                      }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-accent' : 'text-success'}`} />
                      </div>
                      <span className={plan.popular ? 'text-primary-foreground/90' : 'text-foreground/80'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full py-6 text-lg font-semibold ${
                    plan.popular
                      ? 'bg-accent text-accent-foreground hover:bg-accent-light shadow-accent'
                      : 'bg-primary text-primary-foreground hover:bg-primary-light'
                  }`}
                >
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* One-Time Courses */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionHeader
            badge="One-Time Purchase"
            title="Complete Course Bundles"
            subtitle="Get lifetime access to specific exam courses with a one-time payment."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'UPSC Complete', price: 49999, duration: '18 months access' },
              { name: 'SSC Master Bundle', price: 24999, duration: '12 months access' },
              { name: 'Judiciary Prep', price: 54999, duration: '24 months access' },
            ].map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-elevated text-center"
              >
                <Zap className="w-10 h-10 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-bold text-foreground mb-2">{course.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{course.duration}</p>
                <p className="text-3xl font-extrabold text-primary mb-6">
                  ₹{course.price.toLocaleString()}
                </p>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Learn More
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Have Questions About Pricing?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Contact our team for custom plans, group discounts, or any queries about our courses.
            </p>
            <Button className="btn-hero-outline">
              Contact Sales
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing;
