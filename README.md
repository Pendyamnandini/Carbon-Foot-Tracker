# 🌱 CarbonTracker - Personal Carbon Footprint Monitor

CarbonTracker is a high-fidelity, interactive, and responsive web application designed to help individuals measure, track, reduce, and offset their daily carbon footprint. 

---

## ✨ Features

### 🔒 Secure Authentication & User Settings
- **JWT-Based Authentication**: Secure login, registration, and session management.
- **OTP Password Recovery**: Otp-based password reset flow integrated directly with **Gmail SMTP Outgoing Mail** to deliver codes to real email inboxes.
- **Persistent Data Store**: Local file-based H2 database persistence (no data lost on server restarts).

### 🎨 High-Fidelity Glassmorphism UX/UI
- **Aesthetic Theme System**: Curved translucent glass containers, backdrop blur filters, and dynamic radial-mesh background gradients that morph when toggling between **Light Mode** and **Dark Mode**.
- **Ambient Glowing Orbs**: Soft floating Emerald and Cyan background depth orbs.
- **Color-Coded Sidebar Navigation**: Fully custom colored items that dynamically adjust their selection bar and highlight backdrops to match their brand icons on click.

### 📊 Sustainability Analytics
- **Dynamic Leaderboard**: Podium ranks (1st, 2nd, 3rd) framed with colored outlines and gold/silver/bronze medallions. Earned badges displayed as premium achievements.
- **Eco Insights Engine**: Actionable, category-based personalized recommendations based on logged activity profiles.
- **Dashboard Interactive Charts**:
  - Weekly area emission graphs with cyan gradients.
  - Monthly bar comparison charts.
  - Category emissions distribution pie charts.

### 🔍 Day-to-Day Activity Inspector
- **Daily Historical Filtering**: Filter logs by a specific date on the *Log Activities* page, complete with a day-to-day total emissions banner.
- **Dashboard Logs Inspector**: A clickable Daily Emissions bar chart. Clicking on any day instantly loads a detailed card showing exactly what activities were logged on that specific day.

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
