import React from 'react';
import { Clock } from 'lucide-react';

export const UiverseStarButton = ({
  children,
  onClick,
  disabled,
  variant = 'checkin', // 'checkin' | 'checkout' | 'emerald'
  icon: Icon = Clock,
  className = ''
}) => {
  const variantClass = variant === 'checkout' ? 'btn-checkout' : variant === 'emerald' ? 'btn-emerald' : '';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`uiverse-star-btn ${variantClass} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 text-current shrink-0 fill-current" />}
      <span>{children}</span>

      {/* Starburst Animated SVGs from Uiverse.io */}
      <div className="star-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          version="1.1"
          style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}
          viewBox="0 0 784.11 815.53"
        >
          <g id="Layer_x0020_1">
            <path
              className="fil0"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </g>
        </svg>
      </div>

      <div className="star-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          version="1.1"
          style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}
          viewBox="0 0 784.11 815.53"
        >
          <g id="Layer_x0020_1">
            <path
              className="fil0"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </g>
        </svg>
      </div>

      <div className="star-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          version="1.1"
          style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}
          viewBox="0 0 784.11 815.53"
        >
          <g id="Layer_x0020_1">
            <path
              className="fil0"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </g>
        </svg>
      </div>

      <div className="star-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          version="1.1"
          style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}
          viewBox="0 0 784.11 815.53"
        >
          <g id="Layer_x0020_1">
            <path
              className="fil0"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </g>
        </svg>
      </div>

      <div className="star-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          version="1.1"
          style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}
          viewBox="0 0 784.11 815.53"
        >
          <g id="Layer_x0020_1">
            <path
              className="fil0"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </g>
        </svg>
      </div>

      <div className="star-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          version="1.1"
          style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'optimizeQuality', fillRule: 'evenodd', clipRule: 'evenodd' }}
          viewBox="0 0 784.11 815.53"
        >
          <g id="Layer_x0020_1">
            <path
              className="fil0"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </g>
        </svg>
      </div>
    </button>
  );
};
