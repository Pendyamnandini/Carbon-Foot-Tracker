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

### 🎨 High-Fidelity Glassmorphism UX/UI
- **Aesthetic Theme System**: Curved translucent glass containers, backdrop blur filters, and dynamic radial-mesh background gradients that morph when toggling between **Light Mode** and **Dark Mode**.
- **Ambient Glowing Orbs**: Soft floating Emerald and Cyan background depth orbs.
- **Color-Coded Sidebar Navigation**: Fully custom colored items that dynamically adjust their selection bar and highlight backdrops to match their brand icons on click.

### 📊 Advanced Date-Range Analytics & Long-Term Data Retention
- **Date Range Filters**: Select ranges such as *Today*, *Yesterday*, *Last 7 Days*, *Last 30 Days*, *This Month*, *Previous Month*, or specify *Custom Start/End Dates*.
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
