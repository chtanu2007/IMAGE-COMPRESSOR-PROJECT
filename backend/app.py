import os
import zipfile
import uuid
from io import BytesIO
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
from PIL import Image

app = Flask(__name__)
# Allow cross-origin requests from the React frontend
CORS(app)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'compressed_outputs')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ==========================================
# DATABASE CONFIGURATION (MongoDB Atlas Cloud)
# ==========================================
MONGO_URI = "mongodb+srv://admin:YOUR_PASSWORD_HERE@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client['omnicompressor_db']
    batches_collection = db['batches']
    client.server_info()
    print("⚡ Connected to MongoDB Cloud Tier Successfully!")
except Exception as e:
    print("\n⚠️  DATABASE WARNING: Could not connect to MongoDB Cloud.")
    batches_collection = None


# ==========================================
# CORE HELPER: IMAGE COMPRESSION ENGINE
# ==========================================
def compress_single_task(task_input):
    """Worker function optimized for high-speed multi-threading."""
    filename, file_bytes = task_input
    try:
        img = Image.open(BytesIO(file_bytes))
        
        # Strip transparency to save as JPEG
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert('RGB')
            
        output_buffer = BytesIO()
        # High-speed compression (optimize=True is removed for maximum speed)
        img.save(output_buffer, format="JPEG", quality=60)
        compressed_bytes = output_buffer.getvalue()
        
        original_size = len(file_bytes)
        compressed_size = len(compressed_bytes)
        saved_bytes = max(0, original_size - compressed_size)
        
        return filename, compressed_bytes, saved_bytes
    except Exception:
        # Pass file completely untouched if it fails
        return filename, file_bytes, 0


# ==========================================
# API ENDPOINTS
# ==========================================

@app.route('/compress', methods=['POST'])
def compress_assets():
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    uploaded_file = request.files['image']
    filename = uploaded_file.filename
    file_bytes = uploaded_file.read()
    
    batch_id = str(uuid.uuid4())
    total_images_processed = 0
    total_space_saved_bytes = 0
    
    # ----------------------------------------
    # CASE 1: BULK ZIP ARCHIVE
    # ----------------------------------------
    if filename.endswith('.zip'):
        output_zip_path = os.path.join(OUTPUT_DIR, f"{batch_id}.zip")
        compression_tasks = []
        passthrough_files = []
        
        # Unpack instantly in memory
        with zipfile.ZipFile(BytesIO(file_bytes), 'r') as input_zip:
            for file_info in input_zip.infolist():
                # Ignore system junk files
                if file_info.is_dir() or '__MACOSX' in file_info.filename or file_info.filename.startswith('.'):
                    continue
                    
                file_data = input_zip.read(file_info.filename)
                ext = file_info.filename.lower()
                
                # Separate images from other files
                if ext.endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    compression_tasks.append((file_info.filename, file_data))
                else:
                    passthrough_files.append((file_info.filename, file_data))
        
        # Multi-Core parallel processing for extreme speed
        with ThreadPoolExecutor(max_workers=4) as executor:
            processed_results = list(executor.map(compress_single_task, compression_tasks))
            
        # Re-pack the final zip
        with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as out_zip:
            for name, comp_bytes, saved in processed_results:
                base_name = os.path.splitext(name)[0]
                out_zip.writestr(f"{base_name}.jpg", comp_bytes)
                total_images_processed += 1
                total_space_saved_bytes += saved
                
            for name, raw_bytes in passthrough_files:
                out_zip.writestr(name, raw_bytes)
                
        final_download_id = batch_id
        
    # ----------------------------------------
    # CASE 2: SINGLE IMAGE
    # ----------------------------------------
    elif filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        _, comp_bytes, saved = compress_single_task((filename, file_bytes))
        output_file_path = os.path.join(OUTPUT_DIR, f"{batch_id}.jpg")
        
        with open(output_file_path, 'wb') as f:
            f.write(comp_bytes)
            
        total_images_processed = 1
        total_space_saved_bytes = saved
        final_download_id = batch_id
        
    else:
        return jsonify({"error": "Unsupported format. Upload an image or a valid .zip file."}), 400

    # Log analytics
    space_saved_kb = round(total_space_saved_bytes / 1024, 2)
    
    if batches_collection is not None:
        try:
            batches_collection.insert_one({
                "batch_id": final_download_id,
                "total_images": total_images_processed,
                "space_saved_kb": space_saved_kb,
                "timestamp": datetime.utcnow()
            })
        except Exception as db_err:
            print(f"Failed to log record entry to database: {db_err}")

    return jsonify({
        "batch_id": final_download_id,
        "total_images": total_images_processed,
        "space_saved_kb": space_saved_kb
    })


@app.route('/download-batch/<batch_id>', methods=['GET'])
def download_compressed_batch(batch_id):
    zip_target = os.path.join(OUTPUT_DIR, f"{batch_id}.zip")
    img_target = os.path.join(OUTPUT_DIR, f"{batch_id}.jpg")
    
    if os.path.exists(zip_target):
        return send_file(zip_target, as_attachment=True, download_name="omnicompressor_pack.zip")
    elif os.path.exists(img_target):
        return send_file(img_target, as_attachment=True, download_name="compressed_image.jpg")
    else:
        return jsonify({"error": "Requested assets have expired or do not exist on disk"}), 404


@app.route('/analytics', methods=['GET'])
def get_analytics():
    if batches_collection is None:
        return jsonify([])
        
    try:
        cursor = batches_collection.find().sort("timestamp", 1)
        records = list(cursor)
        formatted_chart_data = []
        cumulative_kb = 0.0
        
        for index, record in enumerate(records):
            cumulative_kb += record.get('space_saved_kb', 0.0)
            cumulative_mb = round(cumulative_kb / 1024, 3)
            formatted_chart_data.append({
                "uploadNumber": index + 1,
                "totalSavedMB": cumulative_mb
            })
            
        return jsonify(formatted_chart_data)
    except Exception as e:
        print(f"Error compiling analytics: {e}")
        return jsonify([])


if __name__ == '__main__':
    # Listen on all network interfaces
    app.run(host='0.0.0.0', port=5000, debug=True)