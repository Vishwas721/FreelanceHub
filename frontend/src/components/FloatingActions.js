import React, { useState } from "react";
import "./FloatingActions.css";
import { useNavigate } from "react-router-dom";

const FloatingActions = () => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="floating-button">
      <button
        className="fab"
        onClick={() => setShowActions(!showActions)}
        aria-label="Quick Actions"
      >
        +
      </button>

      {showActions && (
        <div className="quick-actions">
          <button onClick={() => navigate("/post-project")}>Post Project</button>
          <button onClick={() => navigate("/feedback")}>Feedback</button>
          <button onClick={() => navigate("/contact")}>Contact Support</button>
        </div>
      )}
    </div>
  );
};

export default FloatingActions;
