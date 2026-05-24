// src/components/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const BASE_URL = "http://18.61.65.71:5454";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const { userLogin } = useAuth();

  const startCountdown = () => {
    setResendDisabled(true);
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user-login/request-otp?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });

      if (response.ok) {
        setStep(2);
        startCountdown();
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${BASE_URL}/user-login/request-otp?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });

      if (response.ok) {
        startCountdown();
      } else {
        setError("Failed to resend OTP");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user-login/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          
          const userData = {
            email: email,
            name: email.split('@')[0],
            role: "user",
          };
          localStorage.setItem("user_data", JSON.stringify(userData));
          localStorage.setItem("is_admin", "false");
          
          userLogin(data.access_token, email);
          navigate("/");
        }
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
          
            <h2>Raviteja Home Foods</h2>
            <p>Authentic Telugu Flavors</p>
          </div>

          <div className="login-header">
            <h3>{step === 1 ? "Welcome Back!" : "Verify Your Identity"}</h3>
            <p>
              {step === 1 
                ? "Enter your email to receive a one-time password" 
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="login-form">
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-icon">
                  <span className="icon">📧</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="login-input"
                  />
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-spinner"></span>
                ) : (
                  "Continue with Email →"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="login-form">
              <div className="input-group">
                <label>One-Time Password</label>
                <div className="otp-input-group">
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="otp-input"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <p className="otp-hint">Enter the 6-digit code we sent to your email</p>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : "Verify & Sign In →"}
              </button>

              <div className="login-footer-actions">
                <button 
                  type="button" 
                  className="text-btn"
                  onClick={() => setStep(1)}
                >
                  ← Change Email
                </button>
                
                <button 
                  type="button" 
                  className={`text-btn ${resendDisabled ? "disabled" : ""}`}
                  onClick={handleResendOtp}
                  disabled={resendDisabled}
                >
                  {resendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;