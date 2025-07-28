# AI‑Smart‑Ticket‑System

**AI‑powered ticket classification, prioritization & assignment made simple.**

AI- powered backend application that intelligently manages support tickets from automatic categorization to skill‑based assignment, moderator guidance and provides suggestions based on past similar resolved tickets.

---

## Features

- **AI-driven categorization**: Uses Google Gemini to identify ticket type, priority, required skills, and generate contextual notes.
- **Skill-based routing**: Matches tickets to moderators based on expertise; falls back to admin when needed.
- **Event-driven workflow**: Built with Inngest for seamless asynchronous processing and real-time email alerts.
- **AI-driven suggestions**: Uses OpenAI to provide suggestions for solutions to resolve tickets based on past similar resolved tickets.
- **Secure access control**: User roles include User, Moderator, and Admin via JWT authentication.
- **Email orchestration**: Sends structured notifications via Nodemailer (Mailtrap-powered).

---

## Architecture

<img width="1589" height="948" alt="architecture" src="https://github.com/user-attachments/assets/f8510b0d-ae77-43bc-882d-93672118d474" />

---
## Tech Stack

- **Backend**: Node.js + Express  
- **AI**: Google Gemini API & OpenAI API
- **Database**: MongoDB + Mongoose  
- **Queueing**: Inngest  
- **Auth**: JWT  
- **Email**: Nodemailer (Mailtrap dev)  
- **Dev Enhancements**: Nodemon hot reload  

---

## Installation

1. Clone the repo  
2. Install dependencies:
   ```bash
   npm install
3. Create a .env with:
    - MONGO_URI=...
    - JWT_SECRET=...
    - GEMINI_API_KEY=...
    - OPENAI_API_KEY=...
    - MAILTRAP_SMTP_HOST=...
    - MAILTRAP_SMTP_PORT=...
    - MAILTRAP_SMTP_USER=...
    - MAILTRAP_SMTP_PASS=...
    - APP_URL=http://localhost:3000
4. Run the app:
    npm run dev
    npm run inngest-dev

---

## Ticket Workflow
1. Ticket creation: Triggers Inngest on-ticket-created.
2. AI processes the ticket, assigns priority, category, skills, adds note.
3. Matching logic finds the best-suited moderator or defaults to admin.
4. Assignment update + email notification with AI note.
5. Moderator logs in and handles ticket confidently.
6. AI suggests solutions for the ticket based on past similar resolved tickets.

---

## Contribution
Purpose-built for demonstration and learning, expanded contributions welcome via forks or pull requests.
