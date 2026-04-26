# Velo 🚀 
### AI-Powered Visual Triage & Dispatch Agent

Velo is an intelligent "Snap & Dispatch" platform developed for the 2026 Hackathon. It leverages **Gemini 1.5 Pro's** multimodal capabilities to automate emergency resource allocation for property managers.

---

## 🏗️ The Vision
Property managers often face "Information Overload" during site disasters. Manually typing descriptions like *"Burst pipe on 3rd floor"* is slow and prone to error. **Velo** allows them to simply take a photo; our Multi-Agent system handles the analysis, categorization, and dispatching.

## 👥 Team Velo
* **Aritraa Chakraborty**
* **Joy Mukherjee**
* **Ankit Kabiratna**
* **Mainak Saha**

---

## 🛠️ The Tech Stack
* **Frontend:** React + Tailwind CSS (Mobile-First UI)
* **AI Brain:** Gemini 1.5 Pro (Multimodal Visual Triage)
* **Database:** Firebase Firestore (Real-time Sync)
* **Icons:** Lucide React
* **Animations:** Framer Motion

## ⚡ How It Works
1. **Visual Triage:** User snaps a photo of a disaster site (e.g., flooding, fire, electrical hazard).
2. **Multimodal Analysis:** Gemini 1.5 Pro identifies the required trade (e.g., Emergency Plumber) and assigns an urgency level.
3. **Real-Time Dispatch:** The structured data is pushed to **Firebase Firestore**, instantly notifying the relevant workers.
4. **Live Confirmation:** The PM receives a live quote and status update on their dashboard.

## 🚀 Getting Started

### Prerequisites
* Node.js installed
* Google AI Studio API Key

### Installation & Setup
1. **Clone the repo:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/velo.git](https://github.com/YOUR_USERNAME/velo.git)
   cd velo
