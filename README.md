# 🚀 OmniCompress: Full-Stack Image Compression Engine

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.13-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/Flask-2.x-lightgrey.svg" alt="Flask">
  <img src="https://img.shields.io/badge/React-18.x-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/MongoDB-Database-green.svg" alt="MongoDB">
</p>

**OmniCompress** is a high-performance web application that optimizes images while providing real-time analytics. It serves as a comprehensive example of a full-stack integration between a Python backend, a React frontend, and a NoSQL database.

---

## 🌟 Core Functionality
- **Dynamic Compression**: Uses the Pillow library to strip metadata and adjust image quality, drastically reducing file size.
- **Analytics Dashboard**: Calculates precise "Before" vs. "After" sizes and calculates the percentage of storage saved.
- **Data Persistence**: Uses MongoDB to maintain a log of all previous compression tasks, storing filenames, original/compressed sizes, and timestamps.

## 🛠 Tech Stack
| Tier | Technology |
| :--- | :--- |
| **Frontend** | React, CSS3, Fetch API |
| **Backend** | Flask, Python 3.13, Pillow |
| **Database** | MongoDB (Local) |
| **Version Control**| Git & GitHub |

---

## ⚙️ Installation & Setup
### 1. Backend Setup
1. `cd backend`
2. Create and activate environment: 
   `python -m venv new-venv`
   `.\new-venv\Scripts\activate`
3. Install requirements: `pip install Flask Flask-CORS Pillow pymongo`
4. Launch the server: `py app.py`

### 2. Frontend Setup
1. `cd frontend`
2. Install modules: `npm install`
3. Launch: `npm start`

---

## 📝 API Endpoints
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/compress` | POST | Accepts image file, compresses it, and returns metrics. |
| `/download/<filename>` | GET | Serves the compressed file for user download. |
| `/history` | GET | Returns the last 20 compression logs from MongoDB. |

---

## 🛠 Troubleshooting
- **Pillow Build Error**: If you see "Failed building wheel for pillow," ensure you are using Python 3.13 and running `pip install Pillow --no-cache-dir`.
- **Database Connection**: Ensure your local MongoDB service (mongod) is actually running in the background before starting the Flask server.
- **Port Conflicts**: If port 3000 (React) or 5000 (Flask) is in use, verify no other instances are running in your Terminal/Task Manager.

---
*Built with passion for clean, efficient code.*
