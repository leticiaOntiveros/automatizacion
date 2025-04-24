
import { useRef, useEffect } from 'react';

const ImageRadioSelector = ({ 
    containerId, 
    options, 
    name = 'image-radio',
    onChange = (value) => console.log('Seleccionado:', value)
  }) => {
    const containerRef = useRef(null);
  
    useEffect(() => {
      if (!containerRef.current) return;
  
      // Limpiar contenedor primero
      containerRef.current.innerHTML = '';
  
      const group = document.createElement('div');
      group.className = 'image-radio-group';
  
      options.forEach(({ value, imgSrc, alt, checked }) => {
        const label = document.createElement('label');
        label.className = 'image-option';
  
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.value = value;
        if (checked) input.checked = true;
  
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = alt || value;
  
        input.addEventListener('change', () => onChange(input.value));
  
        label.appendChild(input);
        label.appendChild(img);
        group.appendChild(label);
      });
  
      containerRef.current.appendChild(group);
  
      // Agregar estilos
      const style = document.createElement('style');
      style.textContent = `
        .image-radio-group {
          display: flex;
          justify-content: center;
          gap: 20px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 12px;
          font-family: sans-serif;
        }
        .image-option {
          text-align: center;
          cursor: pointer;
        }
        .image-option input[type="radio"] {
          display: none;
        }
        .image-option img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 12px;
          border: 2px solid transparent;
          transition: border 0.3s, transform 0.2s;
        }
        .image-option input[type="radio"]:checked + img {
          border-color: #000;
          transform: scale(1.05);
        }
        .image-option:hover img {
          transform: scale(1.05);
        }
      `;
      document.head.appendChild(style);
  
      return () => {
        // Limpieza
        document.head.removeChild(style);
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }, [options, name, onChange]);
  
    return <div id={containerId} ref={containerRef} />;
  };
  // Exportación CORRECTA como default
export default ImageRadioSelector;