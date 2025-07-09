import React from 'react';
import ReactDOM from 'react-dom/client';
// Temporarily comment out CSS import to test
// import './index.css';
import App from './App';

// Add console log to verify script is running
console.log('VisaQuest: index.js loaded');

// Add basic styles directly
const style = document.createElement('style');
style.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  #root {
    min-height: 100vh;
  }
`;
document.head.appendChild(style);

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error('VisaQuest ErrorBoundary caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('VisaQuest Error Details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f7fafc',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px'
          }}>
            <h2 style={{ color: '#e53e3e', marginBottom: '15px' }}>
              😔 Algo salió mal
            </h2>
            <p style={{ color: '#4a5568', marginBottom: '20px' }}>
              Hubo un error al cargar la aplicación.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#4299e1',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Recargar página
            </button>
            {this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#718096' }}>
                  Ver detalles del error
                </summary>
                <pre style={{
                  fontSize: '12px',
                  overflow: 'auto',
                  backgroundColor: '#f7fafc',
                  padding: '10px',
                  borderRadius: '5px',
                  marginTop: '10px'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple test component
const TestApp = () => {
  console.log('VisaQuest: TestApp rendering');
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#ebf8ff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2d3748' }}>
          ✨ VisaQuest
        </h1>
        <p style={{ color: '#4a5568', marginBottom: '30px' }}>
          La aplicación se está cargando...
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#4299e1',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Recargar
        </button>
      </div>
    </div>
  );
};

// Check for root element
const rootElement = document.getElementById('root');
console.log('VisaQuest: Root element found:', !!rootElement);

if (!rootElement) {
  console.error('VisaQuest: Root element not found!');
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: Arial, sans-serif;
      background-color: #f7fafc;
    ">
      <div style="text-align: center;">
        <h2 style="color: #e53e3e;">Error: No se encontró el elemento root</h2>
        <p>Por favor, recarga la página.</p>
      </div>
    </div>
  `;
} else {
  try {
    console.log('VisaQuest: Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    
    console.log('VisaQuest: Rendering test app first...');
    // First render a simple test component
    root.render(
      <React.StrictMode>
        <TestApp />
      </React.StrictMode>
    );
    
    // Then try to render the actual app after a delay
    setTimeout(() => {
      console.log('VisaQuest: Now rendering full app...');
      try {
        root.render(
          <React.StrictMode>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </React.StrictMode>
        );
        console.log('VisaQuest: Full app rendered successfully');
      } catch (appError) {
        console.error('VisaQuest: Error rendering App component:', appError);
        // Keep the test app if main app fails
      }
    }, 1000);
    
  } catch (error) {
    console.error('VisaQuest: Error during render:', error);
    
    // Show error in UI
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: Arial, sans-serif;
        background-color: #f7fafc;
      ">
        <div style="
          text-align: center;
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 400px;
        ">
          <h2 style="color: #e53e3e; margin-bottom: 15px;">
            😔 Error al iniciar la aplicación
          </h2>
          <p style="color: #4a5568; margin-bottom: 20px;">
            ${error.message || 'Error desconocido'}
          </p>
          <button
            onclick="window.location.reload()"
            style="
              background-color: #4299e1;
              color: white;
              padding: 10px 20px;
              border-radius: 8px;
              border: none;
              font-size: 16px;
              cursor: pointer;
            "
          >
            Recargar página
          </button>
          <details style="margin-top: 20px; text-align: left;">
            <summary style="cursor: pointer; color: #718096;">
              Ver detalles técnicos
            </summary>
            <pre style="
              font-size: 12px;
              overflow: auto;
              background-color: #f7fafc;
              padding: 10px;
              border-radius: 5px;
              margin-top: 10px;
              white-space: pre-wrap;
              word-wrap: break-word;
            ">${error.stack || error.toString()}</pre>
          </details>
        </div>
      </div>
    `;
  }
}
