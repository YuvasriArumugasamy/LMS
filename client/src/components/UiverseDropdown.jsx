import { useState, useRef, useEffect } from 'react';

export default function UiverseDropdown({ options, value, onChange, className = '', placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (e, optValue) => {
    e.stopPropagation();
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className={`uiverse-dropdown-menu ${className}`} ref={dropdownRef}>
      <div className={`item ${isOpen ? 'is-open' : ''}`}>
        <div 
          className="link" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <svg viewBox="0 0 360 360">
            <g id="SVGRepo_iconCarrier">
              <path
                id="XMLID_225_"
                d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"
              ></path>
            </g>
          </svg>
        </div>
        <div className="submenu">
          {options.map((opt) => (
            <div key={opt.value} className="submenu-item">
              <div
                className="submenu-link"
                onClick={(e) => handleSelect(e, opt.value)}
              >
                {opt.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
