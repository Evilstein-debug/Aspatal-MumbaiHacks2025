import React from "react";
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
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useState } from "react";
import WaitlistDialog from "./WaitlistDialog";

function Landing2() {
  const handleStartTrial = () => {
    toast.info("Coming Soon.")
  }

  const handleDemo = () => {
    toast.info("Demo Coming Soon.")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Hospital className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Aस्पताल</span>
            </div>
            <div className="hidden md:flex space-x-10 ml-22">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">How It Works</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <WaitlistDialog>
                <Button variant="outline">
                  Sign In
                </Button>
              </WaitlistDialog>
              <Button onClick={handleStartTrial} className="hidden md:block">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 grid grid-cols-1 lg:grid-cols-2">

        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="text-sm font-semibold px-4 py-2">
              🚀 AI-POWERED HEALTHCARE NETWORK
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
            Connect Every
            <span className="text-red-600 block">Hospital.</span>
            <span className="text-blue-600 block">Save Every Life.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Revolutionary AI system that connects hospitals for real-time resource sharing, 
            predictive staffing, and seamless patient transfers across your entire network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <WaitlistDialog>
              <Button size="lg" className="text-lg px-8 py-6">
              Join The Waitlist <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </WaitlistDialog>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={handleDemo}>
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="mt-20 ml-8 hidden lg:block">
          <img className="rounded-3xl"
          src="/Hospital Management.png" alt="hero-image" />
        </div>

      </section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Connected Hospitals", icon: Hospital },
              { number: "50K+", label: "Lives Saved", icon: Heart },
              { number: "99.9%", label: "Uptime", icon: Activity },
              { number: "30s", label: "Avg Transfer Time", icon: Clock }
            ].map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      <Separator />

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create a connected, efficient healthcare network
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Real-time Resource Visibility",
                description: "Live dashboard showing bed availability, equipment status, and staff allocation across all connected hospitals."
              },
              {
                icon: Brain,
                title: "Predictive AI Analytics",
                description: "AI-powered forecasting for medical supplies, staffing needs, and patient flow optimization."
              },
              {
                icon: Truck,
                title: "Automatic Patient Transfers",
                description: "Seamless patient transfers between hospitals based on availability, specialization, and proximity."
              },
              {
                icon: Shield,
                title: "Aadhaar/ABHA Authentication",
                description: "Secure patient identification and medical record access using India's digital identity systems."
              },
              {
                icon: Users,
                title: "Volunteer Integration",
                description: "Connect with volunteers and NGOs for emergency response and community health initiatives."
              },
              {
                icon: Network,
                title: "Resource Sharing Network",
                description: "Share ambulances, medical equipment, and specialized staff across your hospital network."
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 bg-blue-100">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
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
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to transform your healthcare network</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Your Hospitals",
                description: "Integrate all hospitals in your network through our secure API and dashboard system.",
                icon: Hospital
              },
              {
                step: "02",
                title: "AI Analyzes & Predicts",
                description: "Our AI continuously monitors resources and predicts needs across your entire network.",
                icon: Brain
              },
              {
                step: "03",
                title: "Automatic Optimization",
                description: "System automatically optimizes resource allocation and facilitates seamless transfers.",
                icon: Network
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <Card className="p-8 outline-2 outline-gray-200 hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="space-y-4">
                    <Badge variant="secondary" className="text-2xl font-bold px-4 py-2 text-blue-600">
                      {step.step}
                    </Badge>
                    <step.icon className="h-16 w-16 mx-auto text-gray-700" />
                    <CardTitle className="text-xl">{step.title}</CardTitle>
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
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-xl mb-12 text-blue-100">
            Join the hospitals already using Aस्पताल to save lives and optimize resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" onClick={handleStartTrial}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white hover:bg-white text-blue-600" onClick={handleDemo}>
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Hospital className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">Aस्पताल</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting hospitals. Saving lives. Powered by AI.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div id="contact">
              <h4 className="text-xl font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mumbai, India</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 Aस्पताल. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing2;