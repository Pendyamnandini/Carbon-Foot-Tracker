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

### 📊 Dedicated Category Analytics Module & Business Intelligence
- **Category-Specific Deep Dives**: Dedicated tabs for *Transport*, *Electricity*, *Food*, and *Shopping* analytics.
- **Dynamic Date Filtering**: Instant preset filtering (*Today*, *Yesterday*, *Last 7 Days*, *Last 30 Days*, *This Month*, *Last Month*, *This Year*) and custom date pickers.
- **Predictive Trajectory & Savings Engine**: Calculate potential monthly/annual CO₂ reductions, next-month emission forecasts, and recommendation impact ratings (Difficulty & Impact level).
- **GitHub-Style Activity Heatmap & Journey Timeline**: Interactive daily activity logging matrix and chronological sustainability milestone timeline.
- **Audit-Ready Export Center**: Download raw data and compliance reports in CSV and PDF formats.

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
