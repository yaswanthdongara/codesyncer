# Code Syncer Mobile App

This is the mobile version of Code Syncer, built with Flutter.

## Features

- **GitHub Integration**: Configure your GitHub credentials to browse repositories and save code directly to GitHub.
- **AI Code Generation**: Use AI to generate code snippets based on descriptions.
- **AI Chat**: Chat with an AI assistant for coding help.
- **File Management**: View and manage files in your GitHub repository.

## Setup

1.  **Prerequisites**: Ensure you have Flutter installed and set up on your machine.
2.  **Dependencies**: Run `flutter pub get` to install the required packages.
3.  **Configuration**:
    *   Open the app and go to **Settings**.
    *   Enter your **GitHub Username**, **Repository Name**, and **Personal Access Token**.
    *   Enter your **OpenRouter API Key** for AI features.
    *   (Optional) Set a **Folder Password** for extra security.

## Running the App

To run the app on a connected device or emulator:

```bash
flutter run
```

## Project Structure

- `lib/main.dart`: Entry point of the application.
- `lib/screens/`: Contains the UI screens (Home, Repository, Settings, AI Chat).
- `lib/services/`: Contains the logic for GitHub, AI, and Storage services.

