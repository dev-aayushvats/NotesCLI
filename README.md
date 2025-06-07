
# @aayushmax/notescli

A very simple command-line note-taking app designed to work directly from your terminal. It stores all your notes locally on your PC.

## Features

- **Create Notes**: Quickly add new notes with a title and an optional description.  
- **List Notes**: View all your saved notes, sorted by creation date.  
- **Delete Notes**: Easily remove notes using their unique ID.  
- **Local Storage**: All your notes are stored securely on your local machine.  

## Installation

To install `notescli` globally on your system, open your terminal or command prompt and run:

```bash
npm install -g @aayushmax/notescli
```

> Make sure you have Node.js and npm installed on your system.

## Usage

Once installed, you can use the `anote` command from any directory.

### 1. Create a Note

To create a new note with a title and an optional description:

```bash
anote create "Your Note Title" --description "This is the detailed content of your note."
```

The description is optional. You can create a note with just a title:

```bash
anote create "Quick Idea"
```

### 2. List All Notes

To see all your saved notes:

```bash
anote list
```

This will display a list of your notes, including their unique IDs, titles, descriptions, and creation timestamps.

### 3. Delete a Note

To delete a specific note, you'll need its unique ID (which you can get from the `anote list` command):

```bash
anote delete <NOTE_ID>
```

## Data Storage

Your notes are stored in a hidden directory named `.my_notes` in your user's home directory - completely offline!

- **Windows**: `C:/Users/<YourUsername>/.my_notes/notes.json`  
- **Linux/macOS**: `/home/<yourusername>/.my_notes/notes.json`  

## Repository

The source code for this tool is available on GitHub:  
[Github Link](https://github.com/dev-aayushvats/NotesCLI)