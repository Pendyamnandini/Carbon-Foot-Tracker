import json

# Load profile.json
profile_file = 'C:/Users/Nandi/.gemini/antigravity/scratch/carbon-tracker/frontend/public/locales/en/profile.json'
with open(profile_file, 'r', encoding='utf-8') as f:
    profile_data = json.load(f)

# Update with new keys
profile_updates = {
  "profile.userActivityAudit": "User Activity Audit Trail",
  "profile.filterToday": "Today",
  "profile.filterLast7": "Last 7 Days",
  "profile.filterLast30": "Last 30 Days",
  "profile.filterAllHistory": "All History",
  "profile.action": "Action",
  "profile.description": "Description",
  "profile.page": "Page",
  "profile.dateTime": "Date & Time",
  "profile.noActionsLogged": "No actions logged in this period.",
  "profile.badgesNoBadgesMatching": "No badges found matching the selected filter.",
  "profile.previous": "Previous",
  "profile.next": "Next",
  "recs.personalizedEngine": "Personalized Recommendation Engine",
  "recs.intelligentSuggestions": "Intelligent, data-driven reduction suggestions computed from your logs.",
  "recs.applyRange": "Apply Range",
  "recs.actionDetails": "Details",
  "recs.actionSnooze": "Snooze",
  "recs.actionIgnore": "Ignore",
  "recs.actionImplement": "Implement",
  "recs.actionReactivate": "Reactivate",
  "recs.explanation": "Recommendation Explanation",
  "recs.sustainabilityTip": "Sustainability Tip",
  "recs.categoryTitle": "Category",
  "recs.logActivity": "Log Activity",
  "recs.close": "Close",
  "recs.currentEmission": "Current Emission",
  "recs.reductionPct": "Reduction %",
  "recs.tabMobileApp": "Mobile App",
  "recs.categorySavingsTitle": "Category Savings",
  "recs.topImpactRecs": "Top Impact Recommendations",
  "recs.noDataAnalytics": "No data available for analytics."
}

profile_data.update(profile_updates)
with open(profile_file, 'w', encoding='utf-8') as f:
    json.dump(profile_data, f, indent=2)

print("Updated profile.json")

def replace_in_file(filename, replacements):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old_str, new_str in replacements:
        content = content.replace(old_str, new_str)
        
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

# Replace in AnalyticsPage.js
analytics_file = 'C:/Users/Nandi/.gemini/antigravity/scratch/carbon-tracker/frontend/src/pages/AnalyticsPage.js'
analytics_replacements = [
    ("<InputLabel>Period Type</InputLabel>", "<InputLabel>{t('analytics.inputPeriodType')}</InputLabel>"),
    ("<MenuItem value=\"CUSTOM\">Custom Date Range</MenuItem>", "<MenuItem value=\"CUSTOM\">{t('analytics.customDateRange')}</MenuItem>"),
    ("<InputLabel>Category Filter</InputLabel>", "<InputLabel>{t('analytics.inputCategoryFilter')}</InputLabel>"),
    ("<InputLabel>Select Year</InputLabel>", "<InputLabel>{t('analytics.inputSelectYear')}</InputLabel>"),
    (">Apply Filter<", ">{t('analytics.applyFilter')}<"),
    ("'All Categories'", "t('analytics.catAll')"),
    ("'System-wide summary'", "t('analytics.descAll')"),
    ("'Transport Analytics'", "t('analytics.catTransport')"),
    ("'Vehicles, flights, public transit'", "t('analytics.descTransport')"),
    ("'Electricity Analytics'", "t('analytics.catElectricity')"),
    ("'Household power & heating'", "t('analytics.descElectricity')"),
    ("'Food Analytics'", "t('analytics.catFood')"),
    ("'Dietary choices & agriculture'", "t('analytics.descFood')"),
    ("'Shopping Analytics'", "t('analytics.catShopping')"),
    ("'Goods, apparel & manufacturing'", "t('analytics.descShopping')"),
    ("📊 Emissions Overview KPIs ({selectedCategory})", "{t('analytics.emissionsOverviewKpis')} ({selectedCategory})"),
    ("CO₂ equivalent", "{t('analytics.co2Equivalent')}"),
    ("Per active day ({selectedCategory})", "{t('analytics.perActiveDay')} ({selectedCategory})"),
    ("Projected 7-day average", "{t('analytics.proj7Day')}"),
    ("Projected 30-day average", "{t('analytics.proj30Day')}"),
    ("Baseline comparison", "{t('analytics.baselineComparison')}"),
    ("'No data'", "t('analytics.noData')"),
    ("Trend status:", "{t('analytics.trendStatus')}:"),
    ("🌱 Sustainability Performance & Forecast Metrics ({selectedCategory})", "{t('analytics.sustainabilityPerf')} ({selectedCategory})"),
    (">Sustainability Score<", ">{t('analytics.sustainabilityScore')}<"),
    (">Estimated Annual Trajectory ({selectedCategory})<", ">{t('analytics.estAnnualTrajectory')} ({selectedCategory})<"),
    (">CO₂e annual projected footprint<", ">{t('analytics.co2eAnnualProj')}<"),
    (">Goal Target Success Odds<", ">{t('analytics.goalSuccessOdds')}<"),
    (">Category Intelligence Narrative ({selectedCategory})<", ">{t('analytics.catIntelligenceNarrative')} ({selectedCategory})<"),
    (">Logging activities generates dynamic intelligence insights automatically.<", ">{t('analytics.loggingGeneratesInsights')}<"),
    (">System Category Breakdown<", ">{t('analytics.systemCatBreakdown')}<"),
    ("🔮 Carbon Savings Potential Engine ({selectedCategory})", "{t('analytics.carbonSavingsEngine')} ({selectedCategory})"),
    (">Potential Monthly Reduction<", ">{t('analytics.potentialMonthlyReduction')}<"),
    (">Potential Annual Reduction<", ">{t('analytics.potentialAnnualReduction')}<"),
    ("📈 Predictive Trajectory ({selectedCategory})", "{t('analytics.predictiveTrajectory')} ({selectedCategory})"),
    (">Predicted Next Month Emissions<", ">{t('analytics.predictedNextMonth')}<"),
    (">Predicted Annual Footprint<", ">{t('analytics.predictedAnnual')}<"),
    ("💡 Recommendation Impact Analytics ({selectedCategory})", "{t('analytics.recImpactAnalytics')} ({selectedCategory})"),
    (">Suggested Action<", ">{t('analytics.suggestedAction')}<"),
    (">Category<", ">{t('analytics.category')}<"),
    (">Monthly Savings<", ">{t('analytics.monthlySavings')}<"),
    (">Annual Savings<", ">{t('analytics.annualSavings')}<"),
    (">Difficulty<", ">{t('analytics.difficulty')}<"),
    (">Impact Level<", ">{t('analytics.impactLevel')}<"),
    ("No recommendations found for this category and period. Keep logging activities!", "{t('analytics.noRecsFound')}"),
    ("📅 Activity Logging Heatmap (Consistency Grid)", "{t('analytics.activityHeatmap')}"),
    ("🗺️ Carbon Journey Timeline", "{t('analytics.carbonJourneyTimeline')}"),
    ("kg CO₂e / month", "{t('analytics.kgCo2eMonth')}"),
    ("kg CO₂e / year", "{t('analytics.kgCo2eYear')}"),
    ("kg CO₂e", "{t('analytics.kgCo2e')}"),
    ("kg CO₂", "{t('analytics.kgCo2')}"),
    ("Deep-dive category breakdown", "{t('analytics.subtitle')}"),
    ("{t('analytics.subtitle')} ({selectedCategory}), period comparison, predictive forecasts, and carbon potential engine.", "{t('analytics.subtitle')}"),
    ("activeTrendData.map((item)", "activeTrendData.map((row)")
]
replace_in_file(analytics_file, analytics_replacements)

# Replace in Profile.js
profile_file_js = 'C:/Users/Nandi/.gemini/antigravity/scratch/carbon-tracker/frontend/src/pages/Profile.js'
profile_replacements = [
    (">User Activity Audit Trail<", ">{t('profile.userActivityAudit')}<"),
    (">Today<", ">{t('profile.filterToday')}<"),
    (">Last 7 Days<", ">{t('profile.filterLast7')}<"),
    (">Last 30 Days<", ">{t('profile.filterLast30')}<"),
    (">All History<", ">{t('profile.filterAllHistory')}<"),
    (">Action<", ">{t('profile.action')}<"),
    (">Description<", ">{t('profile.description')}<"),
    (">Page<", ">{t('profile.page')}<"),
    (">Date & Time<", ">{t('profile.dateTime')}<"),
    (">No actions logged in this period.<", ">{t('profile.noActionsLogged')}<"),
    (">Previous<", ">{t('profile.previous')}<"),
    (">Next<", ">{t('profile.next')}<"),
    ("label=\"Mobile App\"", "label={t('recs.tabMobileApp')}"),
    ("historyFilter === 'today' ? 'contained' : 'outlined'", "historyFilter === 'today' ? 'contained' : 'outlined'"),
    ("content = content.filter(act => {", "content = content.filter(row => {")
]
replace_in_file(profile_file_js, profile_replacements)


# Replace in Recommendations.js
recs_file = 'C:/Users/Nandi/.gemini/antigravity/scratch/carbon-tracker/frontend/src/pages/Recommendations.js'
recs_replacements = [
    ("Personalized Recommendation Engine", "{t('recs.personalizedEngine')}"),
    ("Intelligent, data-driven reduction suggestions computed from your logs.", "{t('recs.intelligentSuggestions')}"),
    (">Apply Range<", ">{t('recs.applyRange')}<"),
    (">{t('recs.actionDetails')}<", ">{t('recs.actionDetails')}<"),
    (">Snooze<", ">{t('recs.actionSnooze')}<"),
    (">Ignore<", ">{t('recs.actionIgnore')}<"),
    (">Implement<", ">{t('recs.actionImplement')}<"),
    (">Reactivate<", ">{t('recs.actionReactivate')}<"),
    ("Recommendation Explanation", "{t('recs.explanation')}"),
    ("Sustainability Tip", "{t('recs.sustainabilityTip')}"),
    ("display=\"block\">Category<", "display=\"block\">{t('recs.categoryTitle')}<"),
    (">Log Activity<", ">{t('recs.logActivity')}<"),
    (">Close<", ">{t('recs.close')}<"),
    (">Current Emission<", ">{t('recs.currentEmission')}<"),
    (">Reduction %<", ">{t('recs.reductionPct')}<"),
    (">{t('recs.categorySavingsTitle')}<", ">{t('recs.categorySavingsTitle')}<"),
    (">{t('recs.topImpactRecs')}<", ">{t('recs.topImpactRecs')}<"),
    ("No data available for analytics.", "{t('recs.noDataAnalytics')}")
]
replace_in_file(recs_file, recs_replacements)

print("Replacement complete.")
