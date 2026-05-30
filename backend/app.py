import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# 1. MongoDB Configuration
try:
    client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
    db = client["omnicompress_db"]
    history_collection = db["compression_history"]
    # Test connection
    client.server_info()
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

# ==========================================
# 2. Setup Upload Folder
# ==========================================
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create the uploads folder if it doesn't exist yet
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
# 3. Compression Route (Calculates Sizes & Logs)
@app.route('/compress', methods=['POST'])
def compress_file():
    if 'image' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Save original file to measure its exact size
    original_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(original_path)
    original_size = os.path.getsize(original_path)

    # Setup path for the new compressed file
    compressed_filename = "compressed_" + file.filename
    compressed_path = os.path.join(app.config['UPLOAD_FOLDER'], compressed_filename)
    
    # Compress using PIL (Pillow)
    try:
        img = Image.open(original_path)
        # Convert to RGB if it's a PNG with transparency, so it can be saved and compressed easily
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Save with optimization and reduced quality for compression
        img.save(compressed_path, optimize=True, quality=60)
    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500
    
    # Measure new size and calculate the savings percentage
    compressed_size = os.path.getsize(compressed_path)
    
    if original_size > 0:
        percentage_saved = round(((original_size - compressed_size) / original_size) * 100, 2)
    else:
        percentage_saved = 0

    # Log data to MongoDB
    log_data = {
        "file_name": file.filename,
        "original_size_kb": round(original_size / 1024, 2),
        "compressed_size_kb": round(compressed_size / 1024, 2),
        "savings_percentage": percentage_saved,
        "timestamp": datetime.utcnow()
    }
    
    try:
        history_collection.insert_one(log_data)
    except Exception as e:
        print(f"Failed to log to MongoDB: {e}")

    # Return the calculation stats to React
    return jsonify({
        'message': 'Compression successful!',
        'original_size_kb': round(original_size / 1024, 2),
        'compressed_size_kb': round(compressed_size / 1024, 2),
        'compression_percentage': percentage_saved,
        'download_filename': compressed_filename
    }), 200

# 4. Download Route (For Frontend to get the file)
@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    # This route allows React to actually download the file after seeing the stats
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

# 5. History Route (For a Frontend Dashboard)
@app.route('/history', methods=['GET'])
def get_history():
    try:
        # Fetch latest 20 logs from MongoDB, exclude the un-serializable _id field
        logs = list(history_collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(20))
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)