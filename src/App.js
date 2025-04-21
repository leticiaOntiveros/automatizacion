import Header from './components/Header';
import AutomationC from './forms/automation/AutomationC';
import './App.css';

function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header 
        title="SISTEMA DE AUTOMATIZACION"
      />
      <div style={{ padding: '20px' }}>
        <AutomationC />
      </div>
    </div>
  );
}

export default App;