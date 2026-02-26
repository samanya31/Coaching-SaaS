import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    details: ['+91 98765 43210', '+91 98765 43211'],
    action: 'tel:+919876543210',
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['info@edumentor.com', 'support@edumentor.com'],
    action: 'mailto:info@edumentor.com',
  },
  {
    icon: MapPin,
    title: 'Address',
    details: ['123 Education Hub', 'Connaught Place, New Delhi - 110001'],
    action: 'https://maps.google.com',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    details: ['Monday - Saturday', '9:00 AM - 8:00 PM'],
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: 'Message Sent!',
      description: 'We\'ll get back to you within 24 hours.',
    });

    setFormData({ name: '', email: '', phone: '', course: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
              Contact Us
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              Get in <span className="text-gradient-primary">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Have questions about our courses? We're here to help. 
              Reach out to us and our team will respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-elevated"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background
                               focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                               transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background
                               focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                               transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background
                               focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                               transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Interested Course
                    </label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background
                               focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                               transition-all"
                    >
                      <option value="">Select a course</option>
                      <option value="UPSC">UPSC CSE</option>
                      <option value="SSC">SSC Exams</option>
                      <option value="Judiciary">Judiciary</option>
                      <option value="CUET">CUET</option>
                      <option value="PCS">State PCS</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                             transition-all resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 text-lg btn-hero-accent gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card-elevated flex items-start gap-5"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{info.title}</h3>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-muted-foreground">
                        {info.action && i === 0 ? (
                          <a href={info.action} className="hover:text-primary transition-colors">
                            {detail}
                          </a>
                        ) : (
                          detail
                        )}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* WhatsApp CTA */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="card-feature bg-success/10 border-success/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">Quick Support on WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">Get instant responses to your queries</p>
                  </div>
                  <Button className="bg-success text-success-foreground hover:bg-success/90">
                    Chat Now
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.6743466629347!2d77.21659961508096!3d28.632869982420848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b741d057%3A0xcdee88e47393c3f1!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1645123456789!5m2!1sen!2sin"
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </Layout>
  );
};

export default Contact;
