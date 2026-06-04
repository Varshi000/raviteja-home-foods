import React, { useEffect } from 'react';
import "./SimplePolicy.css";
import SEO from "./SEO";

function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page-wrapper">
      <SEO 
        title="Privacy Policy | Raviteja Home Foods" 
        description="Read our privacy policy to understand how we protect your personal information." 
        canonicalUrl="https://ravitejahomefoods.in/privacy-policy" 
      />
      <div className="simple-policy-container">
        <h1>Privacy Policy</h1>
        <p className="policy-intro">
          At ravitejahomefoods.in, we respect your privacy and are committed to safeguarding the personal information you share with us. This Privacy Policy explains how we collect, use, and protect your information when you visit our website or place an order.
        </p>
        
        <h2>Information We Collect</h2>
        <p>To provide our services efficiently, we may collect the following information:</p>
        <ul>
          <li>Full Name & Phone Number</li>
          <li>Email Address</li>
          <li>Delivery Address</li>
          <li>Order Details</li>
          <li>Payment Information (processed securely through payment providers)</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>The information collected may be used for the following purposes:</p>
        <ul>
          <li>Processing and confirming your orders</li>
          <li>Delivering products to your specified address</li>
          <li>Providing customer support and assistance</li>
          <li>Sending order confirmations, updates, and delivery notifications</li>
          <li>Improving our products, services, and user experience</li>
          <li>Detecting and preventing fraudulent activities or misuse of our services</li>
        </ul>

        <h2>Payment Security</h2>
        <p>
          We prioritize the security of your transactions. All payments made on ravitejahomefoods.in are processed through trusted and secure payment gateways. We do not store or have access to your complete debit card, credit card, banking, or other sensitive payment information.
        </p>

        <h2>Data Protection</h2>
        <p>
          We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, disclosure, alteration, or misuse.
        </p>

        <h2>Third-Party Services</h2>
        <p>To operate our business effectively, we may engage trusted third-party service providers for:</p>
        <ul>
          <li>Payment processing</li>
          <li>Product delivery and logistics</li>
          <li>Website analytics</li>
          <li>Customer communication and notifications</li>
        </ul>
        <p>
          These service providers are authorized to use your information only as necessary to perform their services.
        </p>

        <h2>Information Sharing</h2>
        <p>
          We do not sell, rent, or trade your personal information to third parties. Your information will only be shared when necessary to fulfill orders, comply with legal obligations, or protect our rights and customers.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with immediate effect.
        </p>

        <h2>Contact Us</h2>
        <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
        <div className="contact-details">
          <strong>Website:</strong> <a href="https://ravitejahomefoods.in" target="_blank" rel="noopener noreferrer">ravitejahomefoods.in</a><br/>
          <strong>Email:</strong> <a href="mailto:raviteja.hf@gmail.com">raviteja.hf@gmail.com</a><br/>
          <strong>Phone:</strong> +91 9247551599 | +91 9247551600
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
