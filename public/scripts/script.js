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
    { 
        name: 'Editor', 
        path: 'editor.html', 
        type: '.html', 
        icon: 'fas fa-edit',
        description: 'Professional note creation suite with advanced formatting tools, subject-based organization, and academic workflow optimization.' 
    },
    { 
        name: 'Viewer', 
        path: 'viewer.html', 
        type: '.html', 
        icon: 'fas fa-eye',
        description: 'Note presentation interface for reviewing formatted content with proper typography and visual hierarchy.' 
    }
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
        
        // Inside loadFileTree function, update the innerHTML:
        fileItem.innerHTML = `
            <i class="file-icon ${file.icon}"></i>
            <span class="file-name">${file.name}</span>
        `;
        
        fileItem.addEventListener('click', () => loadFile(file));
        fileTree.appendChild(fileItem);

        // Inside loadFileTree, after creating fileItem, add:
        fileItem.addEventListener('mouseenter', () => {
            const descriptionPanel = document.getElementById('currentDescription');
            descriptionPanel.textContent = file.description || `Hovering: ${file.name}`;
        });

        fileItem.addEventListener('mouseleave', () => {
            // Only update if this file is not active
            if (!fileItem.classList.contains('active')) {
                const descriptionPanel = document.getElementById('currentDescription');
                const activeFile = sampleFiles.find(f => 
                    document.querySelector(`.file-item[data-index="${sampleFiles.indexOf(f)}"]`)?.classList.contains('active')
                );
                descriptionPanel.textContent = activeFile ? activeFile.description : 'Select a file to see its description';
            }
        });
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
        
        // If it's an HTML file, load it into an iframe
        if (file.type === '.html') {
            // Create an iframe to display the HTML
            fileContent.innerHTML = `
                <iframe 
                    src="${file.path}" 
                    style="width: 100%; height: 500px; border: none; border-radius: 8px;"
                    title="${file.name}"
                ></iframe>
            `;
            
            // Update file info
            fileInfo.innerHTML = `
                <p><strong>Page:</strong> ${file.name}</p>
                <p><strong>File:</strong> ${file.path}</p>
                <p><strong>Loaded in iframe</strong></p>
            `;
        } else {
            // For other files, show content as before
            const content = await simulateFileLoad(file);
            fileContent.innerHTML = `<code>${highlightContent(content, file.type)}</code>`;
            fileInfo.innerHTML = `
                <p><strong>File:</strong> ${file.name}</p>
                <p><strong>Type:</strong> ${file.type.substring(1)}</p>
                <p><strong>Path:</strong> ${file.path}</p>
                <p><strong>Size:</strong> ${content.length} characters</p>
            `;
        }
        // Update description panel
        const descriptionPanel = document.getElementById('currentDescription');
        if (file.description) {
            descriptionPanel.textContent = file.description;
        } else {
            descriptionPanel.textContent = `${file.name} - ${file.type.substring(1).toUpperCase()} file`;
        }
        
    } catch (error) {
        fileContent.innerHTML = `<code>Error loading file: ${error.message}</code>`;
        fileInfo.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}
// Simulate file loading
async function simulateFileLoad(file) {
    // This simulates different file contents
   const contents = {
        'editor.html': `<!-- Editor page would load here in iframe -->`,
        'viewer.html': `<!-- Viewer page would load here in iframe -->`
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
// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadFileTree();
    
    // Load Editor by default
    if (sampleFiles.length > 0) {
        loadFile(sampleFiles[0]); // This will load the Editor
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
