import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Palette, Download, Zap, Code, Heart, ArrowRight, Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      const tl = gsap.timeline();
      tl.fromTo('.hero-title', 
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      )
      .fromTo('.hero-subtitle', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.8'
      )
      .fromTo('.hero-cta', 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
        '-=0.5'
      );

      // Floating animation for decorative elements
      gsap.to('.floating', {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        stagger: 0.3
      });

      // Features cards animation
      gsap.fromTo('.feature-card', 
        { opacity: 0, y: 80, rotationY: 15 },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Stats counter animation
      gsap.fromTo('.stat-number', 
        { textContent: 0 },
        {
          textContent: (i, el) => el.getAttribute('data-value'),
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: '.stats-section',
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );

      // CTA section animation
      gsap.fromTo('.cta-content', 
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Generation",
      description: "Create stunning UI components and icons with advanced AI technology"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Infinite Customization",
      description: "Modify colors, gradients, sizes, and styles in real-time"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Export Ready",
      description: "Download your creations as PNG, SVG, or ICO files"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Generate and customize designs in seconds, not hours"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Clean Code",
      description: "Production-ready, semantic HTML and CSS output"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Made with Love",
      description: "Crafted for designers and developers who care about quality"
    }
  ];

  const stats = [
    { value: 10000, label: "Components Generated", suffix: "+" },
    { value: 5000, label: "Happy Users", suffix: "+" },
    { value: 99, label: "Uptime", suffix: "%" },
    { value: 24, label: "Support", suffix: "/7" }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"></div>
        <div className="floating absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 blur-xl"></div>
        <div className="floating absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-20 blur-xl"></div>
        <div className="floating absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-full opacity-20 blur-xl"></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-6xl mx-auto">
          <div className="mb-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-0">
              ✨ AI-Powered Design Tool
            </Badge>
          </div>
          
          <h1 className="hero-title text-6xl md:text-8xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
            Craft Beautiful
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              UI Elements
            </span>
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into stunning UI components and icons with the power of AI. 
            Customize, export, and integrate seamlessly into your projects.
          </p>
          
          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Creating
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg border-2 hover:bg-slate-50 transform hover:scale-105 transition-all duration-200"
            >
              View Examples
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Everything you need to create
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> amazing designs</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform provides all the tools and features you need to bring your creative vision to life.
            </p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card p-8 border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <div className="text-purple-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-24 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-6xl font-bold mb-2">
                  <span className="stat-number" data-value={stat.value}>0</span>
                  <span>{stat.suffix}</span>
                </div>
                <p className="text-purple-100 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="cta-section py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="cta-content">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Ready to transform your
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> creative process?</span>
            </h2>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
              Join thousands of designers and developers who are already creating amazing UI elements with AI-UI Craft.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg border-2 hover:bg-slate-50"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-UI Craft
            </h3>
          </div>
          <p className="text-slate-400 mb-4">
            Democratizing UI design with AI-powered tools
          </p>
          <p className="text-slate-500 text-sm">
            © 2024 AI-UI Craft. Made with ❤️ for creators everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
