import { spawn } from 'child_process';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { input } from '@inquirer/prompts';

async function run() {
    // Create a screen object
    const screen = blessed.screen({
        smartCSR: true,
        title: 'Terminal Split Example'
    });

    // Create a grid layout with 1 row and 2 columns
    const grid = new contrib.grid({ rows: 1, cols: 2, screen: screen });

    // Create two terminal boxes with scrolling enabled, arranged vertically
    const box1 = grid.set(0, 0, 1, 1, blessed.box, {
        label: 'Input Terminal',
        content: '',
        scrollable: true,
        alwaysScroll: true,
        scrollbar: { ch: ' ' }
    });
    const box2 = grid.set(0, 1, 1, 1, blessed.box, {
        label: 'Process Output',
        content: '',
        scrollable: true,
        alwaysScroll: true,
        scrollbar: { ch: ' ' }
    });

    // Function to spawn a child process and log output to a given box
    function runProcess(command: string, args: string[], box: blessed.Widgets.BoxElement, callback: () => void) {
        const proc = spawn(command, args, { shell: true });

        proc.stdout.on('data', (data) => {
            box.setContent(box.getContent() + data.toString());
            box.scrollTo(100);  // Scroll to a large number to ensure it reaches the bottom
            screen.render();
        });

        proc.stderr.on('data', (data) => {
            box.setContent(box.getContent() + data.toString());
            box.scrollTo(100);  // Scroll to a large number to ensure it reaches the bottom
            screen.render();
        });

        proc.on('close', (code) => {
            box.setContent(box.getContent() + `\nProcess exited with code ${code}`);
            box.scrollTo(100);  // Scroll to a large number to ensure it reaches the bottom
            screen.render();
            callback();
        });
    }

    screen.key(['q', 'C-c'], () => process.exit(0));
    screen.render();
    // Show an input prompt in the first terminal box
    while (true) {


        const userInput = await input({
            message: 'Enter a command to run:',
            transformer: (input) => `You entered: ${input}`
        });

        // Display the user's input in the first box
        box1.setContent(`You entered: ${userInput}`);
        screen.render();

        // Run the user's command in the second terminal box
        runProcess(userInput, [], box2, () => {
            // After the process ends, show a completion message
            // grid.set(0, 0, 1, 2, blessed.box, { label: 'All Processes Completed', content: 'All processes have completed.' });
            // screen.render();
        });
        screen.render();
    }
    // Exit the program on 'q' key press
    

    // Render the screen

    process.stdin.resume();
}

run();
