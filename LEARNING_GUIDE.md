## 🎓 Learning Guide for QR-Based Proxy-Free Attendance System (FYP 2026)

**Developer:** Abdul Hakeem Shah  
**Project Year:** 2026  
**Goal:** Be able to explain and build this project confidently for your FYP.

---

## 1. What You Need to Learn (High-Level Roadmap)

- **Web Basics:** HTML, CSS, JavaScript (enough to understand and edit the client).
- **Node.js + Express:** Build REST APIs and understand routing, middleware, and JSON.
- **REST & JSON:** How HTTP requests/responses work in APIs.
- **Project Structure:** How this specific project is organized (layers, folders, files).
- **Tools:** Git, VS Code, Postman, and npm.

You do **not** need to become an expert in everything. You just need **solid basics** + good understanding of **this project’s flow**.

---

## 2. Step-by-Step Learning Plan

### Step 1: Set Up Your Environment

- Install **Node.js LTS (18+)** from `https://nodejs.org`.
- Install **VS Code** from `https://code.visualstudio.com`.
- Install **Git** from `https://git-scm.com` (optional but recommended).
- Verify in terminal/PowerShell:
  - `node --version`
  - `npm --version`

Then open your project folder `attendRevolution` in VS Code.

---

### Step 2: Understand Basic Web (HTML, CSS, JS)

Focus topics for this project:
- **HTML:** forms, inputs, buttons, basic layout.
- **CSS:** simple styling, flexbox, making things centered and readable.
- **JavaScript (browser):** `document.querySelector`, event listeners, `fetch` for API calls.

Practice inside the `client/teacher` and `client/student` folders:
- Open `index.html` / `scan.html` (once they exist).
- Try adding a button and a simple `alert('Hello Abdul')` on click.

Recommended **one-shot YouTube tutorials** (search these titles on YouTube):
- **“HTML & CSS Crash Course - Traversy Media”**
- **“JavaScript Crash Course For Beginners - Traversy Media”**
- **“JavaScript DOM Manipulation Crash Course - Traversy Media”**

Watch them at 1.25x speed, but pause and **code along**.

---

### Step 3: Learn Node.js + Express (Core for Backend)

Concepts you must understand:
- What is **Node.js** and what is **Express**.
- What is a **route** (`app.get`, `app.post`).
- What is **middleware** (`app.use`, `express.json()`).
- How to send JSON responses (`res.json({ ... })`).

Practice mini-API before touching the full project:

```bash
mkdir node-practice
cd node-practice
npm init -y
npm install express
```

Create `server.js`:

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello Abdul, this is your first API!' });
});

app.listen(3001, () => {
  console.log('Practice server running on http://localhost:3001');
});
```

Run: `node server.js` and open `http://localhost:3001/hello` in the browser.

Recommended **one-shot YouTube tutorials** to learn quickly:
- **“Node.js Crash Course - Traversy Media”**
- **“Express JS Crash Course - Traversy Media”**
- **“Build a REST API with Node and Express - Programming with Mosh”**

Watch and **try to rebuild at least one small API yourself**.

---

### Step 4: Learn REST APIs & Postman

You need to be comfortable with:
- **HTTP methods:** GET, POST.
- **Request body vs query params vs URL params.**
- Using **Postman** (or Thunder Client in VS Code) to test APIs.

Practice with your small `node-practice` API:
- Add a `POST /student` route that accepts JSON `{ "name": "Abdul" }` and returns it.
- Test with Postman and see the response.

Key idea for your FYP:
- Teacher UI and Student UI are **just clients**.
- The **real logic** is in the **REST API (server)**.

Search on YouTube:
- **“Postman Beginner Tutorial - Automation Step by Step”**
- **“REST API concepts and examples - Web Dev Simplified”**

---

### Step 5: Understand THIS Project’s Structure

Use `README.md` + other docs as your **map**.

- `PROJECT_DOCUMENTATION.md` → explains **why** and **what**.
- `ARCHITECTURE.md` → explains **how the system is structured**.
- `API_DOCUMENTATION.md` → explains **all endpoints**.
- `DATABASE_SCHEMA.md` → explains **data models**.
- `SETUP_GUIDE.md` → explains **how to run** everything.
- `PROJECT_PLAN.md` → good for FYP viva and report.
- `FLOWCHARTS.md` → perfect for **slides and explanation**.

Suggested reading order for you:
1. `PROJECT_DOCUMENTATION.md` → read fully once.
2. `FLOWCHARTS.md` → understand the end-to-end flows.
3. `ARCHITECTURE.md` → focus on the layered architecture and diagrams.
4. `API_DOCUMENTATION.md` → memorize the 4 main APIs:
   - `POST /api/session/start`
   - `POST /api/attendance/mark`
   - `POST /api/session/end`
   - `GET /api/session/:id/report`

Take small notes for viva like:
- “I used a **layered architecture**: presentation, controller, service, data.”
- “All business logic is in the **service layer**, controllers only handle HTTP.”

---

### Step 6: First Time Running This Project

Follow **`SETUP_GUIDE.md`**, but in short:

1. Open terminal in `attendRevolution`.
2. Run:
   ```bash
   npm install
   mkdir -p server/data reports/csv reports/pdf
   echo "[]" > server/data/sessions.json
   echo "[]" > server/data/attendance.json
   npm start
   ```
3. Open:
   - Teacher: `http://localhost:3000/teacher`
   - Student: `http://localhost:3000/student`
4. Test APIs with Postman using `API_DOCUMENTATION.md`.

If something breaks:
- Check **`SETUP_GUIDE.md` → Troubleshooting**.
- Read the **error message** carefully.

---

## 3. Learning Tasks Directly Related to FYP

Do these small tasks in this project so you truly understand it:

1. **Add a new field to session** (e.g. `teacherName`):
   - Update `session.model.js`.
   - Update `session.service.js` to accept and save it.
   - Update API docs and test with Postman.

2. **Change session duration limits** (e.g. 2–15 minutes):
   - Update validation logic in `validation.service.js`.
   - Update `SETUP_GUIDE.md` or `.env` defaults.

3. **Add a simple health-check endpoint**:
   - `GET /api/health` returning `{ status: 'ok', time: ... }`.
   - Test in browser and Postman.

4. **Add a small UI change**:
   - In teacher UI, show a message like: “Developed by Abdul Hakeem Shah” in the footer.

Every small change you make will increase your confidence for viva and demo.

---

## 4. YouTube “One-Shot” Tutorials (Handpicked for You)

Search these exact titles on YouTube (or similar):

- **HTML / CSS / JS (Frontend)**
  - “HTML & CSS Crash Course - Build a Website - Traversy Media”
  - “JavaScript Crash Course For Beginners - Traversy Media”
  - “JavaScript DOM Manipulation Crash Course - Traversy Media”

- **Node.js + Express (Backend)**
  - “Node.js Crash Course - Traversy Media”
  - “Express JS Crash Course - Traversy Media”
  - “Build a RESTful API Using Node and Express - Programming with Mosh”

- **REST APIs & Postman**
  - “What is a REST API? - Web Dev Simplified”
  - “Postman Beginner’s Course - FreeCodeCamp”

- **Git & GitHub**
  - “Git and GitHub Crash Course for Beginners - Traversy Media”

You don’t have to watch everything at once. Use this strategy:

1. Watch **1 video per topic**.
2. **Pause → code along → run it yourself**.
3. Then jump back into **your project** and map the concepts.

---

## 5. How to Explain This Project in Your Viva

When teachers ask “Explain your project”, you can structure your answer like this:

1. **Problem:**  
   “Manual attendance is slow, error-prone, and allows proxy attendance in large classrooms.”

2. **Solution:**  
   “We built a QR-based, time-limited attendance system where a teacher starts a session, a QR is generated, students scan it, enter roll number, and the server validates and stores attendance.”

3. **Architecture:**  
   “We used a **monolithic Node.js + Express app** with a **strict layered architecture** (presentation, controller, service, data). Validation and business logic are in the **service layer**, controllers are thin.”

4. **Key Features:**  
   “Time-limited sessions, duplicate prevention, server-side validation, live count, CSV/PDF reports.”

5. **Tech Stack:**  
   “Frontend: HTML/CSS/JS. Backend: Node.js + Express. Storage: JSON (MVP, future MongoDB).”

6. **Security / Proxy Prevention:**  
   “We use short QR validity, session expiry, duplicate roll checks, and teacher visibility to reduce proxies.”

7. **Future Work:**  
   “Student login, advanced anti-proxy, analytics dashboard, and ERP integration.”

Practice this explanation **out loud** 3–5 times.

---

## 6. Suggested Study Order for Abdul (Very Practical)

1. Watch **HTML/CSS + JavaScript crash courses** and do 1–2 small pages.
2. Watch **Node.js + Express crash course** and build a tiny API.
3. Read `PROJECT_DOCUMENTATION.md` and `FLOWCHARTS.md` fully.
4. Run the project using `SETUP_GUIDE.md`.
5. Learn endpoints from `API_DOCUMENTATION.md` and test them with Postman.
6. Make **at least 2–3 small changes** to the code (fields, validations, UI text).
7. Prepare **slides** using diagrams from `ARCHITECTURE.md` and `FLOWCHARTS.md`.
8. Practice viva explanation using the structure in section 5.

If you follow this, you’ll not only **submit** the FYP, you’ll also **understand** it well enough to answer questions confidently.

---

**Last Updated:** 2026  
**Prepared For:** Abdul Hakeem Shah (FYP 2026)


