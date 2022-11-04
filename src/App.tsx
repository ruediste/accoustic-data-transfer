import "./App.css";
import { startRecorderProcessorInput } from "./workletRecorder";
import { startPlayback } from "./audioBufferPlayer";
import { workletPlayback } from "./workletPlayback";
import { useRef, useState } from "react";
import { performRoundtrip } from "./roundtrip";

function doRoundtrip(canvas: HTMLCanvasElement) {
  const ffts = performRoundtrip();
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(1024, 100);
  //const max=ffts.map(x=>Math.max(x.)

  // Iterate through every pixel
  for (let y = 0; y < 100 && y < ffts.length; y++) {
    for (let x = 0; x < 1024; x++) {
      const i = 4 * (y * 1024 + x);
      const value = ffts[y][x];
      imageData.data[i + 0] = value; // R value
      imageData.data[i + 1] = value; // G value
      imageData.data[i + 2] = value; // B value
      imageData.data[i + 3] = 255; // A value
    }
  }

  // const imageData = ctx.createImageData(100, 100);

  // Fill the array with RGBA values
  // for (let i = 0; i < imageData.data.length; i += 4) {
  //   // Percentage in the x direction, times 255
  //   let x = ((i % 400) / 400) * 255;
  //   // Percentage in the y direction, times 255
  //   let y = (Math.ceil(i / 400) / 100) * 255;

  //   // Modify pixel data
  //   imageData.data[i + 0] = x; // R value
  //   imageData.data[i + 1] = y; // G value
  //   imageData.data[i + 2] = 255 - x; // B value
  //   imageData.data[i + 3] = 255; // A value
  // }

  // Draw image data to the canvas
  ctx.putImageData(imageData, 20, 20);
}
function App() {
  const [input, setInput] = useState("Hello");
  const canvasRef = useRef<HTMLCanvasElement>();
  return (
    <div className="App">
      <button onClick={() => startRecorderProcessorInput()}>
        Start Recording
      </button>
      <button onClick={() => startPlayback()}>Start Buffer Playback</button>

      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={() => workletPlayback(input)}>Play</button>

      <br />
      <button onClick={() => doRoundtrip(canvasRef.current!)}>
        Test Roundtrip
      </button>
      <br />
      <canvas
        width={1024}
        height={100}
        style={{ height: 200 }}
        ref={(e) => {
          if (e != null) canvasRef.current = e;
        }}
      />
    </div>
  );
}

export default App;
