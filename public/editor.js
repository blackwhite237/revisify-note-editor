const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: code => {
    if (window.hljs) {
      return hljs.highlightAuto(code).value;
    }
    return code;
  }
});

// Render Markdown with Math and syntax highlighting
function render() {
  const raw = editor.value;
  const html = DOMPurify.sanitize(marked.parse(raw));
  preview.innerHTML = html;

  // Render LaTeX math
  if (window.renderMathInElement) {
    renderMathInElement(preview, {
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
    preview.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
  }

  updateWordCount();
}

// Update word and character count
function updateWordCount() {
  const text = editor.value;
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const chars = text.length;
  const lines = text.split('\n').length;
  
  document.getElementById('word-count').textContent = words;
  document.getElementById('char-count').textContent = chars;
  document.getElementById('line-count').textContent = lines;
}

// Insert text at cursor
function insert(before, after = "") {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const text = editor.value;

  const selected = text.slice(start, end);
  editor.value =
    text.slice(0, start) +
    before + selected + after +
    text.slice(end);

  editor.focus();
  editor.selectionStart = start + before.length;
  editor.selectionEnd = start + before.length + selected.length;

  render();
  localStorage.setItem("revisifyDraft", editor.value);
}

// Insert table template
function insertTable() {
  const tableMarkdown = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;
  insert(tableMarkdown + '\n');
}

// Wrap selection with custom div
function wrapSelectionWithDiv(className) {
  const textarea = editor;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  if (start === end) {
    // If nothing selected, insert empty div
    const emptyDiv = `\n<div class="${className}">\nYour content here\n</div>\n`;
    insert(emptyDiv);
    return;
  }

  const selected = textarea.value.substring(start, end);
  const block = `\n<div class="${className}">\n${selected}\n</div>\n`;

  textarea.value =
    textarea.value.substring(0, start) +
    block +
    textarea.value.substring(end);

  textarea.selectionStart = textarea.selectionEnd =
    start + block.length;

  textarea.focus();
  render();
  localStorage.setItem("revisifyDraft", editor.value);
}

// Send to Viewer
function sendToViewer() {
  localStorage.setItem("revisifyCurrentNote", editor.value);
  localStorage.setItem("revisifyLastUpdate", new Date().toLocaleString());
  
  // Show confirmation
  const btn = document.querySelector('header button.btn-primary');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="material-icons">check</span> Sent!';
  btn.style.backgroundColor = '#34a853';
  
  setTimeout(() => {
    btn.innerHTML = '<span class="material-icons">visibility</span> View Note';
    btn.style.backgroundColor = '';
  }, 2000);
  
  // Option to open in new tab
  if (confirm("Note saved! Open in viewer?")) {
    window.open('viewer.html', '_blank');
  }
}

// Clear editor
function clearEditor() {
  if (confirm("Clear the editor? This cannot be undone.")) {
    editor.value = '';
    render();
    localStorage.removeItem("revisifyDraft");
  }
}

// Download as Markdown file
function downloadMarkdown() {
  const content = editor.value;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `revisify-note-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event Listeners
editor.addEventListener("input", () => {
  render();
  localStorage.setItem("revisifyDraft", editor.value);
});

// Toolbar buttons
document.getElementById("insertImageBtn").addEventListener("click", () => {
  const url = prompt("Enter image URL (or leave empty for placeholder):", "https://via.placeholder.com/400x200");
  if (url === null) return;
  const altText = prompt("Enter alt text for the image:", "Image");
  insert(`![${altText}](${url || 'https://via.placeholder.com/400x200'})`);
});

document.getElementById("btnDef").addEventListener("click", () => wrapSelectionWithDiv("definition"));
document.getElementById("btnTheory").addEventListener("click", () => wrapSelectionWithDiv("theory"));
document.getElementById("btnNote").addEventListener("click", () => wrapSelectionWithDiv("note"));
document.getElementById("btnFormula").addEventListener("click", () => wrapSelectionWithDiv("formula"));
document.getElementById("btnWarn").addEventListener("click", () => wrapSelectionWithDiv("warning"));

document.getElementById("imageUpload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    insert(`![${fileName}](${reader.result})`);
  };
  reader.readAsDataURL(file);
});

// Keyboard shortcuts
editor.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    sendToViewer();
  }
  
  // Ctrl/Cmd + B for bold
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    insert('**', '**');
  }
  
  // Ctrl/Cmd + I for italic
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    insert('*', '*');
  }
  
  // Ctrl/Cmd + D for definition
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    wrapSelectionWithDiv("definition");
  }
  
  // Ctrl/Cmd + T for theory
  if ((e.ctrlKey || e.metaKey) && e.key === 't') {
    e.preventDefault();
    wrapSelectionWithDiv("theory");
  }
});

// Load saved draft
const saved = localStorage.getItem("revisifyDraft");
if (saved) {
  editor.value = saved;
} else {
  editor.value = `# Welcome to Revisify!

This is a **markdown editor** with live preview. 

## Features
- ✨ Live preview
- 🔤 **Bold**, *italic*, \`code\`
- 📝 Custom blocks (Definitions, Theories, Notes, etc.)
- 📊 Tables
- 🧮 Math equations with KaTeX
- 📷 Image upload
- 💾 Auto-save

## Try it out!
Select some text and click the buttons above to wrap it in different styles.

<div class="definition">
This is a definition block. Great for important concepts.
</div>

<div class="theory">
**Newton's Laws of Motion**

**First Law (Inertia):**
An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.

**Second Law (Force):**
$F = ma$
The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.

**Third Law (Action-Reaction):**
For every action, there is an equal and opposite reaction.
</div>

<div class="note">
This is a note block. Use it for additional information or observations.
</div>

<div class="formula">
Quantum Mechanics: $\\psi(x,t)$

Schrödinger Equation:
$$
i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)
$$
</div>

<div class="warning">
This is a warning block. Use for important cautions or things to remember.
</div>

## Keyboard Shortcuts
- **Ctrl+S**: Save to viewer
- **Ctrl+B**: Bold text
- **Ctrl+I**: Italic text
- **Ctrl+D**: Wrap as definition
- **Ctrl+T**: Wrap as theory

## More Theory Example
<div class="theory">
**Theory of Evolution**

**Natural Selection:**
1. Variation exists within populations
2. Some variations are heritable
3. Organisms produce more offspring than can survive
4. Survival and reproduction are not random

**Key Principles:**
- Adaptation to environment
- Speciation over time
- Common ancestry
</div>

## Math Example
Inline: $E = mc^2$

Display:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, Revisify!");
}
\`\`\`

Happy note-taking! 🎉`;
}

// Initial render
render();