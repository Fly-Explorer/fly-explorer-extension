import React from 'react';
import './styles.css';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder = "Enter address..."
}) => {
  return (
    <div className="address-input-wrapper">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="address-input"
        placeholder={placeholder}
      />
    </div>
  );
};

export default AddressInput; 