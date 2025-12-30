# Five Forks - onUserCreated Firebase Function

This repository hosts a Firebase Cloud Function that responds whenever a new document is added to the `users` collection in Firestore. It is designed to centralize any onboarding or metadata initialization logic you want running at user creation time.

## Requirements

1. [Node.js](https://nodejs.org/) 18+ (matches the Firebase Functions runtime defined for this project).
2. [Firebase CLI (`firebase-tools`)](https://firebase.google.com/docs/cli) installed globally (e.g., `npm install -g firebase-tools`).
3. A Firebase project (this repo targets `five-forks-745b9`).

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Authenticate with Firebase:
   ```sh
   firebase login
   ```
3. (Optional) Inspect or edit `src/index.ts` to understand or extend the `onUserCreated` trigger logic.
4. Build the TypeScript sources if working locally:
   ```sh
   npm run build
   ```
   (The CLI also builds automatically during deployment.)

## Deploying the Function

Run the following command, substituting `<YOUR_FIREBASE_ACCOUNT_EMAIL>` with the email used for the Firebase CLI login:

```sh
firebase --account=<YOUR_FIREBASE_ACCOUNT_EMAIL> --project=five-forks-745b9 deploy --only functions:onUserCreated
```

This deploys just the `onUserCreated` Cloud Function without touching other Firebase resources.
