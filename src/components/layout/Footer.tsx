import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin,
  Phone,
  Mail,
  MapPin,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const footerLinks = {
  courses: [
    { name: 'UPSC CSE', path: '/courses?category=UPSC' },
    { name: 'SSC Exams', path: '/courses?category=SSC' },
    { name: 'Judiciary', path: '/courses?category=Judiciary' },
    { name: 'CUET', path: '/courses?category=CUET' },
    { name: 'State PCS', path: '/courses?category=PCS' },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Our Faculty', path: '/faculty' },
    { name: 'Results', path: '/results' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' },
  ],
  resources: [
    { name: 'Demo Classes', path: '/demo-classes' },
    { name: 'Study Materials', path: '/resources' },
    { name: 'Current Affairs', path: '/current-affairs' },
    { name: 'Blog', path: '/blog' },
    { name: 'FAQ', path: '/faq' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Refund Policy', path: '/refund-policy' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-light/20">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-primary-foreground/70">
                Subscribe to our newsletter for exam tips, updates, and free resources.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-4 py-3 rounded-lg bg-primary-light/20 border border-primary-light/30 
                         text-primary-foreground placeholder:text-primary-foreground/50 
                         focus:outline-none focus:border-accent"
              />
              <Button className="bg-accent text-accent-foreground hover:bg-accent-light shadow-accent">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-2xl">E</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary-foreground">EduMentor</span>
                <span className="text-xs text-primary-foreground/70 -mt-1">Excellence in Education</span>
              </div>
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              India's leading coaching institute for competitive exams. 
              Empowering aspirants with expert guidance since 2009.
            </p>
            <div className="space-y-3">
              <a href="tel:+919876543210" className="flex items-center gap-3 text-primary-foreground/80 hover:text-accent transition-colors">
                <Phone className="w-5 h-5" />
                +91 98765 43210
              </a>
              <a href="mailto:info@edumentor.com" className="flex items-center gap-3 text-primary-foreground/80 hover:text-accent transition-colors">
                <Mail className="w-5 h-5" />
                info@edumentor.com
              </a>
              <div className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Education Hub, Connaught Place, New Delhi - 110001</span>
              </div>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Courses</h4>
            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* App Download */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Download App</h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 border-primary-foreground/30 text-primary-foreground hover:bg-primary-light">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs opacity-70">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 border-primary-foreground/30 text-primary-foreground hover:bg-primary-light">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs opacity-70">Download on</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-light/20">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-primary-foreground/60">
              <span>© 2024 EduMentor. All rights reserved.</span>
              {footerLinks.legal.map((link, index) => (
                <span key={link.name} className="flex items-center gap-4">
                  <span className="hidden md:inline">•</span>
                  <Link to={link.path} className="hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-primary-light/20 flex items-center justify-center 
                           text-primary-foreground/80 hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
