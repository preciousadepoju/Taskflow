# 🌊 TaskFlow

**TaskFlow** is a modern, responsive, and intuitive full-stack task management application designed to help users stay organized and boost productivity. Built with a sleek UI and robust backend, it features intelligent mobile-first design, secure authentication, and automated email reminders for upcoming tasks.

## ✨ Key Features

- **Responsive & Modern UI**: Built with a mobile-first approach using TailwindCSS 4, Framer Motion for smooth animations, and a dynamic dashboard layout that adapts perfectly across all devices (collapsible sidebar, bottom navigation drawer).
- **Secure Authentication**: End-to-end user authentication with JWT (JSON Web Tokens) and bcrypt password hashing.
- **Task Management**: Create, read, update, and delete tasks. Organize priorities, set due dates, and track statuses from 'pending' to 'completed'.
- **Automated Email Reminders**: Built-in cron jobs automatically send email reminders 24 hours before a task is due, ensuring you never miss a deadline.
- **RESTful API**: A powerful Express-based backend serving a structured JSON API with robust MongoDB data persistence.

## 🛠️ Tech Stack

### Frontend
- **React 19** & **Vite**: Blazing fast modern UI library and build tool.
- **TailwindCSS 4**: Utility-first CSS framework for rapid UI styling.
- **React Router DOM 7**: Seamless client-side routing.
- **Framer Motion**: Production-ready animation library.
- **Lucide React**: Clean, modern iconography.

### Backend
- **Node.js** & **Express 4.21**: Fast, unobtrusive web framework for Node.js.
- **MongoDB** & **Mongoose 9**: NoSQL database for flexible and fast data handling.
- **node-cron**: Task scheduling in Node.js for automated background jobs.
- **Nodemailer**: Module for sending emails (easily configurable with Gmail).
- **JWT & bcryptjs**: Core security and authentication stack.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your local machine. You will also need access to a MongoDB instance (e.g., MongoDB Atlas or a local MongoDB server).

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/taskflow.git
   cd taskflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and configure the following required development variables:
   ```env
   # Server Connection
   PORT=5000
   
   # Database connection string
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication Key
   JWT_SECRET=your_super_secret_jwt_key
   
   # Email Settings (Required for background reminders)
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_email_app_password
   ```

### Running the Application Locally

TaskFlow comes with convenient npm scripts that boot up the primary application. 

Start the fully coupled frontend and backend concurrently via Vite:
```bash
npm run dev
```

Alternatively, if you only want to spin up the backend API side in watch mode:
```bash
npm run server:dev
```

Open [http://localhost:3000](http://localhost:3000) to interact with the application in your browser.

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! 

## 📝 License

This project is licensed under the MIT license.
