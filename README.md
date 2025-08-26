# Job Application Tracker (PostgreSQL Version)

This is a web application to track the status of job applications, featuring a Node.js backend and a PostgreSQL database.

## Architecture

This application uses a client-server architecture:
-   **Backend**: A Node.js server using the Express framework connects to a PostgreSQL database to retrieve and update application data. It exposes a simple REST API.
-   **Frontend**: A static single-page application (HTML, CSS, vanilla JavaScript) that calls the backend API to display and manage data.

## Features

-   Lists job applications in a table from a PostgreSQL database.
-   Dynamically generates a cover letter page from database data.
-   Allows for updating the status of an application.
-   Falls back to local `data.json` if the server is unavailable.
-   Print-friendly cover letter page.

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (which includes npm)
-   [PostgreSQL](https://www.postgresql.org/download/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    -   Follow the instructions in `SETUP.md` to create a PostgreSQL database and user.
    -   Run the `database.sql` script to create the necessary table and populate it with sample data.

4.  **Configure environment variables:**
    -   Create a `.env` file in the project root by copying `.env.example`.
    -   Fill in your PostgreSQL connection details in the `.env` file.

5.  **Start the server:**
    ```bash
    npm start
    ```

6.  **Open the application:**
    -   Navigate to `http://localhost:3000` in your web browser.