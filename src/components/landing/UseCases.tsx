import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Users, Code, Heart, Lightbulb } from 'lucide-react';

const useCases = [
  {
    icon: GraduationCap,
    title: 'For Students',
    description: 'Organize lecture notes, research, assignments, and study materials all in one place.',
    features: ['Class notes', 'Study guides', 'Research papers', 'Assignment tracking'],
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Briefcase,
    title: 'For Professionals',
    description: 'Securely store meeting notes, project details, credentials, and important documents.',
    features: ['Meeting minutes', 'Project plans', 'Credentials', 'Client info'],
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: Code,
    title: 'For Developers',
    description: 'Keep code snippets, API keys, server configs, and technical documentation handy.',
    features: ['Code snippets', 'API documentation', 'Config files', 'Debug notes'],
    color: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: Lightbulb,
    title: 'For Creators',
    description: 'Capture ideas, track projects, manage content calendars, and store inspiration.',
    features: ['Content ideas', 'Project briefs', 'Inspiration', 'Drafts'],
    color: 'from-orange-500/20 to-yellow-500/20',
  },
  {
    icon: Heart,
    title: 'For Personal Use',
    description: 'Journal entries, recipes, travel plans, wish lists, and personal passwords.',
    features: ['Journaling', 'Recipes', 'Travel plans', 'Wish lists'],
    color: 'from-rose-500/20 to-red-500/20',
  },
  {
    icon: Users,
    title: 'For Teams',
    description: 'Share knowledge, collaborate on documents, and maintain team resources.',
    features: ['Team docs', 'Shared resources', 'Onboarding', 'Knowledge base'],
    color: 'from-indigo-500/20 to-violet-500/20',
  },
];

export function UseCases() {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Perfect for Everyone
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whatever your needs, Scriblet adapts to your workflow
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${useCase.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <useCase.icon className="w-7 h-7 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {useCase.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {useCase.description}
                </p>
                
                <ul className="space-y-2">
                  {useCase.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
