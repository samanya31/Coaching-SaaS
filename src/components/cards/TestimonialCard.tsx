import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Testimonial } from '@/data/mockData';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index?: number;
}

export const TestimonialCard = ({ testimonial, index = 0 }: TestimonialCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-elevated relative"
    >
      {/* Quote Icon */}
      <div className="absolute -top-4 -left-2 w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-accent">
        <Quote className="w-6 h-6 text-accent-foreground" />
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-4 pt-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-accent text-accent" />
        ))}
      </div>

      {/* Content */}
      <p className="text-foreground/80 mb-6 text-lg leading-relaxed">
        "{testimonial.content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-accent/20"
        />
        <div>
          <h4 className="font-bold text-foreground">{testimonial.name}</h4>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          <span className="text-xs text-accent-dark font-medium">{testimonial.course}</span>
        </div>
      </div>
    </motion.div>
  );
};
