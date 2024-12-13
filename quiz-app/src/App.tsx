// Main React Component (App.tsx)
import React from 'react';
import './App.css';

const App: React.FC = () => {
  const text = "Coming Soon...";

  return (
    <div>
      <div className="zigzag-background"></div>
      <div className="container">
        <h1 className="title">IM ABOUT TO QUIZ</h1>
        <div className="animated-text">
          {text.split('').map((char, index) => (
            <span
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;