import React, { useState } from 'react';
import './App.css'; // Make sure you keep your CSS imports!

function App() {
  const [file, setFile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStats(null); // Reset the stats screen when picking a new file
    setError(null);
  };

  // 2. Send file to Flask backend
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Send the file to your Flask /compress route
      const response = await fetch('http://localhost:5000/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to compress file. Check your backend!");
      }

      // 3. Receive the JSON stats from Flask
      const data = await response.json();
      setStats(data); // Save the stats to display them
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>OmniCompress</h1>
      
      {/* Upload Section */}
      <div style={{ marginBottom: '20px' }}>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading} style={{ marginLeft: '10px' }}>
          {loading ? "Compressing..." : "Compress Image"}
        </button>
      </div>

      {/* Error Message */}
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      {/* 4. Display Stats & Download Button (Only shows after success) */}
      {stats && (
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          border: '2px dashed #4CAF50', 
          borderRadius: '10px',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#4CAF50' }}>Compression Success! 🎉</h2>
          
          <div style={{ textAlign: 'left', margin: '20px 0' }}>
            <p><strong>Original Size:</strong> {stats.original_size_kb} KB</p>
            <p><strong>Compressed Size:</strong> {stats.compressed_size_kb} KB</p>
            <p><strong>Space Saved:</strong> <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{stats.compression_percentage}%</span></p>
          </div>
          
          {/* Download Button using the new Flask /download route */}
          <a 
            href={`http://localhost:5000/download/${stats.download_filename}`} 
            download
          >
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Download Compressed File
            </button>
          </a>
        </div>
      )}
    </div>
  );
}

export default App;