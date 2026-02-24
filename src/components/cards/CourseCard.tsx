import { motion } from 'framer-motion';
import { Clock, Users, Star, ArrowRight } from 'lucide-react';
import { Course } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  course: Course;
  index?: number;
}

export const CourseCard = ({ course, index = 0 }: CourseCardProps) => {
  const discount = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-feature group relative overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 -mx-8 -mt-8 mb-6 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        
        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className="course-badge">{course.category}</span>
        </div>
        
        {/* Discount */}
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
            {discount}% OFF
          </div>
        )}

        {/* Mode */}
        <div className="absolute bottom-4 left-4 text-primary-foreground text-sm font-medium">
          {course.mode} • {course.duration}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
        {course.title}
      </h3>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{course.students.toLocaleString()} students</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span>{course.rating}</span>
        </div>
      </div>

      {/* Price & CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">₹{course.price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground line-through">₹{course.originalPrice.toLocaleString()}</span>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-light gap-2 group/btn">
          View Details
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
};
