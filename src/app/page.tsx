import { StudioShell } from "@/components/studio";

export default function Home() {
  return (
    <>
      <StudioShell />
      <section className="sr-only" aria-hidden="false">
        <h1>WebPuppet face puppet studio</h1>
        <p>
          WebPuppet is a browser face puppet studio. Make a character copy your
          face, right in your browser. Your camera stays on your device. Nothing
          is uploaded.
        </p>
        <h2>How to use</h2>
        <ol>
          <li>Pick a puppet in the Puppet tab.</li>
          <li>
            Press Try without a camera, or Start camera then Calibrate.
          </li>
          <li>Record a take, scrub the timeline, then Export as MP4 or MOV.</li>
        </ol>
        <h2>Built in demo tour</h2>
        <p>
          A guided tour runs on first visit and can be replayed from Help, Demo
          video. Captions cover welcome, privacy, choosing a puppet, sample
          face, camera calibrate, behaviors, record, timeline, export, and help.
        </p>
        <h2>Keyboard shortcuts</h2>
        <ul>
          <li>Space play or pause</li>
          <li>R record</li>
          <li>S stop</li>
          <li>C calibrate</li>
          <li>T toggle tracking</li>
          <li>F fit stage</li>
          <li>Ctrl or Cmd Z undo</li>
          <li>Ctrl or Cmd Shift Z redo</li>
          <li>Ctrl or Cmd E export</li>
          <li>Question mark opens shortcuts</li>
        </ul>
        <h2>Menu bar</h2>
        <p>File, Edit, View, Puppet, Record, and Help.</p>
        <h2>Privacy</h2>
        <p>
          Face tracking and lip sync run on your device. Camera and mic data
          never leave your browser.
        </p>
      </section>
    </>
  );
}
