import React from "react";
import "./Header.css";
import LogoutIcon from "@mui/icons-material/Logout";

const Header = ({
  title,
}) => {

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title-container">
          <h1 className="header-title-text">{title}</h1>
        </div>
        <div className="header-controls">
        </div>
      </div>
    </header>
  );
};

export default Header;