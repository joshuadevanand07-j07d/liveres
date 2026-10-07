# LIVERGUARD AI ARCHITECTURE SPECIFICATION

## 1. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│      TypeScript · Tailwind CSS · JetBrains Mono        │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ↓                           ↓
   Identity & Session            Reactive State Store
   Google OAuth / Firebase       LocalStorage + Audit Bus
             │                           │
             └─────────────┬─────────────┘
                           │
                           ↓
┌────────────────────────────────────────────────────────┐
│               Clinical ML & Quality Core               │
│                                                        │
│  ┌───────────────────┐       ┌──────────────────────┐  │
│  │ Data Quality      │       │ OOD Detector         │  │
│  │ Engine            │       │ Standardized Z-Dist  │  │
│  └─────────┬─────────┘       └──────────┬───────────┘  │
│            ↓                            ↓              │
│  ┌───────────────────┐       ┌──────────────────────┐  │
│  │ XGBoost Ensemble  │──────→│ TreeSHAP Engine      │  │
│  │ v1.3 Isotonic     │       │ Local Attributions   │  │
│  └───────────────────┘       └──────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## 2. Data Flow & Safety Contracts

1. **Pre-Inference Validation:** Raw inputs must pass range sanity checks (e.g., $0 \le \text{ALT} \le 1500$, $\text{Direct Bilirubin} \le \text{Total Bilirubin}$).
2. **Probability Calibration:** Raw log-odds are post-processed via Isotonic regression to ensure empirical probability accuracy (Brier score $< 0.085$).
3. **Uncertainty Quantification:** Evaluates input compatibility against training centroid, ensemble model agreement, and data completeness.
4. **Physician Review Required:** Predictions are advisory risk estimates; electronic medical signatures are required for report generation.
