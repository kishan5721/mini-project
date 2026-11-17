# 🎓 Student Task & Study Planner

> **A modern, responsive, client-side web application designed for college students to organize daily study schedules, manage deadlines, track academic progress, and boost productivity.**  
> *Developed as a B.Tech Academic Mini Project in Frontend Web Development.*

---

## 📌 1. Project Overview

The **Student Task & Study Planner** is a complete, lightweight, and modern single-page productivity dashboard tailored specifically to the needs of undergraduate college students. It provides a centralized hub to track semester assignments, lab deliverables, seminar preparation, and examination study plans.

With zero third-party framework dependencies, the project is constructed entirely using standard **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6+)**, utilizing the native browser **LocalStorage Web API** to persist data across sessions.

---

## 🎯 2. Project Objectives

- **Centralized Academic Organization:** Eliminate scattered reminders and missed assignment submission deadlines.
- **Smart Prioritization:** Classify assignments by urgency (*High, Medium, Low*) and dynamically highlight upcoming deadlines within 72 hours.
- **Progress Visualization:** Give students instant feedback on completion percentages, motivating consistent daily effort.
- **Offline & Zero Backend Cost:** Provide a completely offline-ready web application that requires no database server, Node.js runtime, or paid third-party APIs.
- **Responsive & Accessible Experience:** Deliver a seamless interface across mobile phones, tablets, laptops, and wide desktop displays.

---

## 💻 3. Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure (`<header>`, `<aside>`, `<main>`, `<section>`, `<dialog>`, etc.), form validation, and accessible UI controls. |
| **CSS3** | Modern CSS custom properties (variables), Flexbox, CSS Grid layouts, card elevation, dark mode transitions, and responsive media queries. |
| **Vanilla JavaScript (ES6+)** | Dynamic DOM manipulation, state management, event delegation, date arithmetic, and filter/search pipelines. |
| **Web Storage API (LocalStorage)** | Client-side persistence for task data and dark/light mode user preferences. |
| **SVG Icons** | Clean, scalable, lightweight vector iconography for ultra-fast loading without heavy external icon libraries. |

---

## 🚀 4. Key Features & Functionalities

### 📊 1. Analytical Dashboard
- **Live Summary Metrics:** Total tasks, pending tasks, completed tasks, and real-time completion percentage.
- **Animated Progress Trackers:** Dynamic horizontal progress bar and SVG circular progress ring indicating current accomplishment level.
- **Contextual Greeting & Clock:** Greets the student based on time of day (*Good morning, afternoon, evening, or night owl*) and shows today's formatted date.
- **Daily Study Tip:** Rotating productivity insights (e.g., Pomodoro technique, Feynman technique, spaced repetition).
- **Upcoming Deadlines Radar:** Immediately alerts students to tasks overdue or due within 72 hours.
- **Recent Tasks Feed:** Quick view of the latest 4 additions with one-click completion toggles.

### 📝 2. Comprehensive Task Management (CRUD)
- **Schedule New Task:** Form with inputs for title, subject/course, priority level, deadline date, estimated duration (hours), and notes.
- **Form Validation:** Real-time visual feedback with red highlight borders and helper messages preventing blank or invalid entries.
- **Mark Complete / Undo:** Checkbox status toggle with smooth strike-through animations and celebration notifications.
- **Edit Modal:** In-place editing modal with pre-populated values and input checks.
- **Safe Delete Modal:** Custom confirmation dialog preventing accidental deletion of important study plans.

### 🔍 3. Real-Time Search, Filter & Sort
- **Live Search:** Instant filtering by task name, subject keyword, or description text.
- **Subject Filter:** Categorize by courses (*Data Structures, Operating Systems, Mathematics, Database Systems, Web Development, etc.*).
- **Priority Filter:** Filter strictly by *High*, *Medium*, or *Low* priority.
- **Status Tabs:** Switch smoothly between *All*, *Pending*, and *Completed* views.
- **Sorting Options:** Sort by earliest deadline, latest deadline, priority weight, newest creation date, or alphabetical title.
- **Active Filter Pills:** Displays current filter criteria with a one-click "Reset All" button.

### 🏆 4. Dedicated Completed Tasks Wall
- Archive of finished assignments with completed timestamps.
- Ability to clear all completed tasks in one click or restore any assignment back to pending.

### 🌓 5. Dark Mode & Accessibility
- Complete dark theme palette designed for late-night study sessions.
- Theme preference is remembered across browser restarts via `localStorage`.

### 📱 6. Mobile Responsiveness
- Collapsible sidebar drawer with smooth slide-in animation and backdrop blur overlay for smartphones and tablets.

---

## 📂 5. Project Directory Structure

```text
Student-Study-Planner/
│
├── index.html          # Semantic HTML5 layout, sidebar, sections & modals
├── style.css           # Blue & white modern styling, dark theme, responsive grid
├── script.js           # Vanilla JS controller, LocalStorage engine, DOM renderer
└── README.md           # Project report, technical specifications & viva notes
```

---

## ⚡ 6. Installation & Execution Instructions

Because this project is built with vanilla web technologies, **no installation, build process, or server configuration is required**.

### Method 1: Direct Browser Launch (Easiest)
1. Navigate to the project folder `Student-Study-Planner/`.
2. Double-click `index.html` to open it in any modern web browser (*Google Chrome, Mozilla Firefox, Microsoft Edge, Safari*).

### Method 2: Live Server in VS Code
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and select **"Open with Live Server"**.
4. The application will launch automatically at `http://127.0.0.1:5500/`.

### Method 3: Python Simple HTTP Server
If you prefer running a local server via terminal:
```bash
# Navigate to the project folder
cd Student-Study-Planner

# Start a local HTTP server
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

---

## 🧠 7. How the Application Works (Architecture & Data Flow)

```
[ User Input / Actions ]
         │
         ▼
[ Event Listeners (script.js) ] ──▶ [ Form Validation ]
         │
         ▼
[ In-Memory State (tasks Array) ]
         │
    ┌────┴──────────────────────────┐
    ▼                               ▼
[ LocalStorage API ]       [ DOM Rendering Engine ]
(JSON.stringify / parse)   - Update Statistics & Cards
                           - Update Progress Bar & Ring
                           - Render Filtered Task Grid
                           - Show Toast Notification
```

1. **State Initialization:** When `index.html` loads, `script.js` checks `localStorage.getItem('studyPlanner_tasks_v1')`. If empty, it automatically seeds 4 realistic B.Tech study assignments so evaluators see a vibrant dashboard immediately.
2. **State Mutation:** When a task is added, edited, completed, or deleted, the in-memory `tasks` array is mutated.
3. **Data Serialization:** `saveTasksToStorage()` executes `localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))`.
4. **Re-rendering:** `updateUI()` recalculates completion rates, updates circular progress SVG offsets, and refreshes all active grids.

---

## 🎓 8. College Project Evaluation (Viva Q&A)

### Q1: What makes LocalStorage suitable for this mini project?
> **Answer:** LocalStorage provides up to 5-10 MB of persistent key-value client-side storage without requiring a database backend or authentication server. It ensures that students retain their study plans even after shutting down their computer or refreshing the page.

### Q2: How does the application calculate task deadlines and urgency?
> **Answer:** Dates are stored in `YYYY-MM-DD` ISO format. When rendering cards, the script parses the deadline, normalizes today's date to midnight, computes the difference in milliseconds, and converts it to days (`Math.round(diffMs / 86400000)`). Tasks with negative values are flagged as "Overdue", 0 as "Due Today", and 1 to 3 as "Upcoming".

### Q3: How is single-page navigation handled?
> **Answer:** Sections are partitioned into `<section class="page-section">` blocks. Clicking sidebar items matches the element's `data-section` attribute, toggling the `.active` class while hiding inactive views via CSS. This creates a fast, zero-refresh user experience.

---

## 📄 9. License & Academic Attribution
- **Author:** B.Tech Computer Science & Engineering Student
- **Academic Year:** 2026
- **License:** Open Source for Academic & Demonstration Purposes

