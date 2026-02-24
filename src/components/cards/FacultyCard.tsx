import { motion } from 'framer-motion';
import { BookOpen, Users } from 'lucide-react';
import { Instructor } from '@/data/instructorsMockData';

interface FacultyCardProps {
  faculty: Instructor;
  index?: number;
}

export const FacultyCard = ({ faculty, index = 0 }: FacultyCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="faculty-card"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={faculty.avatar}
          alt={faculty.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

        {/* Experience Badge */}
        <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
          {faculty.experience}
        </div>

        {/* Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-primary-foreground mb-1">{faculty.name}</h3>
          <p className="text-primary-foreground/80 text-sm">{faculty.qualification}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 text-primary font-semibold mb-4">
          <BookOpen className="w-5 h-5" />
          <span>{faculty.subject}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Users className="w-4 h-4" />
          <span>{faculty.totalClasses}+ classes taken</span>
        </div>
      </div>
    </motion.div>
  );
};
