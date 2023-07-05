import React, { useState } from "react";

export type RadioButtonGroupType = {
  options: {value:string, label:string}[]
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const RadioButtonGroup:React.FC<RadioButtonGroupType> = ({ options, value, onChange }) => {
  return (
    <div>
      {options.map((option) => (
        <label key={option.value}>
          <input type="radio" value={option.value} checked={value === option.value} onChange={onChange} />
          {option.label}
        </label>
      ))}
    </div>
  );
}