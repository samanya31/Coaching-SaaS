import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Achievement } from '@/data/mockData';

interface AchievementCardProps {
  achievement: Achievement;
  index?: number;
}

export const AchievementCard = ({ achievement, index = 0 }: AchievementCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-elevated relative text-center group"
    >
      {/* Rank Badge */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full font-bold shadow-accent">
        <Trophy className="w-4 h-4" />
        {achievement.rank}
      </div>

      {/* Image */}
      <div className="w-24 h-24 mx-auto mt-6 mb-4 rounded-full overflow-hidden ring-4 ring-accent/20 group-hover:ring-accent/40 transition-all">
        <img
          src={achievement.image}
          alt={achievement.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-1">{achievement.name}</h3>
      <p className="text-primary font-semibold mb-2">{achievement.exam}</p>
      <p className="text-sm text-muted-foreground mb-4">{achievement.year}</p>

      {/* Quote */}
      <p className="text-sm text-foreground/70 italic">"{achievement.quote}"</p>
    </motion.div>
  );
};
