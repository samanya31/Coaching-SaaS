import { motion } from 'framer-motion';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader = ({
  badge,
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}
    >
      {badge && (
        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-accent/15 text-accent-dark">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg text-muted-foreground ${align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
