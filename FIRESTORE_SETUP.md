# Firestore Setup & Integration Guide

This guide will walk you through setting up Firebase and Firestore for your Express.js backend, including configuration and connection steps.

---

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the prompts to create a new project.

---

## 2. Enable Firestore

1. In your Firebase project, go to the **Firestore Database** panel.
2. Click **Create database**.
3. Start in production or test mode (for development, test mode is easier).
4. Choose your Cloud Firestore location.

---

## 3. Create a Service Account Key

1. Go to **Project Settings** > **Service accounts** (in Firebase Console).
2. Click **Generate new private key** under the Firebase Admin SDK.
3. Save the downloaded JSON file (e.g., `serviceAccountKey.json`) in your project root (do not commit to version control!).

---

## 4. Add Service Account Key Path to `.env`

Add the following line to your `.env` file:

```env
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

---

## 5. Install Firebase Admin SDK

Run:

```bash
npm install firebase-admin
```

---

## 6. Firestore Data Structure

Your Express API expects a Firestore collection called `jobs` with documents storing job application data.

**Recommended Schema Example:**

```json
{
  "company": "Acme Inc.",
  "position": "Software Engineer",
  "status": "applied",
  "date": "2025-08-31T12:00:00Z",
  // ...other fields as needed
}
```

**Document IDs** will be used as the job `id` in API endpoints.

---

## 7. Connecting the App

The backend will auto-connect using the service account and credentials in `.env` and the code in `server.js`:

```javascript
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let firebaseConfig = {};
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  firebaseConfig.credential = cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS));
} else {
  firebaseConfig.credential = applicationDefault();
}
initializeApp(firebaseConfig);
const db = getFirestore();
```

---

## 8. Migrating Existing Data

To migrate existing SQL data, export it as JSON and import each record as a document in the `jobs` collection from the Firestore Console or using scripts.

---

## 9. Security Rules

Set up Firestore rules to restrict access as needed. For development, you may use:

```js
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobs/{jobId} {
      allow read, write: if true; // NOT for production!
    }
  }
}
```

For production, [read more about security rules](https://firebase.google.com/docs/firestore/security/get-started).

---

## 10. Running Your App

Start your server as usual:

```bash
npm start
```

---

## Troubleshooting

- Ensure `serviceAccountKey.json` exists and is correctly referenced in `.env`.
- Ensure Firestore is enabled and the project ID matches.
- Check for correct permissions on the service account.

---

## References

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
