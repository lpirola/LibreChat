import React from 'react';

interface RadioButtonProps {
  id: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ id, name, value, checked, onChange }) => {
  return (
    <div className='flex justify-center items-center'>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
      />
      <label htmlFor={id} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
        {' '}
        {value}
      </label>
    </div>
  );
};

export default RadioButton;