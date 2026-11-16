import { StudioShell } from "@/components/studio";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and a modern browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Face tracking puppets in the browser",
      "Teleprompter for live reads",
      "Record and export MP4 or MOV",
      "Light and dark theme",
      "On device privacy",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StudioShell />
      <section className="stage-seo border-t border-[var(--border)] bg-[var(--surface-2)]">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
          Stage face puppet studio
        </h1>
        <p>
          Stage is a browser face puppet studio. Make a character copy your
          face, right in your browser. Your camera stays on your device. Nothing
          is uploaded.
        </p>

        <h2>How to use Stage</h2>
        <ol>
          <li>Pick a puppet in the Puppet tab.</li>
          <li>Press Try without a camera, or Start camera then Calibrate.</li>
          <li>Open the teleprompter if you want a script while you perform.</li>
          <li>Record a take, scrub the timeline, then Export as MP4 or MOV.</li>
        </ol>

        <h2>Teleprompter</h2>
        <p>
          Paste your script into the teleprompter, set scroll speed and text
          size, then read while your puppet follows your face. Mirror mode helps
          when you use a reflected monitor.
        </p>

        <h2>Built in demo tour</h2>
        <p>
          A guided tour runs on first visit and can be replayed from Help, Demo
          video. Captions cover welcome, privacy, choosing a puppet, sample
          face, camera calibrate, behaviors, record, timeline, export, and help.
        </p>

        <h2>Light and dark</h2>
        <p>
          Switch appearance from View, Theme, or the theme control in the menu
          bar. Your choice is remembered on this device.
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

        <h2>For AI agents</h2>
        <p>
          Read <a href="/llms.txt">llms.txt</a> and{" "}
          <a href="/llms-full.txt">llms-full.txt</a>. The XML sitemap is at{" "}
          <a href="/sitemap.xml">sitemap.xml</a>.
        </p>
      </section>
    </>
  );
}
