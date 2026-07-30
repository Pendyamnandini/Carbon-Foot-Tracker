package com.carbontracker.config;

import com.carbontracker.service.SampleDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoDataInitializer implements CommandLineRunner {

    @Autowired
    private SampleDataService sampleDataService;

    @Value("${spring.profiles.active:dev}")
    private String activeProfiles;

    @Override
    public void run(String... args) throws Exception {
        // If profile contains dev, or database is empty of demo data, automatically seed
        boolean isDevMode = activeProfiles.contains("dev");
        boolean isDataEmpty = !sampleDataService.isDemoDataLoaded();

        if (isDataEmpty && isDevMode) {
            System.out.println(">>> DemoDataInitializer: Dev mode detected and database is empty of demo users. Initializing realistic sample dataset...");
            try {
                sampleDataService.generateDemoData();
                System.out.println(">>> DemoDataInitializer: Realistic demo user dataset successfully generated via application business logic!");
            } catch (Exception e) {
                System.err.println(">>> DemoDataInitializer: Failed to generate demo dataset: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println(">>> DemoDataInitializer: Demo data is already loaded or not in development mode. Seeding skipped.");
        }
    }
}
