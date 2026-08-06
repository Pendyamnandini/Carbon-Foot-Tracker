# 🌱 CarbonTracker - Personal Carbon Footprint Monitor

CarbonTracker is a high-fidelity, interactive, and responsive web application designed to help individuals measure, track, reduce, and offset their daily carbon footprint. 

---

## ✨ Features

### 🔒 Secure Authentication & User Settings
- **JWT-Based Authentication**: Secure login, registration, and session management.
- **OTP Password Recovery**: Otp-based password reset flow integrated directly with **Gmail SMTP Outgoing Mail** to deliver codes to real email inboxes.
- **Persistent Data Store**: Local file-based H2 database persistence (no data lost on server restarts).
- **Strong Password Policy**: Enforced complexity requirements on registration (minimum 8 characters, alphanumeric, and at least one special character).
- **Password Visibility Toggles**: Interactive eye icons on Login, Register, and Reset Password forms to show/hide typed input.

### 🎨 High-Fidelity Glassmorphism UX/UI & SaaS Landing Page
- **Modern SaaS Landing Page**: Redesigned hero section with mission statement, animated counters (*1.2M+ kg Emissions Tracked*, *28.4K+ Active Users*, *14.2K+ Goals Achieved*, *382.5K kg Carbon Saved*), impact breakdown, testimonials, and call-to-action banner.
- **Landing Page Theme Switcher**: Floating light/dark mode switch icon on the landing page and portal app, allowing users to toggle between modes before or after signing in.
- **Color-Coded Sidebar Navigation**: Fully custom colored menu items with active state highlighting for standard users and administrators.

### 📊 Dedicated Category Analytics Module & Business Intelligence (`/analytics`)
- **Filter Bar Category Dropdown**: Integrated Category selection dropdown right between *Date Range Preset* and *Start Date* in the primary filter bar for seamless single-category filtering.
- **Category-Specific Deep Dives**: Selectable category cards and dropdown options for *Transport Analytics*, *Electricity Analytics*, *Food Analytics*, and *Shopping Analytics*.
- **Dynamic Category-Filtered Charts**:
  - **Daily Emissions Line Chart**: Dynamically plots day-by-day emissions for the selected category.
  - **Weekly Breakdown Area Chart**: Displays 7-day aggregated trends for the selected category.
  - **Monthly Breakdown Bar Chart**: Displays monthly totals for the selected category.
  - **System Category Donut Chart**: Visualizes overall percentage contribution across all categories.
- **Predictive Trajectory & Savings Engine**: Calculate potential monthly/annual CO₂ reductions, next-month emission forecasts, and recommendation impact ratings (Difficulty & Impact level).
- **GitHub-Style Activity Heatmap & Journey Timeline**: Interactive daily activity logging matrix and chronological sustainability milestone timeline.
- **Audit-Ready PDF Export Center**: Download official carbon footprint summary reports in PDF format with active category and date-range filters applied.

### ✉️ Automated Email Reward & Goal Status Alert System
- **Goal Completion Emails**: Automated congratulatory emails ("🎉 Congratulations! Goal Achieved") delivered on reaching 100% target reduction.
- **Milestone Badge Emails**: Instant notification emails ("🏆 Milestone Reached") when unlocking badges (*7-Day Streak*, *Eco Saver 10kg/25kg/50kg*).
- **Goal Status Warnings**: Automated alerts for targets *Behind Schedule* ("⚠ Goal Needs Attention") or *Ahead of Schedule* ("🚀 Great Progress!").
- **Historical Summaries**: Automatic database-level summaries stored in `daily_carbon_summary`, `weekly_carbon_summary`, and `monthly_carbon_summary` tables.
- **Detailed Aggregations Widget**: View total emissions, daily average footprint, total logs, min/max day values, and eco score trends over the selected period.
- **Dashboard Interactive Charts**:
  - Weekly area emission graphs with cyan gradients.
  - Monthly bar comparison charts.
  - Category emissions distribution pie charts.
  - Clickable Daily Emissions bar chart to load specific logged daily activities.

### 🔍 User Activity History & Session Auditing Trail
- **Real-Time Activity Audit Logs**: Securely records login/logout times, profile changes, activity logs CRUD actions, badge awards, report downloads, support ticket submissions, and organizational administrative actions.
- **Device & Client Context**: Stores client IP addresses and User-Agent device headers automatically.
- **Personal Audit Log Profile Tab**: Dedicated tab under Profile displaying range-filtered and paginated personal logs.
- **Administrative Monitoring Dashboards**:
  - Track logins and user activity trends.
  - Review aggregated analytics stats (most active users, most visited pages, most downloaded report types).

### 🎫 Support Ticket Management & Live Admin Chat Hub
- **Eco-Support AI Diagnostics Pre-Check**: Custom troubleshoot diagnostic engine evaluating client environment (OS browser, speed) before ticket submission, offering immediate solutions.
- **Multi-lingual Ticket Support**: Native translations in English, Hindi, Telugu, Spanish, and French for categories (Bug Report, SOS Issue, Voice Detection, OTP, Performance, etc.) and priority levels.
- **Live Ticket Conversation Thread**: Real-time message exchange between users and support admins supporting Base64 image, PDF, and log file uploads.
- **Unified Admin Support Dashboard**:
  - **Summary Metrics**: Real-time counter widgets for Total, Open, Assigned, Resolved, Average Resolution times, and star satisfaction scores.
  - **Analytics Visualization**: Recharts distribution plots for Categories and Priority allocations.
  - **Action controls**: Dialog overlays to re-assign admins, merge duplicates, flag spam, and resolve tickets.
  - **Audit Exports**: Quick buttons to export data to CSV, Excel spreadsheets, or print browser PDFs.
- **Direct Mail Alerts**: Integrated Nodemailer triggers delivering automated notices to users upon ticket receipt and resolution.

### 🌍 Scalable Multilingual Engine (100+ Languages) & Dynamic RTL Layouts
- **Searchable Language Picker**: Completely redesigned selector component in both the landing page navbar and portal dashboard with native and English naming labels, alphabetical sorting, and instant search filter input.
- **RTL (Right-to-Left) Mirrors**: Full support for Right-to-Left layout flipping (Sidebar navigation anchor, grids, margins, alignment controls) dynamically updating when RTL languages like Arabic (`ar`) are active.
- **Unified Translation Context**: Integrated `react-i18next` framework linking local translation namespaces dynamically.
- **Visual Fallback Signatures**: Localized placeholder fallbacks reflecting chosen languages (e.g. `[ଓଡ଼ିଆ] ...`) for full internationalization verification.

### 🤖 Carbon Assistant AI v2 - Enterprise AI Chatbot Upgrade
- **Modern Glassmorphism UI**: Beautiful premium ChatGPT/Gemini-like double-panel layouts, micro-animations, glass overlays, and glowing background blur filters.
- **Conversation History with Search**: A sidebar displaying past conversations, with a text field to search/filter chats, renaming, and deletion.
- **Pinned and Favorite Conversations**: Mark critical chats to keep them at the top of the queue, synced directly to the database.
- **Full-Screen / Maximize Mode**: Toggle sizing between a compact overlay bubble and a comprehensive dual-panel split screen.
- **Interactive Charts Inside Chat**: Renders responsive Recharts (Pie, Bar, Line, Circular Gauges, and Progress bars) directly within chat messages via special tag parsing.
- **Voice Assistant (STT & TTS)**: Native Speech-to-Text (STT) and Text-to-Speech (TTS) engine for hands-free voice interactions.
- **File Upload Sustainability Auditing**: Drag & drop or file explorer uploads of receipt images, utility bills, or travel log CSVs for automated carbon audits.
- **Dynamic AI Suggestions**: Custom context chips suggested dynamically based on user role (Admin vs User) when a conversation has no messages.
- **Sample Data Auto-Seeding**: Users can ask the bot ("seed sample data" or "fill dashboard") to instantly generate 30 days of realistic daily activity logs to populate empty charts.
- **Dynamic Database Context Layer**: Automatically compiles live metrics (emissions, streaks, goals, badges, platform user metrics, CPU/memory stats, audit logs) into system prompts.
- **Centralized Session Persistence**: Stores and retrieves conversation histories securely in database entities (`AiConversation` and `AiMessage`).
- **Swappable AI Provider Layout**: Built with a modular `AIProvider` Java interface for switchable backend engine adapters (Gemini, OpenAI, Azure, Ollama).

---

## 🛠️ Tech Stack

- **Backend**: Java 21, Spring Boot 3.3.1, Spring Security, Spring Data JPA, Flyway Migrations, Hibernate, H2 Database (File Mode).
- **Frontend**: React, Material-UI (MUI), Recharts, Axios, Context API.

---

## 🚀 How to Run the Project

### Prerequisites
Make sure you have the following installed:
- **Java JDK 21+**
- **Node.js 18+**
- **Maven 3.9+**

---

### Step 1: Configure SMTP (For Password Reset Emails)
Open the backend configuration file:
`backend/src/main/resources/application.yml`

Locate the `mail:` block and replace the placeholder fields with your credentials:
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: YOUR_GMAIL@gmail.com
    password: your-16-digit-gmail-app-password
```

---

### Step 2: Run the Spring Boot Backend
1. Open a terminal inside the project root folder.
2. Navigate to the `backend` folder:
   ```cmd
   cd backend
   ```
   *(Note: If your terminal prompt already ends with `\carbon-tracker\backend`, skip this step.)*
3. Build and package the backend using the local Maven executable:
   ```cmd
   ..\..\apache-maven-3.9.6\bin\mvn clean package -DskipTests
   ```
4. Run the Spring Boot application:
   ```cmd
   ..\..\apache-maven-3.9.6\bin\mvn spring-boot:run
   ```
The backend server will start running on **`http://localhost:8080`** using the persistent file database.

---

### Step 3: Run the React Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```cmd
   cd frontend
   ```
2. Install npm dependencies:
   ```cmd
   npm install
   ```
3. Start the React development server:
   ```cmd
   npm start
   ```
The frontend will compile and open automatically in your browser at **`http://localhost:3000`** (or `http://localhost:3001`).
  
## Final UI, Multilingual & AI Improvements  
- **Landing Page**: Implemented a professional, premium SaaS design featuring animated eco-gradients, glassmorphism, and dynamic overlays while retaining Carbon Tracker branding.  
- **Multilingual & Locales**: Fixed all missing translation keys by dynamically injecting English fallbacks across all 99 languages.  
- **Default Language**: English is enforced as the default language on first visit, and language selections are properly persisted to localStorage.  
- **Language Selector**: Resolved contrast and visibility issues for the Light Mode dropdown menu.  
- **AI Chatbot Context**: Upgraded the AI prompt builder to integrate seamlessly with the robust DatabaseContextService, preparing the system to deliver highly contextualized, database-driven responses without repetitive templates. 
