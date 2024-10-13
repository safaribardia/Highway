import React from "react";
import { TextInput } from "@mantine/core";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange }) => {
  const formatPhoneNumber = (input: string): string => {
    const digitsOnly = input.replace(/\D/g, "");
    let formatted = "";

    if (digitsOnly.length > 0) {
      formatted += "(" + digitsOnly.slice(0, 3);
      if (digitsOnly.length > 3) {
        formatted += ") " + digitsOnly.slice(3, 6);
        if (digitsOnly.length > 6) {
          formatted += "-" + digitsOnly.slice(6, 10);
        }
      }
    }

    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    onChange(formatted);
  };

  return (
    <TextInput
      value={value}
      onChange={handleInputChange}
      placeholder="Enter a phone number."
      styles={{
        input: {
          backgroundColor: "#1A1B26",
          color: "#FFFFFF",
          borderColor: "#2C2E3E",
        },
      }}
    />
  );
};

export default PhoneInput;
