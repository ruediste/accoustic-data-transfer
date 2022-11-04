import "./App.css";
import { startRecorder, pauseRecorder, demodulator } from "./workletRecorder";
import { workletPlayback } from "./workletPlayback";
import { useEffect, useRef, useState } from "react";
import { performRoundtrip } from "./roundtrip";
import { start } from "repl";

function doRoundtrip(canvas: HTMLCanvasElement) {
  const ffts = performRoundtrip();
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(1024, 100);
  const max = Math.max(
    ...ffts.map((x) =>
      x.reduce(
        (p, e) => (p === undefined ? e : Math.max(p, e)),
        Number.NEGATIVE_INFINITY
      )
    )
  );

  // Iterate through every pixel
  for (let y = 0; y < 100 && y < ffts.length; y++) {
    for (let x = 0; x < 1024; x++) {
      const i = 4 * (y * 1024 + x);
      const value = (255 * ffts[y][x]) / max;
      imageData.data[i + 0] = value; // R value
      imageData.data[i + 1] = value; // G value
      imageData.data[i + 2] = value; // B value
      imageData.data[i + 3] = 255; // A value
    }
  }

  // Draw image data to the canvas
  ctx.putImageData(imageData, 0, 0);
}

let canvasY = 0;

function App() {
  const [input, setInput] = useState("Hello");
  const canvasRef = useRef<HTMLCanvasElement>();
  useEffect(() => {
    demodulator.onFft = (fft) => {
      const ffts = performRoundtrip();
      const ctx = canvasRef.current!.getContext("2d")!;
      const imageData = ctx.createImageData(1024, 1);
      const max = fft.reduce(
        (p, e) => (p === undefined ? e : Math.max(p, e)),
        Number.NEGATIVE_INFINITY
      );

      // Iterate through every pixel
      for (let x = 0; x < 1024; x++) {
        const i = 4 * x;
        const value = (255 * fft[x]) / max;
        imageData.data[i + 0] = value; // R value
        imageData.data[i + 1] = value; // G value
        imageData.data[i + 2] = value; // B value
        imageData.data[i + 3] = 255; // A value
      }

      // Draw image data to the canvas
      ctx.putImageData(imageData, 0, canvasY++);
      if (canvasY >= canvasRef.current!.height) canvasY = 0;
    };
    return () => {
      demodulator.onFft = (fft) => {};
    };
  });
  return (
    <div className="App" style={{ backgroundColor: "blue" }}>
      <button onClick={() => startRecorder()}>Start Recording</button>
      <button onClick={() => pauseRecorder()}>Pause Recording</button>

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
        style={{ width: "99%" }}
        ref={(e) => {
          if (e != null) canvasRef.current = e;
        }}
      />
    </div>
  );
}

export default App;
