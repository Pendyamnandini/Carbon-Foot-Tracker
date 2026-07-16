package com.carbontracker.repository;

import com.carbontracker.entity.OrganizationReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrganizationReportRepository extends JpaRepository<OrganizationReport, Long> {
    List<OrganizationReport> findByOrganizationIdOrderByReportYearDescReportMonthDesc(Long organizationId);
}
