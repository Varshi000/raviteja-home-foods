import "./BannerSection.css";
import bannerImg from "../assets/images/welcome.png"; // your image

function BannerSection() {
  return (
    <div className="banner-section">
      <img src={bannerImg} alt="banner" />
    </div>
  );
}

export default BannerSection;
