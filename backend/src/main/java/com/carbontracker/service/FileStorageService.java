package com.carbontracker.service;

import com.carbontracker.entity.UploadedFile;
import com.carbontracker.entity.User;
import com.carbontracker.repository.UploadedFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Autowired
    private UploadedFileRepository uploadedFileRepository;

    @org.springframework.beans.factory.annotation.Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @jakarta.annotation.PostConstruct
    public void init() {
        // Ensure upload directory exists
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            System.err.println("Could not create upload directory: " + e.getMessage());
        }
    }

    public UploadedFile storeFile(MultipartFile file, User user) {
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String storedFileName = UUID.randomUUID().toString() + fileExtension;
        Path targetPath = Paths.get(uploadDir).resolve(storedFileName);

        try {
            // Development local storage execution
            Files.copy(file.getInputStream(), targetPath);
            
            // AWS S3 Ready Architecture placeholder:
            // s3Client.putObject(new PutObjectRequest(bucketName, storedFileName, file.getInputStream(), metadata));

            String fileUrl = "/api/files/" + storedFileName;

            UploadedFile uploadedFile = UploadedFile.builder()
                    .user(user)
                    .fileName(originalFileName)
                    .fileUrl(fileUrl)
                    .fileType(file.getContentType())
                    .build();

            return uploadedFileRepository.save(uploadedFile);

        } catch (IOException e) {
            throw new RuntimeException("Could not store file: " + e.getMessage(), e);
        }
    }

    public byte[] loadFile(String filename) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(filename);
        if (Files.exists(filePath)) {
            return Files.readAllBytes(filePath);
        } else {
            throw new IllegalArgumentException("File not found");
        }
    }
}
