# LIVERGUARD AI

## Explainable AI-Powered Liver Disease Risk Screening & Clinical Decision-Support Platform

LiverGuard AI is a production-grade clinical decision-support and risk-screening platform designed for hepatologists, gastroenterologists, pathologists, and clinical care teams.

The platform provides evidence-calibrated risk estimation for chronic hepatic inflammation, early steatohepatitis (MASLD/MASH), and occult liver disease without ever replacing independent medical judgment.

---

### Core Product Principles

```text
PATIENT DATA
      ↓
DATA QUALITY ENGINE
      ↓
AI MODEL PIPELINE (XGBoost Ensemble v1.3 / Random Forest / Logistic Regression)
      ↓
CALIBRATED RISK PROBABILITY (Isotonic / Platt)
      ↓
PREDICTION RELIABILITY & OUT-OF-DISTRIBUTION (OOD) ESTIMATION
      ↓
EXPLAINABLE AI (TreeSHAP Feature Attributions)
      ↓
CLINICAL REVIEW & DIFFERENTIAL SYNTHESIS
      ↓
ATTENDING PHYSICIAN'S FINAL SIGN-OFF & CRYPTOGRAPHIC REPORT
```

---

### Key Capabilities

1. **First-Class Google Sign-In & Multi-Role Authentication**
   - Google Sign-In with profile integration, email/password fallback, password recovery, and first-time clinician onboarding wizard.
   - Strict Role-Based Access Control (RBAC):
     - **Doctor:** Clinical assessments, SHAP explainability, doctor notes, sign-off, printable reports.
     - **Lab Staff:** Ingestion batches, OCR extraction verification, chemistry validation.
     - **Researcher:** Model evaluation matrix, interactive ROC & PR curves, subgroup fairness, drift telemetry.
     - **Administrator:** Immutable audit trail logs, system configuration, deployment approvals.

2. **Smart Global Command Palette (`Ctrl+K` / `Cmd+K`)**
   - Instant keyboard-driven lookup for patients, actions, reports, and models.

3. **8-Step Clinical Assessment Wizard**
   - ① Patient Selection & Demographics
   - ② Clinical Information & Risk Factor Survey
   - ③ Laboratory Chemistry Panel (transaminases, bilirubin subfractions, albumin, alkaline phosphatase, platelets)
   - ④ Automated Pre-Inference Data Quality Engine (range sanity, unit checks, biological plausibility, completeness %)
   - ⑤ AI Model Inference & Calibrated Risk Score
   - ⑥ TreeSHAP Explainable AI (Clinical View vs. Technical View)
   - ⑦ Attending Physician Review & Sign-Off
   - ⑧ Cryptographically Sealed Medical Report Generation

4. **Longitudinal Biomarker Monitoring**
   - Multi-line interactive SVG visualization tracking ALT, AST, Total Bilirubin, and Albumin dynamics over time with reference ULN guidelines and milestone risk events.

5. **Laboratory Document Ingestion (OCR Simulation)**
   - Drag-and-drop support for PDF, CSV, XLSX, and scans with mandatory human-in-the-loop validation prior to chart archival.

6. **Privacy-Preserving Report Verification**
   - Verification endpoint allowing audit verification of report checksums and validity without leaking patient PII.

---

### Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **ML & Data Quality:** Custom TreeSHAP attribution simulator, Isotonic probability calibration, Mahalanobis-like OOD detector, APRI & FIB-4 indices
- **Persistence & Audit:** Reactive local storage engine with audit event logging
