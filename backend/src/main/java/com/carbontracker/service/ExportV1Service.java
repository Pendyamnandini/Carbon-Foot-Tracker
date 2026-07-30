package com.carbontracker.service;

import com.carbontracker.dto.AdminDashboardV1Response;
import com.carbontracker.dto.CategoryBreakdownResponse;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
public class ExportV1Service {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private AnalyticsV1Service analyticsV1Service;

    @Autowired
    private AdminV1Service adminV1Service;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private OrganizationReportRepository organizationReportRepository;

    // --- USER REPORTS ---
    public String generateUserCsv(User user, LocalDate startDate, LocalDate endDate) {
        StringBuilder csv = new StringBuilder();
        csv.append("Carbon Tracker - Individual Footprint Report for ").append(user.getFullName()).append("\n");
        if (startDate != null && endDate != null) {
            csv.append("Period: ").append(startDate).append(" to ").append(endDate).append("\n");
        }
        csv.append("Export Date: ").append(LocalDate.now()).append("\n\n");
        csv.append("Date,Category,Activity Type,Quantity,Unit,Emission Factor,Carbon Emission (kg)\n");

        List<ActivityLog> logs;
        if (startDate != null && endDate != null) {
            logs = activityLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateDesc(user.getId(), startDate, endDate);
        } else {
            logs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
        }
        for (ActivityLog log : logs) {
            csv.append(log.getLogDate()).append(",")
                    .append(log.getCategory().name()).append(",")
                    .append(escapeCsv(log.getActivityType())).append(",")
                    .append(log.getQuantity()).append(",")
                    .append(escapeCsv(log.getUnit())).append(",")
                    .append(log.getEmissionFactor()).append(",")
                    .append(log.getCarbonEmission()).append("\n");
        }
        return csv.toString();
    }

    public byte[] generateUserPdf(User user, LocalDate startDate, LocalDate endDate) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, java.awt.Color.DARK_GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.WHITE);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, java.awt.Color.BLACK);
            Font boldBodyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.BLACK);

            // Title
            Paragraph title = new Paragraph("Individual Sustainability Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            String periodStr = (startDate != null && endDate != null) ? "\nPeriod: " + startDate + " to " + endDate : "";
            Paragraph subtitle = new Paragraph("Carbon Footprint Tracking & Analytical Breakdown\nUser: " + 
                    user.getFullName() + " (" + user.getEmail() + ")\nGenerated on: " + LocalDate.now() + periodStr + "\n\n", 
                    FontFactory.getFont(FontFactory.HELVETICA, 10, java.awt.Color.GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            // Profile info
            document.add(new Paragraph("Profile Context:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("Location: " + (user.getCity() != null ? user.getCity() + ", " : "") + 
                    (user.getState() != null ? user.getState() + ", " : "") + (user.getCountry() != null ? user.getCountry() : "N/A"), bodyFont));
            document.add(new Paragraph("Role: " + user.getRole().name() + "\n\n", bodyFont));

            // Query logs for the period
            List<ActivityLog> logs;
            if (startDate != null && endDate != null) {
                logs = activityLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateDesc(user.getId(), startDate, endDate);
            } else {
                logs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
            }

            // Calculate category breakdown
            double total = logs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
            
            document.add(new Paragraph("Aggregated Emission Metrics:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("Total Carbon Emission: " + String.format("%.1f", total) + " kg CO₂\n\n", boldBodyFont));

            // Breakdown table
            PdfPTable breakdownTable = new PdfPTable(3);
            breakdownTable.setWidthPercentage(100);
            breakdownTable.setWidths(new float[]{3f, 2f, 2f});
            
            PdfPCell cell1 = new PdfPCell(new Phrase("Category", headerFont));
            cell1.setBackgroundColor(new java.awt.Color(16, 185, 129)); // Emerald Green
            cell1.setHorizontalAlignment(Element.ALIGN_CENTER);
            breakdownTable.addCell(cell1);
            
            PdfPCell cell2 = new PdfPCell(new Phrase("Emissions (kg)", headerFont));
            cell2.setBackgroundColor(new java.awt.Color(16, 185, 129));
            cell2.setHorizontalAlignment(Element.ALIGN_CENTER);
            breakdownTable.addCell(cell2);

            PdfPCell cell3 = new PdfPCell(new Phrase("Contribution (%)", headerFont));
            cell3.setBackgroundColor(new java.awt.Color(16, 185, 129));
            cell3.setHorizontalAlignment(Element.ALIGN_CENTER);
            breakdownTable.addCell(cell3);

            for (Category cat : Category.values()) {
                double catSum = logs.stream().filter(l -> l.getCategory() == cat).mapToDouble(ActivityLog::getCarbonEmission).sum();
                double pct = total > 0 ? (catSum / total) * 100.0 : 0.0;
                breakdownTable.addCell(new PdfPCell(new Phrase(cat.name(), bodyFont)));
                breakdownTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", catSum), bodyFont)));
                breakdownTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", pct) + "%", bodyFont)));
            }
            document.add(breakdownTable);
            document.add(new Paragraph("\n"));

            // Detailed Logs
            document.add(new Paragraph("Recent Activity Logs:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            PdfPTable logTable = new PdfPTable(5);
            logTable.setWidthPercentage(100);
            logTable.setWidths(new float[]{2f, 2f, 3f, 2f, 2f});

            String[] headers = {"Date", "Category", "Activity Type", "Qty/Unit", "CO₂ (kg)"};
            for (String h : headers) {
                PdfPCell c = new PdfPCell(new Phrase(h, headerFont));
                c.setBackgroundColor(new java.awt.Color(6, 182, 212)); // Cyan/Blue
                c.setHorizontalAlignment(Element.ALIGN_CENTER);
                logTable.addCell(c);
            }

            for (ActivityLog log : logs) {
                logTable.addCell(new PdfPCell(new Phrase(log.getLogDate().toString(), bodyFont)));
                logTable.addCell(new PdfPCell(new Phrase(log.getCategory().name(), bodyFont)));
                logTable.addCell(new PdfPCell(new Phrase(log.getActivityType(), bodyFont)));
                logTable.addCell(new PdfPCell(new Phrase(log.getQuantity() + " " + log.getUnit(), bodyFont)));
                logTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", log.getCarbonEmission()), bodyFont)));
            }
            document.add(logTable);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }

    // --- ORGANIZATION REPORTS ---
    public String generateOrgCsv(Organization org, User user) {
        StringBuilder csv = new StringBuilder();
        csv.append("Organization Sustainability Analytics Report - ").append(org.getOrganizationName()).append("\n");
        csv.append("Organization Type: ").append(org.getOrganizationType()).append("\n");
        csv.append("Export Date: ").append(LocalDate.now()).append("\n\n");

        csv.append("EMPLOYEE LIST & RANKING\n");
        csv.append("Rank,Employee Name,Email,Assigned Department,Role,Total Emissions (kg)\n");

        List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(org.getId());
        // Sort members by total emissions (lowest to highest)
        List<MemberEmission> rankings = members.stream()
                .map(m -> {
                    double em = activityLogRepository.findByUserIdOrderByLogDateDesc(m.getUser().getId()).stream()
                            .mapToDouble(ActivityLog::getCarbonEmission).sum();
                    // dynamically generate department based on email
                    String dept = getMockDepartment(m.getUser());
                    return new MemberEmission(m.getUser().getFullName(), m.getUser().getEmail(), dept, m.getRole().name(), em);
                })
                .sorted(Comparator.comparingDouble(MemberEmission::getEmissions))
                .collect(Collectors.toList());

        int rank = 1;
        for (MemberEmission me : rankings) {
            csv.append(rank++).append(",")
                    .append(escapeCsv(me.name)).append(",")
                    .append(escapeCsv(me.email)).append(",")
                    .append(escapeCsv(me.department)).append(",")
                    .append(me.role).append(",")
                    .append(round(me.emissions)).append("\n");
        }

        csv.append("\nMONTHLY SUSTAINABILITY REPORTS HISTORY\n");
        csv.append("Period,Aggregated CO2 (kg)\n");
        List<OrganizationReport> reports = organizationReportRepository.findByOrganizationIdOrderByReportYearDescReportMonthDesc(org.getId());
        for (OrganizationReport rep : reports) {
            csv.append(rep.getReportMonth()).append("/").append(rep.getReportYear()).append(",")
                    .append(round(rep.getTotalEmission())).append("\n");
        }

        return csv.toString();
    }

    public byte[] generateOrgPdf(Organization org, User user) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, java.awt.Color.DARK_GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.WHITE);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, java.awt.Color.BLACK);
            Font boldBodyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.BLACK);

            Paragraph title = new Paragraph("Organization Sustainability Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph("Institutional Carbon Footprint Metrics\nOrganization: " + 
                    org.getOrganizationName() + " (" + org.getOrganizationType() + ")\nGenerated on: " + LocalDate.now() + "\n\n", 
                    FontFactory.getFont(FontFactory.HELVETICA, 10, java.awt.Color.GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(org.getId());
            document.add(new Paragraph("Staff Context Summary:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("Total Linked Members: " + members.size(), bodyFont));
            document.add(new Paragraph("\n"));

            // Team Rankings
            document.add(new Paragraph("Employee Leaderboard Rankings:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            PdfPTable teamTable = new PdfPTable(5);
            teamTable.setWidthPercentage(100);
            teamTable.setWidths(new float[]{1f, 3f, 2f, 2f, 2f});

            String[] tableHeaders = {"Rank", "Employee Name", "Department", "Role", "Emissions (kg)"};
            for (String th : tableHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(th, headerFont));
                cell.setBackgroundColor(new java.awt.Color(16, 185, 129));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                teamTable.addCell(cell);
            }

            List<MemberEmission> rankings = members.stream()
                .map(m -> {
                    double em = activityLogRepository.findByUserIdOrderByLogDateDesc(m.getUser().getId()).stream()
                            .mapToDouble(ActivityLog::getCarbonEmission).sum();
                    String dept = getMockDepartment(m.getUser());
                    return new MemberEmission(m.getUser().getFullName(), m.getUser().getEmail(), dept, m.getRole().name(), em);
                })
                .sorted(Comparator.comparingDouble(MemberEmission::getEmissions))
                .collect(Collectors.toList());

            int rank = 1;
            for (MemberEmission me : rankings) {
                teamTable.addCell(new PdfPCell(new Phrase(String.valueOf(rank++), bodyFont)));
                teamTable.addCell(new PdfPCell(new Phrase(me.name, bodyFont)));
                teamTable.addCell(new PdfPCell(new Phrase(me.department, bodyFont)));
                teamTable.addCell(new PdfPCell(new Phrase(me.role, bodyFont)));
                teamTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", me.emissions) + " kg", bodyFont)));
            }
            document.add(teamTable);
            document.add(new Paragraph("\n"));

            // Department Summaries
            document.add(new Paragraph("Department Performance Matrix:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            Map<String, List<MemberEmission>> deptGroups = rankings.stream().collect(Collectors.groupingBy(me -> me.department));
            PdfPTable deptTable = new PdfPTable(4);
            deptTable.setWidthPercentage(100);
            deptTable.setWidths(new float[]{3f, 2f, 2f, 2f});

            String[] deptHeaders = {"Department", "Staff Count", "Total CO2 (kg)", "Average CO2 (kg)"};
            for (String dh : deptHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(dh, headerFont));
                cell.setBackgroundColor(new java.awt.Color(6, 182, 212));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                deptTable.addCell(cell);
            }

            for (Map.Entry<String, List<MemberEmission>> entry : deptGroups.entrySet()) {
                String deptName = entry.getKey();
                List<MemberEmission> ems = entry.getValue();
                int count = ems.size();
                double totalEm = ems.stream().mapToDouble(me -> me.emissions).sum();
                double avgEm = count == 0 ? 0.0 : totalEm / count;

                deptTable.addCell(new PdfPCell(new Phrase(deptName, bodyFont)));
                deptTable.addCell(new PdfPCell(new Phrase(String.valueOf(count), bodyFont)));
                deptTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", totalEm), bodyFont)));
                deptTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", avgEm), bodyFont)));
            }
            document.add(deptTable);
            document.add(new Paragraph("\n"));

            // Reports History
            document.add(new Paragraph("Monthly Aggregated Reports Archive:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            PdfPTable repTable = new PdfPTable(2);
            repTable.setWidthPercentage(100);
            repTable.setWidths(new float[]{3f, 3f});

            repTable.addCell(new PdfPCell(new Phrase("Report Period", headerFont)) {{ setBackgroundColor(new java.awt.Color(251, 191, 36)); }});
            repTable.addCell(new PdfPCell(new Phrase("Aggregated CO₂ (kg)", headerFont)) {{ setBackgroundColor(new java.awt.Color(251, 191, 36)); }});

            List<OrganizationReport> reports = organizationReportRepository.findByOrganizationIdOrderByReportYearDescReportMonthDesc(org.getId());
            for (OrganizationReport rep : reports) {
                repTable.addCell(new PdfPCell(new Phrase(rep.getReportMonth() + "/" + rep.getReportYear(), bodyFont)));
                repTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", rep.getTotalEmission()) + " kg", bodyFont)));
            }
            document.add(repTable);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }

    // --- ANALYTICS/PLATFORM REPORTS ---
    public String generateAnalyticsCsv() {
        AdminDashboardV1Response stats = adminV1Service.getAdminDashboardStats();
        StringBuilder csv = new StringBuilder();
        csv.append("Carbon Tracker Platform-Wide Administration Report\n");
        csv.append("Export Date: ").append(LocalDate.now()).append("\n\n");

        csv.append("CORE KPIs\n");
        csv.append("Total Registered Users,").append(stats.getTotalUsers()).append("\n");
        csv.append("Active Users,").append(stats.getActiveUsers()).append("\n");
        csv.append("Inactive Users,").append(stats.getInactiveUsers()).append("\n");
        csv.append("Total Platform Emissions Logged (kg),").append(stats.getTotalPlatformEmissions()).append("\n");
        csv.append("Total Logged Activities,").append(stats.getTotalActivities()).append("\n");
        csv.append("Goal Success Rate (%),").append(stats.getGoalSuccessRate()).append("\n");
        csv.append("Most Earned Badge,").append(escapeCsv(stats.getMostEarnedBadge())).append("\n");
        csv.append("Feedback Unresolved Open Queries,").append(stats.getOpenFeedback()).append("\n\n");

        csv.append("CATEGORY EMISSIONS DISTRIBUTION\n");
        csv.append("Category,Emission Value (kg),Contribution Percentage (%)\n");
        for (String cat : stats.getCategoryEmissions().keySet()) {
            csv.append(cat).append(",")
                    .append(stats.getCategoryEmissions().get(cat)).append(",")
                    .append(stats.getCategoryPercentages().get(cat)).append("\n");
        }

        csv.append("\nTOP 10 LOWEST EMISSION USERS\n");
        csv.append("User Name,Email,Emissions (kg),Sustainability Score\n");
        for (AdminDashboardV1Response.UserEmissionRank u : stats.getLowestEmissionUsers()) {
            csv.append(escapeCsv(u.getFullName())).append(",")
                    .append(escapeCsv(u.getEmail())).append(",")
                    .append(u.getEmissions()).append(",")
                    .append(u.getSustainabilityScore()).append("\n");
        }

        csv.append("\nTOP 10 HIGHEST EMISSION USERS\n");
        csv.append("User Name,Email,Emissions (kg),Sustainability Score\n");
        for (AdminDashboardV1Response.UserEmissionRank u : stats.getHighestEmissionUsers()) {
            csv.append(escapeCsv(u.getFullName())).append(",")
                    .append(escapeCsv(u.getEmail())).append(",")
                    .append(u.getEmissions()).append(",")
                    .append(u.getSustainabilityScore()).append("\n");
        }

        return csv.toString();
    }

    public byte[] generateAnalyticsPdf() {
        AdminDashboardV1Response stats = adminV1Service.getAdminDashboardStats();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, java.awt.Color.DARK_GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.WHITE);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, java.awt.Color.BLACK);
            Font boldBodyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.BLACK);

            Paragraph title = new Paragraph("Platform Sustainability Performance Analytics", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph("Platform-Wide Carbon Footprint Summary & Audits\nGenerated on: " + 
                    LocalDate.now() + "\n\n", FontFactory.getFont(FontFactory.HELVETICA, 10, java.awt.Color.GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            // Core KPIs List
            document.add(new Paragraph("Core Metrics Overview:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("Total Registered Users: " + stats.getTotalUsers() + " (Active: " + stats.getActiveUsers() + ")", bodyFont));
            document.add(new Paragraph("Total Activities Logged: " + stats.getTotalActivities(), bodyFont));
            document.add(new Paragraph("Total Carbon Emission: " + String.format("%.1f", stats.getTotalPlatformEmissions()) + " kg CO₂", bodyFont));
            document.add(new Paragraph("Goal Success Achievement Rate: " + String.format("%.1f", stats.getGoalSuccessRate()) + "%", bodyFont));
            document.add(new Paragraph("Total User Feedbacks Received: " + stats.getTotalFeedback() + " (Pending: " + stats.getOpenFeedback() + ")", bodyFont));
            document.add(new Paragraph("\n"));

            // Category breakdown
            document.add(new Paragraph("Category Breakdown:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            PdfPTable breakdownTable = new PdfPTable(3);
            breakdownTable.setWidthPercentage(100);
            breakdownTable.setWidths(new float[]{3f, 2f, 2f});

            breakdownTable.addCell(new PdfPCell(new Phrase("Category", headerFont)) {{ setBackgroundColor(new java.awt.Color(6, 182, 212)); }});
            breakdownTable.addCell(new PdfPCell(new Phrase("Emissions (kg)", headerFont)) {{ setBackgroundColor(new java.awt.Color(6, 182, 212)); }});
            breakdownTable.addCell(new PdfPCell(new Phrase("Platform Contribution (%)", headerFont)) {{ setBackgroundColor(new java.awt.Color(6, 182, 212)); }});

            for (String cat : stats.getCategoryEmissions().keySet()) {
                breakdownTable.addCell(new PdfPCell(new Phrase(cat, bodyFont)));
                breakdownTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", stats.getCategoryEmissions().get(cat)), bodyFont)));
                breakdownTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", stats.getCategoryPercentages().get(cat)) + "%", bodyFont)));
            }
            document.add(breakdownTable);
            document.add(new Paragraph("\n"));

            // Top 5 Lowest Users
            document.add(new Paragraph("Top 5 Eco-Friendly Users (Lowest Footprints):", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            PdfPTable lowestTable = new PdfPTable(4);
            lowestTable.setWidthPercentage(100);
            lowestTable.setWidths(new float[]{3f, 3f, 2f, 2f});

            lowestTable.addCell(new PdfPCell(new Phrase("User Name", headerFont)) {{ setBackgroundColor(new java.awt.Color(16, 185, 129)); }});
            lowestTable.addCell(new PdfPCell(new Phrase("Email", headerFont)) {{ setBackgroundColor(new java.awt.Color(16, 185, 129)); }});
            lowestTable.addCell(new PdfPCell(new Phrase("Emissions (kg)", headerFont)) {{ setBackgroundColor(new java.awt.Color(16, 185, 129)); }});
            lowestTable.addCell(new PdfPCell(new Phrase("Eco Score", headerFont)) {{ setBackgroundColor(new java.awt.Color(16, 185, 129)); }});

            int c = 0;
            for (AdminDashboardV1Response.UserEmissionRank u : stats.getLowestEmissionUsers()) {
                if (c++ >= 5) break;
                lowestTable.addCell(new PdfPCell(new Phrase(u.getFullName(), bodyFont)));
                lowestTable.addCell(new PdfPCell(new Phrase(u.getEmail(), bodyFont)));
                lowestTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", u.getEmissions()), bodyFont)));
                lowestTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", u.getSustainabilityScore()), bodyFont)));
            }
            document.add(lowestTable);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }

    // --- CSV AND UTILS HELPERS ---
    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }

    private String getMockDepartment(User user) {
        String[] departments = {"Sales", "Engineering", "Marketing", "HR", "Operations"};
        return departments[(int)(user.getId() % departments.length)];
    }

    private double round(double val) {
        return Math.round(val * 10.0) / 10.0;
    }

    private static class MemberEmission {
        String name;
        String email;
        String department;
        String role;
        double emissions;

        public MemberEmission(String name, String email, String department, String role, double emissions) {
            this.name = name;
            this.email = email;
            this.department = department;
            this.role = role;
            this.emissions = emissions;
        }

        public double getEmissions() {
            return emissions;
        }
    }
}
