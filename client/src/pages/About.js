import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Shield, Heart, Users, Award, Globe, Sparkles } from 'lucide-react';
import shantanuImg from '../assets/shantanu.jpeg';
import anushkaImg from '../assets/Anushka.jpeg';
import aboutimg from '../assets/about.jpg';
const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Dermatologist Trusted',
      description: 'Formulated with dermatologists to ensure safety and efficacy for all skin types'
    },
    {
      icon: Leaf,
      title: 'Clean Ingredients',
      description: 'No parabens, sulfates, phthalates, or artificial fragrances'
    },
    {
      icon: Heart,
      title: 'Cruelty-Free',
      description: 'Never tested on animals. PETA certified and vegan options available'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Developed with input from thousands of real customers'
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized by leading beauty publications and industry experts'
    },
    {
      icon: Globe,
      title: 'Sustainable',
      description: 'Eco-friendly packaging and carbon-neutral shipping'
    }
  ];

  return (
    <div>
      {/* Hero Section with Image */}
      <section className="relative h-[60vh] min-h-[400px] bg-cover bg-center" style={{
        backgroundImage: 'url("https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=1200")'
      }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative h-full flex items-center justify-center text-center">
          <div className="text-white px-4">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">Our Story</h1>
            <p className="text-xl max-w-2xl mx-auto">Founded with a mission to make science-backed skincare accessible to everyone</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                "We didn't just build DermaFlow. We built the solution we desperately needed."

Like millions of you, our founders spent years staring at bathroom mirrors, frustrated by expensive skincare routines that promised everything but delivered nothing.

Late nights researching ingredients. Wasted money on products that caused breakouts instead of healing them. Conflicting advice from every direction.

Sound familiar?

After countless allergic reactions, wasted thousands of dollars, and enough frustration to give up entirely, we realized something was broken. The skincare industry wasn't designed for real people with real skin problems. It was designed for profit.

So we decided to fix it.

Our mission became simple: Create dermatologist-approved skincare that actually works, using clean ingredients you can pronounce, at prices that don't require a second mortgage.

Today, DermaFlow is that solution—born from frustration, built with science, and fueled by the belief that everyone deserves healthy skin, regardless of their budget or skin type.

We're not just selling products. We're giving people back their confidence, one clear skin day at a time.

— The Founders, DermaFlow
              </p>
              <p className="text-lg text-muted-foreground">
                Every product we create is rigorously tested, clinically proven, and formulated 
                to address real skin concerns without compromise.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="bg-maroon/10 rounded-full p-3">
                  <Sparkles className="text-maroon" size={24} />
                </div>
                <div>
                  <p className="font-semibold">10,000+ Happy Customers</p>
                  <p className="text-sm text-muted-foreground">And counting...</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={aboutimg}
                alt="Our lab"
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-maroon text-white p-4 rounded-lg shadow-lg">
                <p className="text-2xl font-bold">15+ Years</p>
                <p className="text-sm">of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">Our Values</h2>
            <p className="text-muted-foreground mt-2">What drives us every day</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-maroon/10 rounded-full mb-4 group-hover:bg-maroon/20 transition">
                  <value.icon className="text-maroon" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section with Images */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">Meet Our Team</h2>
            <p className="text-muted-foreground mt-2">Experts dedicated to your skin health</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-full w-48 h-48 mx-auto mb-4">
                <img 
  src={shantanuImg}
  alt="Shantanu Pawar"
  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
/>
              </div>
              <h3 className="text-xl font-semibold">Shantanu pawar</h3>
              <p className="text-maroon">Co-founder & Chief Technical Head</p>
              <p className="text-sm text-muted-foreground mt-2">IT Engineer</p>
            </div>
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-full w-48 h-48 mx-auto mb-4">
                <img 
  src={anushkaImg}
  alt="Anushka Sharma"
  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
/>
              </div>
              <h3 className="text-xl font-semibold">Anushka Sharma</h3>
              <p className="text-maroon">Co- Founder & Head of Product Innovation</p>
              <p className="text-sm text-muted-foreground mt-2">IT Engineer</p>
            </div>
            {/* <div className="text-center group">
              <div className="relative overflow-hidden rounded-full w-48 h-48 mx-auto mb-4">
                <img 
                  src="https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Rahul Verma"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold">Rahul Verma</h3>
              <p className="text-maroon">Customer Experience Lead</p>
              <p className="text-sm text-muted-foreground mt-2">Your skincare advocate</p>
            </div> */}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-maroon text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-cream">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-cream">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-cream">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-cream">Countries</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;