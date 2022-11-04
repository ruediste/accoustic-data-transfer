import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { startRecorderProcessorInput } from "./audioWorkletProcessor";
import { startPlayback } from "./audioBufferPlayer";

function App() {
  return (
    <div className="App">
      <button onClick={() => startRecorderProcessorInput()}>
        Start Recording
      </button>
      <button onClick={() => startPlayback()}>Start Playback</button>
    </div>
  );
}

export default App;
