// src/components/ProductDetails.jsx - Add QR payment for Buy Now
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, fetchProductReviews, createReview } from "../services/api";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import SEO from "./SEO";
import "./ProductDetails.css";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Write Review state
  const { user } = useAuth();
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewContent, setNewReviewContent] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newEmailAddress, setNewEmailAddress] = useState("");
  const [newMobileNumber, setNewMobileNumber] = useState("");
  const [postReviewLoading, setPostReviewLoading] = useState(false);
  const [postSuccess, setPostSuccess] = useState(null);
  const [postError, setPostError] = useState(null);

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
    setCurrentPage(1);
  }, [productId]);

  // Prefill user info when user changes or loads
  useEffect(() => {
    if (user) {
      setNewDisplayName(user.name || "");
      setNewEmailAddress(user.email || "");
      setNewMobileNumber(user.mobile || "");
    }
  }, [user]);

  const handlePostReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newRating) {
      setPostError("Please select a rating.");
      return;
    }
    if (!newReviewTitle.trim()) {
      setPostError("Please enter a review title.");
      return;
    }
    if (!newReviewContent.trim()) {
      setPostError("Please write some review content.");
      return;
    }
    if (!newDisplayName.trim()) {
      setPostError("Please enter your name.");
      return;
    }
    if (!newEmailAddress.trim()) {
      setPostError("Please enter your email address.");
      return;
    }
    if (!newMobileNumber.trim()) {
      setPostError("Please enter your mobile number.");
      return;
    }

    setPostReviewLoading(true);
    setPostError(null);
    setPostSuccess(null);

    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("rating", newRating);
      formData.append("review_title", newReviewTitle);
      formData.append("review_content", newReviewContent);
      formData.append("display_name", newDisplayName);
      formData.append("email_address", newEmailAddress);
      formData.append("mobile_number", newMobileNumber);

      const response = await createReview(formData);
      if (response && response.message) {
        setPostSuccess("Review submitted successfully! Thank you for your feedback.");
        setNewRating(5);
        setNewReviewTitle("");
        setNewReviewContent("");
        
        // Reload reviews to show the new review
        try {
          const reviewsRes = await fetchProductReviews(productId);
          if (reviewsRes) {
            setReviews(reviewsRes.data || []);
            setReviewsCount(reviewsRes.count || 0);
            setAvgRating(reviewsRes.avg_rating || 0);
          }
        } catch (loadErr) {
          console.error(loadErr);
        }
        
        setTimeout(() => {
          setPostSuccess(null);
        }, 5000);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      setPostError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setPostReviewLoading(false);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductById(productId);
      if (data) {
        setProduct(data);
        if (data.pricing && data.pricing.length > 0) {
          setSelectedWeight(data.pricing[0].weight);
        }
        
        // Fetch product reviews
        try {
          const reviewsRes = await fetchProductReviews(productId);
          if (reviewsRes) {
            setReviews(reviewsRes.data || []);
            setReviewsCount(reviewsRes.count || 0);
            setAvgRating(reviewsRes.avg_rating || 0);
          }
        } catch (revErr) {
          console.error("Failed to load product reviews:", revErr);
        }
      } else {
        setError("Product not found");
      }
    } catch (err) {
      console.error("Failed to load product:", err);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrice = () => {
    if (!product?.pricing || !selectedWeight) return 0;
    const priceOption = product.pricing.find(p => p.weight === selectedWeight);
    return priceOption?.price || 0;
  };

  const handleAddToCart = async () => {
    const productToAdd = {
      id: product.id,
      product_name: product.product_name,
      image_url: product.images_url?.[0],
      selectedWeight: selectedWeight,
      price: getCurrentPrice(),
      business_type: product.business_type,
    };
    
    const result = await addToCart(productToAdd, quantity);
    
    if (result?.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      alert("Failed to add to cart. Please try again.");
    }
  };

  // Buy Now - Show QR Code Modal
  const handleBuyNow = () => {
    setShowQrModal(true);
  };

  // Close QR Modal
  const handleCloseQrModal = () => {
    setShowQrModal(false);
  };

  // After payment confirmation
  const handlePaymentConfirmed = () => {
    setShowQrModal(false);
    alert("Payment successful! Your order has been placed.");
    // Navigate to orders page or show success
    navigate("/my-orders");
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-error">
        <h2>😞 Product Not Found</h2>
        <p>{error || "The product you're looking for doesn't exist."}</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const totalPrice = currentPrice * quantity;

  const reviewsPerPage = 5;
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  return (
    <div className="product-details-page">
      <SEO 
        title={`${product.product_name} | Raviteja Home Foods`}
        description={product.description || `Buy authentic ${product.product_name} online.`}
        canonicalUrl={`https://ravitejahomefoods.in/product/${productId}`}
        image={product.images_url?.[0] || "https://ravitejahomefoods.in/logo.png"}
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.product_name,
          "image": product.images_url || [],
          "description": product.description,
          "brand": {
            "@type": "Brand",
            "name": "Raviteja Home Foods"
          },
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "INR",
            "lowPrice": product.pricing?.[0]?.price || 0,
            "availability": "https://schema.org/InStock"
          }
        }}
      />
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate("/")}>Home</span>
          <span>/</span>
          <span onClick={() => navigate(`/category/${product.category_id}`)}>
            {product.subcategory || "Products"}
          </span>
          <span>/</span>
          <span className="current">{product.product_name}</span>
        </div>

        <div className="product-details-container">
          {/* Left: Images */}
          <div className="product-gallery">
            <div className="main-image">
              <img 
                src={product.images_url?.[selectedImage] || "/placeholder.png"} 
                alt={product.product_name}
              />
            </div>
            {product.images_url?.length > 1 && (
              <div className="thumbnail-list">
                {product.images_url.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`thumbnail ${selectedImage === idx ? "active" : ""}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img} alt={`${product.product_name} view ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="product-info-section">
            <h1 className="product-title">{product.product_name}</h1>
            
            {reviewsCount > 0 ? (
              <div className="product-rating">
                <span className="rating-stars">
                  {"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))}
                </span>
                <span className="rating-count">({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})</span>
              </div>
            ) : (
              <div className="product-rating">
                <span className="no-reviews">No reviews yet</span>
              </div>
            )}

            {/* Business Type Badge */}
            {product.business_type && (
              <div className="business-type-badge-wrapper">
                <span className="business-type-badge">
                  🏷️ {product.business_type.charAt(0).toUpperCase() + product.business_type.slice(1)}
                </span>
              </div>
            )}
            
            <div className="product-price">
              <span className="current-price">₹{currentPrice}</span>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Weight Selection */}
            {product.pricing && product.pricing.length > 0 && (
              <div className="weight-selection">
                <h3>Select Weight</h3>
                <div className="weight-options">
                  {product.pricing.map((option) => (
                    <button
                      key={option.weight}
                      className={`weight-btn ${selectedWeight === option.weight ? "active" : ""}`}
                      onClick={() => setSelectedWeight(option.weight)}
                    >
                      {option.weight}
                      <span className="weight-price">₹{option.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="quantity-selection">
              <h3>Quantity</h3>
              <div className="quantity-control">
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="total-price">
              <span>Total Amount:</span>
              <strong>₹{totalPrice}</strong>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className={`btn-cart ${addedToCart ? "added" : ""}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? "✓ Added to Cart" : "🛒 Add to Cart"}
              </button>
            </div>

           
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          {reviews.length > 0 ? (
            <>
              <div className="reviews-list">
                {currentReviews.map((review, idx) => (
                  <div key={review.id || idx} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <strong>{review.display_name}</strong>
                        <span className="review-rating">
                          {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                        </span>
                      </div>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <div className="review-body">
                      <h4 className="review-title">{review.review_title}</h4>
                      <p className="review-content">{review.review_content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reviews Pagination */}
              {reviews.length > reviewsPerPage && (
                <div className="reviews-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '8px 16px', borderRadius: '20px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, transition: 'all 0.2s' }}
                  >
                    ← Previous
                  </button>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    style={{ padding: '8px 16px', borderRadius: '20px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.5 : 1, transition: 'all 0.2s' }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-reviews-section">
              <p>There are no reviews for this product yet. Be the first to buy and leave a review!</p>
            </div>
          )}
        </div>

        {/* Post a Review Form */}
        <div className="post-review-section" style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--text-main)' }}>Write a Customer Review</h2>
          <form onSubmit={handlePostReviewSubmit} style={{ maxWidth: '600px', marginTop: '20px' }}>
            {postSuccess && (
              <div className="review-message success" style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '16px' }}>
                {postSuccess}
              </div>
            )}
            {postError && (
              <div className="review-message error" style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '16px' }}>
                ⚠️ {postError}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Overall Rating</label>
              <div className="star-rating" style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    style={{ background: 'transparent', border: 'none', fontSize: '32px', cursor: 'pointer', color: star <= newRating ? '#ffc107' : '#ccc', padding: 0, transition: 'transform 0.1s ease' }}
                    onClick={() => setNewRating(star)}
                    className="star-btn"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="postReviewTitle" style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Review Title</label>
              <input
                type="text"
                id="postReviewTitle"
                className="form-input"
                placeholder="e.g. Delicious Taste, Highly Recommend!"
                value={newReviewTitle}
                onChange={(e) => setNewReviewTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="postReviewContent" style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Review Details</label>
              <textarea
                id="postReviewContent"
                className="form-input"
                rows="4"
                placeholder="Tell us what you liked or disliked about this food..."
                value={newReviewContent}
                onChange={(e) => setNewReviewContent(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="postDisplayName" style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Your Name</label>
              <input
                type="text"
                id="postDisplayName"
                className="form-input"
                placeholder="e.g. John Doe"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div className="form-group text-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label htmlFor="postEmailAddress" style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Email Address</label>
                <input
                  type="email"
                  id="postEmailAddress"
                  className="form-input"
                  placeholder="e.g. john@example.com"
                  value={newEmailAddress}
                  onChange={(e) => setNewEmailAddress(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label htmlFor="postMobileNumber" style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Mobile Number</label>
                <input
                  type="tel"
                  id="postMobileNumber"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={newMobileNumber}
                  onChange={(e) => setNewMobileNumber(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-buy" 
              disabled={postReviewLoading}
              style={{ padding: '12px 30px', borderRadius: '30px', width: 'fit-content' }}
            >
              {postReviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>

      {/* QR Code Payment Modal */}
      {showQrModal && (
        <div className="modal-overlay" onClick={handleCloseQrModal}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>Scan & Pay</h3>
              <button className="close-btn" onClick={handleCloseQrModal}>✕</button>
            </div>
            <div className="qr-modal-body">
              <div className="qr-code-container">
                {/* Replace this with your actual QR code image */}
                <img 
                  src="/images/razorpay-qr.png" 
                  alt="Payment QR Code" 
                  className="qr-code-image"
                />
                <p className="qr-instruction">Scan this QR code with any UPI app to pay</p>
              </div>
              <div className="order-summary-mini">
                <p><strong>Order Summary</strong></p>
                <p>Product: {product.product_name}</p>
                <p>Weight: {selectedWeight}</p>
                <p>Quantity: {quantity}</p>
                <p className="total-amount">Total Amount: ₹{totalPrice}</p>
              </div>
              <div className="payment-actions">
                <button className="btn-primary" onClick={handlePaymentConfirmed}>
                  I have completed payment
                </button>
                <button className="btn-secondary" onClick={handleCloseQrModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
