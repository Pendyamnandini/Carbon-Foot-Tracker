package com.carbontracker.repository;

import com.carbontracker.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    List<UploadedFile> findByUserId(Long userId);
}
