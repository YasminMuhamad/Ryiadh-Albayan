import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Home from "../src/pages/Home/Home.jsx";
import Courses from "../src/pages/Courses/Courses.jsx";
import Contact from "../src/pages/Contact/Contact.jsx";
import Cart from "../src/pages/Cart/Cart.jsx";
import CourseDetails from "../src/pages/Courses/CourseDetails.jsx";
import Checkout from "../src/pages/Checkout/Checkout.jsx";
import PaymentSuccess from "../src/pages/Checkout/PaymentSuccess.jsx";
import './styles/globals.css'; 

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </div>
    </Router>
  );
}