import { useState } from 'react';
import AutomationForm from './AutomationForm';
import './styles.css'; // Importa los estilos

export default function AutomationC() {
  const [activeTab, setActiveTab] = useState('AutomationForm'); // Estado para la pestaña activa

  return (
    <div className="container">
      <div className="card">
        <div className="p-6">
          <h1 className="title"></h1>
          {/* Pestañas */}
          <div className="tabs">
            <button
              className="button-recargar"
              onClick={() => setActiveTab('AutomationForm')}
            >
              Datos de automatizacion
            </button>
          </div>
          
          {/* Contenido del formulario */}
          <div className="form-container">
            {activeTab === 'AutomationForm' && <AutomationForm />}
          </div>
        </div>
      </div>
    </div>
  );
}