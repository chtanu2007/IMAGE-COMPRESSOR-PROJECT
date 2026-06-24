import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Dynamically connects to your backend whether on localhost or local IP
const BACKEND_URL = `http://${window.location.hostname}:5000`;

function App() {
  const [file, setFile] = useState(null);
  const [latestBatchId, setLatestBatchId] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/analytics`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      
      if (data && !data.error && Array.isArray(data)) {
        setChartData(data);
      }
    } catch (err) {
      console.error("Error fetching analytics chart:", err);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file (.zip or image) first!");
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${BACKEND_URL}/compress`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStats(data);
        setLatestBatchId(data.batch_id || null);
        setTimeout(() => fetchAnalytics(), 300);
      } else {
        alert(data.error || "Compression failed.");
      }
    } catch (err) {
      alert("Failed to connect to backend server. Make sure Python is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!latestBatchId) return;
    window.location.href = `${BACKEND_URL}/download-batch/${latestBatchId}`;
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', color: '#333' }}>
      <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>Omnicompressor Dashboard ⚡</h1>
      </div>

      <div style={{ background: '#f8f9fa', border: '1px solid #ddd', padding: '25px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0 }}>1. Select Assets</h3>
        <input type="file" onChange={handleFileChange} accept=".zip,image/*" style={{ marginBottom: '15px', display: 'block' }} />
        <button 
          onClick={handleUpload} 
          disabled={loading} 
          style={{ 
            background: loading ? '#95a5a6' : '#3498db', 
            color: 'white', padding: '10px 20px', borderRadius: '5px', 
            fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' 
          }}
        >
          {loading ? "Compressing Fast (Using Multi-Core Processing)..." : "Compress Upload"}
        </button>
      </div>

      {stats && (
        <div style={{ background: '#eafaf1', border: '1px solid #2ecc71', padding: '25px', borderRadius: '8px', marginBottom: '30px' }}>
          <h3 style={{ marginTop: 0, color: '#27ae60' }}>🎉 Compression Successful!</h3>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
            <div>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>Items Processed</p>
              <h2 style={{ margin: 0 }}>{stats.total_images || 1}</h2>
            </div>
            <div>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>Space Saved (KB)</p>
              <h2 style={{ margin: 0, color: '#27ae60' }}>{stats.space_saved_kb} KB</h2>
            </div>
          </div>
          {latestBatchId && (
            <button 
              onClick={handleDownload} 
              style={{ background: '#2ecc71', color: 'white', padding: '12px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
            >
              📥 Download Compressed Package
            </button>
          )}
        </div>
      )}

      <div style={{ background: '#ffffff', border: '1px solid #ddd', padding: '25px', borderRadius: '8px' }}>
        <h3>Lifetime Storage Savings Timeline</h3>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          {chartData && chartData.length > 0 ? (
            <LineChart width={800} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="uploadNumber" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalSavedMB" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '50px 0' }}>No upload history data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;