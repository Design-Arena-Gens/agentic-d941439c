# Photon Curator – Intelligent Photographer Dashboard

Photon Curator is a web-based culling workspace that helps photographers review thousands of captures, surface the strongest frames, and package polished selections for clients. All quality analysis happens in the browser so large RAW conversions stay private and responsive.

## ✨ Feature Highlights
- **On-device AI quality scoring**: evaluates sharpness, exposure balance, contrast, dynamic range, and saturation to rank images instantly.
- **Brief-aware filtering**: capture client intent with project, mood, and orientation preferences that inform insights and filters.
- **Smart tagging & filters**: automatic mood tags (vibrant, moody, airy, etc.), orientation, and score thresholds make it easy to focus on keepers.
- **Shortlist & hero workflows**: toggle selections, nominate a hero frame, and keep totals visible at all times.
- **Client-ready export**: download a ZIP containing chosen files plus a manifest JSON aligned with the brief.

## 🏁 Getting Started
```bash
npm install
npm run dev
```
Visit `http://localhost:3000` to begin curating. Dropping images into the dashboard keeps every file in the browser; nothing leaves your machine.

## 🛠 Scripts
- `npm run dev` – start the local development server.
- `npm run build` – create an optimized production build.
- `npm run start` – serve the production build.
- `npm run lint` – check the project with ESLint.

## 🧠 How Scoring Works
Image files are down-sampled on the client, processed through a series of heuristics (Laplacian sharpness, global contrast, highlight/shadow ratio, saturation, and entropy), and combined into a single AI score. The calculated metrics also generate smart tags to drive filters and insights.

## 📦 Export Manifest Structure
The exported ZIP includes a `manifest.json` with:
```json
{
  "project": "Untitled Shoot",
  "client": "Example Client",
  "deliveryDate": "2025-11-04",
  "selected": [
    {
      "file": "DSC_1234.jpg",
      "aiScore": 0.92,
      "tags": ["tack-sharp", "dynamic-range"],
      "orientation": "landscape"
    }
  ],
  "hero": "photo-id",
  "notes": "Client notes captured in the brief."
}
```

## 🚀 Deployment
The project is optimized for Vercel. Build locally before running `vercel deploy --prod`.

## 📄 License
Released under the MIT License. Feel free to adapt it to your workflow.
