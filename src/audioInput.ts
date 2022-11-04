export function startInput(): void {
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then((stream) => {
      console.log("got stream");
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        console.log("data", event.data);
      };
      mediaRecorder.onerror = (e) => console.log("error", e);
      mediaRecorder.onstart = () => console.log("onstart");
      mediaRecorder.start();
    });
}
