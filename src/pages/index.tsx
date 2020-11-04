// eslint-disable-next-line no-use-before-define
import React, { useEffect } from 'react';

export default () => {
  useEffect(() => {
    console.log('1');
  });
  return (
    <div>
      <canvas style={{ border: '1px solid black' }}></canvas>
      <div>{'Hello World'}</div>
    </div>
  );
};
