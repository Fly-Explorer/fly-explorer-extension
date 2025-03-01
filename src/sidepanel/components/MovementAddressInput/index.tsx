import React from 'react';
import './styles.css';

interface MovementAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MovementAddressInput: React.FC<MovementAddressInputProps> = ({
  value,
  onChange,
  placeholder = "Enter movement address"
}) => {
  return (
    <div className="movement-address-input-wrapper">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="movement-address-input"
        placeholder={placeholder}
      />
    </div>
  );
};

export default MovementAddressInput; 