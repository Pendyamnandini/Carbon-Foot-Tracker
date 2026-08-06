const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
const translationsPath = path.join(__dirname, 'frontend', 'src', 'components', 'translations.js');

// 1. First, expand translations database with all extra keys
let translationsContent = fs.readFileSync(translationsPath, 'utf8');
let cleanCode = translationsContent
  .replace('const TRANSLATIONS =', 'global.TRANSLATIONS_EVAL =')
  .replace(/export const translate/g, 'const translate')
  .replace(/export default TRANSLATIONS;/g, '');

global.TRANSLATIONS_EVAL = null;
eval(cleanCode);
const TRANSLATIONS = global.TRANSLATIONS_EVAL;

const extraKeys = {
  // Common
  "btn.clear": "Clear",
  
  // Profile
  "profile.genderMale": "Male",
  "profile.genderFemale": "Female",
  "profile.genderOther": "Other",
  "profile.genderPreferNotToSay": "Prefer not to say",
  "profile.savePreferences": "Save Preferences",
  "profile.kilometers": "Kilometers (km)",
  "profile.miles": "Miles (mi)",
  "profile.stateProvince": "State / Province",
  "profile.saveChangesBtn": "Save Profile Changes",
  "profile.rewardsLevelUpInfo": "Gain 100 points to level up. You have accumulated {totalPoints} points overall.",
  "profile.levelProgress": "Level Progress",
  "profile.globalRank": "Global Rank",
  "profile.pointsAccumulated": "Points Accumulated",
  "profile.earningRulesTitle": "Earning Points & Achievements Rules",
  "profile.earningRulesDesc": "Perform active tasks on the platform to raise your rank, earn points, and unlock green achievements.",
  "profile.ruleLogActivities": "Log Carbon Activities",
  "profile.ruleLogActivitiesDesc": "Awarded for any daily carbon activity logs.",
  "profile.ruleCompleteGoals": "Complete Goal Milestones",
  "profile.ruleCompleteGoalsDesc": "Successfully hit 100% on targets.",
  "profile.ruleRecs": "Dynamic Recommendations",
  "profile.ruleRecsDesc": "Implement personalized suggestions.",
  "profile.ruleBadges": "Unlock Badges",
  "profile.ruleBadgesDesc": "Gain milestones like Streaks or Savings.",
  "profile.ruleCerts": "Receive Digital Certificates",
  "profile.ruleCertsDesc": "Earn professional certified badges.",
  "profile.markAllRead": "Mark all read",
  "profile.markRead": "Mark Read",
  "profile.settingsWeeklyDesc": "Receive weekly carbon summary reports",
  "profile.settingsGoalsDesc": "Alert me when I reach 50% or 100% of reduction goals",
  "profile.settingsBadgesDesc": "Notify me when I unlock achievements",
  "profile.settingsLeaderboardDesc": "Receive notifications when my global ranking changes",
  
  // Dashboard
  "dashboard.activityInsights": "Activity Insights (Last 30 Days)",
  "dashboard.highestContributor": "Highest Contributor Category",
  "dashboard.mostLoggedActivity": "Most Logged Activity",
  "dashboard.highestFootprintActivities": "Highest Footprint Activities",
  "dashboard.noActivitiesLoggedRecently": "No activities logged recently.",
  "dashboard.benchmarkingComparison": "Platform Benchmarking Comparison",
  "dashboard.platformAverage": "Platform Average",
  "org.orgAverage": "Organization Average",
  "dashboard.cohortAverage": "Cohort Average (Similar Users)",
  "dashboard.weeklyEmissionsTrend": "Weekly Emissions Trend (All Time)",
  "dashboard.monthlyEmissionsTrend": "Monthly Carbon Footprint Trend (All Time)",
  "dashboard.noMonthlySummaries": "No monthly summaries generated.",
  "dashboard.recentActivitySummary": "Activity Summary",
  "dashboard.lastLoginTime": "LAST LOGIN TIME",
  "dashboard.lastActiveTime": "LAST ACTIVE TIME",
  "dashboard.lastSearchedAnalytics": "LAST SEARCHED ANALYTICS",
  "dashboard.lastDownloadedReport": "LAST DOWNLOADED REPORT",
  "dashboard.lastViewedRecommendation": "LAST VIEWED RECOMMENDATION",
  "dashboard.trendIndicators": "Trend Indicators & Insights",
  "dashboard.dailyTrend": "Daily Trend",
  "dashboard.weeklyTrend": "Weekly Trend",
  "dashboard.monthlyTrend": "Monthly Trend",
  "dashboard.analyticalNotes": "Analytical Notes:",
  "dashboard.noTrendObservations": "No trend observations logged yet.",
  "dashboard.stable": "STABLE",
  "dashboard.improving": "IMPROVING",
  "dashboard.increasing": "INCREASING",
  "dashboard.logMoreToGenerateRecs": "Log more activities to generate personalized reduction recommendations.",
  "dashboard.activityName": "Activity Name",
  "dashboard.activityDescription": "Description",
  "dashboard.noActivitiesRecorded": "No activities recorded yet.",
  "dashboard.mostImpact": "Most impact",
  "dashboard.basedOnLogs": "Based on logs",
  
  // Recommendations extra
  "recs.activeTips": "Active tips",
  "recs.needsAction": "Needs action",
  "recs.potentialMonthlySavings": "Potential Monthly Savings",
  "recs.potentialAnnualSavings": "Potential Annual Savings",
  "recs.calculatedScore": "Calculated score",
  "recs.topSourceCategory": "Top Source Category",
  "recs.highestEmissions": "Highest emissions",
  "recs.completionRate": "Completion rate",
  "recs.goalImpactPotential": "Goal Impact Potential",
  "recs.carbonReduction": "Carbon reduction",
  "recs.personalInsights": "Personal Sustainability Insights",
  "recs.currentEmission": "Current Emission",
  "recs.monthlySavings": "Monthly Savings",
  "recs.reductionPct": "Reduction Pct",
  "recs.topImpactRecs": "Top Impact Recommendations (kg CO₂ Savings)",
  "recs.dialogExplanation": "Recommendation Explanation",
  "recs.dialogTip": "Sustainability Tip",
  "recs.dialogCategory": "Category",
  "recs.dialogImpact": "Impact",
  "recs.dialogConfidence": "AI Confidence",
  "recs.period7Short": "7D",
  "recs.period30Short": "30D",
  "recs.periodCustomShort": "Custom",
  
  // Activity Logging extra
  "activity.logsOnThisDay": "activity logs logged on this day"
};

// Merge extraKeys into all languages
for (const lang in TRANSLATIONS) {
  for (const [key, defaultVal] of Object.entries(extraKeys)) {
    if (!TRANSLATIONS[lang][key]) {
      TRANSLATIONS[lang][key] = defaultVal;
    }
  }
}

let output = "const TRANSLATIONS = " + JSON.stringify(TRANSLATIONS, null, 2) + ";\n\n";
output += `export const translate = (key, lang = 'en') => {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  return dict[key] || TRANSLATIONS['en'][key] || key;
};
export default TRANSLATIONS;
`;
fs.writeFileSync(translationsPath, output, 'utf8');
console.log("Translations expanded successfully!");

// 2. Perform page replacements
const fileReplacements = {
  // BATCH 1 FILES
  "Dashboard.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const Dashboard = () => {", "const Dashboard = () => {\n  const { t } = useTranslation();"],
    ["<Typography variant=\"h4\" fontWeight={800} gutterBottom>\n            Carbon Footprint Analytics\n          </Typography>", "<Typography variant=\"h4\" fontWeight={800} gutterBottom>\n            {t('dashboard.analyticsTitle')}\n          </Typography>"],
    ["<Typography variant=\"body2\" color=\"text.secondary\">\n            Advanced real-time tracking, benchmarking comparisons, and personalized sustainability tips.\n          </Typography>", "<Typography variant=\"body2\" color=\"text.secondary\">\n            {t('dashboard.analyticsSubtitle')}\n          </Typography>"],
    [">Export CSV<", ">{t('dashboard.exportCSV')}<"],
    [">Export PDF<", ">{t('dashboard.exportPDF')}<"],
    ["label=\"Select Date Range Filter\"", "label={t('dashboard.selectDateRangeFilter')}"],
    ["<MenuItem value=\"today\">Today</MenuItem>", "<MenuItem value=\"today\">{t('dashboard.presetToday')}</MenuItem>"],
    ["<MenuItem value=\"yesterday\">Yesterday</MenuItem>", "<MenuItem value=\"yesterday\">{t('dashboard.presetYesterday')}</MenuItem>"],
    ["<MenuItem value=\"last-7\">Last 7 Days</MenuItem>", "<MenuItem value=\"last-7\">{t('dashboard.presetLast7')}</MenuItem>"],
    ["<MenuItem value=\"last-30\">Last 30 Days</MenuItem>", "<MenuItem value=\"last-30\">{t('dashboard.presetLast30')}</MenuItem>"],
    ["<MenuItem value=\"this-month\">This Month</MenuItem>", "<MenuItem value=\"this-month\">{t('dashboard.presetThisMonth')}</MenuItem>"],
    ["<MenuItem value=\"prev-month\">Previous Month</MenuItem>", "<MenuItem value=\"prev-month\">{t('dashboard.presetPrevMonth')}</MenuItem>"],
    ["<MenuItem value=\"custom\">Custom Date Range</MenuItem>", "<MenuItem value=\"custom\">{t('dashboard.presetCustom')}</MenuItem>"],
    ["label=\"From\"", "label={t('dashboard.from')}"],
    ["label=\"To\"", "label={t('dashboard.to')}"],
    [">Search</Button>", ">{t('dashboard.search')}</Button>"],
    ["Period Emissions", "{t('dashboard.periodEmissions')}"],
    ["vs previous", "{t('dashboard.vsPrevious')}"],
    ["Daily Average", "{t('dashboard.dailyAverage')}"],
    ["Total {dateRangeSummary?.activityCount ?? 0} logs tracked", "{t('dashboard.totalLogsTracked')}: {dateRangeSummary?.activityCount ?? 0}"],
    ["Peak/Min Days", "{t('dashboard.peakMinDays')}"],
    ["Max: ", "{t('dashboard.max')}: "],
    ["Min: ", "{t('dashboard.min')}: "],
    ["Period Eco Score", "{t('dashboard.periodEcoScore')}"],
    ["Percentile standing: ", "{t('dashboard.percentileStanding')}: "],
    ["Goal Completion %", "{t('dashboard.goalCompletion')}"],
    ["On track for 2026 targets", "{t('dashboard.activeTargets')}"],
    ["Monthly Carbon Savings", "{t('dashboard.monthlyCarbonSavings')}"],
    ["CO₂e reduced vs baseline", "{t('dashboard.carbonReductions')}"],
    ["Highest Category / Most Improved", "{t('dashboard.highestCategory')}"],
    ["High: Transport (48%)", "{t('dashboard.max')}: Transport (48%)"],
    ["Improved: Food (-12%)", "{t('dashboard.mostImpact')}: Food (-12%)"],
    ["Estimated Annual Footprint", "{t('dashboard.estimatedAnnualFootprint')}"],
    ["CO₂e annual projection", "{t('dashboard.basedOnLogs')}"],
    ["<Tab label=\"Emissions Trends\" />", "<Tab label={t('dashboard.tabEmissionsOverTime')} />"],
    ["<Tab label=\"Category Breakdown\" />", "<Tab label={t('dashboard.tabCategoryBreakdown')} />"],
    ["<Tab label=\"Personalized Recommendations\" />", "<Tab label={t('dashboard.tabRecommendations')} />"],
    ["<Tab label=\"Benchmarking & Insights\" />", "<Tab label={t('dashboard.tabBenchmarking')} />"],
    ["<Tab label=\"Recent Activity History\" />", "<Tab label={t('dashboard.tabRecentLogs')} />"],
    ["Daily Emissions Trend (Selected Period)", "{t('dashboard.chartDailyEmissions')}"],
    ["No activities logged in this range.", "{t('dashboard.noActivities')}"],
    ["Weekly Emissions Trend (All Time)", "{t('dashboard.weeklyEmissionsTrend')}"],
    ["No summaries generated.", "{t('dashboard.noActivities')}"],
    ["Monthly Carbon Footprint Trend (All Time)", "{t('dashboard.monthlyEmissionsTrend')}"],
    ["No monthly summaries generated.", "{t('dashboard.noMonthlySummaries')}"],
    ["Donut Emission Breakdown (Selected Period)", "{t('dashboard.chartEmissionsDist')}"],
    ["Carbon Emissions Distribution", "{t('dashboard.chartEmissionsDist')}"],
    ["Emissions generated by your category choice", "{t('dashboard.emissionsByCategory')}"],
    ["How you compare to similar profiles", "{t('dashboard.howYouCompare')}"],
    ["Your Footprint", "{t('dashboard.yourFootprint')}"],
    ["Peer Average", "{t('dashboard.peerAverage')}"],
    ["National Target", "{t('dashboard.nationalTarget')}"],
    ["Benchmark Comparison (kg CO₂)", "{t('dashboard.chartBenchmarkComparison')}"],
    ["Sustainability Standing", "{t('dashboard.sustainabilityStanding')}"],
    ["You are doing great! Your carbon footprint is below the peer average.", "{t('dashboard.standingSummary')}"],
    ["💡 Actionable Eco-Recommendations", "💡 {t('dashboard.personalizedRecs')}"],
    ["<TableCell>Estimated Savings</TableCell>", "<TableCell>{t('dashboard.estimatedSavings')}</TableCell>"],
    ["<TableCell>Status</TableCell>", "<TableCell>{t('dashboard.status')}</TableCell>"],
    ["<TableCell align=\"right\">Action</TableCell>", "<TableCell align=\"right\">{t('dashboard.action')}</TableCell>"],
    [">Implement</Button>", ">{t('dashboard.implement')}</Button>"],
    [">COMPLETED</Chip>", ">{t('dashboard.completed')}</Chip>"],
    [">ACTIVE</Chip>", ">{t('dashboard.active')}</Chip>"],
    ["Recent Activities (Last 10 Actions)", "{t('dashboard.latestTrackedActions')}"],
    ["<TableCell>Category</TableCell>", "<TableCell>{t('dashboard.activityCategory')}</TableCell>"],
    ["<TableCell>Activity Type</TableCell>", "<TableCell>{t('dashboard.activityType')}</TableCell>"],
    ["<TableCell>Quantity</TableCell>", "<TableCell>{t('dashboard.activityQuantity')}</TableCell>"],
    ["<TableCell>Emissions (kg)</TableCell>", "<TableCell>{t('dashboard.activityEmissions')}</TableCell>"],
    ["<TableCell>Date</TableCell>", "<TableCell>{t('dashboard.activityDate')}</TableCell>"],
    ["No activities logged for this period.", "{t('dashboard.noActivities')}"],
    ["Sign In Again", "{t('dashboard.signInAgain')}"],
    ["Your session token may have expired. Please re-authenticate to load your live analytics data.", "{t('dashboard.sessionExpiredAlert')}"],
    
    // Additional Dashboard replacements
    ["Activity Insights (Last 30 Days)", "{t('dashboard.activityInsights')}"],
    ["Highest Contributor Category", "{t('dashboard.highestContributor')}"],
    ["Most Logged Activity", "{t('dashboard.mostLoggedActivity')}"],
    ["Highest Footprint Activities", "{t('dashboard.highestFootprintActivities')}"],
    ["No activities logged recently.", "{t('dashboard.noActivitiesLoggedRecently')}"],
    ["Log more activities to generate personalized reduction recommendations.", "{t('dashboard.logMoreToGenerateRecs')}"],
    ["Platform Benchmarking Comparison", "{t('dashboard.benchmarkingComparison')}"],
    ["Platform Average", "{t('dashboard.platformAverage')}"],
    ["Organization Average", "{t('org.orgAverage')}"],
    ["Cohort Average (Similar Users)", "{t('dashboard.cohortAverage')}"],
    ["Goal target: {benchmarking?.platformAverage.toFixed(1)} kg avg", "{t('goals.targetReduction')} {benchmarking?.platformAverage.toFixed(1)} kg avg"],
    ["Activity Summary", "{t('dashboard.recentActivitySummary')}"],
    ["LAST LOGIN TIME", "{t('dashboard.lastLoginTime')}"],
    ["LAST ACTIVE TIME", "{t('dashboard.lastActiveTime')}"],
    ["LAST SEARCHED ANALYTICS", "{t('dashboard.lastSearchedAnalytics')}"],
    ["LAST DOWNLOADED REPORT", "{t('dashboard.lastDownloadedReport')}"],
    ["LAST VIEWED RECOMMENDATION", "{t('dashboard.lastViewedRecommendation')}"],
    ["📈 Trend Indicators & Insights", "📈 {t('dashboard.trendIndicators')}"],
    ["Daily Trend", "{t('dashboard.dailyTrend')}"],
    ["Weekly Trend", "{t('dashboard.weeklyTrend')}"],
    ["Monthly Trend", "{t('dashboard.monthlyTrend')}"],
    ["Analytical Notes:", "{t('dashboard.analyticalNotes')}"],
    ["No trend observations logged yet.", "{t('dashboard.noTrendObservations')}"],
    ["label={trends?.dailyTrend || 'STABLE'}", "label={trends?.dailyTrend === 'IMPROVING' ? t('dashboard.improving') : trends?.dailyTrend === 'INCREASING' ? t('dashboard.increasing') : t('dashboard.stable')}"],
    ["label={trends?.weeklyTrend || 'STABLE'}", "label={trends?.weeklyTrend === 'IMPROVING' ? t('dashboard.improving') : trends?.weeklyTrend === 'INCREASING' ? t('dashboard.increasing') : t('dashboard.stable')}"],
    ["label={trends?.monthlyTrend || 'STABLE'}", "label={trends?.monthlyTrend === 'IMPROVING' ? t('dashboard.improving') : trends?.monthlyTrend === 'INCREASING' ? t('dashboard.increasing') : t('dashboard.stable')}"],
    ["Activity Name", "{t('dashboard.activityName')}"],
    ["Date & Time", "{t('dashboard.activityDate')}"],
    ["Description", "{t('dashboard.activityDescription')}"],
    ["No activities recorded yet.", "{t('dashboard.noActivitiesRecorded')}"]
  ],
  "ActivityLogging.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const ActivityLogging = () => {", "const ActivityLogging = () => {\n  const { t } = useTranslation();"],
    ["setError('Could not retrieve activity logs.');", "setError(t('activity.retrieveError'));"],
    ["setSuccess('Activity log updated successfully!');", "setSuccess(t('activity.updateSuccess'));"],
    ["setSuccess('Activity logged successfully!');", "setSuccess(t('activity.logSuccess'));"],
    ["setSuccess('Activity log deleted successfully!');", "setSuccess(t('activity.deleteSuccess'));"],
    ["setError('Quantity cannot be negative');", "setError(t('activity.negativeError'));"],
    ["setError(err.response?.data?.message || 'Logging action failed.');", "setError(err.response?.data?.message || t('activity.failedError'));"],
    ["setError('Deletion failed.');", "setError(t('activity.deleteError'));"],
    ["Log Carbon Footprint Habits", "{t('activity.logTitle')}"],
    ["Track your daily transport, utility, and diet choices to compute your real-time carbon footprint.", "{t('activity.logSubtitle')}"],
    ["label=\"Category\"", "label={t('activity.category')}"],
    ["label=\"Activity Type\"", "label={t('activity.type')}"],
    ["label={`Quantity (${CATEGORIES[category].unit})`}", "label={`${t('activity.quantity')} (${CATEGORIES[category].unit})`}"],
    ["label=\"Log Date\"", "label={t('activity.date')}"],
    ["Cancel", "{t('btn.cancel')}"],
    ["{editId ? 'Update Activity' : 'Log Activity'}", "{editId ? t('activity.updateLog') : t('activity.logBtn')}"],
    ["label=\"Filter by Date\"", "label={t('activity.filterByDate')}"],
    ["Clear", "{t('btn.clear')}"],
    ["Selected Date Standings", "{t('activity.dailySummary')}"],
    ["{filteredLogs.length} activity logs logged on this day", "{filteredLogs.length} {t('activity.logsOnThisDay')}"],
    ["Recent Activities History", "{t('activity.recentLogsTitle')}"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Date</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('activity.date')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Category</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('activity.category')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Activity</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('activity.type')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"right\">Qty</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"right\">{t('activity.quantity')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"right\">Carbon (kg)</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"right\">{t('dashboard.activityEmissions')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"center\">Actions</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"center\">{t('activity.actions')}</TableCell>"],
    ["No logs found.", "{t('activity.noLogs')}"],
    ["window.confirm('Are you sure you want to delete this activity log?')", "window.confirm(t('activity.deleteConfirm'))"]
  ],
  "Goals.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const Goals = () => {", "const Goals = () => {\n  const { t } = useTranslation();"],
    ["setError('Could not retrieve goals.');", "setError(t('goals.retrieveError'));"],
    ["setError('Target reduction percentage must be between 1% and 100%');", "setError(t('goals.validationTarget'));"],
    ["setSuccess('Goal established successfully!');", "setSuccess(t('goals.successCreate'));"],
    ["setError(err.response?.data?.message || 'Failed to establish goal.');", "setError(err.response?.data?.message || t('goals.failCreate'));"],
    ["setSuccess('Goal deleted successfully!');", "setSuccess(t('goals.successDelete'));"],
    ["setError('Goal deletion failed.');", "setError(t('goals.failDelete'));"],
    ["Sustainability Goals", "{t('goals.title')}"],
    ["🎯 Establish Custom Sustainability Goal", "🎯 {t('goals.establishTitle')}"],
    ["label=\"Goal Title (e.g. 15% Commute Reduction)\"", "label={t('goals.formTitle')}"],
    ["label=\"Target Reduction (%)\"", "label={t('goals.formTarget')}"],
    ["label=\"Start Date\"", "label={t('goals.formStart')}"],
    ["label=\"Target End Date\"", "label={t('goals.formEnd')}"],
    ["{loading ? 'Creating...' : 'Create Goal'}", "{loading ? t('goals.formCreating') : t('goals.formSubmit')}"],
    ["Your Goals & Target Progress", "{t('goals.listTitle')}"],
    ["You don't have any active carbon reduction goals.", "{t('goals.noGoals')}"],
    ["{t('goals.targetReduction')} {goal.targetReductionPercentage}% Reduction", "{t('goals.targetReduction')} {goal.targetReductionPercentage}% {t('goals.targetReduction').replace(': ', '')}"],
    ["{goal.startDate} to {goal.targetDate}", "{goal.startDate} {t('goals.to')} {goal.targetDate}"]
  ],
  "Recommendations.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const Recommendations = () => {", "const Recommendations = () => {\n  const { t } = useTranslation();"],
    ["setError('Could not retrieve personalized recommendations.');", "setError(t('recs.retrieveError'));"],
    ["setSuccess(`Recommendation marked as ${newStatus.replace('_', ' ').toLowerCase()}!`);", "setSuccess(t('recs.successUpdate'));"],
    ["setError('Failed to update recommendation status.');", "setError(t('recs.failUpdate'));"],
    ["Personalized Eco Recommendations", "{t('recs.insufficientDataTitle')}"],
    ["We need a little more activity data to generate personalized recommendations. Log at least 3 activities to enable our smart engine.", "{t('recs.insufficientDataDesc')}"],
    ["Go To Activity Logs", "{t('recs.goToLogs')}"],
    ["AI-powered recommendations based on your activity pattern to help you cut carbon emissions.", "{t('recs.subtitle')}"],
    ["<Tab label=\"Active Suggestions\" sx={{ fontWeight: 800 }} />", "<Tab label={t('recs.tabActive')} sx={{ fontWeight: 800 }} />"],
    ["<Tab label=\"Recommendation History\" sx={{ fontWeight: 800 }} />", "<Tab label={t('recs.tabHistory')} sx={{ fontWeight: 800 }} />"],
    ["<Tab label=\"Impact Analytics\" sx={{ fontWeight: 800 }} />", "<Tab label={t('recs.tabAnalytics')} sx={{ fontWeight: 800 }} />"],
    ["label={cat}", "label={cat === 'ALL' ? t('recs.filterAll') : cat === 'TRANSPORT' ? t('dashboard.catTransport') : cat === 'ELECTRICITY' ? t('dashboard.catElectricity') : cat === 'FOOD' ? t('dashboard.catFood') : t('dashboard.catShopping')}"],
    ["7D", "{t('recs.period7Short')}"],
    ["30D", "{t('recs.period30Short')}"],
    ["Custom", "{t('recs.periodCustomShort')}"],
    ["label=\"Start Date\"", "label={t('goals.formStart')}"],
    ["label=\"End Date\"", "label={t('goals.formEnd')}"],
    ["Apply Range", "{t('recs.search')}"],
    ["{ label: 'Total Recs', value: data.totalRecommendations, sub: 'Active tips', color: '#06b6d4' }", "{ label: t('recs.activeRecsCount'), value: data.totalRecommendations, sub: t('recs.activeTips'), color: '#06b6d4' }"],
    ["{ label: 'Critical Priority', value: data.criticalRecommendations, sub: 'Needs action', color: '#ef4444' }", "{ label: t('recs.badgeCritical'), value: data.criticalRecommendations, sub: t('recs.needsAction'), color: '#ef4444' }"],
    ["{ label: 'Potential Monthly Savings', value: `${data.potentialMonthlySavings} kg`, sub: 'CO2 equivalent', color: '#10b981' }", "{ label: t('recs.potentialMonthlySavings'), value: `${data.potentialMonthlySavings} kg`, sub: t('landing.co2Equiv'), color: '#10b981' }"],
    ["{ label: 'Potential Annual Savings', value: `${data.potentialAnnualSavings} kg`, sub: 'CO2 equivalent', color: '#3b82f6' }", "{ label: t('recs.potentialAnnualSavings'), value: `${data.potentialAnnualSavings} kg`, sub: t('landing.co2Equiv'), color: '#3b82f6' }"],
    ["{ label: 'Sustainability Score', value: `${data.sustainabilityScore}/100`, sub: 'Calculated score', color: '#fbbf24' }", "{ label: t('dashboard.periodEcoScore'), value: `${data.sustainabilityScore}/100`, sub: t('recs.calculatedScore'), color: '#fbbf24' }"],
    ["{ label: 'Top Source Category', value: data.highestEmissionCategory, sub: 'Highest emissions', color: '#f87171' }", "{ label: t('recs.topSourceCategory'), value: data.highestEmissionCategory, sub: t('recs.highestEmissions'), color: '#f87171' }"],
    ["{ label: 'Success Rate', value: `${data.recommendationSuccessRate.toFixed(0)}%`, sub: 'Completion rate', color: '#a78bfa' }", "{ label: t('recs.implementationRate'), value: `${data.recommendationSuccessRate.toFixed(0)}%`, sub: t('recs.completionRate'), color: '#a78bfa' }"],
    ["{ label: 'Goal Impact Potential', value: `${data.goalProgressImpact.toFixed(1)}%`, sub: 'Carbon reduction', color: '#ec4899' }", "{ label: t('recs.goalImpactPotential'), value: `${data.goalProgressImpact.toFixed(1)}%`, sub: t('recs.carbonReduction'), color: '#ec4899' }"],
    ["Personal Sustainability Insights", "{t('recs.personalInsights')}"],
    ["No active suggestions in this category. Keep logging activities!", "{t('recs.noActive')}"],
    ["Current Emission", "{t('recs.currentEmission')}"],
    ["Monthly Savings", "{t('recs.monthlySavings')}"],
    ["Reduction Pct", "{t('recs.reductionPct')}"],
    ["Details", "{t('recs.actionDetails')}"],
    ["Later", "{t('recs.actionSnooze')}"],
    ["Ignore", "{t('recs.actionIgnore')}"],
    ["Complete", "{t('recs.actionImplement')}"],
    ["No historical recommendations recorded yet.", "{t('recs.noHistory')}"],
    ["Reactivate", "{t('recs.actionReactivate')}"],
    ["Insufficient data to build charts. Keep logging footprint habits!", "{t('recs.noDataAnalytics')}"],
    ["Savings Potential by Category (kg CO₂/month)", "{t('recs.categorySavingsTitle')}"],
    ["formatter={(value) => [`\\${value} kg`, 'Savings']}", "formatter={(value) => [`\\${value} kg`, t('recs.potentialSavings')]}\n"],
    ["Top Impact Recommendations (kg CO₂ Savings)", "{t('recs.topImpactRecs')}"],
    ["formatter={(value) => [`\\${value} kg`, 'CO₂ Savings']}", "formatter={(value) => [`\\${value} kg`, t('recs.kg')]}\n"],
    ["Recommendation Explanation", "{t('recs.dialogExplanation')}"],
    ["Sustainability Tip", "{t('recs.dialogTip')}"],
    ["Category", "{t('recs.dialogCategory')}"],
    ["Difficulty", "{t('recs.dialogDifficulty')}"],
    ["Impact", "{t('recs.dialogImpact')}"],
    ["AI Confidence", "{t('recs.dialogConfidence')}"],
    ["Estimated Monthly Savings", "{t('recs.potentialMonthlySavings')}"],
    ["Estimated Annual Savings", "{t('recs.potentialAnnualSavings')}"],
    ["Log Activity", "{t('activity.logBtn')}"],
    ["Close", "{t('recs.dialogClose')}"],
    ["{btn.cat}", "{t('dashboard.cat' + btn.cat.charAt(0) + btn.cat.slice(1).toLowerCase())}"],
    ["{ label: 'Log Transport Activity', cat: 'TRANSPORT', color: '#06b6d4' }", "{ label: t('activity.logTitle') + ' (' + t('dashboard.catTransport') + ')', cat: 'TRANSPORT', color: '#06b6d4' }"],
    ["{ label: 'Log Electricity Usage', cat: 'ELECTRICITY', color: '#fbbf24' }", "{ label: t('activity.logTitle') + ' (' + t('dashboard.catElectricity') + ')', cat: 'ELECTRICITY', color: '#fbbf24' }"],
    ["{ label: 'Log Food Activity', cat: 'FOOD', color: '#f87171' }", "{ label: t('activity.logTitle') + ' (' + t('dashboard.catFood') + ')', cat: 'FOOD', color: '#f87171' }"],
    ["{ label: 'Log Shopping Activity', cat: 'SHOPPING', color: '#a78bfa' }", "{ label: t('activity.logTitle') + ' (' + t('dashboard.catShopping') + ')', cat: 'SHOPPING', color: '#a78bfa' }"]
  ],
  "Leaderboard.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const Leaderboard = () => {", "const Leaderboard = () => {\n  const { t } = useTranslation();"],
    ["setError('Could not retrieve leaderboard standings.');", "setError(t('leaderboard.retrieveError'));"],
    ["Community Leaderboard", "{t('leaderboard.title')}"],
    ["🏆 Monthly Emissions Ranking", "🏆 {t('leaderboard.subtitle')}"],
    ["No standings available.", "{t('leaderboard.noUsers')}"],
    ["Active Participant", "{t('leaderboard.activeParticipant')}"],
    ["kg CO2 logged", "{t('leaderboard.savings')}"],
    ["🏅 Your Earned Achievements", "🏅 {t('profile.tabAchievements')}"],
    ["No Badges Earned Yet", "{t('profile.badgesLocked')}"],
    ["Log daily activities and complete your target reduction goals to unlock community accomplishments!", "{t('profile.badgesLockedDesc')}"],
    ["Awarded: ", "{t('profile.badgesEarnedOn')}"]
  ],
  "Feedback.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const Feedback = () => {", "const Feedback = () => {\n  const { t } = useTranslation();"],
    ["setSuccess('Feedback submitted successfully! Thank you for helping us improve.');", "setSuccess(t('feedback.successMsg'));"],
    ["setError('Failed to submit feedback.');", "setError(t('feedback.errorMsg'));"],
    ["Submit Platform Feedback", "{t('feedback.title')}"],
    ["Help us improve Carbon Tracker. Share your experience, report bugs, or request features.", "{t('feedback.subtitle')}"],
    ["label=\"Feedback Category\"", "label={t('feedback.formCategory')}"],
    ["label=\"Star Rating (1-5)\"", "label={t('feedback.formRating')}"],
    ["label=\"Written Feedback\"", "label={t('feedback.formText')}"],
    ["{loading ? 'Submitting...' : 'Submit Feedback'}", "{loading ? t('feedback.submitting') : t('feedback.formSubmit')}"]
  ],
  "LoginPage.js": [
    ["import { useAuth } from '../context/AuthContext';", "import { useAuth } from '../context/AuthContext';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const LoginPage = () => {", "const LoginPage = () => {\n  const { t } = useTranslation();"],
    ["Measure, Reduce, and <Box component=\"span\" sx={{ color: 'primary.main' }}>Offset</Box> Your Footprint.", "{t('auth.loginHeroTitle')}"],
    ["Join thousands of community members logging their daily activities, competing on the leaderboard, and completing carbon reduction goals.", "{t('auth.loginHeroDesc')}"],
    ["TONS CO2 SAVED", "{t('auth.tonsSaved')}"],
    ["ACTIVITIES LOGGED", "{t('auth.activitiesLogged')}"],
    ["Sign in to manage your carbon footprint logs and tracker.", "{t('auth.loginSubtitle')}"],
    ["label=\"Email Address\"", "label={t('auth.email')}"],
    ["label=\"Password\"", "label={t('auth.password')}"],
    ["Forgot Password?", "{t('auth.forgot_password')}"],
    ["{loading ? 'Signing in...' : 'Sign In'}", "{loading ? t('auth.loggingIn') : t('auth.login')}"],
    ["<Divider>Or</Divider>", "<Divider>{t('auth.or')}</Divider>"],
    ["Sign In with Google", "{t('auth.googleLogin')}"],
    ["Don't have an account?", "{t('auth.noAccount')}"],
    ["Register here", "{t('auth.registerHere')}"]
  ],
  "RegisterPage.js": [
    ["import { useAuth } from '../context/AuthContext';", "import { useAuth } from '../context/AuthContext';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const RegisterPage = () => {", "const RegisterPage = () => {\n  const { t } = useTranslation();"],
    ["Start Your <Box component=\"span\" sx={{ color: 'primary.main' }}>Green</Box> Journey Today.", "{t('auth.registerHeroTitle')}"],
    ["Create your account to unlock personalized recommendations, track your sustainability logs, and visualize progress in real-time.", "{t('auth.registerHeroDesc')}"],
    ["Did you know?", "{t('auth.didYouKnow')}"],
    ["Logging activities daily helps build eco-conscious habits. Average users reduce their carbon output by 15% in their first month!", "{t('auth.didYouKnowDesc')}"],
    ["Join the carbon tracking platform and begin measuring impact.", "{t('auth.registerSubtitle')}"],
    ["label=\"Full Name\"", "label={t('auth.fullName')}"],
    ["label=\"Email Address\"", "label={t('auth.email')}"],
    ["label=\"Mobile Number\"", "label={t('auth.mobileNumber')}"],
    ["label=\"Password\"", "label={t('auth.password')}"],
    ["label=\"Confirm Password\"", "label={t('auth.confirmPassword')}"],
    ["{loading ? 'Registering...' : 'Register'}", "{loading ? t('auth.registering') : t('auth.register')}"],
    ["Already have an account?", "{t('auth.hasAccount')}"],
    ["Sign in here", "{t('auth.loginHere')}"],
    ["return \"Password must be at least 8 characters long.\";", "return t('auth.validationPasswordLength');"],
    ["return \"Password must be alphanumeric (contain both letters and numbers).\";", "return t('auth.validationPasswordAlphanumeric');"],
    ["return \"Password must contain at least one special character (e.g. @, #, $, %, etc.).\";", "return t('auth.validationPasswordSpecial');"],
    ["setError(\"Passwords do not match\");", "setError(t('profile.passwordMatchError'));"],
    ["setSuccess(\"Registration completed! Redirecting to login...\");", "setSuccess(t('auth.registrationSuccess'));"]
  ],
  "ForgotPasswordPage.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const ForgotPasswordPage = () => {", "const ForgotPasswordPage = () => {\n  const { t } = useTranslation();"],
    ["Forgot Password", "{t('auth.forgotPasswordTitle')}"],
    ["Enter your registered email address to receive a 6-digit verification code.", "{t('auth.forgotPasswordSubtitle')}"],
    ["label=\"Email Address\"", "label={t('auth.email')}"],
    ["{loading ? 'Sending OTP...' : 'Send OTP'}", "{loading ? t('auth.forgotPasswordSending') : t('auth.forgotPasswordBtn')}"],
    ["Back to Sign In", "{t('auth.loginHere')}"]
  ],
  "OtpVerificationPage.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const OtpVerificationPage = () => {", "const OtpVerificationPage = () => {\n  const { t } = useTranslation();"],
    ["Verify OTP", "{t('auth.otpTitle')}"],
    ["Enter the 6-digit code sent to <strong>{email}</strong>.", "<Box component=\"span\">{t('auth.otpSubtitle')} <strong>{email}</strong></Box>"],
    ["label=\"Email Address\"", "label={t('auth.email')}"],
    ["label=\"6-Digit OTP\"", "label={t('auth.otpLabel')}"],
    ["{loading ? 'Verifying...' : 'Verify Code'}", "{loading ? t('auth.otpsending') : t('auth.otpBtnVerify')}"],
    ["Resend OTP", "{t('auth.resendOtp')}"],
    ["Back to Sign In", "{t('auth.loginHere')}"]
  ],
  "ResetPasswordPage.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const ResetPasswordPage = () => {", "const ResetPasswordPage = () => {\n  const { t } = useTranslation();"],
    ["Reset Password", "{t('auth.resetPasswordTitle')}"],
    ["Set your new account password.", "{t('auth.resetPasswordSubtitle')}"],
    ["label=\"New Password\"", "label={t('profile.settingsNewPassword')}"],
    ["label=\"Confirm Password\"", "label={t('auth.confirmPassword')}"],
    ["{loading ? 'Updating Password...' : 'Reset Password'}", "{loading ? t('auth.resetPasswordSending') : t('auth.resetPasswordBtn')}"],
    ["Back to Sign In", "{t('auth.loginHere')}"],
    ["setError('Passwords do not match');", "setError(t('profile.passwordMatchError'));"]
  ],
  "Profile.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const Profile = () => {", "const SUPPORTED_LANGUAGES = [\n  { code: 'en', label: 'English' },\n  { code: 'hi', label: 'हिंदी (Hindi)' },\n  { code: 'te', label: 'తెలుగు (Telugu)' },\n  { code: 'ta', label: 'தமிழ் (Tamil)' },\n  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },\n  { code: 'ml', label: 'മലയാളം (Malayalam)' },\n  { code: 'mr', label: 'मराठी (Marathi)' },\n  { code: 'gu', label: 'ગુજરાती (Gujarati)' },\n  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },\n  { code: 'bn', label: 'বাংলা (Bengali)' },\n  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },\n  { code: 'ur', label: 'اردو (Urdu)' },\n  { code: 'es', label: 'Español (Spanish)' },\n  { code: 'fr', label: 'Français (French)' },\n  { code: 'de', label: 'Deutsch (German)' },\n  { code: 'it', label: 'Italiano (Italian)' },\n  { code: 'pt', label: 'Português (Portuguese)' },\n  { code: 'nl', label: 'Nederlands (Dutch)' },\n  { code: 'ru', label: 'Русский (Russian)' },\n  { code: 'tr', label: 'Türkçe (Turkish)' },\n  { code: 'ar', label: 'العربية (Arabic)' },\n  { code: 'he', label: 'עברית (Hebrew)' },\n  { code: 'fa', label: 'فارسی (Persian)' },\n  { code: 'zh_CN', label: '简体中文' },\n  { code: 'zh_TW', label: '繁體中文' },\n  { code: 'ja', label: '日本語 (Japanese)' },\n  { code: 'ko', label: '한국어 (Korean)' },\n  { code: 'th', label: 'ไทย (Thai)' },\n  { code: 'vi', label: 'Tiếng Việt (Vietnamese)' },\n  { code: 'id', label: 'Bahasa Indonesia' },\n  { code: 'ms', label: 'Bahasa Melayu' }\n];\n\nconst Profile = () => {\n  const { t, lang, changeLanguage } = useTranslation();"],
    ["weeklyDigest: true,\n    goalAlerts: true,\n    badgeAlerts: true,\n    leaderboardAlerts: true,\n    language: 'en',", "weeklyDigest: true,\n    goalAlerts: true,\n    badgeAlerts: true,\n    leaderboardAlerts: true,\n    language: lang,"],
    ["  const handleSaveSettings = () => {\n    localStorage.setItem('userSettings', JSON.stringify(settings));\n    setSuccess('Settings saved successfully!');\n  };", "  const handleSaveSettings = () => {\n    localStorage.setItem('userSettings', JSON.stringify(settings));\n    changeLanguage(settings.language);\n    setSuccess(t('profile.successUpdate'));\n  };\n\n  useEffect(() => {\n    setSettings(prev => ({ ...prev, language: lang }));\n  }, [lang]);"],
    ["User Profile Center", "{t('profile.title')}"],
    ["Edit Profile Details", "{t('profile.editTitle')}"],
    ["label=\"Full Name\"", "label={t('profile.fullName')}"],
    ["label=\"Mobile Number\"", "label={t('profile.mobileNumber')}"],
    ["label=\"Date of Birth\"", "label={t('profile.dob')}"],
    ["<InputLabel>Gender</InputLabel>", "<InputLabel>{t('profile.gender')}</InputLabel>"],
    ["label=\"Gender\"", "label={t('profile.gender')}"],
    ["<MenuItem value=\"MALE\">Male</MenuItem>", "<MenuItem value=\"MALE\">{t('profile.genderMale')}</MenuItem>"],
    ["<MenuItem value=\"FEMALE\">Female</MenuItem>", "<MenuItem value=\"FEMALE\">{t('profile.genderFemale')}</MenuItem>"],
    ["<MenuItem value=\"OTHER\">Other</MenuItem>", "<MenuItem value=\"OTHER\">{t('profile.genderOther')}</MenuItem>"],
    ["<MenuItem value=\"PREFER_NOT_TO_SAY\">Prefer not to say</MenuItem>", "<MenuItem value=\"PREFER_NOT_TO_SAY\">{t('profile.genderPreferNotToSay')}</MenuItem>"],
    ["label=\"Country\"", "label={t('profile.country')}"],
    ["label=\"State / Province\"", "label={t('profile.stateProvince')}"],
    ["label=\"City\"", "label={t('profile.city')}"],
    ["label=\"Sustainability Preferences (e.g. Vegetarian, EV Driver, Solar Panels)\"", "label={t('profile.preferences')}"],
    ["Save Profile Changes", "{t('profile.saveChangesBtn')}"],
    ["Saving...", "{t('profile.saving')}"],
    ["Profile updated successfully!", "t('profile.successUpdate')"],
    ["Failed to update profile info.", "t('profile.errorUpdate')"],
    ["Tracked Carbon Log History", "{t('profile.historyTitle')}"],
    ["label=\"All Logs\"", "label={t('profile.historyFilterAll')}"],
    ["label=\"Today\"", "label={t('profile.historyFilterToday')}"],
    ["label=\"Last 7 Days\"", "label={t('profile.historyFilter7')}"],
    ["label=\"Last 30 Days\"", "label={t('profile.historyFilter30')}"],
    ["Page ", "t('profile.historyPage')"],
    [" of ", " + t('profile.historyOf') + "],
    ["Your Carbon Badges Portfolio", "{t('profile.badgesTitle')}"],
    ["label=\"Unlocked Badges\"", "label={t('profile.badgesUnlocked')}"],
    ["label=\"Locked Badges\"", "label={t('profile.badgesLocked')}"],
    ["label=\"All Badges\"", "label={t('profile.badgesAll')}"],
    ["Earned on: ", "t('profile.badgesEarnedOn')"],
    ["Locked - Complete objectives to earn this badge", "{t('profile.badgesLockedDesc')}"],
    ["Carbon Mitigations Digital Certificates", "{t('profile.certsTitle')}"],
    ["Tamper-proof credentials certifying your commitment to lowering carbon emissions.", "{t('profile.certsSubtitle')}"],
    ["Issued: ", "t('profile.certsIssued')"],
    ["Verified Secure Document", "{t('profile.certsVerified')}"],
    ["View Secure Doc", "{t('profile.certsViewDoc')}"],
    ["Share Certificate", "{t('profile.certsShare')}"],
    ["Share link copied to clipboard!", "t('profile.certsCopied')"],
    ["You have not earned any certificates yet. Achieve goals to generate verified certificates.", "{t('profile.certsNoCerts')}"],
    ["Secure Digital Green Certificate", "{t('profile.certsModalTitle')}"],
    ["Certificate ID: ", "t('profile.certsModalId')"],
    ["Issued To: ", "t('profile.certsModalIssuedTo')"],
    ["Certified Mitigated Carbon: ", "t('profile.certsModalEmissions')"],
    ["Verification Link: ", "t('profile.certsModalVerifyUrl')"],
    ["Print Certificate", "{t('profile.certsModalPrint')}"],
    ["Gamified Achievements", "{t('profile.achieveTitle')}"],
    ["Unlocked Achievements", "{t('profile.achieveUnlocked')}"],
    ["Unlocked: ", "t('profile.achieveDate')"],
    ["Ecological Reward Center", "{t('profile.rewardsTitle')}"],
    ["Total Points", "{t('profile.rewardsPoints')}"],
    ["Account Level: ", "t('profile.rewardsLevel')"],
    ["Current Global Rank: ", "t('profile.rewardsCurrentRank')"],
    ["System Notification Logs", "{t('profile.notifsTitle')}"],
    ["No notifications found.", "{t('profile.notifsNoNotifs')}"],
    ["Platform Notification Preferences", "{t('profile.settingsTitle')}"],
    ["Weekly Carbon Digest Email", "{t('profile.settingsWeekly')}"],
    ["Goal Milestone Alerts", "{t('profile.settingsGoals')}"],
    ["New Badges & Rewards Notifications", "{t('profile.settingsBadges')}"],
    ["Leaderboard Rank Updates", "{t('profile.settingsLeaderboard')}"],
    ["Interface Display Language", "{t('profile.settingsLanguage')}"],
    ["Preferred Currency", "{t('profile.settingsCurrency')}"],
    ["Distance Metrics Unit", "{t('profile.settingsDistance')}"],
    ["Security / Update Password", "{t('profile.settingsChangePassword')}"],
    ["label=\"Old Password\"", "label={t('profile.settingsOldPassword')}"],
    ["label=\"New Password\"", "label={t('profile.settingsNewPassword')}"],
    ["label=\"Confirm New Password\"", "label={t('profile.settingsConfirmPassword')}"],
    ["Update Account Password", "{t('profile.settingsUpdatePasswordBtn')}"],
    ["Password updated successfully!", "t('profile.passwordSuccess')"],
    ["Failed to update password. Please check your credentials.", "t('profile.passwordFail')"],
    ["New passwords do not match", "t('profile.passwordMatchError')"],
    ["Save Preferences", "{t('profile.saveChanges')}"],
    ["<MenuItem value=\"km\">Kilometers (km)</MenuItem>", "<MenuItem value=\"km\">{t('profile.kilometers')}</MenuItem>"],
    ["<MenuItem value=\"mi\">Miles (mi)</MenuItem>", "<MenuItem value=\"mi\">{t('profile.miles')}</MenuItem>"],
    ["<Tab label=\"Edit Profile\" sx={{ fontWeight: 800 }} />", "<Tab label={t('profile.tabProfile')} sx={{ fontWeight: 800 }} />"],
    ["<Tab label=\"Activity History\" sx={{ fontWeight: 800 }} />", "<Tab label={t('profile.tabHistory')} sx={{ fontWeight: 800 }} />"],
    ["<Tab label=\"Badges\" sx={{ fontWeight: 800 }} />", "<Tab label={t('profile.tabBadges')} sx={{ fontWeight: 800 }} />"],
    ["<Tab label=\"Certificates\" sx={{ fontWeight: 800 }} />", "<Tab label={t('profile.tabCertificates')} sx={{ fontWeight: 800 }} />"],
    ["<Tab label=\"Achievements\" sx={{ fontWeight: 800 }} />", "<Tab label={t('profile.tabAchievements')} sx={{ fontWeight: 800 }} />"],
    ["<Tab label=\"Rewards Progress\" sx={{ fontWeight: 800 }} />", "<Tab label={t('profile.tabRewards')} sx={{ fontWeight: 800 }} />"],
    ["<Tab label=\"Notification History\" sx={{ fontWeight: 800 }} />", "<Tab label={t('profile.tabNotifications')} sx={{ fontWeight: 800 }} />"],
    ["<Tab label=\"Settings\" sx={{ fontWeight: 800 }} />", "<Tab label={t('profile.tabSettings')} sx={{ fontWeight: 800 }} />"],
    
    // Select languages block replacement
    ["<FormControl fullWidth size=\"small\">\n                        <InputLabel>Language</InputLabel>\n                        <Select\n                          label=\"Language\"\n                          value={settings.language}\n                          onChange={(e) => handleSettingsChange('language', e.target.value)}\n                        >\n                          <MenuItem value=\"en\">English</MenuItem>\n                          <MenuItem value=\"es\">Español</MenuItem>\n                          <MenuItem value=\"fr\">Français</MenuItem>\n                          <MenuItem value=\"de\">Deutsch</MenuItem>\n                        </Select>\n                      </FormControl>", "<FormControl fullWidth size=\"small\">\n                        <InputLabel>{t('profile.settingsLanguage')}</InputLabel>\n                        <Select\n                          label={t('profile.settingsLanguage')}\n                          value={settings.language}\n                          onChange={(e) => handleSettingsChange('language', e.target.value)}\n                        >\n                          {SUPPORTED_LANGUAGES.map((item) => (\n                            <MenuItem key={item.code} value={item.code}>\n                              {item.label}\n                            </MenuItem>\n                          ))}\n                        </Select>\n                      </FormControl>"],
    
    // Extra translations for profile
    ["Gain 100 points to level up. You have accumulated {rewards.totalPoints} points overall.", "{t('profile.rewardsLevelUpInfo').replace('{totalPoints}', rewards.totalPoints)}"],
    ["Level Progress", "{t('profile.levelProgress')}"],
    ["Global Rank", "{t('profile.globalRank')}"],
    ["Points Accumulated", "{t('profile.pointsAccumulated')}"],
    ["Earning Points & Achievements Rules", "{t('profile.earningRulesTitle')}"],
    ["Perform active tasks on the platform to raise your rank, earn points, and unlock green achievements.", "{t('profile.earningRulesDesc')}"],
    ["{ label: 'Log Carbon Activities', pts: '+10 points', desc: 'Awarded for any daily daily carbon activity logs.' }", "{ label: t('profile.ruleLogActivities'), pts: '+10 ' + t('org.points'), desc: t('profile.ruleLogActivitiesDesc') }"],
    ["{ label: 'Complete Goal Milestones', pts: '+50 points', desc: 'Successfully hit 100% on targets.' }", "{ label: t('profile.ruleCompleteGoals'), pts: '+50 ' + t('org.points'), desc: t('profile.ruleCompleteGoalsDesc') }"],
    ["{ label: 'Dynamic Recommendations', pts: '+30 points', desc: 'Implement personalized suggestions.' }", "{ label: t('profile.ruleRecs'), pts: '+30 ' + t('org.points'), desc: t('profile.ruleRecsDesc') }"],
    ["{ label: 'Unlock Badges', pts: '+20 points', desc: 'Gain milestones like Streaks or Savings.' }", "{ label: t('profile.ruleBadges'), pts: '+20 ' + t('org.points'), desc: t('profile.ruleBadgesDesc') }"],
    ["{ label: 'Receive Digital Certificates', pts: '+100 points', desc: 'Earn professional certified badges.' }", "{ label: t('profile.ruleCerts'), pts: '+100 ' + t('org.points'), desc: t('profile.ruleCertsDesc') }"],
    ["Notifications & History", "{t('profile.tabNotifications')}"],
    ["Mark all read", "{t('profile.markAllRead')}"],
    ["No notification logs recorded.", "{t('profile.notifsNoNotifs')}"],
    ["Mark Read", "{t('profile.markRead')}"],
    ["Preferences & Customization", "{t('profile.settingsTitle')}"],
    ["Weekly Digest Email", "{t('profile.settingsWeekly')}"],
    ["Receive weekly carbon summary reports", "{t('profile.settingsWeeklyDesc')}"],
    ["Goal Milestone Alerts", "{t('profile.settingsGoals')}"],
    ["Alert me when I reach 50% or 100% of reduction goals", "{t('profile.settingsGoalsDesc')}"],
    ["New Badges & Rewards Notifications", "{t('profile.settingsBadges')}"],
    ["Notify me when I unlock achievements", "{t('profile.settingsBadgesDesc')}"],
    ["Leaderboard Rank Updates", "{t('profile.settingsLeaderboard')}"],
    ["Receive notifications when my global ranking changes", "{t('profile.settingsLeaderboardDesc')}"],
    ["<InputLabel>Offset Currency</InputLabel>", "<InputLabel>{t('profile.settingsCurrency')}</InputLabel>"],
    ["label=\"Offset Currency\"", "label={t('profile.settingsCurrency')}"],
    ["<InputLabel>Distance Unit</InputLabel>", "<InputLabel>{t('profile.settingsDistance')}</InputLabel>"],
    ["label=\"Distance Unit\"", "label={t('profile.settingsDistance')}"],
    ["Security & Password", "{t('profile.settingsChangePassword')}"],
    ["label=\"Current Password\"", "label={t('profile.settingsOldPassword')}"],
    ["label=\"New Password\"", "label={t('profile.settingsNewPassword')}"],
    ["label=\"Confirm New Password\"", "label={t('profile.settingsConfirmPassword')}"],
    ["{passwordLoading ? 'Updating...' : 'Change Password'}", "{passwordLoading ? t('profile.saving') : t('profile.settingsUpdatePasswordBtn')}"],
    ["Save Preferences", "{t('profile.savePreferences')}"],
    
    // Typo in rules list fix
    ["{ label: 'Log Carbon Activities', pts: '+10 points', desc: 'Awarded for any daily carbon activity logs.' }", "{ label: t('profile.ruleLogActivities'), pts: '+10 ' + t('org.points'), desc: t('profile.ruleLogActivitiesDesc') }"]
  ],

  // BATCH 2 FILES
  "AnalyticsPage.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const AnalyticsPage = () => {", "const AnalyticsPage = () => {\n  const { t } = useTranslation();"],
    ["Advanced Analytics & Intelligence", "{t('analytics.title')}"],
    ["Deep-dive category breakdown, period comparison, predictive forecasts, and carbon potential engine.", "{t('analytics.subtitle')}"],
    ["Download CSV", "{t('dashboard.exportCSV')}"],
    ["Download PDF", "{t('dashboard.exportPDF')}"],
    ["label=\"Period Type\"", "label={t('analytics.periodType')}"],
    ["<MenuItem value=\"DAILY\">Daily Analytics</MenuItem>", "<MenuItem value=\"DAILY\">{t('analytics.dailyAnalytics')}</MenuItem>"],
    ["<MenuItem value=\"WEEKLY\">Weekly Analytics</MenuItem>", "<MenuItem value=\"WEEKLY\">{t('analytics.weeklyAnalytics')}</MenuItem>"],
    ["<MenuItem value=\"MONTHLY\">Monthly Analytics</MenuItem>", "<MenuItem value=\"MONTHLY\">{t('analytics.monthlyAnalytics')}</MenuItem>"],
    ["<MenuItem value=\"YEARLY\">Yearly Analytics</MenuItem>", "<MenuItem value=\"YEARLY\">{t('analytics.yearlyAnalytics')}</MenuItem>"],
    ["label=\"Select Date\"", "label={t('analytics.selectDate')}"],
    ["label=\"Select Week\"", "label={t('analytics.selectWeek')}"],
    ["label=\"Select Month\"", "label={t('analytics.selectMonth')}"],
    ["label=\"Select Year\"", "label={t('analytics.selectYear')}"],
    ["label=\"Category Filter\"", "label={t('analytics.categoryFilter')}"],
    ["label=\"Start Date\"", "label={t('analytics.startDate')}"],
    ["label=\"End Date\"", "label={t('analytics.endDate')}"],
    ["<MenuItem value=\"ALL\">All Categories</MenuItem>", "<MenuItem value=\"ALL\">{t('recs.filterAll')}</MenuItem>"],
    ["<MenuItem value=\"TRANSPORT\">Transport Analytics</MenuItem>", "<MenuItem value=\"TRANSPORT\">{t('analytics.transportAnalytics')}</MenuItem>"],
    ["<MenuItem value=\"ELECTRICITY\">Electricity Analytics</MenuItem>", "<MenuItem value=\"ELECTRICITY\">{t('analytics.electricityAnalytics')}</MenuItem>"],
    ["<MenuItem value=\"FOOD\">Food Analytics</MenuItem>", "<MenuItem value=\"FOOD\">{t('analytics.foodAnalytics')}</MenuItem>"],
    ["<MenuItem value=\"SHOPPING\">Shopping Analytics</MenuItem>", "<MenuItem value=\"SHOPPING\">{t('analytics.shoppingAnalytics')}</MenuItem>"],
    ["<Tab label=\"KPI Overview & Deep Insights\" icon={<SpeedIcon />} iconPosition=\"start\" />", "<Tab label={t('analytics.tabKpiOverview')} icon={<SpeedIcon />} iconPosition=\"start\" />"],
    ["<Tab label=\"Breakdown & Comparison Charts\" icon={<AutoGraphIcon />} iconPosition=\"start\" />", "<Tab label={t('analytics.tabBreakdownCharts')} icon={<AutoGraphIcon />} iconPosition=\"start\" />"],
    ["<Tab label=\"Forecasts & Recommendations\" icon={<TrendingDownIcon />} iconPosition=\"start\" />", "<Tab label={t('analytics.tabForecastsRecs')} icon={<TrendingDownIcon />} iconPosition=\"start\" />"],
    ["<Tab label=\"Activity Heatmap & Timeline\" icon={<TimelineIcon />} iconPosition=\"start\" />", "<Tab label={t('analytics.tabHeatmapTimeline')} icon={<TimelineIcon />} iconPosition=\"start\" />"],
    ["<Tab label=\"Benchmarking BI\" icon={<EqualizerIcon />} iconPosition=\"start\" />", "<Tab label={t('analytics.tabBenchmarkingBi')} icon={<EqualizerIcon />} iconPosition=\"start\" />"],
    ["Total Period Emissions", "{t('analytics.totalPeriodCarbonFootprint')}"],
    ["Daily Average Emissions", "{t('analytics.dailyAverage')}"],
    ["Weekly Average Emissions", "{t('analytics.weeklyAverage')}"],
    ["Monthly Average Emissions", "{t('analytics.monthlyAverage')}"],
    ["Previous Period Emissions", "{t('analytics.previousPeriod')}"],
    ["Peak Emission Point", "{t('analytics.peakDay')}"],
    ["Lowest Emission Point", "{t('analytics.lowestDay')}"],
    ["Period Difference & Change", "{t('analytics.periodOverPeriod')}"],
    ["label={sustainabilityScore >= 80 ? \"Excellent\" : sustainabilityScore >= 60 ? \"Good\" : \"Needs Improvement\"}", "label={sustainabilityScore >= 80 ? t('analytics.excellent') : sustainabilityScore >= 60 ? t('analytics.good') : t('analytics.needsImprovement')}"],
    ["label=\"Calculated Odds\"", "label={t('analytics.calculatedOdds')}"]
  ],
  "LandingPage.js": [
    ["import { ColorModeContext } from '../App';", "import { ColorModeContext } from '../App';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const LandingPage = () => {", "const LandingPage = () => {\n  const { t } = useTranslation();"],
    ["Empower Your Journey To <Box component=\"span\" sx={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zero Emissions</Box>", "{t('landing.heroTitle')}"],
    ["Track daily activities across transport, electricity, food, and shopping. Benefit from real-time analytics, predictive forecasting, automated goal alerts, and enterprise benchmarking.", "{t('landing.heroSubtitle')}"],
    ["Get Started Free", "{t('landing.getStarted')}"],
    ["Sign In to Portal", "{t('auth.login')}"],
    ["Enterprise Ecological Intelligence", "{t('landing.featuresTitle')}"],
    ["title: 'Automated Activity Logging',", "title: t('landing.feature1Title'),"],
    ["description: 'Log transport, electricity, food, and shopping habits effortlessly with intelligent real-time carbon conversion factors.',", "description: t('landing.feature1Desc'),"],
    ["title: 'Category Intelligence & Forecasts',", "title: t('landing.feature2Title'),"],
    ["description: 'Deep dive into 4 core emission categories with predictive trend lines, peak day analysis, and YoY period comparisons.',", "description: t('landing.feature2Desc'),"],
    ["title: 'Personalized Recommendations',", "title: t('dashboard.tabRecommendations'),"],
    ["description: 'Get actionable eco-tips calculated with estimated monthly and annual carbon savings tailored to your consumption habits.',", "description: t('dashboard.tailoredRecsSubtitle'),"],
    ["title: 'Leaderboard & Achievements',", "title: t('profile.tabAchievements'),"],
    ["description: 'Earn gamified eco-badges (Eco Saver, 7-Day Streak) and climb the platform rankings as you reduce your footprint.',", "description: t('leaderboard.subtitle'),"],
    ["title: 'Enterprise Benchmarking',", "title: t('nav.benchmarking'),"],
    ["description: 'Compare your progress against platform averages and organization benchmarks with percentile ranking insights.',", "description: t('dashboard.howYouCompare'),"],
    ["title: 'Audit-Ready Export Center',", "title: t('nav.reports'),"],
    ["description: 'Generate comprehensive PDF and CSV sustainability compliance reports for personal audit or enterprise reporting.',", "description: t('dashboard.analyticsSubtitle'),"],
    ["What Sustainability Advocates Say", "{t('landing.testimonialsTitle')}"],
    ["Real impact stories from businesses and individuals using CarbonTracker.", "{t('landing.testimonialsSubtitle')}"],
    ["Ready to Offset Your Footprint?", "{t('landing.ctaTitle')}"],
    ["Join a global community tracking Scope 1, 2, and 3 carbon emissions. Completely free for development and demonstration.", "{t('landing.ctaDesc')}"],
    ["Start Tracking Free", "{t('landing.ctaBtn')}"],
    ["label: 'Total Emissions Tracked', value: '1,245,800 kg', subtext: 'CO₂ equivalent'", "label: t('landing.statsTotalEmissions'), value: '1,245,800 kg', subtext: t('landing.co2Equiv')"],
    ["label: 'Active Eco Warriors', value: '28,400+', subtext: 'Global users'", "label: t('landing.statsActiveWarriors'), value: '28,400+', subtext: t('landing.globalUsers')"],
    ["label: 'Sustainability Goals', value: '14,250', subtext: 'Achieved this year'", "label: t('landing.statsGoals'), value: '14,250', subtext: t('landing.achievedThisYear')"],
    ["label: 'Net Carbon Saved', value: '382,500 kg', subtext: 'Verified reduction'", "label: t('landing.statsCarbonSaved'), value: '382,500 kg', subtext: t('landing.verifiedReduction')"],
    ["Why Carbon Footprint Monitoring Matters", "{t('landing.awarenessTitle')}"],
    ["Human activities generate greenhouse gases that accelerate global climate change. Every commute, electricity bill, dietary choice, and retail purchase carries a hidden carbon cost.", "{t('landing.awarenessDesc1')}"],
    ["By establishing a clear baseline and measuring daily outputs, individuals and organizations can target impactful reductions, unlock financial savings, and drive meaningful environmental stewardship.", "{t('landing.awarenessDesc2')}"],
    ["label=\"Next-Gen Sustainability Analytics Platform\"", "label={t('landing.badge')}"],
    ["4.8 Tons", "{t('landing.awarenessStat1Val')}"],
    ["Avg. Annual Global Footprint per Person", "{t('landing.awarenessStat1Lbl')}"],
    ["2.0 Tons", "{t('landing.awarenessStat2Val')}"],
    ["Target Footprint to Halt Global Warming", "{t('landing.awarenessStat2Lbl')}"],
    ["Carbon Impact Breakdown", "{t('landing.impactBreakdown')}"]
  ],
  "OrganizationDashboard.js": [
    ["import { useAuth } from '../context/AuthContext';", "import { useAuth } from '../context/AuthContext';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const OrganizationDashboard = () => {", "const OrganizationDashboard = () => {\n  const { t } = useTranslation();"],
    ["Organization Sustainability", "{t('org.title')}"],
    ["Benchmark and track departmental carbon metrics, invite teammates, and manage carbon budgets.", "{t('org.subtitle')}"],
    ["You are not member of any organization. Create a new one or join using an invite code.", "{t('org.noOrg')}"],
    ["Create a New Organization", "{t('org.createTitle')}"],
    ["Join an Existing Organization", "{t('org.joinTitle')}"],
    ["label=\"Organization Name\"", "label={t('org.orgName')}"],
    ["label=\"Invite Code (6 characters)\"", "label={t('org.inviteCode')}"],
    ["Join Organization", "{t('org.joinBtn')}"],
    ["Create Organization", "{t('org.createBtn')}"],
    ["Invite Code", "{t('org.inviteCodeLabel')}"],
    ["Team Members", "{t('org.members')}"],
    ["Share this code to invite teammates: ", "t('org.inviteCodeShare')"],
    ["Teammates Contribution Leaderboard", "{t('org.ranking')}"],
    ["label=\"Assigned Role\"", "label={t('org.assignedRole')}"],
    ["<Typography variant=\"subtitle1\" fontWeight={700} gutterBottom>Member Role</Typography>", "<Typography variant=\"subtitle1\" fontWeight={700} gutterBottom>{t('org.memberRole')}</Typography>"],
    ["Monthly Footprint (kg)", "{t('org.monthlyFootprint')}"],
    ["Points", "{t('org.points')}"],
    ["setSuccess('Organization established successfully!');", "setSuccess(t('org.successCreate'));"],
    ["setSuccess('Joined organization successfully!');", "setSuccess(t('org.successJoin'));"],
    ["setError('Failed to execute organization operation.');", "setError(t('org.failAction'));"],
    ["setSuccess('Employee added successfully!');", "setSuccess(t('org.successAddEmployee'));"],
    ["setError(err.response?.data?.message || 'Failed to add employee.');", "setError(err.response?.data?.message || t('org.failAddEmployee'));"],
    ["setSuccess('Monthly sustainability report generated!');", "setSuccess(t('org.successReport'));"],
    ["setError('Failed to generate report.');", "setError(t('org.failReport'));"],
    ["Typography>Loading organization details...</Typography>", "Typography>{t('org.loading')}</Typography>"],
    ["Institutional Sustainability", "{t('org.institutionalTitle')}"],
    ["Connect your business, school, or organization to track aggregated carbon footprints and report group impact.", "{t('org.institutionalSubtitle')}"],
    ["label=\"Organization Type\"", "label={t('org.type')}"],
    ["Business / Corporation", "{t('org.typeBusiness')}"],
    ["School / University", "{t('org.typeSchool')}"],
    ["Government / NGO", "{t('org.typeGovernment')}"],
    ["Community Group", "{t('org.typeCommunity')}"],
    ["{orgLink.organization.organizationName} Dashboard", "{orgLink.organization.organizationName} {t('org.dashboard')}"],
    ["Manage employees, monitor team carbon footprints, and review monthly reports.", "{t('org.dashboardSubtitle')}"],
    ["Total Employees", "{t('org.totalEmployees')}"],
    ["Active team members", "{t('org.activeTeamMembers')}"],
    ["Generated Reports", "{t('org.generatedReports')}"],
    ["Monthly audits archived", "{t('org.monthlyAuditsArchived')}"],
    ["Emission Trends & Performance", "{t('org.tabEmissionTrends')}"],
    ["Team Rankings & Management", "{t('org.tabTeamRankings')}"],
    ["Reports & Actions", "{t('org.tabReportsActions')}"],
    ["Employee Emission Trends (Last 6 Months, kg CO₂)", "{t('org.employeeEmissionTrends')}"],
    ["No emission data available yet.", "{t('org.noEmissionData')}"],
    ["Department Performance (Current Month Average, kg CO₂)", "{t('org.departmentPerformance')}"],
    ["No department data available.", "{t('org.noDeptData')}"],
    ["name=\"Avg Emissions (kg)\"", "name={t('org.avgEmissionsKg')}"],
    ["name=\"Total Emissions (kg)\"", "name={t('org.totalEmissionsKg')}"],
    ["Team Rankings (Current Month)", "{t('org.teamRankingsCurrentMonth')}"],
    ["<TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>", "<TableCell sx={{ fontWeight: 700 }}>{t('org.tableRank')}</TableCell>"],
    ["<TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>", "<TableCell sx={{ fontWeight: 700 }}>{t('org.tableEmployee')}</TableCell>"],
    ["<TableCell sx={{ fontWeight: 700 }}>Department</TableCell>", "<TableCell sx={{ fontWeight: 700 }}>{t('org.tableDepartment')}</TableCell>"],
    ["<TableCell sx={{ fontWeight: 700 }} align=\"right\">Emissions (kg)</TableCell>", "<TableCell sx={{ fontWeight: 700 }} align=\"right\">{t('org.tableEmissions')}</TableCell>"],
    ["<TableCell sx={{ fontWeight: 700 }} align=\"right\">Sustainability Score</TableCell>", "<TableCell sx={{ fontWeight: 700 }} align=\"right\">{t('org.tableSustainabilityScore')}</TableCell>"],
    ["Add Employee / Member", "{t('org.addEmployeeTitle')}"],
    ["label=\"User Email Address\"", "label={t('org.userEmailAddress')}"],
    ["<MenuItem value=\"ORG_USER\">Employee (ORG_USER)</MenuItem>", "<MenuItem value=\"ORG_USER\">{t('org.roleUser')}</MenuItem>"],
    ["<MenuItem value=\"ORG_ADMIN\">Manager (ORG_ADMIN)</MenuItem>", "<MenuItem value=\"ORG_ADMIN\">{t('org.roleAdmin')}</MenuItem>"],
    ["Add User", "{t('org.addUserBtn')}"],
    ["Employees Roster", "{t('org.employeesRoster')}"],
    ["Monthly Sustainability Reports", "{t('org.monthlySustainabilityReports')}"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Report Period</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('org.reportPeriod')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"right\">Aggregated CO2 (kg)</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"right\">{t('org.aggregatedCO2')}</TableCell>"],
    ["No reports generated yet.", "{t('org.noReportsYet')}"],
    ["Generate Aggregated Report", "{t('org.generateAggregatedReport')}"],
    ["label=\"Month (1-12)\"", "label={t('org.monthLabel')}"],
    ["label=\"Year\"", "label={t('org.yearLabel')}"],
    ["Calculate & Save Report", "{t('org.calculateSaveReport')}"],
    ["You are registered as an **Employee (ORG_USER)**. Sustainability reports and employee management settings are restricted to organization administrators.", "You are registered as an **{t('org.roleUser')}**. Sustainability reports and employee management settings are restricted to organization administrators."]
  ],
  "AdminDashboard.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const AdminDashboard = () => {", "const AdminDashboard = () => {\n  const { t } = useTranslation();"],
    ["Platform Administration", "{t('admin.dashboardTitle')}"],
    ["Comprehensive platform health overview, user activities audits, and system-wide carbon emissions.", "{t('admin.dashboardSubtitle')}"],
    ["{resetting ? 'Resetting Demo Data...' : 'Reset & Seed Demo Data'}", "{resetting ? t('admin.resettingDemoData') : t('admin.resetDemoDataBtn')}"],
    ["Export Platform CSV", "{t('admin.exportPlatformCSV')}"],
    ["Export Platform PDF", "{t('admin.exportPlatformPDF')}"],
    ["Total Users", "{t('admin.statsUsers')}"],
    ["Platform Footprint", "{t('admin.statsEmissions')}"],
    ["Pending Feedback", "{t('admin.statsTickets')}"],
    ["Goal success rate", "{t('admin.goalSuccessRate')}"],
    ["registered this week", "{t('admin.newUsersThisWeek')}"],
    ["Total CO₂ tracked", "{t('admin.totalCo2Tracked')}"],
    ["Unresolved queries", "{t('admin.unresolvedQueries')}"],
    ["<Tab label=\"Emission Analytics\" />", "<Tab label={t('admin.tabEmissionAnalytics')} />"],
    ["<Tab label=\"Category breakdown\" />", "<Tab label={t('dashboard.tabCategoryBreakdown')} />"],
    ["<Tab label=\"User Leaderboard rankings\" />", "<Tab label={t('admin.tabLeaderboardRankings')} />"],
    ["<Tab label=\"Goal & Badge Achievement details\" />", "<Tab label={t('admin.tabGoalAchievementDetails')} />"],
    ["<Tab label=\"User Activities & Audits\" />", "<Tab label={t('admin.tabUserActivitiesAudits')} />"],
    ["<Tab label=\"Platform Gamification\" />", "<Tab label={t('admin.tabPlatformGamification')} />"],
    ["Daily Emissions (kg CO₂)", "{t('admin.dailyEmissionsLabel')}"]
  ],
  "UserManagement.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const UserManagement = () => {", "const UserManagement = () => {\n  const { t } = useTranslation();"],
    ["User Account Directory", "{t('admin.userDirectoryTitle')}"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>User Profile</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.userProfile')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Mobile</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('profile.mobileNumber')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"center\">Account Status</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"center\">{t('admin.usersTableStatus')}</TableCell>"],
    ["label={u.active ? 'ACTIVE' : 'SUSPENDED'}", "label={u.active ? t('admin.statusActive') : t('admin.statusSuspended')}"]
  ],
  "EmissionFactorManagement.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const EmissionFactorManagement = () => {", "const EmissionFactorManagement = () => {\n  const { t } = useTranslation();"],
    ["Loading emission factors...", "{t('admin.factorsLoading')}"],
    ["Emission Multiplier Factors", "{t('admin.factorsTitle')}"],
    ["Edit Factor Multiplier Value", "{t('admin.factorsEditTitle')}"],
    ["label=\"Multiplier Factor\"", "label={t('admin.factorCoefficient')}"],
    ["label=\"Version\"", "label={t('admin.factorVersion')}"],
    ["<Button type=\"submit\" variant=\"contained\" color=\"primary\" disabled={saving}>\n                  {saving ? 'Saving...' : 'Save'}\n                </Button>", "<Button type=\"submit\" variant=\"contained\" color=\"primary\" disabled={saving}>\n                  {saving ? 'Saving...' : t('common.save')}\n                </Button>"],
    ["<Button variant=\"outlined\" color=\"inherit\" onClick={handleCancel}>\n                  Cancel\n                </Button>", "<Button variant=\"outlined\" color=\"inherit\" onClick={handleCancel}>\n                  {t('common.cancel')}\n                </Button>"],
    ["Factor Coeff.", "{t('admin.factorCoefficient')}"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Ver</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.versionShort')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Source</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.factorSource')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"center\">Edit</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"center\">{t('common.edit')}</TableCell>"],
    ["setSuccess('Emission factor coefficient updated successfully!');", "setSuccess(t('admin.factorsSuccessUpdate'));"]
  ],
  "FeedbackManagement.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const FeedbackManagement = () => {", "const FeedbackManagement = () => {\n  const { t } = useTranslation();"],
    ["Loading user feedbacks...", "{t('admin.feedbackLoading')}"],
    ["label=\"Filter Status\"", "label={t('admin.filterStatus')}"],
    ["<MenuItem value=\"ALL\">All Feedback</MenuItem>", "<MenuItem value=\"ALL\">{t('admin.allFeedback')}</MenuItem>"],
    ["<MenuItem value=\"OPEN\">Open</MenuItem>", "<MenuItem value=\"OPEN\">{t('admin.statusOpen')}</MenuItem>"],
    ["<MenuItem value=\"IN_PROGRESS\">In Progress</MenuItem>", "<MenuItem value=\"IN_PROGRESS\">{t('admin.statusInProgress')}</MenuItem>"],
    ["<MenuItem value=\"RESOLVED\">Resolved</MenuItem>", "<MenuItem value=\"RESOLVED\">{t('admin.statusResolved')}</MenuItem>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Content</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.feedbackTableText')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"center\">Status</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"center\">{t('admin.supportStatus')}</TableCell>"],
    ["<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"center\">Resolution Actions</TableCell>", "<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align=\"center\">{t('admin.supportActions')}</TableCell>"],
    ["<TableCell colSpan={6} align=\"center\">No feedbacks match selection.</TableCell>", "<TableCell colSpan={6} align=\"center\">{t('admin.noFeedbacks')}</TableCell>"],
    ["<Button variant=\"outlined\" color=\"secondary\" size=\"small\" onClick={() => handleUpdateStatus(f.id, 'IN_PROGRESS')}>\n                          In Progress\n                        </Button>", "<Button variant=\"outlined\" color=\"secondary\" size=\"small\" onClick={() => handleUpdateStatus(f.id, 'IN_PROGRESS')}>\n                          {t('admin.statusInProgress')}\n                        </Button>"],
    ["<Button variant=\"contained\" color=\"success\" size=\"small\" onClick={() => handleUpdateStatus(f.id, 'RESOLVED')}>\n                          Resolve\n                        </Button>", "<Button variant=\"contained\" color=\"success\" size=\"small\" onClick={() => handleUpdateStatus(f.id, 'RESOLVED')}>\n                          {t('admin.resolveBtn')}\n                        </Button>"],
    ["<Typography variant=\"caption\" color=\"text.secondary\">Completed</Typography>", "<Typography variant=\"caption\" color=\"text.secondary\">{t('admin.completed')}</Typography>"],
    ["setSuccess('Feedback status updated successfully!');", "setSuccess(t('admin.feedbackSuccessUpdate'));"],
    ["setError('Failed to update status.');", "setError(t('admin.feedbackFailUpdate'));"],
    ["setError('Could not retrieve user feedbacks.');", "setError(t('admin.feedbackFailRetrieve'));"]
  ],
  "ReportsAnalytics.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const ReportsAnalytics = () => {", "const ReportsAnalytics = () => {\n  const { t } = useTranslation();"],
    ["Compiling reports and analytics...", "{t('admin.reportsCompiling')}"],
    ["Platform Analytics & Reports", "{t('admin.reportsTitle')}"],
    ["Aggregated indicators detailing total carbon footprint metrics and averages across all platform categories.", "{t('admin.reportsSubtitle')}"],
    ["Total Emissions by Category (kg CO2)", "{t('admin.reportsEmissionsLabel')}"],
    ["No activity logs recorded on the platform.", "{t('admin.reportsNoData')}"],
    ["name: key,\n          'Total Emissions': parseFloat(grouped[key].sum.toFixed(1)),\n          'Average Emission': parseFloat((grouped[key].sum / grouped[key].count).toFixed(1))", "name: key,\n          [t('dashboard.periodEmissions')]: parseFloat(grouped[key].sum.toFixed(1)),\n          [t('dashboard.dailyAverage')]: parseFloat((grouped[key].sum / grouped[key].count).toFixed(1))"],
    ["dataKey=\"Total Emissions\"", "dataKey={t('dashboard.periodEmissions')}"],
    ["dataKey=\"Average Emission\"", "dataKey={t('dashboard.dailyAverage')}"],
    ["setError('Could not compile platform analytics.');", "setError(t('admin.reportsCompiling'));"]
  ],
  "AdminSupportDashboard.js": [
    ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    ["const AdminSupportDashboard = () => {", "const AdminSupportDashboard = () => {\n  const { t } = useTranslation();"],
    ["Support Ticket Management Dashboard", "{t('admin.supportTitle')}"],
    ["Coordinate support query workflows, inspect customer environments, and monitor platform SLA compliance.", "{t('admin.supportSubtitle')}"],
    ["Total Tickets", "{t('admin.supportTotalTickets')}"],
    ["Open / New", "{t('admin.supportOpenNew')}"],
    ["Assigned / In Progress", "{t('admin.supportAssignedInProgress')}"],
    ["Resolved Issues", "{t('admin.supportResolvedIssues')}"]
  ]
};

// Process each file
for (const [filename, fileRepls] of Object.entries(fileReplacements)) {
  const filepath = path.join(pagesDir, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filename}`);
    continue;
  }
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(/\r\n/g, '\n');
  let modified = false;

  for (const [target, replacement] of fileRepls) {
    if (content.includes(target)) {
      content = content.split(target).join(replacement);
      modified = true;
    } else {
      console.warn(`[Warning] target string not found in ${filename}: "${target.slice(0, 40).replace(/\n/g, '\\n')}"`);
    }
  }

  if (modified) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Successfully translated: ${filename}`);
  } else {
    console.log(`No changes made to: ${filename}`);
  }
}

// Special custom processing for SupportPage.js (batch 2 custom)
const supportPath = path.join(pagesDir, 'SupportPage.js');
if (fs.existsSync(supportPath)) {
  let content = fs.readFileSync(supportPath, 'utf8');
  content = content.replace(/\r\n/g, '\n');

  // Remove import { translate } from '../components/translations';
  content = content.replace("import { translate } from '../components/translations';", "import { useTranslation } from '../context/LanguageContext';");

  // Remove static FAQS definition
  const faqsRegex = /const FAQS = \[[\s\S]*?\];/;
  content = content.replace(faqsRegex, '/* FAQS deleted */');

  // Replace component declaration and state
  const componentStartRegex = /const SupportPage = \(\) => \{\s*const \[lang, setLang\] = useState\('en'\);/g;
  const newHeader = `const SupportPage = () => {
  const { t, lang, changeLanguage: setLang } = useTranslation();

  const FAQS = [
    {
      question: t('support.faqQ1'),
      answer: t('support.faqA1')
    },
    {
      question: t('support.faqQ2'),
      answer: t('support.faqA2')
    },
    {
      question: t('support.faqQ3'),
      answer: t('support.faqA3')
    },
    {
      question: t('support.faqQ4'),
      answer: t('support.faqA4')
    },
    {
      question: t('support.faqQ5'),
      answer: t('support.faqA5')
    }
  ];`;

  if (componentStartRegex.test(content)) {
    content = content.replace(componentStartRegex, newHeader);
  } else {
    content = content.replace("const SupportPage = () => {", newHeader);
    content = content.replace("const [lang, setLang] = useState('en');", "");
  }

  // Replace translate('some.key', lang) with t('some.key')
  content = content.replace(/translate\(\s*'([^']+)'\s*,\s*lang\s*\)/g, "t('$1')");
  content = content.replace(/translate\(\s*`([^`]+)`\s*,\s*lang\s*\)/g, "t(`$1`)");

  // Replace hardcoded MenuItems
  content = content.replace('<MenuItem value="BUG">Bug Report</MenuItem>', '<MenuItem value="BUG">{t(\'category.bug\')}</MenuItem>');
  content = content.replace('<MenuItem value="FEATURE_REQUEST">Feature Request</MenuItem>', '<MenuItem value="FEATURE_REQUEST">{t(\'category.feature\')}</MenuItem>');
  content = content.replace('<MenuItem value="SOS_ISSUE">SOS Issue</MenuItem>', '<MenuItem value="SOS_ISSUE">{t(\'category.sos\')}</MenuItem>');
  content = content.replace('<MenuItem value="VOICE_DETECTION_ISSUE">Voice Detection Issue</MenuItem>', '<MenuItem value="VOICE_DETECTION_ISSUE">{t(\'category.voice\')}</MenuItem>');
  content = content.replace('<MenuItem value="LOGIN_ISSUE">Login Issue</MenuItem>', '<MenuItem value="LOGIN_ISSUE">{t(\'category.login\')}</MenuItem>');
  content = content.replace('<MenuItem value="OTP_ISSUE">OTP Issue</MenuItem>', '<MenuItem value="OTP_ISSUE">{t(\'category.otp\')}</MenuItem>');
  content = content.replace('<MenuItem value="EMAIL_ISSUE">Email Issue</MenuItem>', '<MenuItem value="EMAIL_ISSUE">{t(\'category.email\')}</MenuItem>');
  content = content.replace('<MenuItem value="NOTIFICATION_ISSUE">Notification Issue</MenuItem>', '<MenuItem value="NOTIFICATION_ISSUE">{t(\'category.notification\')}</MenuItem>');
  content = content.replace('<MenuItem value="PERFORMANCE_ISSUE">Performance Issue</MenuItem>', '<MenuItem value="PERFORMANCE_ISSUE">{t(\'category.performance\')}</MenuItem>');
  content = content.replace('<MenuItem value="UI_UX_ISSUE">UI/UX Issue</MenuItem>', '<MenuItem value="UI_UX_ISSUE">{t(\'category.ui_ux\')}</MenuItem>');
  content = content.replace('<MenuItem value="ACCOUNT_ISSUE">Account Issue</MenuItem>', '<MenuItem value="ACCOUNT_ISSUE">{t(\'category.account\')}</MenuItem>');
  content = content.replace('<MenuItem value="FEEDBACK">Feedback</MenuItem>', '<MenuItem value="FEEDBACK">{t(\'category.feedback\')}</MenuItem>');
  content = content.replace('<MenuItem value="GENERAL">General Query</MenuItem>', '<MenuItem value="GENERAL">{t(\'category.query\')}</MenuItem>');
  content = content.replace('<MenuItem value="OTHER">Other</MenuItem>', '<MenuItem value="OTHER">{t(\'category.other\')}</MenuItem>');

  content = content.replace('<MenuItem value="Critical">Critical</MenuItem>', '<MenuItem value="Critical">{t(\'priority.critical\')}</MenuItem>');
  content = content.replace('<MenuItem value="High">High</MenuItem>', '<MenuItem value="High">{t(\'priority.high\')}</MenuItem>');
  content = content.replace('<MenuItem value="Medium">Medium</MenuItem>', '<MenuItem value="Medium">{t(\'priority.medium\')}</MenuItem>');
  content = content.replace('<MenuItem value="Low">Low</MenuItem>', '<MenuItem value="Low">{t(\'priority.low\')}</MenuItem>');

  // AI Dialog Title
  content = content.replace('Eco-Support AI Diagnostics Pre-Check', "{t('support.aiCheck')}");
  content = content.replace('Probable Issue Cause:', "{t('support.details')}:");
  content = content.replace('Troubleshooting Steps:', "{t('support.faq')}:");
  content = content.replace('Eco Recommendation:', "{t('nav.recommendations')}:");

  fs.writeFileSync(supportPath, content, 'utf8');
  console.log("Successfully block-translated: SupportPage.js");
}

console.log("Unified translation system application successfully completed!");
