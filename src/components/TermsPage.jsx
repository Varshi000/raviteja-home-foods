import "./InfoPages.css";

import p11 from "../assets/about/p11.png";
import p8 from "../assets/about/p8.png";
import SEO from "./SEO";

function TermsPage() {

  return (

    <section className="terms-page">
      <SEO 
        title="Terms & Conditions | Raviteja Home Foods" 
        description="Read the terms and conditions for using the Raviteja Home Foods website and ordering products." 
        canonicalUrl="https://ravitejahomefoods.in/terms" 
      />

      {/* HERO */}

      <div
        className="terms-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,0.65),
              rgba(0,0,0,0.65)
            ),
            url(${p11})
          `
        }}
      >

        <div className="terms-hero-content">

          <span>RAVITEJA HOME FOODS</span>

          <h1>
            Built On Trust,
            <br />
            Tradition & Quality ❤️
          </h1>

          <p>
            These terms help us maintain
            a safe, transparent,
            and trustworthy experience
            for every customer.
          </p>

        </div>

      </div>

      {/* TERMS CARDS */}

      <div className="terms-grid">

        <div className="terms-card">

          <div className="terms-icon">
            📦
          </div>

          <h2>Orders</h2>

          <p>
            Orders are confirmed only
            after successful payment
            and product availability.
          </p>

        </div>

        <div className="terms-card">

          <div className="terms-icon">
            💳
          </div>

          <h2>Payments</h2>

          <p>
            All payments are securely processed
            through trusted payment gateways.
          </p>

        </div>

        <div className="terms-card">

          <div className="terms-icon">
            🚚
          </div>

          <h2>Shipping</h2>

          <p>
            Delivery timelines may vary
            depending on location
            and courier availability.
          </p>

        </div>

      </div>

      {/* STORY SECTION */}

      <div className="terms-story-section">

        <div className="terms-story-image">

          <img src={p8} alt="Terms" />

        </div>

        <div className="terms-story-content">

          <span className="terms-tag">
            TERMS & CONDITIONS
          </span>

          <h2>
            Honest Food.
            <br />
            Honest Relationships.
          </h2>

          <p>
            Raviteja Home Foods was built
            with a mission to preserve
            authentic homemade Telugu flavors
            and deliver them with trust,
            quality, and care.
          </p>

          <p>
            By using our website,
            you agree to follow
            our policies regarding
            orders, payments,
            shipping, and product usage.
          </p>

          <p>
            We reserve the right
            to update products,
            pricing, and policies
            whenever necessary
            to improve customer experience.
          </p>

          <div className="terms-highlight-box">

            “Food made with love
            always tastes special.”

          </div>

        </div>

      </div>

      {/* TERMS INFO */}

      <div className="terms-info-section">

        <h2>
          Important Terms
        </h2>

        <div className="terms-info-grid">

          <div className="terms-info-box">

            <h3>📦 Product Availability</h3>

            <p>
              Products may occasionally
              become unavailable
              depending on freshness
              and preparation schedules.
            </p>

          </div>

          <div className="terms-info-box">

            <h3>💰 Pricing</h3>

            <p>
              Prices and offers may change
              without prior notice
              based on market conditions.
            </p>

          </div>

          <div className="terms-info-box">

            <h3>📷 Product Images</h3>

            <p>
              Product images are for
              representation purposes.
              Actual appearance may vary slightly.
            </p>

          </div>

          <div className="terms-info-box">

            <h3>⚖️ Policy Updates</h3>

            <p>
              Raviteja Home Foods reserves
              the right to modify terms
              and policies at any time.
            </p>

          </div>

        </div>

      </div>

      {/* FINAL */}

      <div className="terms-final-section">

        <h2>
          Carrying Tradition
          Forward With Trust ❤️
        </h2>

        <p>
          Homemade • Honest • Traditional
        </p>

      </div>

    </section>

  );
}

export default TermsPage;
