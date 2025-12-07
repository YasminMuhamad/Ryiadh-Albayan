
import React from "react";
import { BookOpen, Users, Target, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import photo4 from "../assets/images/photo4.jpg"

export default function AboutUs() {
  return (
    <div className="w-full">
      
          {/* Header WITHOUT IMAGE */}
      <div className="bg-[#0E7C7B] py-20 text-center text-white">
        <h1 className="text-4xl font-bold tracking-wide">About Us</h1>
        <p className="max-w-2xl mx-auto mt-4 text-lg opacity-90">
          Welcome to Riyad Al-Bayan — where Arabic and Islamic knowledge is delivered with clarity, excellence, and authenticity.
        </p>
      </div>
          

      {/* Mission Section */}
      <section className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>    
            <img
      src={photo4}
      alt="mission"
      className="rounded-xl shadow-lg w-full object-cover"
      style={{ height: '400px' }} 
    />
        </div>        

        {/* Text */}
        <div>
          <h2 className="text-3xl font-semibold text-[#0E7C7B] mb-4">Our Mission</h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            Our mission is to make Arabic and Islamic studies accessible to everyone.  
            We provide structured, authentic, and easy-to-understand programs designed to inspire students and deepen their understanding.
          </p>

          <p className="text-gray-700 leading-relaxed">
            With dedication, qualified teachers, and a passion for knowledge, we aim to build a generation connected to the language of the Qur’an and grounded in authentic Islamic principles.
          </p>

          {/* Numbers */}
          <div className="flex gap-12 mt-6">
            <div>
              <h3 className="text-3xl font-bold text-[#0E7C7B]">500+</h3>
              <p className="text-gray-600">Students Enrolled</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#0E7C7B]">50+</h3>
              <p className="text-gray-600">Courses</p>
            </div>
          </div>

        </div>
      </section>

      {/* Values Section */}
      <section className="bg-[#E6EFEB] py-16">
        <div className="container mx-auto px-6 text-center">

          <h2 className="text-3xl font-semibold text-[#0E7C7B]">Our Values</h2>
          <p className="text-gray-700 mt-3 max-w-2xl mx-auto">
            These values guide us in teaching, communicating, and serving our students every day.
          </p>

          {/* Cards */}
          <div className="grid md:grid-cols-4 gap-6 mt-10">
            
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <Target size={34} className="text-[#0E7C7B] mx-auto" />
              <h3 className="font-semibold text-lg mt-4">Excellence</h3>
              <p className="text-gray-600 mt-2">
                We strive for quality and clarity in every lesson and program.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <Users size={34} className="text-[#0E7C7B] mx-auto" />
              <h3 className="font-semibold text-lg mt-4">Collaboration</h3>
              <p className="text-gray-600 mt-2">
                We foster teamwork and support between teachers and students.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <Sparkles size={34} className="text-[#0E7C7B] mx-auto" />
              <h3 className="font-semibold text-lg mt-4">Creativity</h3>
              <p className="text-gray-600 mt-2">
                We simplify knowledge using modern, engaging teaching methods.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
              <ShieldCheck size={34} className="text-[#0E7C7B] mx-auto" />
              <h3 className="font-semibold text-lg mt-4">Integrity</h3>
              <p className="text-gray-600 mt-2">
                We commit to authentic, trustworthy, and ethical teaching.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
