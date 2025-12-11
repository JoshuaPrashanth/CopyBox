// ==============================================
// CONFIGURATION
// ==============================================

// 1. Your course titles
const courseTitles = {
    python: "Data Visualization With Python",
    cpp: "Programming in C++: A Hands-on Introduction"
};

// 2. Your Python files
const pythonFiles = [
    { 
        name: "8.txt", 
        displayName: "VTU-8", 
        path: "python/8.txt"
    },
    { 
        name: "10.txt", 
        displayName: "VTU-10", 
        path: "python/10.txt"
    }
];

// 3. C++ Chapter-Module structure - AUTO-GENERATED
const cppChapterModules = {};

// Generate for chapters 1-4, modules 1-4
for (let chapter = 1; chapter <= 4; chapter++) {
    for (let module = 1; module <= 4; module++) {
        const folderName = `chapter${chapter}_module${module}`;
        const files = [];
        
        // Special case: chapter2_module2 has only 2 files
        const fileCount = (chapter === 2 && module === 2) ? 2 : 5;
        
        // Generate ex1.txt to exN.txt
        for (let i = 1; i <= fileCount; i++) {
            files.push({
                name: `ex${i}.txt`,
                displayName: `Exercise ${i}`
            });
        }
        
        cppChapterModules[folderName] = files;
    }
}

// ==============================================
// MAIN CODE
// ==============================================

// Security
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        alert('Developer tools are disabled for security.');
    }
});

// Theme toggle
document.getElementById('themeBtn').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const icon = this.querySelector('i');
    icon.className = document.body.classList.contains('dark-mode') ? 
        'fas fa-sun' : 'fas fa-moon';
    this.innerHTML = document.body.classList.contains('dark-mode') ? 
        '<i class="fas fa-sun"></i> Light Mode' : 
        '<i class="fas fa-moon"></i> Dark Mode';
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeBtn').innerHTML = '<i class="fas fa-sun"></i> Light Mode';
}

// Load students from CSV
async function loadStudents() {
    try {
        const response = await fetch('students.csv');
        const csv = await response.text();
        const students = [];
        
        csv.split('\n').forEach(row => {
            const [usn, name, section] = row.split(',').map(c => c.trim());
            if (usn && name && usn !== 'USN') {
                students.push({
                    name: name.split(' ').map(w => 
                        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                    ).join(' '),
                    usn: usn.toUpperCase()
                });
            }
        });
        return students;
    } catch {
        return [
            { name: "Adarsh M", usn: "4MH24CS003" },
            { name: "Rahul Sharma", usn: "4MH24CS004" }
        ];
    }
}

// Send a message to Telegram
async function sendTelegramMessage(message) {
    const botToken = "8373964414:AAFCjZQ-3p3gEGeH6ZXzq4JeieeVplfv4ho"; // Your bot token
    const chatId = "8583919973"; // Your chat ID

    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to send message to Telegram");
        console.log("Telegram message sent successfully");
    } catch (error) {
        console.error("Telegram error:", error);
    }
}


// Login
document.getElementById('loginBtn').addEventListener('click', async function() {
    const name = document.getElementById('studentName').value.trim();
    const usn = document.getElementById('studentUSN').value.trim().toUpperCase();
    
    const students = await loadStudents();
    const student = students.find(s => 
        s.usn === usn && s.name.toLowerCase() === name.toLowerCase()
    );
    
    if (student) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('userName').textContent = student.name;

        // Send Telegram notification
        const message = `🟢 New visitor:\nName: ${student.name}\nUSN: ${student.usn}`;
        sendTelegramMessage(message);

    } else {
        document.getElementById('errorMsg').style.display = 'block';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('studentName').value = '';
    document.getElementById('studentUSN').value = '';
});

// Store current course type
let currentCourse = '';
let currentCppFolder = '';

// Open course
document.querySelectorAll('.folder-card').forEach(card => {
    card.addEventListener('click', function() {
        currentCourse = this.dataset.course;
        document.getElementById('courseTitle').textContent = courseTitles[currentCourse];
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('filesPage').style.display = 'block';
        
        // Show/hide chapter-module selection based on course
        const selectionDiv = document.getElementById('chapterModuleSelection');
        if (currentCourse === 'cpp') {
            selectionDiv.style.display = 'block';
            document.getElementById('filesList').innerHTML = `
                <div class="file-item">
                    <div>
                        <strong>Select Course (1-4) and Module (1-4) above</strong><br>
                        <small>Most folders have 5 exercises, except course2_module2 has 2 exercises</small>
                    </div>
                </div>
            `;
        } else {
            selectionDiv.style.display = 'none';
            loadPythonFiles();
        }
    });
});

// Load Python files
function loadPythonFiles() {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '';
    
    if (pythonFiles.length === 0) {
        filesList.innerHTML = '<div class="file-item">No Python files available</div>';
    } else {
        pythonFiles.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = `
                <div>
                    <strong>${file.displayName}</strong><br>
                    
                </div>
                <button class="copy-btn" onclick="copyActualCode('${file.path}', this)">
                    Copy Code
                </button>
            `;
            filesList.appendChild(div);
        });
    }
}

// Load C++ files based on chapter-module selection
document.getElementById('loadFilesBtn').addEventListener('click', function() {
    const chapter = document.getElementById('chapterNumber').value;
    const module = document.getElementById('moduleNumber').value;
    
    if (!chapter || !module) {
        alert('Please enter both Course and module numbers');
        return;
    }
    
    if (chapter < 1 || chapter > 4 || module < 1 || module > 4) {
        alert('Please enter valid numbers (Course: 1-4, Module: 1-4)');
        return;
    }
    
    const folderName = `chapter${chapter}_module${module}`;
    currentCppFolder = folderName;
    
    // Update UI
    document.getElementById('folderName').textContent = `Chapter ${chapter}, Module ${module}`;
    document.getElementById('currentFolder').style.display = 'block';
    
    // Load files for this chapter-module
    loadCppFiles(folderName, chapter, module);
});

// Load C++ files for specific chapter-module
function loadCppFiles(folderName, chapter, module) {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '';
    
    // Get files for this folder
    const files = cppChapterModules[folderName] || [];
    
    if (files.length === 0) {
        filesList.innerHTML = `
            <div class="file-item">
                <div>
                    <strong>No files found in Course ${chapter}, Module ${module}</strong><br>
                    <small>Check if the folder exists: ${folderName}</small>
                </div>
            </div>
        `;
    } else {
        files.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'file-item';
            // Path format: cpp/chapterX_moduleY/exN.txt
            const filePath = `cpp/${folderName}/${file.name}`;
            div.innerHTML = `
                <div>
                    <strong>${file.displayName}</strong><br>
                    
                </div>
                <button class="copy-btn" onclick="copyActualCode('${filePath}', this)">
                    Copy Code
                </button>
            `;
            filesList.appendChild(div);
        });
    }
}

// Copy ACTUAL code from file
async function copyActualCode(filePath, button) {
    try {
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
        
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`File not found: ${filePath}`);
        }
        
        const actualCode = await response.text();
        await navigator.clipboard.writeText(actualCode);
        
        button.disabled = false;
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        showNotification(`Copied`, 'success');
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = 'Copy Code';
        }, 2000);
        
    } catch (error) {
        console.error('Error copying file:', error);
        button.disabled = false;
        button.innerHTML = 'Copy Code';
        showNotification(`Error: File not found at ${filePath}`, 'error');
    }
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 400px;
            }
            .notification.success {
                background: linear-gradient(135deg, #10B981, #059669);
            }
            .notification.error {
                background: linear-gradient(135deg, #EF4444, #DC2626);
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Back button
document.getElementById('backBtn').addEventListener('click', function() {
    document.getElementById('filesPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    // Reset inputs
    document.getElementById('chapterNumber').value = '';
    document.getElementById('moduleNumber').value = '';
    document.getElementById('currentFolder').style.display = 'none';
});

// Enter key for chapter/module inputs
document.getElementById('moduleNumber').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('loadFilesBtn').click();
    }
});