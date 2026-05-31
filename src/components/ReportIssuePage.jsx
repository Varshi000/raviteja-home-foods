// src/components/ReportIssuePage.jsx
import { useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { createIssue } from "../services/api";
import "./ReportIssuePage.css";

const ISSUE_TYPES = [
  { id: "Refund/Return",  label: "Refund / Return",  requiresImage: true  },
  { id: "Cancel Order",   label: "Cancel Order",      requiresImage: false },
  { id: "Replace Order",  label: "Replace Order",     requiresImage: true  },
];

export default function ReportIssuePage() {
  const { user } = useAuth();

  const [orderId,        setOrderId]        = useState("");
  const [paymentId,      setPaymentId]      = useState("");
  const [email,          setEmail]          = useState(user?.email || "");
  const [mobile,         setMobile]         = useState(user?.mobile || "");
  const [issueType,      setIssueType]      = useState("");
  const [detailedReason, setDetailedReason] = useState("");
  const [files,          setFiles]          = useState([]);
  const [previews,       setPreviews]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [ticket,         setTicket]         = useState(null);
  const [dragging,       setDragging]       = useState(false);

  const fileRef = useRef(null);
  const selected = ISSUE_TYPES.find(t => t.id === issueType);

  /* ── file helpers ─────────────────────────────── */
  const addFiles = (incoming) => {
    const imgs = Array.from(incoming).filter(f => f.type.startsWith("image/"));
    const merged = [...files, ...imgs].slice(0, 5);
    setFiles(merged);
    merged.forEach((file, i) => {
      if (previews[i]) return;
      const r = new FileReader();
      r.onload = e => setPreviews(p => { const a = [...p]; a[i] = e.target.result; return a; });
      r.readAsDataURL(file);
    });
  };

  const removeFile = (i) => {
    setFiles(f => f.filter((_, x) => x !== i));
    setPreviews(p => p.filter((_, x) => x !== i));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files);
  }, [files]); // eslint-disable-line

  /* ── submit ───────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!issueType)                          return setError("Please select an issue type.");
    if (!orderId.trim())                     return setError("Order ID is required.");
    if (!paymentId.trim())                   return setError("Payment ID is required.");
    if (!email.trim())                       return setError("Email is required.");
    if (mobile.trim().length < 10)           return setError("Enter a valid 10-digit mobile number.");
    if (detailedReason.trim().length < 10)   return setError("Describe the issue (min 10 characters).");
    if (selected?.requiresImage && !files.length)
      return setError(`Images are required for "${selected.label}".`);

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("order_id",        orderId.trim());
      fd.append("payment_id",      paymentId.trim());
      fd.append("email",           email.trim());
      fd.append("mobile",          mobile.trim());
      fd.append("issue_type",      issueType);
      fd.append("detailed_reason", detailedReason.trim());
      files.forEach(f => fd.append("files", f));
      const res = await createIssue(fd);
      setTicket(res);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setOrderId(""); setPaymentId(""); setMobile(user?.mobile || "");
    setIssueType(""); setDetailedReason(""); setFiles([]); setPreviews([]);
    setError(""); setTicket(null);
  };

  /* ── success screen ───────────────────────────── */
  if (ticket) {
    return (
      <div className="ri-page">
        <div className="ri-success">
          <div className="ri-success-icon">✓</div>
          <h1>Issue Submitted</h1>
          <p>We'll review your request and get back to you within 2–4 business days.</p>
          <div className="ri-ticket">
            <div className="ri-ticket-row"><span>Ticket ID</span><strong>#{ticket.issue_id || "—"}</strong></div>
            <div className="ri-ticket-row"><span>Type</span><strong>{ticket.issue_type}</strong></div>
            <div className="ri-ticket-row"><span>Payment ID</span><strong>{ticket.payment_id || paymentId}</strong></div>
            <div className="ri-ticket-row"><span>Mobile</span><strong>{ticket.mobile || mobile}</strong></div>
            <div className="ri-ticket-row"><span>Status</span><span className="ri-status">{ticket.status || "Pending"}</span></div>
          </div>
          <button className="ri-btn" onClick={reset}>Submit Another</button>
        </div>
      </div>
    );
  }

  /* ── form ─────────────────────────────────────── */
  return (
    <div className="ri-page">
      <div className="ri-header">
        <h1>Report a Problem</h1>
        <p>Tell us what went wrong and we'll make it right.</p>
      </div>

      <div className="ri-card">
        <form onSubmit={handleSubmit} noValidate>

          {/* Order & Payment */}
          <div className="ri-row">
            <div className="ri-group">
              <label className="ri-label" htmlFor="ri-order">Order ID <span>*</span></label>
              <input
                id="ri-order"
                className="ri-input"
                type="text"
                placeholder="e.g. ORD-20240101-XXXX"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
              />
            </div>
            <div className="ri-group">
              <label className="ri-label" htmlFor="ri-pay">Payment ID <span>*</span></label>
              <input
                id="ri-pay"
                className="ri-input"
                type="text"
                placeholder="e.g. pay_XXXXXXXXXX"
                value={paymentId}
                onChange={e => setPaymentId(e.target.value)}
              />
            </div>
          </div>

          {/* Email & Mobile */}
          <div className="ri-row">
            <div className="ri-group">
              <label className="ri-label" htmlFor="ri-email">Email <span>*</span></label>
              <input
                id="ri-email"
                className="ri-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="ri-group">
              <label className="ri-label" htmlFor="ri-mobile">Mobile <span>*</span></label>
              <input
                id="ri-mobile"
                className="ri-input"
                type="tel"
                placeholder="10-digit number"
                maxLength={10}
                value={mobile}
                onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          {/* Issue Type */}
          <div className="ri-group">
            <label className="ri-label">Issue Type <span>*</span></label>
            <div className="ri-types">
              {ISSUE_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`ri-type${issueType === t.id ? " ri-type-active" : ""}`}
                  onClick={() => { setIssueType(t.id); setError(""); }}
                >
                  {t.label}
                  {t.requiresImage && <span className="ri-img-dot" title="Images required" />}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="ri-group">
            <label className="ri-label" htmlFor="ri-reason">
              Describe the Issue <span>*</span>
            </label>
            <textarea
              id="ri-reason"
              className="ri-textarea"
              rows={4}
              placeholder="What happened? Please describe in detail…"
              value={detailedReason}
              onChange={e => setDetailedReason(e.target.value)}
            />
          </div>

          {/* Images — shown only after issue type is picked */}
          {issueType && (
          <div className="ri-group">
            <label className="ri-label">
              Photos
              {selected?.requiresImage
                ? <span className="ri-required-note"> — required</span>
                : <span className="ri-optional-note"> — optional</span>}
            </label>

            <div
              className={`ri-drop${dragging ? " ri-drop-active" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={e => addFiles(e.target.files)}
              />
              <span className="ri-drop-icon">↑</span>
              <span>Click or drag images here</span>
              <small>PNG, JPG, WEBP — up to 5 photos</small>
            </div>

            {files.length > 0 && (
              <div className="ri-previews">
                {files.map((f, i) => (
                  <div key={i} className="ri-preview">
                    <img src={previews[i] || ""} alt={f.name} />
                    <button type="button" className="ri-remove" onClick={() => removeFile(i)}>✕</button>
                  </div>
                ))}
                {files.length < 5 && (
                  <button type="button" className="ri-add-more" onClick={() => fileRef.current?.click()}>
                    + Add
                  </button>
                )}
              </div>
            )}
          </div>
          )} {/* end issueType && Photos */}

          {/* Error */}
          {error && (
            <div className="ri-error" role="alert">
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="ri-btn ri-btn-full" disabled={loading} id="ri-submit">
            {loading ? <><span className="ri-spin" /> Submitting…</> : "Submit Issue"}
          </button>

        </form>
      </div>
    </div>
  );
}
