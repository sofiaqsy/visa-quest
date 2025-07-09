import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Add console log to verify script is running
console.log('VisaQuest: index.js loaded');

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
    
    console.log('VisaQuest: Rendering app...');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('VisaQuest: App rendered successfully');
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
