import React from "react";
import "./TaglineSection.css";

const TaglineSection = () => {
  return (
    <div className="tagline-card">
      {/* Glow Background */}
      <div className="tagline-glow"></div>

      <div className="tagline-content">
        {/* Small Top Badge */}
        <div className="tagline-badge">✨ Smart Expense Tracking</div>

        {/* Main Heading */}
        <h2>Track. Manage. Grow. 💸</h2>

        {/* Description */}
        <p>
          Organize your daily spending, manage your lifestyle beautifully, and
          build smarter financial habits with your own dreamy personal expense
          tracker.
        </p>


        {/* Bottom Badge */}
        <div className="company-badge">
          <span className="powered-by">Made with ❤️</span>

          <span className="company-name">by Khushee & AI</span>
        </div>
      </div>
    </div>
  );
};

export default TaglineSection;
