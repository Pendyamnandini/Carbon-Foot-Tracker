package com.carbontracker.controller;

import com.carbontracker.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/{filename:.+}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) {
        try {
            byte[] fileBytes = fileStorageService.loadFile(filename);
            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (filename.toLowerCase().endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (filename.toLowerCase().endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            }
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(fileBytes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
