const viewer = document.getElementById("viewer");

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: code => hljs.highlightAuto(code).value
});

// Load and render note
function load() {
  const note = localStorage.getItem("revisifyCurrentNote") || 
    `# Welcome to Revisify Viewer!

## No note yet

Write something in the editor and click **"View Note"** to see it here!

<div class="theory">
**How to use Theory blocks:**

1. Go to the Editor
2. Select some text
3. Click the <span class="material-icons" style="font-size: 16px; vertical-align: middle;">psychology</span> Theory button
4. Your text will be wrapped in a theory block
5. View it here in the viewer!

**Keyboard shortcut:** Ctrl+T to wrap as theory
</div>

<div class="definition">
**Definition:** A statement of the exact meaning of a word or concept.
</div>

<div class="formula">
Example formula: $E = mc^2$
</div>`;
  
  const html = DOMPurify.sanitize(marked.parse(note));
  viewer.innerHTML = html;

  // Render LaTeX math
  if (window.renderMathInElement) {
    renderMathInElement(viewer, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false,
      strict: false
    });
  }

  // Apply syntax highlighting
  if (window.hljs) {
    viewer.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
  }

  // Update last updated time
  const lastUpdate = localStorage.getItem("revisifyLastUpdate");
  if (lastUpdate) {
    document.getElementById('last-updated').textContent = lastUpdate;
  }
}

// Initialize
load();

// Auto-refresh every 5 seconds (optional)
// setInterval(load, 5000);