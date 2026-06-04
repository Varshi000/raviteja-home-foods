import "./InfoPages.css";

import p1 from "../assets/about/p1.png";
import p2 from "../assets/about/p5.png";
import p3 from "../assets/about/p3.png";
import p4 from "../assets/about/p6.png";
import SEO from "./SEO";

function AboutPage() {

  return (

    <section className="cinematic-about">
      <SEO 
        title="About Us | Raviteja Home Foods"
        description="Learn the story behind Raviteja Home Foods, our commitment to traditional recipes, and authentic Indian taste."
        canonicalUrl="https://ravitejahomefoods.in/about"
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Raviteja Home Foods",
          "url": "https://ravitejahomefoods.in"
        }}
      />

      {/* HERO */}

      <div
        className="hero-section"
        style={{
          backgroundImage:
          `linear-gradient(
            rgba(0,0,0,0.55),
            rgba(0,0,0,0.55)
          ), url(${p1})`
        }}
      >

        <div className="hero-content">

          <h1>
            Not Just Food.
            <br />
            A Tradition That Lives Forever.
          </h1>

          <p>
            Every homemade flavor carries
            love, memories, culture,
            and generations of Telugu tradition.
          </p>

        </div>

      </div>

      {/* STORY SECTION */}

      <div className="story-section">

        <div className="story-image">

          <img src={p2} alt="" />

        </div>

        <div className="story-text">

          <h2>
            Why Raviteja Home Foods Started
          </h2>

          <p>
            In today’s modern world,
            people are slowly moving away
            from real homemade food and
            becoming addicted to artificial taste.
          </p>

          <p>
            At the same time,
            many parents and elders
            no longer have enough time
            to prepare all the incredible
            traditional recipes that once
            filled homes with happiness.
          </p>

          <p>
            Raviteja Home Foods was born
            to protect those emotions,
            preserve Telugu food culture,
            and bring back the warmth
            of homemade food into people’s lives.
          </p>

        </div>

      </div>

      {/* CULTURE SECTION */}

      <div
        className="culture-section"
        style={{
          backgroundImage:
          `linear-gradient(
            rgba(0,0,0,0.65),
            rgba(0,0,0,0.65)
          ), url(${p3})`
        }}
      >

        <div className="culture-overlay">

          <h2>
            Food Is Not Just Energy.
            <br />
            It Is An Emotion.
          </h2>

          <p>
            We are not just preparing sweets,
            pickles, namkeen, or spice powders.
            We are carrying a beautiful culture
            into future generations.
          </p>

        </div>

      </div>

      {/* SPECIALITIES */}

      <div className="special-section">

        <h2>Our Homemade Specialities</h2>

        <div className="special-grid">

          <div className="special-card">
            ❤️ Handmade With Love
          </div>

          <div className="special-card">
            🌿 No Preservatives
          </div>

          <div className="special-card">
            🏡 Authentic Telugu Taste
          </div>

          <div className="special-card">
            ✨ Festival Specials
          </div>

          <div className="special-card">
            🚚 Pan India Delivery
          </div>

          <div className="special-card">
            👩‍🍳 Traditional Recipes
          </div>

        </div>

      </div>

      {/* FOOD SHOWCASE */}

      <div className="food-showcase">

        <img src={p4} alt="" />

        <img src={p1} alt="" />

      </div>

      {/* FINAL QUOTE */}

      <div className="final-quote">

        <h2>
          “Food made with love
          always tastes special.”
        </h2>

        <p>
          — Raviteja Home Foods
        </p>

      </div>

    </section>

  );
}

export default AboutPage;
