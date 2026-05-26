import React, { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [compressedImage, setCompressedImage] = useState(null);
  const [fileType, setFileType] = useState(''); // Tracks if image or json
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    setCompressedImage(null);
    setFileType('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("⚠️ Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setIsLoading(true);
      setMessage("⏳ Processing and compressing...");
      setCompressedImage(null);
      
      const response = await fetch('http://127.0.0.1:5000/compress', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("✅ " + data.message);
        setFileType(data.file_type); // Capture what type of file came back
        
        if (data.filename) {
          setCompressedImage(`http://127.0.0.1:5000/uploads/${data.filename}`);
        }
      } else {
        const errData = await response.json();
        setMessage(`❌ Failed: ${errData.error || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage("❌ Error connecting to backend. Is Flask running?");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      color: '#ffffff',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '20px'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
      maxWidth: '450px',
      width: '100%'
    },
    title: {
      margin: '0 0 25px 0',
      fontSize: '2.2rem',
      background: '-webkit-linear-gradient(#00d2ff, #3a7bd5)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 'bold'
    },
    inputLabel: {
      display: 'inline-block',
      padding: '12px 20px',
      background: 'rgba(255,255,255,0.1)',
      border: '1px dashed rgba(255,255,255,0.5)',
      borderRadius: '10px',
      cursor: 'pointer',
      marginBottom: '20px',
      transition: 'all 0.3s ease',
      width: '80%'
    },
    fileInput: {
      display: 'none'
    },
    button: {
      background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)',
      border: 'none',
      padding: '14px 25px',
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      borderRadius: '10px',
      cursor: 'pointer',
      width: '90%',
      boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)'
    },
    message: {
      marginTop: '20px',
      fontSize: '1rem',
      color: '#e0e0e0'
    },
    imageContainer: {
      marginTop: '30px',
    },
    image: {
      maxWidth: '100%',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      border: '2px solid rgba(255,255,255,0.1)'
    },
    jsonBox: {
      padding: '20px',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.2)',
      fontSize: '1.5rem',
      color: '#00d2ff',
      marginBottom: '15px'
    },
    downloadBtn: {
      display: 'inline-block',
      marginTop: '10px',
      padding: '12px 25px',
      background: '#28a745',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '10px',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📦 OmniCompress</h1>
        <p style={{color: '#aaa', marginTop: '-15px', marginBottom: '25px'}}>Images & JSON Files</p>
        
        {/* Accepting images and .json extensions */}
        <label style={styles.inputLabel}>
          📁 {selectedFile ? selectedFile.name : 'Choose Image or JSON'}
          <input 
            type="file" 
            style={styles.fileInput} 
            onChange={handleFileChange} 
            accept="image/*,.json" 
          />
        </label>
        <br />
        
        <button 
          onClick={handleUpload} 
          style={{...styles.button, opacity: isLoading ? 0.7 : 1}}
          disabled={isLoading}
        >
          {isLoading ? '⏳ Compressing...' : '🚀 Compress Now'}
        </button>
        
        {message && <p style={styles.message}>{message}</p>}

        {compressedImage && (
          <div style={styles.imageContainer}>
            {fileType === 'image' ? (
              <img src={compressedImage} alt="Compressed" style={styles.image} />
            ) : (
              <div style={styles.jsonBox}>
                📄 Minified JSON Ready
              </div>
            )}
            <br />
            <a href={compressedImage} download style={styles.downloadBtn}>
              ⬇️ Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;