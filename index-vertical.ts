const { spawn } = require('child_process');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

// Create a screen object
const screen = blessed.screen({
    smartCSR: true,
    title: 'Terminal Split Example'
});

// Create a grid layout
const grid = new contrib.grid({ rows: 1, cols: 2, screen: screen });

// Create two terminal boxes
const box1 = grid.set(0, 0, 1, 1, blessed.box, {
    scrollable: true,
    alwaysScroll: true,
    scrollbar: { ch: ' ' },
    label: 'Process 1', content: ''
});
const box2 = grid.set(0, 1, 1, 1, blessed.box, {
    scrollable: true,
    alwaysScroll: true,
    scrollbar: { ch: ' ' },
    label: 'Process 2', content: ''
});

// Function to spawn a child process and log output to a given box
function runProcess(command, args, box, callback) {
    const proc = spawn(command, args, { shell: true });

    proc.stdout.on('data', (data) => {
        box.setContent(box.getContent() + data.toString());
        box.scrollTo(100);  // 
        screen.render();
    });

    proc.stderr.on('data', (data) => {
        box.setContent(box.getContent() + data.toString());
        box.scrollTo(100);  // 
        screen.render();
    });

    proc.on('close', (code) => {
        box.setContent(box.getContent() + `\nProcess exited with code ${code}`);
        screen.render();
        callback();
    });
}

// Counter to keep track of finished processes
let finishedProcesses = 0;

function processFinished() {
    finishedProcesses += 1;
    if (finishedProcesses === 2) {
        // After both processes end, show the completion message
        grid.set(0, 0, 2, 1, blessed.box, { label: 'All Processes Completed', content: 'All processes have completed.' });
        screen.render();
    }
}

// Run two processes in parallel
// Use 'dir' for Windows or 'ls' for Unix-based systems, and 'echo' for a simple output.
runProcess('firedev', ['showloopmessages'], box1, processFinished);
runProcess('firedev', ['showloopmessages'], box2, processFinished);

// Exit the program on 'q' key press
screen.key(['q', 'C-c'], () => process.exit(0));

// Render the screen
screen.render();
