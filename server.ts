/**
 * LiverGuard AI - Clinical Backend Server
 * Express REST API for Doctor Portfolio, Clinical Photos, and Health Services
 */

import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Ensure high payload limit for photo uploads (up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve assets directory statically for media access
const assetsDir = path.join(__dirname, 'src', 'assets', 'images');
app.use('/assets/images', express.static(assetsDir));

// Storage Paths (compatible with both Local Disk and Vercel Serverless /tmp)
const dataDir = process.env.VERCEL
  ? path.join('/tmp', 'liverguard-data')
  : path.join(__dirname, 'data');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch {
  // Ignore on read-only serverless environments; in-memory fallback will handle state
}
const portfolioFile = path.join(dataDir, 'portfolio-store.json');
const clinicalStoreFile = path.join(dataDir, 'clinical-store.json');
const bundledPortfolioFile = path.join(__dirname, 'data', 'portfolio-store.json');
const bundledClinicalFile = path.join(__dirname, 'data', 'clinical-store.json');

// Initial seed portfolio data
const initialPortfolio = {
  id: 'doc-portfolio-001',
  full_name: 'Dr. Joshua Daniel, MD',
  title: 'Chief of Hepatology & Clinical Liver Care',
  medical_license: 'MD-6482910-US (Active)',
  institution: 'Metro Liver Institute & Comprehensive Care Center',
  department: 'Division of Gastroenterology & Hepatology',
  email: 'joshua.daniel@liverguard.health',
  phone: '+1 (555) 438-2026',
  office_location: 'Pavilion B, Suite 420 · Clinical Hepatology Wing',
  bio: 'Board-certified hepatologist specializing in metabolic dysfunction-associated steatotic liver disease (MASLD/MASH), alcohol-associated liver disease (ALD), cirrhosis complications, and clinical decision support. Co-investigator on multicenter validation of explainable AI biomarkers in hepatic steatohepatitis.',
  specialties: [
    'Metabolic Dysfunction-Associated Steatotic Liver Disease (MASLD)',
    'Cirrhosis & Portal Hypertension Management',
    'Drug-Induced Liver Injury (DILI) Surveillance',
    'Transient Elastography (FibroScan®)',
    'Liver Transplant Candidate Stratification',
  ],
  certifications: [
    'American Board of Internal Medicine (ABIM) - Gastroenterology',
    'Fellow of the American Association for the Study of Liver Diseases (FAASLD)',
    'Advanced Hepatic Hemodynamics & Shear-Wave Certification',
    'Good Clinical Practice (GCP) & HIPAA Healthcare Privacy Certified',
  ],
  stats: {
    screenings_completed: 1420,
    active_cases: 12,
    years_experience: 16,
    publications_count: 28,
  },
  avatar_url: '/src/assets/images/avatar_doctor_lead_1790589107591.jpg',
  photos: [
    {
      id: 'photo-seed-01',
      title: 'Lead Physician Headshot',
      category: 'profile',
      url: '/src/assets/images/avatar_doctor_lead_1790589107591.jpg',
      uploaded_at: '2026-09-15T09:30:00Z',
      description: 'Official clinical identification photo for medical staff directory and electronic health record signing.',
      tags: ['Physician', 'Headshot', 'Verified Staff'],
      is_primary_avatar: true,
      file_size_kb: 677,
    },
    {
      id: 'photo-seed-02',
      title: 'Hepatic Segmental Architecture & Lobular Vascular Map',
      category: 'radiology',
      url: '/src/assets/images/hero_liver_anatomy_1790589091389.jpg',
      uploaded_at: '2026-09-18T14:15:00Z',
      description: 'High-resolution anatomical reference model used for patient education, lesion localization, and portal hypertension evaluation.',
      tags: ['Anatomy', 'Hepatic Lobule', 'Patient Education'],
      is_primary_avatar: false,
      file_size_kb: 566,
    },
    {
      id: 'photo-seed-03',
      title: 'Diagnostic Pathology & Lab Technology Colleague',
      category: 'clinical_case',
      url: '/src/assets/images/avatar_lab_tech_1790589124856.jpg',
      uploaded_at: '2026-09-20T11:00:00Z',
      description: 'Collaborating clinical laboratory scientist coordinating rapid automated analyzer verification and quality assurance.',
      tags: ['Lab Team', 'Quality Control', 'Diagnostics'],
      is_primary_avatar: false,
      file_size_kb: 652,
    },
  ],
  updated_at: new Date().toISOString(),
};

let memoryPortfolio: any = null;
let memoryClinicalStore: ClinicalStoreData | null = null;

// Helper: load portfolio from disk or memory
function loadPortfolio() {
  try {
    if (fs.existsSync(portfolioFile)) {
      const data = JSON.parse(fs.readFileSync(portfolioFile, 'utf-8'));
      memoryPortfolio = data;
      return data;
    }
    if (fs.existsSync(bundledPortfolioFile)) {
      const data = JSON.parse(fs.readFileSync(bundledPortfolioFile, 'utf-8'));
      memoryPortfolio = data;
      return data;
    }
  } catch (err) {
    console.error('Error loading portfolio from disk:', err);
  }
  if (memoryPortfolio) return memoryPortfolio;
  savePortfolio(initialPortfolio);
  return initialPortfolio;
}

// Helper: save portfolio to disk and memory
function savePortfolio(data: any) {
  memoryPortfolio = data;
  try {
    fs.writeFileSync(portfolioFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Portfolio stored in memory:', err);
  }
}

// Helper: load clinical store (patients, assessments, alerts, reports, audit_logs, users)
interface ClinicalStoreData {
  patients: any[];
  assessments: any[];
  alerts: any[];
  reports: any[];
  audit_logs: any[];
  users: any[];
  updated_at: string;
}

function loadClinicalStore(): ClinicalStoreData | null {
  try {
    if (fs.existsSync(clinicalStoreFile)) {
      const parsed = JSON.parse(fs.readFileSync(clinicalStoreFile, 'utf-8'));
      memoryClinicalStore = parsed;
      return parsed;
    }
    if (fs.existsSync(bundledClinicalFile)) {
      const parsed = JSON.parse(fs.readFileSync(bundledClinicalFile, 'utf-8'));
      memoryClinicalStore = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error loading clinical store from disk:', err);
  }
  return memoryClinicalStore;
}

function saveClinicalStore(data: Partial<ClinicalStoreData>): ClinicalStoreData {
  const existing = loadClinicalStore() || {
    patients: [],
    assessments: [],
    alerts: [],
    reports: [],
    audit_logs: [],
    users: [],
    updated_at: new Date().toISOString(),
  };
  const merged: ClinicalStoreData = {
    patients: data.patients !== undefined ? data.patients : existing.patients,
    assessments: data.assessments !== undefined ? data.assessments : existing.assessments,
    alerts: data.alerts !== undefined ? data.alerts : existing.alerts,
    reports: data.reports !== undefined ? data.reports : existing.reports,
    audit_logs: data.audit_logs !== undefined ? data.audit_logs : existing.audit_logs,
    users: data.users !== undefined ? data.users : existing.users,
    updated_at: new Date().toISOString(),
  };
  memoryClinicalStore = merged;
  try {
    fs.writeFileSync(clinicalStoreFile, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Clinical store saved in memory:', err);
  }
  return merged;
}

// ================= API ROUTES =================

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  const portfolio = loadPortfolio();
  const clinical = loadClinicalStore();
  res.json({
    status: 'ok',
    online: true,
    service: 'LiverGuard AI Clinical Backend',
    version: '2026.2.0',
    port: PORT,
    stats: {
      photos_count: portfolio?.photos?.length || 0,
      patients_count: clinical?.patients?.length || 12,
      assessments_count: clinical?.assessments?.length || 4,
    },
    timestamp: new Date().toISOString(),
  });
});

// 2. Get Portfolio
app.get('/api/portfolio', (_req: Request, res: Response) => {
  const portfolio = loadPortfolio();
  res.json({
    success: true,
    data: portfolio,
  });
});

// 3. Update Doctor Portfolio Info
app.put('/api/portfolio', (req: Request, res: Response) => {
  const current = loadPortfolio();
  const updates = req.body;

  const updated = {
    ...current,
    ...updates,
    stats: {
      ...current.stats,
      ...(updates.stats || {}),
    },
    updated_at: new Date().toISOString(),
  };

  savePortfolio(updated);
  res.json({
    success: true,
    message: 'Doctor profile and portfolio updated successfully',
    data: updated,
  });
});

// 4. Add Photo to Portfolio
app.post('/api/portfolio/photos', (req: Request, res: Response) => {
  const { title, category, url, description, patient_id, tags, is_primary_avatar, file_size_kb } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: 'Photo URL or base64 data is required' });
  }

  const current = loadPortfolio();

  const newPhotoId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newPhoto = {
    id: newPhotoId,
    title: title || `Clinical Media ${current.photos.length + 1}`,
    category: category || 'clinical_case',
    url,
    uploaded_at: new Date().toISOString(),
    description: description || '',
    patient_id: patient_id || undefined,
    tags: Array.isArray(tags) ? tags : [],
    is_primary_avatar: Boolean(is_primary_avatar),
    file_size_kb: file_size_kb || 0,
  };

  let photos = [...current.photos];
  let avatarUrl = current.avatar_url;

  if (is_primary_avatar) {
    photos = photos.map((p) => ({ ...p, is_primary_avatar: false }));
    avatarUrl = url;
  }

  photos.unshift(newPhoto);

  const updated = {
    ...current,
    photos,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  };

  savePortfolio(updated);

  res.status(201).json({
    success: true,
    message: 'Photo successfully added to portfolio',
    data: newPhoto,
    portfolio: updated,
  });
});

// 5. Delete Photo
app.delete('/api/portfolio/photos/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const current = loadPortfolio();

  const filtered = current.photos.filter((p: any) => p.id !== id);
  if (filtered.length === current.photos.length) {
    return res.status(404).json({ success: false, error: 'Photo not found' });
  }

  const updated = {
    ...current,
    photos: filtered,
    updated_at: new Date().toISOString(),
  };

  savePortfolio(updated);

  res.json({
    success: true,
    message: 'Photo removed from portfolio',
    data: { id },
  });
});

// 6. Set Photo as Avatar
app.put('/api/portfolio/photos/:id/avatar', (req: Request, res: Response) => {
  const { id } = req.params;
  const current = loadPortfolio();

  const targetPhoto = current.photos.find((p: any) => p.id === id);
  if (!targetPhoto) {
    return res.status(404).json({ success: false, error: 'Photo not found' });
  }

  const photos = current.photos.map((p: any) => ({
    ...p,
    is_primary_avatar: p.id === id,
  }));

  const updated = {
    ...current,
    photos,
    avatar_url: targetPhoto.url,
    updated_at: new Date().toISOString(),
  };

  savePortfolio(updated);

  res.json({
    success: true,
    message: 'Photo set as primary avatar',
    data: targetPhoto,
    portfolio: updated,
  });
});

// 7. Clinical Store Sync (Patients, Assessments, Alerts, Reports, Users)
app.get('/api/clinical-store', (_req: Request, res: Response) => {
  const store = loadClinicalStore();
  res.json({
    success: true,
    initialized: Boolean(store && store.patients && store.patients.length > 0),
    data: store,
  });
});

app.post('/api/clinical-store/sync', (req: Request, res: Response) => {
  const { patients, assessments, alerts, reports, audit_logs, users } = req.body || {};
  const saved = saveClinicalStore({
    patients,
    assessments,
    alerts,
    reports,
    audit_logs,
    users,
  });
  res.json({
    success: true,
    message: 'Clinical database synchronized with backend storage',
    counts: {
      patients: saved.patients.length,
      assessments: saved.assessments.length,
      alerts: saved.alerts.length,
      reports: saved.reports.length,
    },
    updated_at: saved.updated_at,
  });
});

// 8. Direct Patients REST API
app.get('/api/patients', (_req: Request, res: Response) => {
  const store = loadClinicalStore();
  res.json({
    success: true,
    data: store?.patients || [],
  });
});

app.post('/api/patients', (req: Request, res: Response) => {
  const patient = req.body;
  if (!patient || !patient.id) {
    return res.status(400).json({ success: false, error: 'Valid patient object is required' });
  }
  const store = loadClinicalStore() || {
    patients: [],
    assessments: [],
    alerts: [],
    reports: [],
    audit_logs: [],
    users: [],
    updated_at: new Date().toISOString(),
  };
  const idx = store.patients.findIndex((p: any) => p.id === patient.id);
  if (idx >= 0) {
    store.patients[idx] = { ...store.patients[idx], ...patient };
  } else {
    store.patients.unshift(patient);
  }
  const saved = saveClinicalStore(store);
  res.status(201).json({ success: true, data: patient, total: saved.patients.length });
});

// 9. Direct Assessments REST API
app.get('/api/assessments', (_req: Request, res: Response) => {
  const store = loadClinicalStore();
  res.json({
    success: true,
    data: store?.assessments || [],
  });
});

app.post('/api/assessments', (req: Request, res: Response) => {
  const assessment = req.body;
  if (!assessment || !assessment.id) {
    return res.status(400).json({ success: false, error: 'Valid assessment object is required' });
  }
  const store = loadClinicalStore() || {
    patients: [],
    assessments: [],
    alerts: [],
    reports: [],
    audit_logs: [],
    users: [],
    updated_at: new Date().toISOString(),
  };
  const idx = store.assessments.findIndex((a: any) => a.id === assessment.id);
  if (idx >= 0) {
    store.assessments[idx] = { ...store.assessments[idx], ...assessment };
  } else {
    store.assessments.unshift(assessment);
  }
  const saved = saveClinicalStore(store);
  res.status(201).json({ success: true, data: assessment, total: saved.assessments.length });
});

// 10. System status
app.get('/api/system-status', (_req: Request, res: Response) => {
  const portfolio = loadPortfolio();
  const clinical = loadClinicalStore();
  res.json({
    success: true,
    backend_status: 'online',
    port: PORT,
    database_synced: true,
    total_photos_stored: portfolio.photos.length,
    total_patients_stored: clinical?.patients?.length || 12,
    total_assessments_stored: clinical?.assessments?.length || 4,
    active_engine: 'LiverGuard Clinical Risk Engine v2026.2 (AASLD/EASL)',
  });
});

// Start standalone HTTP server when executed directly via `tsx server.ts`
const isDirectRun =
  process.argv[1] &&
  (path.resolve(process.argv[1]) === path.resolve(__filename) ||
    process.argv[1].endsWith('server.ts') ||
    process.argv[1].endsWith('server.js'));

if (isDirectRun) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LiverGuard Backend] Server running at http://localhost:${PORT}`);
    console.log(`[LiverGuard Backend] Health check available at http://localhost:${PORT}/api/health`);
    console.log(`[LiverGuard Backend] Doctor Portfolio endpoint at http://localhost:${PORT}/api/portfolio`);
    console.log(`[LiverGuard Backend] Clinical Store endpoint at http://localhost:${PORT}/api/clinical-store`);
  });
}

