import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createIssue } from "../services/api";
import "./ReportIssuePage.css";

const issueTypes = [
  "Refund/Return",
  "Cancel Order",
  "Replace Order",
  "Wrong Item Delivered",
  "Other",
];

function ReportIssuePage() {
  const { user } = useAuth();
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState("");
  const [issueType, setIssueType] = useState(issueTypes[0]);
  const [detailedReason, setDetailedReason] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [createdIssue, setCreatedIssue] = useState(null);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const resetForm = () => {
    setOrderId("");
    setPaymentId("");
    setMobile("");
    setIssueType(issueTypes[0]);
    setDetailedReason("");
    setFiles([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setCreatedIssue(null);

    if (!orderId || !paymentId || !email || !issueType || !detailedReason) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("order_id", orderId);
      formData.append("payment_id", paymentId);
      formData.append("email", email);
      formData.append("mobile", mobile);
      formData.append("issue_type", issueType);
      formData.append("detailed_reason", detailedReason);

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await createIssue(formData);
      setSuccessMessage("Your issue has been submitted successfully.");
      setCreatedIssue(response);
      resetForm();
    } catch (error) {
      setErrorMessage(error.message || "Unable to submit issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="report-issue-page">
      

      <div className="report-issue-content">
        <div className="report-issue-card">
          <h2>Submit an Issue</h2>
          <p className="report-issue-note">
            Required fields are marked with <span>*</span>.
          </p>

          {successMessage && (
            <div className="report-issue-alert success">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="report-issue-alert error">
              {errorMessage}
            </div>
          )}

          <form className="report-issue-form" onSubmit={handleSubmit}>
            <label>
              Order ID <span>*</span>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order id"
                required
              />
            </label>

            <label>
              Payment ID <span>*</span>
              <input
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="Enter your payment id"
                required
              />
            </label>

            <label>
              Email <span>*</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </label>

            <label>
              Mobile
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
              />
            </label>

            <label>
              Issue Type <span>*</span>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                required
              >
                {issueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Describe the issue <span>*</span>
              <textarea
                value={detailedReason}
                onChange={(e) => setDetailedReason(e.target.value)}
                placeholder="Please explain the problem in detail"
                rows={5}
                required
              />
            </label>

            <label>
              Attach files (optional)
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>

            {files.length > 0 && (
              <div className="report-issue-files">
                {files.map((file) => (
                  <span key={file.name}>{file.name}</span>
                ))}
              </div>
            )}

            <button type="submit" className="report-issue-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Issue"}
            </button>
          </form>

          {createdIssue && (
            <div className="report-issue-result">
              <h3>Issue Created</h3>
              <p>
                Your issue id: <strong>{createdIssue.issue_id || createdIssue.id || "—"}</strong>
              </p>
              <p>Status: <strong>{createdIssue.status || "Pending"}</strong></p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ReportIssuePage;
