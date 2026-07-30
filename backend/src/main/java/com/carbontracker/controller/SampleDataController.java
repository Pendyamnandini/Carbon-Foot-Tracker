package com.carbontracker.controller;

import com.carbontracker.dto.ApiResponse;
import com.carbontracker.service.SampleDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/demo")
public class SampleDataController {

    @Autowired
    private SampleDataService sampleDataService;

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetDemoData() {
        try {
            sampleDataService.resetAndGenerateDemoData();
            Map<String, Object> data = new HashMap<>();
            data.put("status", "SUCCESS");
            data.put("message", "Demo database reset and realistic historical user data successfully generated.");
            return ResponseEntity.ok(ApiResponse.success("Demo dataset generated successfully", data));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to generate demo data: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDemoStatus() {
        boolean loaded = sampleDataService.isDemoDataLoaded();
        Map<String, Object> data = new HashMap<>();
        data.put("demoDataLoaded", loaded);
        data.put("message", loaded ? "Demo data is present" : "Demo data not loaded");
        return ResponseEntity.ok(ApiResponse.success("Demo status retrieved", data));
    }
}
