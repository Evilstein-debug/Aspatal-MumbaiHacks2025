import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Brain, 
  Hospital, 
  Users, 
  Shield, 
  Truck, 
  Clock, 
  Network,
  ArrowRight,
  Heart,
  Menu,
  X,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import WaitlistDialog from "./WaitlistDialog";

function Landing2({ onNavigateToDashboard }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if(element){
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  const handleStartTrial = () => {
    toast.info("Coming Soon.");
  }

  const handleDemo = () => {
    toast.info("Demo Coming Soon.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Navigation */}
      <nav className={`bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Hospital className="h-8 w-8 text-blue-600 animate-pulse" />
                <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <a className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent hover:scale-105 transition-transform" 
                 href="#hero"
                 onClick={(e) => handleNavClick(e, "hero")}
              >Aस्पताल</a>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#features" 
                 className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105 relative group"
                 onClick={(e) => handleNavClick(e, 'features')}
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#how-it-works" 
                 className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105 relative group"
                 onClick={(e) => handleNavClick(e, "how-it-works")}
              >
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#contact" 
                 className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105 relative group"
                 onClick={(e) => handleNavClick(e, "contact")}
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <WaitlistDialog>
                <Button variant="outline" className="hidden sm:flex">
                  Sign In
                </Button>
              </WaitlistDialog>
              <Button 
                onClick={onNavigateToDashboard || handleStartTrial} 
                className="hidden md:block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {onNavigateToDashboard ? "Go to Dashboard" : "Get Started"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-md animate-in slide-in-from-top duration-300">
            <div className="px-4 pt-2 pb-4 space-y-3">
              <a
                href="#features"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                onClick={(e) => handleNavClick(e, 'features')}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                onClick={(e) => handleNavClick(e, "how-it-works")}
              >
                How It Works
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                onClick={(e) => handleNavClick(e, "contact")}
              >
                Contact
              </a>
              <div className="pt-2 space-y-2">
                <WaitlistDialog>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </WaitlistDialog>
                <Button onClick={handleStartTrial} className="w-full bg-gradient-to-r from-blue-600 to-blue-700">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left space-y-6 animate-in fade-in slide-in-from-left duration-700">
              <div className="flex justify-center lg:justify-start mb-6">
                <Badge variant="secondary" className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200 hover:scale-105 transition-transform cursor-default">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600 inline" />
                  AI-POWERED HEALTHCARE NETWORK
                </Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                <span className="block text-gray-900">Connect Every</span>
                <span className="block bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent animate-pulse">
                  Hospital.
                </span>
                <span className="block bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Save Every Life.
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Revolutionary AI system that connects hospitals for real-time resource sharing, 
                predictive staffing, and seamless patient transfers across your entire network.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <WaitlistDialog>
                  <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    Join The Waitlist 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </WaitlistDialog>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300" onClick={handleDemo}>
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-red-400 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <img 
                  className="relative rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  src="/Hospital Management.png" 
                  alt="Hospital Management Dashboard" 
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { number: "500+", label: "Connected Hospitals", icon: Hospital, color: "text-blue-600" },
              { number: "50K+", label: "Lives Saved", icon: Heart, color: "text-red-600" },
              { number: "99.9%", label: "Uptime", icon: Activity, color: "text-green-600" },
              { number: "30s", label: "Avg Transfer Time", icon: Clock, color: "text-purple-600" }
            ].map((stat, index) => (
              <Card key={index} className="text-center border-2 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <stat.icon className={`h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 ${stat.color} animate-bounce`} style={{ animationDelay: `${index * 0.1}s` }} />
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-in fade-in duration-700">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create a connected, efficient healthcare network
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Activity,
                title: "Real-time Resource Visibility",
                description: "Live dashboard showing bed availability, equipment status, and staff allocation across all connected hospitals.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Brain,
                title: "Predictive AI Analytics",
                description: "AI-powered forecasting for medical supplies, staffing needs, and patient flow optimization.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: Truck,
                title: "Automatic Patient Transfers",
                description: "Seamless patient transfers between hospitals based on availability, specialization, and proximity.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Shield,
                title: "Aadhaar/ABHA Authentication",
                description: "Secure patient identification and medical record access using India's digital identity systems.",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: Users,
                title: "Volunteer Integration",
                description: "Connect with volunteers and NGOs for emergency response and community health initiatives.",
                gradient: "from-indigo-500 to-blue-500"
              },
              {
                icon: Network,
                title: "Resource Sharing Network",
                description: "Share ambulances, medical equipment, and specialized staff across your hospital network.",
                gradient: "from-teal-500 to-cyan-500"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-300 bg-white border-2 hover:border-blue-300 hover:scale-105 overflow-hidden"
              >
                <CardHeader className="relative">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-white via-blue-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-in fade-in duration-700">
            <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Simple steps to transform your healthcare network</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line for Desktop */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>
            
            {[
              {
                step: "01",
                title: "Connect Your Hospitals",
                description: "Integrate all hospitals in your network through our secure API and dashboard system.",
                icon: Hospital,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                step: "02",
                title: "AI Analyzes & Predicts",
                description: "Our AI continuously monitors resources and predicts needs across your entire network.",
                icon: Brain,
                gradient: "from-purple-500 to-pink-500"
              },
              {
                step: "03",
                title: "Automatic Optimization",
                description: "System automatically optimizes resource allocation and facilitates seamless transfers.",
                icon: Network,
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative z-10">
                <Card className="p-8 border-2 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white group">
                  <CardContent className="space-y-6">
                    <div className="relative inline-block">
                      <Badge className={`text-2xl font-bold px-6 py-3 bg-gradient-to-r ${step.gradient} text-white border-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {step.step}
                      </Badge>
                    </div>
                    <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300`}>
                      <step.icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]"></div>
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="inline-block mb-6">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 mr-2 inline" />
              Trusted by Leading Hospitals
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-in fade-in duration-700">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-xl mb-12 text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Join the hospitals already using Aस्पताल to save lives and optimize resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold" 
              onClick={handleStartTrial}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2 border-white hover:bg-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300 font-semibold" 
              onClick={handleDemo}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Hospital className="h-8 w-8 text-blue-400 animate-pulse" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Aस्पताल
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting hospitals. Saving lives. Powered by AI.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a 
                    href="#features" 
                    className="hover:text-blue-400 transition-colors flex items-center group"
                    onClick={(e) => handleNavClick(e, 'features')}
                  >
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Features
                  </a>
                </li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div id="contact">
              <h4 className="text-xl font-semibold mb-4 text-white">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <span className="mr-2">📍</span>
                  Mumbai, India
                </li>
                <li>
                  <WaitlistDialog>
                    <Button variant="outline" className="mt-2 border-gray-700 hover:border-blue-400 hover:text-blue-400">
                      Get in Touch
                    </Button>
                  </WaitlistDialog>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 <span className="text-blue-400 font-semibold">Aस्पताल</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing2;