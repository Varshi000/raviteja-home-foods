import { useState, useEffect } from "react";
import "./CategoriesSection.css";
import { Link } from "react-router-dom";
import { fetchCategories } from "../services/api";

import sweetImg from "../assets/images/category-sweets.png";
import namkeenImg from "../assets/images/category-namkeen.png";
import pickleImg from "../assets/images/category-pickles.png";
import chilliImg from "../assets/images/category-chilli-powders.png";
import essentialsImg from "../assets/images/category-essentials.png";
import giftImg from "../assets/images/category-gift.png";

const fallbackCategories = [
  { name: "Sweets", image: sweetImg, slug: "sweets" },
  { name: "Namkeen", image: namkeenImg, slug: "namkeen" },
  { name: "Pickles", image: pickleImg, slug: "pickles" },
  { name: "Chilli Powders", image: chilliImg, slug: "chilli-powders" },
  { name: "Daily Essentials", image: essentialsImg, slug: "essentials" },
  { name: "Gift Packs", image: giftImg, slug: "gifts" }
];

function CategoriesSection() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        if (data && data.length > 0) {
          // Format based on API response structure. Assuming the API returns a list of category objects.
          // Fallback image will be used if the API doesn't provide one.
          const mapped = data.map(c => ({
            name: c.name,
            slug: c.name.toLowerCase().replace(/\s+/g, '-'),
            image: c.image_url || sweetImg,
            id: c._id || c.id
          }));
          setCategories(mapped);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        setCategories(fallbackCategories);
      }
    };
    loadCategories();
  }, []);

  return (
    <section className="categories">
      <div className="categories-head">
        <p>OUR COLLECTIONS</p>
        <h2>Recipes That Carry Memories</h2>
      </div>

      <div className="category-grid">
        {categories.map((item, index) => (
          <div
            key={item.id || index}
            className="category-card"
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <div className="category-overlay">
              <h3>{item.name}</h3>
              <Link to={`/category/${item.slug}`}>
                <button className="shop-btn">Shop Now</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategoriesSection;
