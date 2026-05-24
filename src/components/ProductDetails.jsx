// src/components/ProductDetails.jsx - Add QR payment for Buy Now
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../services/api";
import { CartContext } from "../context/CartContext";
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

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [productId]);

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

  return (
    <div className="product-details-page">
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
              <button className="btn-buy" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>

           
          </div>
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