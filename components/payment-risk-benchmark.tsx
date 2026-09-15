"use client";

import { useState } from "react";

const models = [
  { name: "Elastic-Net α=0.5", auc: 0.6840 },
  { name: "LightGBM", auc: 0.6806 },
  { name: "XGBoost", auc: 0.6765 },
  { name: "GAM", auc: 0.6748 },
  { name: "Random Forest", auc: 0.6714 },
  { name: "Elastic-Net L2", auc: 0.6702 },
  { name: "RuleFit", auc: 0.6625 },
] as const;

const views = ["Leaderboard", "Validation", "Decision"] as const;
type View = (typeof views)[number];

export function PaymentRiskBenchmark() {
  const [view, setView] = useState<View>("Leaderboard");

  return (
    <section className="benchmark-playground" aria-labelledby="benchmark-title">
      <div className="benchmark-heading">
        <div>
          <p className="eyebrow">03 / AutoML benchmark &amp; model governance</p>
          <h2 id="benchmark-title">Evidence before replacement.</h2>
        </div>
        <p>
          Explore the verified DataRobot results and the reasoning behind retaining
          the production champion. This is a read-only evidence view, not a live
          scoring or training interface.
        </p>
      </div>

      <div className="benchmark-tabs" role="tablist" aria-label="Benchmark evidence views">
        {views.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={view === item}
            aria-controls={`benchmark-${item.toLowerCase()}`}
            onClick={() => setView(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="benchmark-panel" id={`benchmark-${view.toLowerCase()}`} role="tabpanel">
        {view === "Leaderboard" && (
          <div>
            <div className="benchmark-panel-intro">
              <p>DataRobot holdout ROC-AUC</p>
              <span>Higher is better · scale begins at 0.65</span>
            </div>
            <ol className="benchmark-bars">
              {models.map((model, index) => (
                <li key={model.name}>
                  <span className="benchmark-rank">{String(index + 1).padStart(2, "0")}</span>
                  <span className="benchmark-name">{model.name}</span>
                  <span className="benchmark-track" aria-hidden="true">
                    <span style={{ width: `${((model.auc - 0.65) / 0.04) * 100}%` }} />
                  </span>
                  <strong>{model.auc.toFixed(4)}</strong>
                </li>
              ))}
            </ol>
            <p className="benchmark-note">The truncated scale makes small differences visible; exact values remain the primary evidence.</p>
          </div>
        )}

        {view === "Validation" && (
          <div className="benchmark-validation">
            <div className="benchmark-score">
              <span>Backtest ROC-AUC</span><strong>0.6733</strong><small>Elastic-Net α=0.5</small>
            </div>
            <div className="benchmark-score benchmark-score--accent">
              <span>Holdout ROC-AUC</span><strong>0.6840</strong><small>Elastic-Net α=0.5</small>
            </div>
            <div className="benchmark-score">
              <span>Holdout PR-AUC</span><strong>0.4136</strong><small>Class-sensitive ranking</small>
            </div>
            <div className="benchmark-score">
              <span>Holdout LogLoss</span><strong>0.5274</strong><small>Probability quality · lower is better</small>
            </div>
            <p className="benchmark-context">
              Backtesting and the final holdout provide separate checks on ranking performance. These DataRobot partitions differ from the manually engineered AWS experiment, so the figures are not placed on a shared production leaderboard.
            </p>
          </div>
        )}

        {view === "Decision" && (
          <div className="benchmark-decision">
            <div>
              <p className="eyebrow">Production champion</p>
              <h3>Logistic Regression v1</h3>
              <strong>0.20</strong>
              <span>Frozen operational threshold</span>
            </div>
            <ul>
              <li><span>01</span>Integrated with the governed AWS feature, serving, and monitoring contracts.</li>
              <li><span>02</span>Directly interpretable for a human-reviewed payment-protection workflow.</li>
              <li><span>03</span>No partition-aligned evidence yet demonstrates a material replacement benefit.</li>
              <li><span>04</span>DataRobot remains a benchmark; none of its models is deployed.</li>
            </ul>
          </div>
        )}
      </div>

      <div className="benchmark-explainability">
        <p className="eyebrow">Qualitative feature effects</p>
        <div>
          <p><span>Risk increases</span>Prior escalation rate · critical missing fields · conflicting project information</p>
          <p><span>Risk decreases</span>Payment-chain completeness</p>
        </div>
        <small>No unverified SHAP magnitude or feature rank is presented.</small>
      </div>
    </section>
  );
}
