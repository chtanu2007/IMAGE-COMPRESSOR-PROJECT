import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/compress', methods=['POST'])
def compress_file():
    if 'image' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Look at the file extension to see what it is
    file_extension = os.path.splitext(file.filename)[1].lower()

    # --- IMAGE HANDLING ---
    if file_extension in ['.png', '.jpg', '.jpeg', '.webp']:
        try:
            img = Image.open(file)
            filename = file.filename.split('.')[0] + '_compressed.png'
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            img.save(output_path, format='PNG', optimize=True)
            
            return jsonify({
                'message': 'Image compressed successfully!',
                'filename': filename,
                'file_type': 'image'
            }), 200
        except Exception as e:
            return jsonify({'error': f'Image processing failed: {str(e)}'}), 500

    # --- JSON HANDLING ---
    elif file_extension == '.json':
        try:
            # Load the raw JSON data
            raw_data = json.load(file)
            filename = file.filename.split('.')[0] + '_compressed.json'
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Save it back without any spaces or formatting gaps to minimize file size
            with open(output_path, 'w') as f:
                json.dump(raw_data, f, separators=(',', ':'))
                
            return jsonify({
                'message': 'JSON minified and compressed successfully!',
                'filename': filename,
                'file_type': 'json'
            }), 200
        except Exception as e:
            return jsonify({'error': f'Invalid JSON data: {str(e)}'}), 400

    # --- UNSUPPORTED FILES ---
    else:
        return jsonify({'error': 'Unsupported file type. Upload images or JSON files.'}), 400

@app.route('/uploads/<filename>')
def serve_compressed_image(filename):
    return send_from_directory('uploads', filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)