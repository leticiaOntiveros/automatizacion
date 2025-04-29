import React, { useState, useEffect } from "react";
import "./TemplateCarousel.css";
import AutomationForm from "./AutomationForm.js";

const TemplateCarousel = ({
  templateOptions = [],
  formData,
  handleTemplateChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (formData.template) {
      const selectedIndex = templateOptions.findIndex(
        (opt) => opt.id === formData.template
      );
      if (selectedIndex >= 0) {
        setCurrentIndex(selectedIndex);
      }
    }
  }, [formData.template, templateOptions]);

  const handleSelectTemplate = (templateId) => {
    handleTemplateChange({
      target: {
        name: "template",
        value: templateId,
      },
    });
  };

  if (templateOptions.length === 0) {
    return (
      <div className="carousel-empty">
        <div className="empty-icon">📷</div>
        <p>No hay templates disponibles</p>
      </div>
    );
  }

  const getAdjacentIndex = (offset) => {
    return (
      (currentIndex + offset + templateOptions.length) % templateOptions.length
    );
  };

  return (
    <div className="carousel-container">
      <label className="carousel-label">Template:</label>

      <div className="carousel-wrapper">
        {templateOptions.length > 1 && (
          <div
            className="carousel-item prev"
            onClick={() => setCurrentIndex(getAdjacentIndex(-1))}
          >
            <img
              src={templateOptions[getAdjacentIndex(-1)].image}
              alt={templateOptions[getAdjacentIndex(-1)].label}
            />
          </div>
        )}

        <div
          className={`carousel-item center ${
            formData.template === templateOptions[currentIndex].id
              ? "selected"
              : ""
          }`}
          onClick={() => handleSelectTemplate(templateOptions[currentIndex].id)}
        >
          <img
            src={templateOptions[currentIndex].image}
            alt={templateOptions[currentIndex].label}
          />
          <div className="template-name">
            {templateOptions[currentIndex].label}
          </div>
        </div>

        {templateOptions.length > 1 && (
          <div
            className="carousel-item next"
            onClick={() => setCurrentIndex(getAdjacentIndex(1))}
          >
            <img
              src={templateOptions[getAdjacentIndex(1)].image}
              alt={templateOptions[getAdjacentIndex(1)].label}
            />
          </div>
        )}
      </div>

      <div className="carousel-footer">
        {templateOptions.length > 1 && (
          <div className="carousel-indicators">
            {templateOptions.map((_, idx) => (
              <span
                key={idx}
                className={`indicator ${idx === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        )}
        <div className="selected-template-name">
          {formData.template
            ? `Seleccionado: ${
              templateOptions[currentIndex].label
              }`
            : "Ningún template seleccionado"}
        </div>
      </div>
    </div>
  );
};

export default TemplateCarousel;
