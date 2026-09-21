// client/src/pages/About.tsx
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { useSettings } from "@/hooks/useSettings";
import {
  BookOpen,
  Users,
  Award,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/common/Button";

export const About = () => {
  const { settings, loading } = useSettings();

  const stats = [
    { label: "Books Published", value: "500+", icon: BookOpen },
    { label: "Happy Readers", value: "50K+", icon: Users },
    { label: "Awards Won", value: "25+", icon: Award },
    { label: "Countries", value: "30+", icon: Globe },
  ];

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Editor-in-Chief",
      image: "/images/team/sarah.jpg",
      bio: "20+ years in academic publishing",
    },
    {
      name: "Michael Chen",
      role: "Creative Director",
      image: "/images/team/michael.jpg",
      bio: "Award-winning designer and typographer",
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Senior Editor",
      image: "/images/team/emily.webp",
      bio: "Specialist in South Asian literature",
    },
  ];

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center justify-items-center">
          <a href="/" className="flex">
            <img
              src="/images/ph-logo.png"
              alt="Logo"
              className="w-40 md:w-64 h-40 md:h-64 mb-2 rounded-full shadow hover:scale-105 hover:shadow-xl hover:shadow-cyan-600 transition-all duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </a>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            About {settings.publisher_name}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            {settings.tagline ||
              "Since 1995, we've been committed to publishing works that educate, inspire, and connect readers across the globe."}
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {settings.about ||
                "To bridge cultures and generations through the power of the written word. We believe in publishing content that challenges perspectives, sparks conversations, and contributes to a more informed and empathetic world."}
            </p>
            <div className="h-1 w-20 bg-blue-600 mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 1995 by a group of passionate academics and
                  writers, {settings.publisher_name} began as a small
                  independent press with a big vision. What started in a modest
                  office with just three employees has grown into a respected
                  publishing house with a global reach.
                </p>
                <p>
                  Over the past three decades, we've published over 500 titles
                  across multiple genres and languages. From groundbreaking
                  academic research to captivating literary fiction, our catalog
                  reflects our commitment to quality and diversity.
                </p>
                <p>
                  Today, we continue to champion both established voices and
                  emerging talents, ensuring that important stories find their
                  way to readers who need them.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl overflow-hidden">
                <img
                  src="/images/about/office.png"
                  alt="Our Office"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/600x600?text=Our+Office";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality First
              </h3>
              <p className="text-gray-600">
                We maintain rigorous editorial standards to ensure every
                publication meets the highest quality benchmarks.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Author Partnership
              </h3>
              <p className="text-gray-600">
                We work closely with our authors, providing support and guidance
                throughout the publishing journey.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Global Reach
              </h3>
              <p className="text-gray-600">
                Our distribution network spans over 30 countries, making quality
                content accessible worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/200x200?text=Team+Member";
                    }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 mb-2">{member.role}</p>
                <p className="text-gray-500 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 text-center mb-12">
            Get in Touch
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <Button className="mx-auto">Send Message</Button>
              </form>
            </div>
            <div className="flex flex-col justify-between gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {/* Email */}
                  <div>
                    {settings.contact_email ? (
                      <a
                        href={`mailto:${settings.contact_email}`}
                        className="hover:text-blue-600 transition flex items-center gap-3 text-gray-600"
                      >
                        <Mail className="w-5 h-5 flex-shrink-0" />
                        {settings.contact_email}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </div>

                  {/* Phone/WhatsApp Number - Show even if empty with debug */}
                  <div>
                    {settings.whatsapp_number ? (
                      <a
                        href={`tel:${settings.whatsapp_number}`}
                        className="hover:text-blue-600 transition flex items-center gap-3 text-gray-600"
                      >
                        <Phone className="w-5 h-5 flex-shrink-0" />
                        {settings.whatsapp_number}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    {settings.contact_address ? (
                      <span>{settings.contact_address}</span>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Office Hours
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
