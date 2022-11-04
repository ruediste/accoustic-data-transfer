import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { startInput } from "./audioInput";

function App() {
  return (
    <div className="App">
      <button onClick={() => startInput()}>Start</button>
    </div>
  );
}

export default App;
