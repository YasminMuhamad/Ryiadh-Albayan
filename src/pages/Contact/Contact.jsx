

import React, { useState } from "react";
import { db } from "../../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // إضافة البيانات لـ Firestore
      await addDoc(collection(db, "messages"), {
        ...formData,
        timestamp: serverTimestamp(),
      });

      setSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Error adding document: ", err);
      setError("Oops! Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-2">Contact Us</h2>
      <p className="mb-6 text-gray-600">
        Have questions? We’d love to hear from you. Send us a message and we’ll respond as soon as possible.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Left: Contact Info */}
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Email</h3>
            <p>info@riyadhAlBayan.com</p>
            <p>support@riyadhAlBayan.com</p>
            <br />
            <br />
          
            <h3 className="font-semibold mb-2">Phone</h3>
            <p>+1 (555) 123-4567</p>
            <p>+1 (555) 987-6543</p>
            <br />
            <br />
        
            <h3 className="font-semibold mb-2">Address</h3>
            <p>123 Knowledge Street</p>
            <p>Learning City, LC 12345</p>
            <p>United States</p>
           </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Office Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p>Saturday: 10:00 AM - 4:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Send us a Message</h3>
          <p className="mb-4 text-gray-600">
            Fill out the form below and we’ll get back to you within 24 hours
          </p>

          {submitted && (
            <p className="mb-4 text-green-600 font-semibold">
              Your message has been sent!
            </p>
          )}
          {error && (
            <p className="mb-4 text-red-600 font-semibold">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row md:space-x-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="flex-1 p-2 border rounded"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 p-2 border rounded"
                required
              />
            </div>
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-2 border rounded h-32"
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-700 text-white py-2 rounded hover:bg-teal-800 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">How do I enroll in a course?</h4>
            <p>Simply create an account, browse our courses, and click "Enroll Now" on any course you’re interested in. You’ll have immediate access to the content after payment.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Are the courses self-paced?</h4>
            <p>Recorded courses are completely self-paced with lifetime access. Interactive sessions have scheduled meeting times but recordings are available for enrolled students.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Do you offer certificates?</h4>
            <p>Yes! Upon successful completion of a course, you'll receive a certificate of completion that you can download and share.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Can I interact with instructors?</h4>
            <p>Absolutely! All students can message their instructors directly through our platform. Interactive sessions also include live Q&A with teachers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
