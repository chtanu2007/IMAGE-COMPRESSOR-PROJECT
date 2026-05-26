# OmniCompress 🚀

OmniCompress is a sleek, modern image and JSON file processing application built with a high-performance Python Flask backend and an interactive glassmorphic React frontend.

## ✨ Features
* **Dual Compression Engine:** Handles both image sizing operations and complex JSON data structures.
* **Modern UI:** Glassmorphism-inspired design with real-time feedback.
* **Fast Processing:** Light backend architecture utilizing custom environments for instant execution.

---

## 🛠️ Installation & Setup

To run this project locally, follow these simple setup steps for both the backend and frontend.

### 1. Backend Setup (Flask)
Navigate to the backend directory, configure your isolated environment, and spin up the server:
```bash
cd backend
py -3.13 -m venv venv
.\venv\Scripts\activate
pip install Pillow Flask Flask-CORS
py app.py
