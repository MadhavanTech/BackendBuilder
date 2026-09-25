import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Headphones, Mail, MessageSquare, Send, ShieldCheck, UserRound } from "lucide-react";
import "../style/Support.css";

const FORMSPREE_URL = "https://formspree.io/f/xbdaqpoe";

export default function Support() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    message: "",
  });
  const [status, setStatus] = useState({ state: "idle", text: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "sending", text: "" });

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(e.target),
      });

      if (response.ok) {
        setStatus({
          state: "success",
          text: "Message sent! We'll be in touch soon.",
        });
        setFormData({ name: "", email: "", password: "", message: "" });
      } else {
        setStatus({
          state: "error",
          text: "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      setStatus({
        state: "error",
        text: "Network error. Please try again later.",
      });
    }
  }

  return (
    <section className="support-page">
      <div className="support-intro">
        <div className="support-kicker"><Headphones size={15} /> BUILDER SUPPORT</div>
        <h1>Let&apos;s get your backend moving.</h1>
        <p>Tell us what&apos;s blocking your build. Include the project name and what you expected to happen so we can help quickly.</p>

        <div className="support-details">
          <div className="support-detail">
            <span className="support-detail-icon"><Clock3 size={17} /></span>
            <div><strong>Typical reply</strong><span>Within 24 hours</span></div>
          </div>
          <div className="support-detail">
            <span className="support-detail-icon"><Mail size={17} /></span>
            <div><strong>Email support</strong><span>builder team inbox</span></div>
          </div>
        </div>

        <div className="support-note">
          <ShieldCheck size={18} />
          <span>Never include production secrets or real database passwords in a support request.</span>
        </div>
      </div>

      <div className="support-card">
        <div className="support-header">
          <div className="support-icon"><MessageSquare size={21} /></div>
          <div><span className="support-form-label">SEND A REQUEST</span><h2>What can we help with?</h2></div>
        </div>

        <form onSubmit={handleSubmit}>
        <div className="support-field">
          <label htmlFor="name"><UserRound size={14} /> Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="support-field">
          <label htmlFor="email"><Mail size={14} /> Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="support-field">
          <label htmlFor="password"><ShieldCheck size={14} /> Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <span className="support-hint">
            Note: this is sent as plain text via email — avoid reusing a real account password.
          </span>
        </div>

        <div className="support-field">
          <label htmlFor="message"><MessageSquare size={14} /> Reporting message</label>
          <textarea
            id="message"
            name="message"
            placeholder="Describe the issue you're facing..."
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={status.state === "sending"}>
          {status.state === "sending" ? "Sending..." : <><Send size={16} /> Send request</>}
        </button>

        {status.text && (
          <div className={`support-status ${status.state}`}>
            {status.state === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {status.text}
          </div>
        )}
        </form>

        <div className="support-footer">We usually respond within 24 hours.</div>
      </div>
    </section>
  );
}
