import "./InfoPages.css";

import p8 from "../assets/about/p8.png";
import p6 from "../assets/about/p6.png";
import SEO from "./SEO";

function ContactPage() {

  return (

    <section className="contact-page">
      <SEO 
        title="Contact Us | Raviteja Home Foods"
        description="Get in touch with Raviteja Home Foods. Call us for orders, support, and enquiries."
        canonicalUrl="https://ravitejahomefoods.in/contact"
        schema={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Raviteja Home Foods",
          "telephone": "+919246848877",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Kukatpally, Hyderabad",
            "addressCountry": "IN"
          }
        }}
      />

      {/* HERO SECTION */}

      <div
        className="contact-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,0.6),
              rgba(0,0,0,0.6)
            ),
            url(${p8})
          `
        }}
      >

        <div className="contact-hero-content">

          <span>RAVITEJA HOME FOODS</span>

          <h1>
            Every Conversation
            <br />
            Starts With Warmth ❤️
          </h1>

          <p>
            Homemade food is not just taste.
            It is emotion, tradition,
            and memories shared together.
          </p>

        </div>

      </div>

      {/* CONTACT CARDS */}

      <div className="contact-grid">

        <div className="contact-card">

          <div className="contact-icon">📞</div>

          <h2>Call Us</h2>

          <p>
            For orders, support,
            and enquiries.
          </p>

          <a href="tel:+919246848877">
            +91 92468 48877
          </a>

        </div>

        <div className="contact-card">

          <div className="contact-icon">📍</div>

          <h2>Location</h2>

          <p>
            Visit our traditional
            homemade food world.
          </p>

          <span>
            Kukatpally, Hyderabad
          </span>

        </div>

        <div className="contact-card">

          <div className="contact-icon">🚚</div>

          <h2>Delivery</h2>

          <p>
            Delivering authentic
            Telugu flavors everywhere.
          </p>

          <span>
            Pan India Delivery
          </span>

        </div>

      </div>

      {/* STORY SECTION */}

      <div className="contact-story">

        <div className="contact-story-image">

          <img src={p6} alt="Food" />

        </div>

        <div className="contact-story-content">

          <span className="small-tag">
            MADE WITH LOVE
          </span>

          <h2>
            More Than Food.
            <br />
            A Feeling Of Home.
          </h2>

          <p>
            Every sweet, pickle,
            namkeen, and spice powder
            carries authentic Telugu culture,
            family warmth,
            and homemade happiness.
          </p>

          <p>
            We believe food should not
            only satisfy hunger —
            it should create memories
            that stay forever.
          </p>

          <div className="quote-box">

            “Food made with love
            always tastes special.”

          </div>

        </div>

      </div>

      {/* FINAL SECTION */}

      <div className="contact-final">

        <h2>
          Let’s Keep Tradition Alive ❤️
        </h2>

        <p>
          Thank you for supporting
          homemade food culture.
        </p>

        <a
          href="tel:+919246848877"
          className="contact-btn"
        >
          Talk With Us →
        </a>

      </div>

    </section>
  );
}

export default ContactPage;
