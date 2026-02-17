import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Is Scriblet really free?',
    answer: 'Yes! Scriblet is completely free to use with unlimited notes, tags, and features. We believe everyone deserves access to secure note-taking.',
  },
  {
    question: 'How secure is my data?',
    answer: 'Your data is encrypted using military-grade AES-256 encryption. We use industry-standard security protocols and never share or sell your information. Your notes are stored securely on Supabase infrastructure.',
  },
  {
    question: 'Can I use Scriblet offline?',
    answer: 'Yes! Scriblet is a Progressive Web App (PWA) that works offline. You can create, edit, and view your notes without an internet connection. Changes sync automatically when you\'re back online.',
  },
  {
    question: 'What devices can I use Scriblet on?',
    answer: 'Scriblet works on any device with a modern web browser - desktop, laptop, tablet, or smartphone. You can also install it as an app on your phone for quick access.',
  },
  {
    question: 'Can I export my notes?',
    answer: 'Yes, you can export your notes in multiple formats including text, PDF, and markdown. You have full control over your data and can download everything at any time.',
  },
  {
    question: 'Is there a limit to how many notes I can create?',
    answer: 'No limits! Create as many notes as you need. We don\'t impose artificial restrictions on note count, storage, or features.',
  },
  {
    question: 'How do I organize my notes?',
    answer: 'Use tags, favorites, and pinning to organize your notes. You can also search through all your notes instantly and filter by tags or favorites.',
  },
  {
    question: 'Can I customize note appearance?',
    answer: 'Absolutely! Choose from 18+ color themes for each note, add background images, and customize text formatting to match your style.',
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-border last:border-0"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-start justify-between text-left group hover:text-primary transition-colors"
      >
        <span className="text-lg font-semibold pr-8">{question}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300',
            isOpen && 'rotate-180 text-primary'
          )}
        />
      </button>
      
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-muted-foreground leading-relaxed pr-8">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Scriblet
          </p>
        </motion.div>

        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              index={index}
            />
          ))}
        </div>

        <motion.p
          className="text-center text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Still have questions?{' '}
          <a href="mailto:support@scriblet.app" className="text-primary hover:underline font-medium">
            Contact us
          </a>
        </motion.p>
      </div>
    </section>
  );
}
