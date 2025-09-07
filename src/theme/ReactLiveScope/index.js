import React from 'react';

const ButtonExample = (props) => (
  <button
    {...props}
    style={{
      backgroundColor: 'white',
      color: 'black',
      border: 'solid red',
      borderRadius: 20,
      padding: 10,
      cursor: 'pointer',
      ...props.style,
    }}
  />
);

const Loading = (props) => {
  const { size } = props;
  let sizeClassName = 'w-6 h-6';
  if (size === 'sm') {
    sizeClassName = 'w-4 h-4';
  } else if (size === 'lg') {
    sizeClassName = 'w-8 h-8';
  } else if (size === 'xl') {
    sizeClassName = 'w-12 h-12';
  } else if (size === '2xl') {
    sizeClassName = 'w-16 h-16 m-0 mx-auto';
  }

  return (
    <div
      className={`${sizeClassName} border-2 border-solid border-[var(--ifm-color-primary)] border-t-transparent rounded-full animate-spin`}
    ></div>
  );
};

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  ButtonExample,
  Loading,
};
export default ReactLiveScope;
