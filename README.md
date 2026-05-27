OmniCompress: Full-Stack Image Compression Engine
OmniCompress is a powerful web application designed to compress images on the fly while tracking performance metrics and saving history in a database.

🚀 Features
Efficient Compression: Uses Pillow (PIL) to reduce image file size while maintaining visual quality.

Real-time Metrics: Calculates and displays "Before" and "After" file sizes, along with the total percentage of storage saved.

History Tracking: Automatically logs every compression task into a MongoDB database for future reference.

Modern Stack: Built with a React frontend and a Flask (Python) backend.

🛠 Tech Stack
Frontend: React.js, CSS

Backend: Flask (Python 3.13)

Image Processing: Pillow (PIL)

Database: MongoDB

Communication: RESTful API with Flask-CORS

⚙️ How to Setup
1. Backend Setup
Navigate to the backend folder.

Activate your virtual environment: .\new-venv\Scripts\activate

Install dependencies: pip install Flask Flask-CORS Pillow pymongo

Run the server: py app.py

2. Frontend Setup
Navigate to the frontend folder.

Install dependencies: npm install

Start the application: npm start

📊 Database
The application connects to a local MongoDB instance at mongodb://localhost:27017/. It utilizes a database named omnicompress_db and a collection named compression_history to store logs of all processed files.

🤝 Contributing
Feel free to fork this project and submit pull requests to add new compression algorithms or dashboard features!
