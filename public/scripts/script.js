 // File icons mapping
const fileIcons = {
    '.md': 'fas fa-file-alt',
    '.js': 'fab fa-js-square',
    '.html': 'fab fa-html5',
    '.css': 'fab fa-css3-alt',
    '.json': 'fas fa-code',
    '.rvsf': 'fas fa-file-code',
    'default': 'fas fa-file'
};

// Sample file data (you'll replace this with real file loading)
const sampleFiles = [
    { name: 'getting-started.md', path: 'sample-files/notes/getting-started.md', type: '.md' },
    { name: 'tutorial.md', path: 'sample-files/notes/tutorial.md', type: '.md' },
    { name: 'example1.rvsf', path: 'sample-files/examples/example1.rvsf', type: '.rvsf' },
    { name: 'example.js', path: 'sample-files/example.js', type: '.js' },
    { name: 'example.html', path: 'sample-files/example.html', type: '.html' }
];

// DOM elements
const fileTree = document.getElementById('fileTree');
const fileName = document.getElementById('fileName');
const fileType = document.getElementById('fileType');
const fileContent = document.getElementById('fileContent');
const fileInfo = document.getElementById('fileInfo');

// Initialize file tree
function loadFileTree() {
    fileTree.innerHTML = '';
    
    sampleFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.index = index;
        
        // Get icon
        const iconClass = fileIcons[file.type] || fileIcons.default;
        
        fileItem.innerHTML = `
            <i class="file-icon ${iconClass}"></i>
            <span class="file-name">${file.name}</span>
        `;
        
        fileItem.addEventListener('click', () => loadFile(file));
        fileTree.appendChild(fileItem);
    });
}

// Load file content
async function loadFile(file) {
    try {
        // Update active state
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.file-item[data-index="${sampleFiles.indexOf(file)}"]`).classList.add('active');
        
        // Update header
        fileName.textContent = file.name;
        fileType.textContent = file.type.substring(1).toUpperCase() + ' File';
        
        // Load file content (for now, we'll use placeholder)
        // In a real app, you'd fetch the actual file
        const content = await simulateFileLoad(file);
        
        // Display content with syntax highlighting
        fileContent.innerHTML = `<code>${highlightContent(content, file.type)}</code>`;
        
        // Show file info
        fileInfo.innerHTML = `
            <p><strong>File:</strong> ${file.name}</p>
            <p><strong>Type:</strong> ${file.type.substring(1)}</p>
            <p><strong>Path:</strong> ${file.path}</p>
            <p><strong>Size:</strong> ${content.length} characters</p>
        `;
        
    } catch (error) {
        fileContent.innerHTML = `<code>Error loading file: ${error.message}</code>`;
        fileInfo.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

// Simulate file loading
async function simulateFileLoad(file) {
    // This simulates different file contents
    const contents = {
        'getting-started.md': `# Getting Started\n\nWelcome to Revisify Note Editor!\n\n## Features\n- File viewer\n- Note editing\n- Markdown support\n- Syntax highlighting\n\n## How to Use\n1. Click files in the sidebar\n2. View content in the editor\n3. Edit files (coming soon)`,
        'tutorial.md': `# Tutorial\n\nLearn how to use Revisify...\n\n## Basic Navigation\nUse the sidebar to browse files.\n\n## File Types Supported\n- Markdown (.md)\n- JavaScript (.js)\n- HTML (.html)\n- CSS (.css)\n- JSON (.json)\n- Revisify (.rvsf)`,
        'example1.rvsf': `{\n  "title": "My First Note",\n  "content": "This is a sample note in Revisify format",\n  "created": "2024-01-01",\n  "tags": ["sample", "demo"],\n  "version": "1.0"\n}`,
        'example.js': `// JavaScript Example\nconsole.log("Hello Revisify!");\n\nfunction greetUser(name) {\n    return \`Hello, \${name}! Welcome to Revisify.\`;\n}\n\n// Example usage\nconst message = greetUser("Developer");\nconsole.log(message);`,
        'example.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Example Page</title>\n</head>\n<body>\n    <h1>Welcome to Revisify</h1>\n    <p>This is an example HTML file.</p>\n    \n    <script>\n        console.log("HTML file loaded");\n    </script>\n</body>\n</html>`
    };
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(contents[file.name] || `Content for ${file.name}\n\nFile type: ${file.type}\n\nThis is simulated content.`);
        }, 300); // Simulate network delay
    });
}

// Simple syntax highlighting
function highlightContent(content, fileType) {
    let highlighted = content;
    
    // Escape HTML
    highlighted = highlighted
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    
    // Basic highlighting for different file types
    if (fileType === '.md') {
        highlighted = highlighted
            .replace(/^# (.*$)/gm, '<span class="md-heading">#$1</span>')
            .replace(/^## (.*$)/gm, '<span class="md-heading">##$1</span>')
            .replace(/\*\*(.*?)\*\*/g, '<span class="md-bold">**$1**</span>')
            .replace(/\`(.*?)\`/g, '<span class="md-code">`$1`</span>');
    } else if (fileType === '.js') {
        highlighted = highlighted
            .replace(/\b(const|let|var|function|return|if|else|for|while|console)\b/g, '<span class="js-keyword">$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="js-comment">$1</span>');
    } else if (fileType === '.json') {
        highlighted = highlighted
            .replace(/("[^"]*"):/g, '<span class="json-key">$1</span>:')
            .replace(/("[^"]*")/g, '<span class="json-string">$1</span>');
    }
    
    return highlighted;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadFileTree();
    
    // Load first file by default
    if (sampleFiles.length > 0) {
        loadFile(sampleFiles[0]);
    }
    
    // Add some CSS for syntax highlighting
    const style = document.createElement('style');
    style.textContent = `
        .md-heading { color: #005cc5; font-weight: bold; }
        .md-bold { color: #24292e; font-weight: bold; }
        .md-code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; }
        .js-keyword { color: #d73a49; }
        .js-comment { color: #6a737d; }
        .json-key { color: #005cc5; }
        .json-string { color: #032f62; }
    `;
    document.head.appendChild(style);
});
