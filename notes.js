#!/usr/bin/env node
// Import Node.js built-in modules
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto'); // For generating unique IDs

// Define the directory and file names for notes
const NOTES_DIR_NAME = ".my_notes"; // Hidden directory for Unix-like systems
const NOTES_FILE_NAME = "notes.json";

/**
 * Returns the path to the notes directory. Creates it if it doesn't exist.
 * The directory will be created in the user's home directory.
 * @returns {string} The full path to the notes directory.
 */
function getNotesDir() {
    const homeDir = os.homedir();
    const notesDir = path.join(homeDir, NOTES_DIR_NAME);

    // Check if the directory exists, if not, create it
    if (!fs.existsSync(notesDir)) {
        try {
            fs.mkdirSync(notesDir);
            console.log(`Created notes directory: ${notesDir}`);
        } catch (error) {
            console.error(`Error creating notes directory: ${error.message}`);
            process.exit(1); // Exit if directory cannot be created
        }
    }
    return notesDir;
}

/**
 * Returns the full path to the notes JSON file.
 * @returns {string} The full path to the notes JSON file.
 */
function getNotesFilePath() {
    const notesDir = getNotesDir();
    return path.join(notesDir, NOTES_FILE_NAME);
}

/**
 * Loads notes from the JSON file. If the file doesn't exist or is empty,
 * it returns an empty array.
 * @returns {Array<Object>} An array of note objects.
 */
function loadNotes() {
    const notesFilePath = getNotesFilePath();
    
    // Check if the file exists and is not empty
    if (!fs.existsSync(notesFilePath) || fs.statSync(notesFilePath).size === 0) {
        return [];
    }

    try {
        const fileContent = fs.readFileSync(notesFilePath, 'utf8');
        const notes = JSON.parse(fileContent);

        // Ensure all notes have 'created_at' and 'id' fields for consistency
        return notes.map(note => {
            if (!note.created_at) {
                note.created_at = new Date().toISOString();
            }
            if (!note.id) {
                // Generate a short unique ID (first 8 chars of a UUID)
                note.id = crypto.randomUUID().slice(0, 8); 
            }
            return note;
        });
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.warn(`Warning: Notes file '${NOTES_FILE_NAME}' is corrupted. Starting with an empty list.`);
        } else {
            console.error(`An error occurred while loading notes: ${error.message}`);
        }
        return []; // Return empty array on error
    }
}

/**
 * Saves the given list of notes to the JSON file.
 * @param {Array<Object>} notes - The array of note objects to save.
 */
function saveNotes(notes) {
    const notesFilePath = getNotesFilePath();
    try {
        // Use indent for pretty printing the JSON
        fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 4), 'utf8');
    } catch (error) {
        console.error(`An error occurred while saving notes: ${error.message}`);
    }
}

/**
 * Creates a new note with a title and description, assigns a unique ID and timestamp,
 * and saves it to the notes file.
 * @param {string} title - The title of the note.
 * @param {string} description - The description/content of the note.
 */
function createNote(title, description) {
    const notes = loadNotes();
    const newNote = {
        id: crypto.randomUUID().slice(0, 8), // Generate a short unique ID
        title: title,
        description: description,
        created_at: new Date().toISOString() // ISO format for easy sorting and parsing
    };
    notes.push(newNote);
    saveNotes(notes);
    console.log(`Note '${title}' (ID: ${newNote.id}) created successfully.`);
}

/**
 * Lists all notes, ordered by creation date (most recent first).
 */
function listNotes() {
    const notes = loadNotes();
    if (notes.length === 0) {
        console.log("No notes found.");
        return;
    }

    // Sort notes by 'created_at' in descending order (most recent first)
    notes.sort((a, b) => {
        try {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB.getTime() - dateA.getTime(); // Sort descending
        } catch (e) {
            console.warn("Warning: Some notes might have invalid 'created_at' dates. Sorting might be inconsistent.");
            return 0; // Don't change order if dates are invalid
        }
    });

    console.log("\n--- Your Notes ---");
    notes.forEach(note => {
        const noteId = note.id || 'N/A';
        const title = note.title || 'No Title';
        const description = note.description || 'No Description';
        const createdAtStr = note.created_at || 'N/A';
        
        let formattedDate = createdAtStr;
        try {
            const createdDt = new Date(createdAtStr);
            formattedDate = createdDt.toLocaleString(); // Format for local timezone readability
        } catch (e) {
            // Fallback if date parsing fails
        }

        console.log(`ID: ${noteId}`);
        console.log(`Title: ${title}`);
        console.log(`Description: ${description}`);
        console.log(`Created: ${formattedDate}`);
        console.log("-".repeat(20));
    });
    console.log("------------------\n");
}

/**
 * Deletes a note by its unique ID.
 * @param {string} noteId - The ID of the note to delete.
 */
function deleteNote(noteId) {
    let notes = loadNotes();
    const initialNoteCount = notes.length;
    
    // Filter out the note with the matching ID
    notes = notes.filter(note => note.id !== noteId);

    if (notes.length < initialNoteCount) {
        saveNotes(notes);
        console.log(`Note with ID '${noteId}' deleted successfully.`);
    } else {
        console.log(`No note found with ID '${noteId}'.`);
    }
}

/**
 * Main function to parse command-line arguments and call appropriate functions.
 */
function main() {
    const args = process.argv.slice(2); 
    const command = args[0]; 

    switch (command) {
        case 'create':
            const title = args[1];
            const descIndex = args.indexOf('--desc');
            let description = '';
            if (descIndex !== -1 && args[descIndex + 1]) {
                description = args[descIndex + 1];
            }

            if (!title) {
                console.error("Error: 'create' command requires a title. Usage: notes create \"Your Title\" [--desc \"Your description\"]");
                process.exit(1);
            }
            createNote(title, description);
            break;
        case 'list':
            listNotes();
            break;
        case 'delete':
            const idToDelete = args[1];
            if (!idToDelete) {
                console.error("Error: 'delete' command requires a note ID. Usage: notes delete <note_id>");
                process.exit(1);
            }
            deleteNote(idToDelete);
            break;
        default:
            console.log("Welcome to the Node.js Note-Taking Tool!");
            console.log("\nAvailable commands:");
            console.log("  create \"Your Title\" [--desc \"Your description\"] - Create a new note.");
            console.log("  list                                                     - List all notes.");
            console.log("  delete <note_id>                                       - Delete a note by its ID.");
            break;
    }
}

main();
