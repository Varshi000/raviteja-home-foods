import "./InfoPages.css";

import p7 from "../assets/about/p7.png";
import p8 from "../assets/about/p8.png";
import SEO from "./SEO";

function ShippingPolicy() {

  return (

    <section className="shipping-page">
      <SEO 
        title="Shipping Policy | Raviteja Home Foods" 
        description="Read our shipping policy. We deliver authentic Telugu flavors Pan India." 
        canonicalUrl="https://ravitejahomefoods.in/shipping-policy" 
      />

      {/* HERO */}

      <div
        className="shipping-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,0.65),
              rgba(0,0,0,0.65)
            ),
            url(${p7})
          `
        }}
      >

        <div className="shipping-hero-content">

          <span>RAVITEJA HOME FOODS</span>

          <h1>
            Freshness Delivered
            <br />
            With Care ❤️
          </h1>

          <p>
            Every package carries
            homemade emotions,
            authentic Telugu flavors,
            and the warmth of tradition.
          </p>

        </div>

      </div>

      {/* POLICY GRID */}

      <div className="shipping-policy-grid">

        <div className="shipping-policy-card">

          <div className="shipping-policy-icon">
            🚚
          </div>

          <h2>Delivery Timeline</h2>

          <p>
            Orders are usually delivered
            within 2–4 business days
            depending on your location.
          </p>

        </div>

        <div className="shipping-policy-card">

          <div className="shipping-policy-icon">
            📦
          </div>

          <h2>Safe Packaging</h2>

          <p>
            Every product is carefully packed
            to preserve freshness,
            hygiene, and authentic taste.
          </p>

        </div>

        <div className="shipping-policy-card">

          <div className="shipping-policy-icon">
            🌍
          </div>

          <h2>Delivery Coverage</h2>

          <p>
            We provide Pan India delivery
            and selected international shipping.
          </p>

        </div>

      </div>

      {/* STORY SECTION */}

      <div className="shipping-story-section">

        <div className="shipping-story-image">

          <img src={p8} alt="Shipping" />

        </div>

        <div className="shipping-story-content">

          <span className="shipping-mini-tag">
            OUR DELIVERY PROMISE
          </span>

          <h2>
            Homemade Food
            <br />
            Deserves Special Care.
          </h2>

          <p>
            We understand homemade food
            is not just another product.
            It carries memories,
            emotions, traditions,
            and family love.
          </p>

          <p>
            That is why every order
            is packed with extra care
            to ensure the same freshness,
            taste, and happiness
            reaches your doorstep.
          </p>

          <div className="shipping-highlight-box">

            “Every package carries
            the warmth of home.”

          </div>

        </div>

      </div>

      {/* IMPORTANT INFO */}

      <div className="shipping-info-section">

        <h2>
          Important Shipping Information
        </h2>

        <div className="shipping-info-grid">

          <div className="shipping-info-box">

            <h3>📍 Delivery Availability</h3>

            <p>
              Delivery timelines may vary
              depending on location,
              weather conditions,
              and courier availability.
            </p>

          </div>

          <div className="shipping-info-box">

            <h3>📷 Damaged Orders</h3>

            <p>
              If you receive a damaged package,
              please contact us immediately
              with photographs for assistance.
            </p>

          </div>

          <div className="shipping-info-box">

            <h3>❤️ Fresh Preparation</h3>

            <p>
              Most products are freshly prepared
              after order confirmation
              to maintain authentic taste.
            </p>

          </div>

          <div className="shipping-info-box">

            <h3>🌎 International Orders</h3>

            <p>
              Selected products are available
              for international delivery
              based on destination availability.
            </p>

          </div>

        </div>

      </div>

      {/* FINAL CTA */}

      <div className="shipping-final-section">

        <h2>
          Bringing Telugu Tradition
          To Every Doorstep ❤️
        </h2>

        <p>
          Fresh • Handmade • Traditional
        </p>

      </div>

    </section>

  );
}

export default ShippingPolicy;
