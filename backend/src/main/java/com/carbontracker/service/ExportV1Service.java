package com.carbontracker.service;

import com.carbontracker.dto.AdminDashboardV1Response;
import com.carbontracker.dto.CategoryBreakdownResponse;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import com.carbontracker.service.ai.Translator;
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

    private Font resolveFont(float size, int style, java.awt.Color color) {
        try {
            String fontPath = "C:\\Windows\\Fonts\\arial.ttf";
            BaseFont bf = BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            return new Font(bf, size, style, color);
        } catch (Exception e) {
            int pdfStyle = Font.NORMAL;
            if (style == Font.BOLD) pdfStyle = Font.BOLD;
            return FontFactory.getFont(FontFactory.HELVETICA, size, pdfStyle, color);
        }
    }

    // --- USER REPORTS ---
    public String generateUserCsv(User user, LocalDate startDate, LocalDate endDate) {
        StringBuilder csv = new StringBuilder();
        csv.append(Translator.toLocale("Carbon Tracker - Individual Footprint Report for ")).append(user.getFullName()).append("\n");
        if (startDate != null && endDate != null) {
            csv.append(Translator.toLocale("Period: ")).append(startDate).append(" ").append(Translator.toLocale("to")).append(" ").append(endDate).append("\n");
        }
        csv.append(Translator.toLocale("Export Date: ")).append(LocalDate.now()).append("\n\n");
        
        csv.append(Translator.toLocale("Date")).append(",")
           .append(Translator.toLocale("Category")).append(",")
           .append(Translator.toLocale("Activity Type")).append(",")
           .append(Translator.toLocale("Quantity")).append(",")
           .append(Translator.toLocale("Unit")).append(",")
           .append(Translator.toLocale("Emission Factor")).append(",")
           .append(Translator.toLocale("Carbon Emission (kg)")).append("\n");

        List<ActivityLog> logs;
        if (startDate != null && endDate != null) {
            logs = activityLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateDesc(user.getId(), startDate, endDate);
        } else {
            logs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
        }
        for (ActivityLog log : logs) {
            csv.append(log.getLogDate()).append(",")
                    .append(Translator.toLocale(log.getCategory().name())).append(",")
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
            Font titleFont = resolveFont(18, Font.BOLD, java.awt.Color.DARK_GRAY);
            Font headerFont = resolveFont(12, Font.BOLD, java.awt.Color.WHITE);
            Font bodyFont = resolveFont(10, Font.NORMAL, java.awt.Color.BLACK);
            Font boldBodyFont = resolveFont(10, Font.BOLD, java.awt.Color.BLACK);
            Font grayFont = resolveFont(10, Font.NORMAL, java.awt.Color.GRAY);

            // Title
            Paragraph title = new Paragraph(Translator.toLocale("Individual Sustainability Report"), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            String periodStr = (startDate != null && endDate != null) ? "\n" + Translator.toLocale("Period: ") + startDate + " " + Translator.toLocale("to") + " " + endDate : "";
            Paragraph subtitle = new Paragraph(Translator.toLocale("Carbon Footprint Tracking & Analytical Breakdown") + "\n" + 
                    Translator.toLocale("User: ") + user.getFullName() + " (" + user.getEmail() + ")\n" + 
                    Translator.toLocale("Generated on: ") + LocalDate.now() + periodStr + "\n\n", grayFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            // Profile info
            document.add(new Paragraph(Translator.toLocale("Profile Context:"), resolveFont(12, Font.BOLD, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph(Translator.toLocale("Location: ") + (user.getCity() != null ? user.getCity() + ", " : "") + 
                    (user.getState() != null ? user.getState() + ", " : "") + (user.getCountry() != null ? user.getCountry() : "N/A"), bodyFont));
            document.add(new Paragraph(Translator.toLocale("Role: ") + user.getRole().name() + "\n\n", bodyFont));

            // Query logs for the period
            List<ActivityLog> logs;
            if (startDate != null && endDate != null) {
                logs = activityLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateDesc(user.getId(), startDate, endDate);
            } else {
                logs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
            }

            // Calculate category breakdown
            double total = logs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
            
            document.add(new Paragraph(Translator.toLocale("Aggregated Emission Metrics:"), resolveFont(12, Font.BOLD, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph(Translator.toLocale("Total Carbon Emission: ") + String.format("%.1f", total) + " kg CO₂\n\n", boldBodyFont));

            // Breakdown table
            PdfPTable breakdownTable = new PdfPTable(3);
            breakdownTable.setWidthPercentage(100);
            breakdownTable.setWidths(new float[]{3f, 2f, 2f});
            
            PdfPCell cell1 = new PdfPCell(new Phrase(Translator.toLocale("Category"), headerFont));
            cell1.setBackgroundColor(new java.awt.Color(16, 185, 129)); // Emerald Green
            cell1.setHorizontalAlignment(Element.ALIGN_CENTER);
            breakdownTable.addCell(cell1);
            
            PdfPCell cell2 = new PdfPCell(new Phrase(Translator.toLocale("Emissions (kg)"), headerFont));
            cell2.setBackgroundColor(new java.awt.Color(16, 185, 129));
            cell2.setHorizontalAlignment(Element.ALIGN_CENTER);
            breakdownTable.addCell(cell2);

            PdfPCell cell3 = new PdfPCell(new Phrase(Translator.toLocale("Contribution (%)"), headerFont));
            cell3.setBackgroundColor(new java.awt.Color(16, 185, 129));
            cell3.setHorizontalAlignment(Element.ALIGN_CENTER);
            breakdownTable.addCell(cell3);

            for (Category cat : Category.values()) {
                double catSum = logs.stream().filter(l -> l.getCategory() == cat).mapToDouble(ActivityLog::getCarbonEmission).sum();
                double pct = total > 0 ? (catSum / total) * 100.0 : 0.0;
                breakdownTable.addCell(new PdfPCell(new Phrase(Translator.toLocale(cat.name()), bodyFont)));
                breakdownTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", catSum), bodyFont)));
                breakdownTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", pct) + "%", bodyFont)));
            }
            document.add(breakdownTable);
            document.add(new Paragraph("\n"));

            // Detailed Logs
            document.add(new Paragraph(Translator.toLocale("Recent Activity Logs:"), resolveFont(12, Font.BOLD, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            PdfPTable logTable = new PdfPTable(5);
            logTable.setWidthPercentage(100);
            logTable.setWidths(new float[]{2f, 2f, 3f, 2f, 2f});

            String[] headers = {
                Translator.toLocale("Date"), 
                Translator.toLocale("Category"), 
                Translator.toLocale("Activity Type"), 
                Translator.toLocale("Qty/Unit"), 
                Translator.toLocale("CO₂ (kg)")
            };
            for (String h : headers) {
                PdfPCell c = new PdfPCell(new Phrase(h, headerFont));
                c.setBackgroundColor(new java.awt.Color(6, 182, 212)); // Cyan/Blue
                c.setHorizontalAlignment(Element.ALIGN_CENTER);
                logTable.addCell(c);
            }

            for (ActivityLog log : logs) {
                logTable.addCell(new PdfPCell(new Phrase(log.getLogDate().toString(), bodyFont)));
                logTable.addCell(new PdfPCell(new Phrase(Translator.toLocale(log.getCategory().name()), bodyFont)));
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
        csv.append(Translator.toLocale("Organization Sustainability Analytics Report - ")).append(org.getOrganizationName()).append("\n");
        csv.append(Translator.toLocale("Organization Type: ")).append(org.getOrganizationType()).append("\n");
        csv.append(Translator.toLocale("Export Date: ")).append(LocalDate.now()).append("\n\n");

        csv.append(Translator.toLocale("EMPLOYEE LIST & RANKING")).append("\n");
        csv.append(Translator.toLocale("Rank")).append(",")
           .append(Translator.toLocale("Employee Name")).append(",")
           .append(Translator.toLocale("Email")).append(",")
           .append(Translator.toLocale("Assigned Department")).append(",")
           .append(Translator.toLocale("Role")).append(",")
           .append(Translator.toLocale("Total Emissions (kg)")).append("\n");

        List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(org.getId());
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
            csv.append(rank++).append(",")
                    .append(escapeCsv(me.name)).append(",")
                    .append(escapeCsv(me.email)).append(",")
                    .append(escapeCsv(Translator.toLocale(me.department))).append(",")
                    .append(Translator.toLocale(me.role)).append(",")
                    .append(round(me.emissions)).append("\n");
        }

        csv.append("\n" + Translator.toLocale("MONTHLY SUSTAINABILITY REPORTS HISTORY") + "\n");
        csv.append(Translator.toLocale("Period")).append(",")
           .append(Translator.toLocale("Aggregated CO2 (kg)")).append("\n");
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

            Font titleFont = resolveFont(18, Font.BOLD, java.awt.Color.DARK_GRAY);
            Font headerFont = resolveFont(12, Font.BOLD, java.awt.Color.WHITE);
            Font bodyFont = resolveFont(10, Font.NORMAL, java.awt.Color.BLACK);
            Font boldBodyFont = resolveFont(10, Font.BOLD, java.awt.Color.BLACK);
            Font grayFont = resolveFont(10, Font.NORMAL, java.awt.Color.GRAY);

            Paragraph title = new Paragraph(Translator.toLocale("Organization Sustainability Report"), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph(Translator.toLocale("Institutional Carbon Footprint Metrics") + "\n" + 
                    Translator.toLocale("Organization: ") + org.getOrganizationName() + " (" + org.getOrganizationType() + ")\n" + 
                    Translator.toLocale("Generated on: ") + LocalDate.now() + "\n\n", grayFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(org.getId());
            document.add(new Paragraph(Translator.toLocale("Staff Context Summary:"), resolveFont(12, Font.BOLD, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph(Translator.toLocale("Total Linked Members: ") + members.size(), bodyFont));
            document.add(new Paragraph("\n"));

            // Team Rankings
            document.add(new Paragraph(Translator.toLocale("Employee Leaderboard Rankings:"), resolveFont(12, Font.BOLD, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            PdfPTable teamTable = new PdfPTable(5);
            teamTable.setWidthPercentage(100);
            teamTable.setWidths(new float[]{1f, 3f, 2f, 2f, 2f});

            String[] tableHeaders = {
                Translator.toLocale("Rank"), 
                Translator.toLocale("Employee Name"), 
                Translator.toLocale("Department"), 
                Translator.toLocale("Role"), 
                Translator.toLocale("Emissions (kg)")
            };
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
                teamTable.addCell(new PdfPCell(new Phrase(Translator.toLocale(me.department), bodyFont)));
                teamTable.addCell(new PdfPCell(new Phrase(Translator.toLocale(me.role), bodyFont)));
                teamTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", me.emissions) + " kg", bodyFont)));
            }
            document.add(teamTable);
            document.add(new Paragraph("\n"));

            // Department Summaries
            document.add(new Paragraph(Translator.toLocale("Department Performance Matrix:"), resolveFont(12, Font.BOLD, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            Map<String, List<MemberEmission>> deptGroups = rankings.stream().collect(Collectors.groupingBy(me -> me.department));
            PdfPTable deptTable = new PdfPTable(4);
            deptTable.setWidthPercentage(100);
            deptTable.setWidths(new float[]{3f, 2f, 2f, 2f});

            String[] deptHeaders = {
                Translator.toLocale("Department"), 
                Translator.toLocale("Staff Count"), 
                Translator.toLocale("Total CO2 (kg)"), 
                Translator.toLocale("Average CO2 (kg)")
            };
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

                deptTable.addCell(new PdfPCell(new Phrase(Translator.toLocale(deptName), bodyFont)));
                deptTable.addCell(new PdfPCell(new Phrase(String.valueOf(count), bodyFont)));
                deptTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", totalEm), bodyFont)));
                deptTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", avgEm), bodyFont)));
            }
            document.add(deptTable);
            document.add(new Paragraph("\n"));

            // Reports History
            document.add(new Paragraph(Translator.toLocale("Monthly Aggregated Reports Archive:"), resolveFont(12, Font.BOLD, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            PdfPTable repTable = new PdfPTable(2);
            repTable.setWidthPercentage(100);
            repTable.setWidths(new float[]{3f, 3f});

            repTable.addCell(new PdfPCell(new Phrase(Translator.toLocale("Report Period"), headerFont)) {{ setBackgroundColor(new java.awt.Color(251, 191, 36)); }});
            repTable.addCell(new PdfPCell(new Phrase(Translator.toLocale("Aggregated CO₂ (kg)"), headerFont)) {{ setBackgroundColor(new java.awt.Color(251, 191, 36)); }});

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
        csv.append(Translator.toLocale("Carbon Tracker Platform-Wide Administration Report")).append("\n");
        csv.append(Translator.toLocale("Export Date: ")).append(LocalDate.now()).append("\n\n");

        csv.append(Translator.toLocale("CORE KPIs")).append("\n");
        csv.append(Translator.toLocale("Total Registered Users")).append(",").append(stats.getTotalUsers()).append("\n");
        csv.append(Translator.toLocale("Active Users")).append(",").append(stats.getActiveUsers()).append("\n");
        csv.append(Translator.toLocale("Inactive Users")).append(",").append(stats.getInactiveUsers()).append("\n");
        csv.append(Translator.toLocale("Total Platform Emissions Logged (kg)")).append(",").append(stats.getTotalPlatformEmissions()).append("\n");
        csv.append(Translator.toLocale("Total Logged Activities")).append(",").append(stats.getTotalActivities()).append("\n");
        csv.append(Translator.toLocale("Goal Success Rate (%)")).append(",").append(stats.getGoalSuccessRate()).append("\n");
        csv.append(Translator.toLocale("Most Earned Badge")).append(",").append(escapeCsv(Translator.toLocale(stats.getMostEarnedBadge()))).append("\n");
        csv.append(Translator.toLocale("Feedback Unresolved Open Queries")).append(",").append(stats.getOpenFeedback()).append("\n\n");

        csv.append(Translator.toLocale("CATEGORY EMISSIONS DISTRIBUTION")).append("\n");
        csv.append(Translator.toLocale("Category")).append(",")
           .append(Translator.toLocale("Emission Value (kg)")).append(",")
           .append(Translator.toLocale("Contribution Percentage (%)")).append("\n");
        for (String cat : stats.getCategoryEmissions().keySet()) {
            csv.append(Translator.toLocale(cat)).append(",")
                    .append(stats.getCategoryEmissions().get(cat)).append(",")
                    .append(stats.getCategoryPercentages().get(cat)).append("\n");
        }

        csv.append("\n" + Translator.toLocale("TOP 10 LOWEST EMISSION USERS") + "\n");
        csv.append(Translator.toLocale("User Name")).append(",")
           .append(Translator.toLocale("Email")).append(",")
           .append(Translator.toLocale("Emissions (kg)")).append(",")
           .append(Translator.toLocale("Sustainability Score")).append("\n");
        for (AdminDashboardV1Response.UserEmissionRank u : stats.getLowestEmissionUsers()) {
            csv.append(escapeCsv(u.getFullName())).append(",")
                    .append(escapeCsv(u.getEmail())).append(",")
                    .append(u.getEmissions()).append(",")
                    .append(u.getSustainabilityScore()).append("\n");
        }

        csv.append("\n" + Translator.toLocale("TOP 10 HIGHEST EMISSION USERS") + "\n");
        csv.append(Translator.toLocale("User Name")).append(",")
           .append(Translator.toLocale("Email")).append(",")
           .append(Translator.toLocale("Emissions (kg)")).append(",")
           .append(Translator.toLocale("Sustainability Score")).append("\n");
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

            Font titleFont = resolveFont(18, Font.BOLD, java.awt.Color.DARK_GRAY);
            Font headerFont = resolveFont(12, Font.BOLD, java.awt.Color.WHITE);
            Font bodyFont = resolveFont(10, Font.NORMAL, java.awt.Color.BLACK);
            Font boldBodyFont = resolveFont(10, Font.BOLD, java.awt.Color.BLACK);
            Font grayFont = resolveFont(10, Font.NORMAL, java.awt.Color.GRAY);

            Paragraph title = new Paragraph(Translator.toLocale("Platform Sustainability Performance Analytics"), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph(Translator.toLocale("Platform-Wide Carbon Footprint Summary & Audits") + "\n" + 
                    Translator.toLocale("Generated on: ") + LocalDate.now() + "\n\n", grayFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            // Core KPIs List
            document.add(new Paragraph(Translator.toLocale("Core Metrics Overview:"), resolveFont(12, Font.BOLD, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph(Translator.toLocale("Total Registered Users: ") + stats.getTotalUsers() + " (" + Translator.toLocale("Active: ") + stats.getActiveUsers() + ")", bodyFont));
            document.add(new Paragraph(Translator.toLocale("Total Activities Logged: ") + stats.getTotalActivities(), bodyFont));
            document.add(new Paragraph(Translator.toLocale("Total Carbon Emission: ") + String.format("%.1f", stats.getTotalPlatformEmissions()) + " kg CO₂", bodyFont));
            document.add(new Paragraph(Translator.toLocale("Goal Success Achievement Rate: ") + String.format("%.1f", stats.getGoalSuccessRate()) + "%", bodyFont));
            document.add(new Paragraph(Translator.toLocale("Total User Feedbacks Received: ") + stats.getTotalFeedback() + " (" + Translator.toLocale("Pending: ") + stats.getOpenFeedback() + ")", bodyFont));
            document.add(new Paragraph("\n"));

            // Category breakdown
            document.add(new Paragraph(Translator.toLocale("Category Breakdown:"), resolveFont(12, Font.BOLD, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            PdfPTable breakdownTable = new PdfPTable(3);
            breakdownTable.setWidthPercentage(100);
            breakdownTable.setWidths(new float[]{3f, 2f, 2f});

            breakdownTable.addCell(new PdfPCell(new Phrase(Translator.toLocale("Category"), headerFont)) {{ setBackgroundColor(new java.awt.Color(6, 182, 212)); }});
            breakdownTable.addCell(new PdfPCell(new Phrase(Translator.toLocale("Emissions (kg)"), headerFont)) {{ setBackgroundColor(new java.awt.Color(6, 182, 212)); }});
            breakdownTable.addCell(new PdfPCell(new Phrase(Translator.toLocale("Platform Contribution (%)"), headerFont)) {{ setBackgroundColor(new java.awt.Color(6, 182, 212)); }});

            for (String cat : stats.getCategoryEmissions().keySet()) {
                breakdownTable.addCell(new PdfPCell(new Phrase(Translator.toLocale(cat), bodyFont)));
                breakdownTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", stats.getCategoryEmissions().get(cat)), bodyFont)));
                breakdownTable.addCell(new PdfPCell(new Phrase(String.format("%.1f", stats.getCategoryPercentages().get(cat)) + "%", bodyFont)));
            }
            document.add(breakdownTable);
            document.add(new Paragraph("\n"));

            // Top 5 Lowest Users
            document.add(new Paragraph(Translator.toLocale("Top 5 Eco-Friendly Users (Lowest Footprints):"), resolveFont(12, Font.BOLD, java.awt.Color.DARK_GRAY)));
            document.add(new Paragraph("\n"));

            PdfPTable lowestTable = new PdfPTable(4);
            lowestTable.setWidthPercentage(100);
            lowestTable.setWidths(new float[]{3f, 3f, 2f, 2f});

            lowestTable.addCell(new PdfPCell(new Phrase(Translator.toLocale("User Name"), headerFont)) {{ setBackgroundColor(new java.awt.Color(16, 185, 129)); }});
            lowestTable.addCell(new PdfPCell(new Phrase(Translator.toLocale("Email"), headerFont)) {{ setBackgroundColor(new java.awt.Color(16, 185, 129)); }});
            lowestTable.addCell(new PdfPCell(new Phrase(Translator.toLocale("Emissions (kg)"), headerFont)) {{ setBackgroundColor(new java.awt.Color(16, 185, 129)); }});
            lowestTable.addCell(new PdfPCell(new Phrase(Translator.toLocale("Eco Score"), headerFont)) {{ setBackgroundColor(new java.awt.Color(16, 185, 129)); }});

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
