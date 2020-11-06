// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react';
import { Popover } from 'antd';
import { SketchPicker } from 'react-color';

interface IColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
}

const ColorPicker: React.FC<IColorPickerProps> = ({ value, onChange }) => {
  const [color, setColor] = useState(value);

  useEffect(() => {
    setColor(value);
  }, [value]);

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      content={
        <SketchPicker
          color={color}
          onChangeComplete={(e) => {
            setColor(e.hex);
            if (onChange) {
              onChange(e.hex);
            }
          }}
        ></SketchPicker>
      }
    >
      <div
        style={{
          padding: 5,
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        }}
      >
        <div style={{ width: 52, height: 20, background: color }}></div>
      </div>
    </Popover>
  );
};

export default ColorPicker;
