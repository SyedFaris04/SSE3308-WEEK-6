
# Personal Task Manager

A React JS web application integrated with Firebase Authentication and Cloud Firestore.

## Technologies Used
- React JS
- Vite
- Firebase Authentication
- Cloud Firestore
- JavaScript
- CSS

## Features
1. User Registration
2. User Login and Logout
3. Create Tasks
4. Read and Display Tasks
5. Update Tasks
6. Delete Tasks
7. Mark Tasks as Completed
8. Real-time Firestore Updates
9. User-specific Data Storage
10. Firestore Security Rules

## Installation

Clone the repository:

git clone YOUR_REPOSITORY_URL

Install dependencies:

npm install

Install Firebase:

npm install firebase

Configure your .env file using .env.example.

Run the application:

npm run dev

## Database Structure

users/
  USER_UID/
    tasks/
      TASK_ID/

## Security

Firestore Security Rules ensure users can only access their own tasks.

## Developer

Your Name

