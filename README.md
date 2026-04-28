<h1> ImpactGrid </h1>
<br>

## 🌟 Overview

**ImpactGrid** is a sophisticated, AI-driven documentation and orchestration platform designed to transform complex repository data and real-world crisis metrics into professional, comprehensive, and actionable intelligence. By bridging the gap between raw codebase analysis and executive-level reporting, ImpactGrid empowers developers and mission coordinators to generate high-fidelity README files and tactical documentation in seconds.

### 🛑 The Problem
> Coordinating large-scale humanitarian efforts and maintaining high-quality technical documentation often leads to critical information silos. Developers spend hundreds of hours manually writing documentation, while field coordinators struggle to sync real-time crisis data with mission reports. This inconsistency leads to slower response times, poor project visibility, and a significant burden on technical resources.

### ✅ The Solution
ImpactGrid eliminates the documentation bottleneck by providing an intelligent, component-based interface that analyzes project structures and mission data automatically. Whether you are documenting a complex GitHub repository or orchestrating a disaster relief mission, ImpactGrid provides a centralized "Neural Data Engine" that captures impact, processes logistics, and generates professional outputs (like READMEs and reports) with zero manual overhead.

### 🏗️ Architecture Overview
The platform is built on a modern **Component-based Architecture**, leveraging **React** and **Next.js** for a high-performance, single-page application experience. It utilizes **Supabase** for real-time data persistence and **Tailwind CSS** for a tactical, responsive user interface. The system is designed to be modular, with dedicated layers for AI processing, geospatial mapping, and personnel management.

---

## ✨ Key Features

ImpactGrid is packed with features designed to maximize user efficiency and provide total operational awareness.

- 🤖 **Neural Data Engine:** Automatically analyzes project structures and mission parameters to generate structured documentation and insights without manual entry.
- 🗺️ **Tactical Crisis Mapping:** Integrated geospatial awareness via Leaflet, allowing users to visualize "Impact Zones" and mission locations in real-time.
- 👥 **Personnel & Volunteer Management:** A dedicated panel for tracking personnel status, skill sets, and deployment readiness for mission-critical tasks.
- 🛰️ **Live Intel Stream:** Direct integration with the Global Disaster Alert and Coordination System (GDACS) to provide real-time global monitoring.
- 📦 **Logistics & Resource Matrix:** Manage field gear, equipment distribution, and resource allocation through a centralized matrix interface.
- 📊 **Predictive Analytics:** Utilize the AI-processing layer to forecast resource requirements and potential mission bottlenecks.
- 📄 **Automated Report Generation:** One-click summarization of mission activities into professional formats, including GitHub-ready README files.
---

## 🛠️ Tech Stack & Architecture

ImpactGrid utilizes a world-class technical stack to ensure scalability, reliability, and speed.

| Technology | Purpose | Why it was Chosen |
| :--- | :--- | :--- |
| **React 19** | UI Library | For building a dynamic, component-based user interface with high reactivity. |
| **Next.js 16.2** | Framework | Provides optimized routing, server-side rendering, and a robust API structure. |
| **TypeScript** | Language | Ensures type safety and reduces runtime errors across complex mission data models. |
| **Tailwind CSS** | Styling | Enables rapid development of a tactical, high-contrast, and responsive UI. |
| **Supabase** | Backend/Auth | Provides a scalable PostgreSQL database and real-time synchronization for mission logs. |
| **Leaflet** | Mapping | Lightweight and powerful library for handling geospatial data and tactical overlays. |
| **Lucide React** | Iconography | A comprehensive set of consistent, professional icons for UI clarity. |
| **Radix UI** | Components | Accessible, unstyled primitives for building high-quality design systems. |
| **Zod** | Validation | Ensures all incoming data from the AI engine and users meets strict schema requirements. |

---

## 📁 Project Structure

The project follows a modular Next.js App Router structure, separating core logic from UI components for maximum maintainability.

```
📂 KOD666-Impact-Grid-ed72906/
├── 📁 app/                       # Application entry points and routing
│   ├── 📁 analytics/             # Impact and performance metrics
│   ├── 📁 api/                   # Serverless API routes
│   │   ├── 📁 ai-match/          # AI-driven personnel matching
│   │   ├── 📁 gdacs/             # Global disaster data integration
│   │   ├── 📁 missions/          # Mission lifecycle management
│   │   └── 📁 reports/           # Automated report/README generation
│   ├── 📁 gdacs/                 # Real-time disaster monitoring view
│   ├── 📁 logistics/             # Resource and gear tracking
│   ├── 📁 personnel/             # Personnel and volunteer directory
│   └── 📄 layout.tsx             # Global application wrapper
├── 📁 components/                # Reusable UI components
│   ├── 📁 impact-grid/           # Mission-specific tactical components
│   │   ├── 📄 crisis-map.tsx     # Leaflet-based geospatial interface
│   │   ├── 📄 mission-card.tsx   # Mission summary component
│   │   └── 📄 neural-data-engine.tsx # Core AI processing interface
│   └── 📁 ui/                    # Radix-based design system components
├── 📁 hooks/                     # Custom React hooks (e.g., use-dashboard)
├── 📁 lib/                       # Core business logic and utilities
│   ├── 📄 ai-processing.ts       # AI logic for documentation generation
│   ├── 📄 allocate.ts            # Resource allocation algorithms
│   ├── 📁 supabase/              # Database client and server config
│   └── 📄 types.ts               # Global TypeScript definitions
├── 📁 scripts/                   # Database migration and setup scripts
├── 📁 styles/                    # Global CSS and Tailwind configurations
├── 📄 package.json               # Project dependencies and scripts
└── 📄 tsconfig.json              # TypeScript configuration
```

---

## 🚀 Getting Started

Follow these steps to deploy your own instance of ImpactGrid.

### Prerequisites

- **Node.js:** version 18.x or higher
- **npm:** version 9.x or higher
- **TypeScript:** version 5.x

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/impact-grid.git
   cd impact-grid
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```


3. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 🔧 Usage

### Generating Documentation
1. Navigate to the **Dashboard**.
2. Select the **Neural Data Engine** panel.
3. Input the repository or mission data you wish to analyze.
4. Click **Generate README** to produce a professional, formatted document based on your analysis.

### Orchestrating Missions
1. Use the **Tactical Map** to identify areas of interest or crisis.
2. Go to the **Personnel** tab to view available volunteers and their skill sets.
3. Use the **AI-Match** API to automatically suggest the best personnel for a specific mission.
4. Track progress in the **Mission Card** interface and monitor live updates via the **Live Intel Stream**.

### Real-time Monitoring
Access the `/gdacs` route to view live global disaster alerts. These alerts can be used to trigger new mission documentation or deployment orders directly within the grid.

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.

