import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Hero() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Sticky Header */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between py-4 px-4 sm:px-6 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
              <img src="/logo.png" alt="Scriblet" className="w-7 h-7 rounded-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight">Scriblet</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/auth?mode=signup">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Animated blobs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/20 blur-3xl"
        style={{ opacity }}
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl"
        style={{ opacity }}
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            >
              Your Notes,{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Beautifully Organized
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              Store credentials, ideas, reminders, and personal information with 
              military-grade encryption. Beautiful, fast, and works offline.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <Button 
                asChild 
                size="lg" 
                className="h-14 px-8 text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto"
              >
                <Link to="/auth?mode=signup">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="h-14 px-8 text-base border-2 w-full sm:w-auto"
              >
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          {/* Right column - App Preview */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Dashboard preview image */}
              <div className="relative rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-purple-500/10 to-background shadow-2xl overflow-hidden p-6">
                <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-lg p-4">
                  {/* Header */}
                  <div className="h-10 bg-primary/10 rounded-lg flex items-center px-3 gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-primary/30 flex items-center justify-center">
                      <div className="w-3 h-3 rounded bg-primary"></div>
                    </div>
                    <div className="h-2.5 bg-primary/20 rounded flex-1 max-w-[120px]"></div>
                  </div>
                  {/* Note cards grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-28 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                      <div className="h-2.5 bg-purple-300 dark:bg-purple-700 rounded mb-2 w-3/4"></div>
                      <div className="h-1.5 bg-purple-200 dark:bg-purple-800 rounded mb-1.5"></div>
                      <div className="h-1.5 bg-purple-200 dark:bg-purple-800 rounded w-2/3"></div>
                    </div>
                    <div className="h-28 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                      <div className="h-2.5 bg-blue-300 dark:bg-blue-700 rounded mb-2 w-3/4"></div>
                      <div className="h-1.5 bg-blue-200 dark:bg-blue-800 rounded mb-1.5"></div>
                      <div className="h-1.5 bg-blue-200 dark:bg-blue-800 rounded w-2/3"></div>
                    </div>
                    <div className="h-28 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
                      <div className="h-2.5 bg-green-300 dark:bg-green-700 rounded mb-2 w-3/4"></div>
                      <div className="h-1.5 bg-green-200 dark:bg-green-800 rounded mb-1.5"></div>
                      <div className="h-1.5 bg-green-200 dark:bg-green-800 rounded w-2/3"></div>
                    </div>
                    <div className="h-28 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-3 border border-pink-200 dark:border-pink-800">
                      <div className="h-2.5 bg-pink-300 dark:bg-pink-700 rounded mb-2 w-3/4"></div>
                      <div className="h-1.5 bg-pink-200 dark:bg-pink-800 rounded mb-1.5"></div>
                      <div className="h-1.5 bg-pink-200 dark:bg-pink-800 rounded w-2/3"></div>
                    </div>
                    <div className="h-28 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                      <div className="h-2.5 bg-amber-300 dark:bg-amber-700 rounded mb-2 w-3/4"></div>
                      <div className="h-1.5 bg-amber-200 dark:bg-amber-800 rounded mb-1.5"></div>
                      <div className="h-1.5 bg-amber-200 dark:bg-amber-800 rounded w-2/3"></div>
                    </div>
                    <div className="h-28 bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl p-3 border border-teal-200 dark:border-teal-800">
                      <div className="h-2.5 bg-teal-300 dark:bg-teal-700 rounded mb-2 w-3/4"></div>
                      <div className="h-1.5 bg-teal-200 dark:bg-teal-800 rounded mb-1.5"></div>
                      <div className="h-1.5 bg-teal-200 dark:bg-teal-800 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                ✨ AI-Powered
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
