import React, { useEffect } from 'react';
import "./SimplePolicy.css";

function ReturnRefundPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page-wrapper">
      <div className="simple-policy-container">
        <h1>Return & Refund Policy</h1>
        <p className="policy-intro">
          At Raviteja Home Foods, we strive to deliver fresh, high-quality products to our customers. Due to the perishable nature of food items, returns and refunds are subject to the conditions outlined below.
        </p>
        
        <h2>Eligible Return & Refund Cases</h2>
        <p>Customers may request a return, replacement, or refund in the following situations:</p>
        <ul>
          <li>Product received in a damaged condition</li>
          <li>Incorrect product delivered</li>
          <li>Product found to be spoiled, defective, or unfit for consumption upon delivery</li>
        </ul>

        <h2>Reporting an Issue</h2>
        <p>
          To ensure a fair resolution, customers must report any issue within <strong>24 hours of receiving the order</strong>.
        </p>
        <p>When submitting a request, please provide:</p>
        <ul>
          <li>Order details</li>
          <li>Clear photographs of the product</li>
          <li>A brief description of the issue</li>
        </ul>
        <p>Requests submitted after the reporting period may not be eligible for a refund or replacement.</p>

        <h2>Refund Process</h2>
        <p>
          Once the issue has been reviewed and approved by our support team, the refund will be initiated to the original payment method used during purchase.
        </p>
        <ul>
          <li>Refund processing time: <strong>5–7 business days</strong></li>
          <li>Processing times may vary depending on the customer's bank or payment provider.</li>
        </ul>

        <h2>Non-Returnable Items</h2>
        <p>The following items are generally not eligible for return or refund:</p>
        <ul>
          <li>Opened or partially consumed food products</li>
          <li>Perishable products reported after the specified reporting period</li>
          <li>Products damaged due to improper storage or handling after delivery</li>
          <li>Customized or special-order products</li>
        </ul>

        <h2>Cancellation Policy</h2>
        <p>
          Orders may only be cancelled before they are processed and dispatched. Once an order has been prepared or shipped, cancellation requests may not be accepted.
        </p>

        <h2>Contact Support</h2>
        <p>For any return, replacement, or refund-related queries, please contact us:</p>
        <div className="contact-details">
          <strong>Email:</strong> <a href="mailto:raviteja.hf@gmail.com">raviteja.hf@gmail.com</a><br/>
          <strong>Phone:</strong> +91 9247551599 | +91 9247551600<br/><br/>
          Our support team will review your request and assist you as quickly as possible.
        </div>
      </div>
    </div>
  );
}

export default ReturnRefundPolicy;
