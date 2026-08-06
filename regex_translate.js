const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');

const fileReplacements = {
  "Dashboard.js": [
    // Imports & Hook
    [/import api from '\.\.\/api';/, "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    [/const Dashboard = \(\) => \{/, "const Dashboard = () => {\n  const { t } = useTranslation();"],
    // Headings
    [/<Typography variant="h4" fontWeight=\{800\} gutterBottom>\s*Carbon Footprint Analytics\s*<\/Typography>/, "<Typography variant=\"h4\" fontWeight={800} gutterBottom>\n            {t('dashboard.analyticsTitle')}\n          </Typography>"],
    [/<Typography variant="body2" color="text\.secondary">\s*Advanced real-time tracking, benchmarking comparisons, and personalized sustainability tips\.\s*<\/Typography>/, "<Typography variant=\"body2\" color=\"text.secondary\">\n            {t('dashboard.analyticsSubtitle')}\n          </Typography>"],
    // Download Buttons
    [/<Button([^>]*)>\s*Export CSV\s*<\/Button>/g, "<Button$1>{t('dashboard.exportCSV')}</Button>"],
    [/<Button([^>]*)>\s*Export PDF\s*<\/Button>/g, "<Button$1>{t('dashboard.exportPDF')}</Button>"],
    // Session Alert
    [/\{error\} Your session token may have expired\. Please re-authenticate to load your live analytics data\./, "{error} {t('dashboard.sessionExpiredAlert')}"],
    [/Sign In Again/, "{t('dashboard.signInAgain')}"],
    // Select Date Range Filter
    [/label="Select Date Range Filter"/, "label={t('dashboard.selectDateRangeFilter')}"],
    [/<MenuItem value="today">Today<\/MenuItem>/, "<MenuItem value=\"today\">{t('dashboard.presetToday')}</MenuItem>"],
    [/<MenuItem value="yesterday">Yesterday<\/MenuItem>/, "<MenuItem value=\"yesterday\">{t('dashboard.presetYesterday')}</MenuItem>"],
    [/<MenuItem value="last-7">Last 7 Days<\/MenuItem>/, "<MenuItem value=\"last-7\">{t('dashboard.presetLast7')}</MenuItem>"],
    [/<MenuItem value="last-30">Last 30 Days<\/MenuItem>/, "<MenuItem value=\"last-30\">{t('dashboard.presetLast30')}</MenuItem>"],
    [/<MenuItem value="this-month">This Month<\/MenuItem>/, "<MenuItem value=\"this-month\">{t('dashboard.presetThisMonth')}</MenuItem>"],
    [/<MenuItem value="prev-month">Previous Month<\/MenuItem>/, "<MenuItem value=\"prev-month\">{t('dashboard.presetPrevMonth')}</MenuItem>"],
    [/<MenuItem value="custom">Custom Date Range<\/MenuItem>/, "<MenuItem value=\"custom\">{t('dashboard.presetCustom')}</MenuItem>"],
    [/label="From"/, "label={t('dashboard.from')}"],
    [/label="To"/, "label={t('dashboard.to')}"],
    [/<Button([^>]*)>\s*Search\s*<\/Button>/g, "<Button$1>{t('dashboard.search')}</Button>"],
    // KPI Cards
    [/Period Emissions/, "{t('dashboard.periodEmissions')}"],
    [/\% vs previous/, "% \" + t('dashboard.vsPrevious')"],
    [/Daily Average/, "{t('dashboard.dailyAverage')}"],
    [/Total \{dateRangeSummary\?\.activityCount \?\? 0\} logs tracked/, "{t('dashboard.totalLogsTracked')}: {dateRangeSummary?.activityCount ?? 0}"],
    [/Peak\/Min Days/, "{t('dashboard.peakMinDays')}"],
    [/Max: /, "{t('dashboard.max')}: "],
    [/Min: /, "{t('dashboard.min')}: "],
    [/Period Eco Score/, "{t('dashboard.periodEcoScore')}"],
    [/Percentile standing: /, "{t('dashboard.percentileStanding')}: "],
    [/Goal Completion %/, "{t('dashboard.goalCompletion')}"],
    [/On track for 2026 targets/, "{t('dashboard.activeTargets')}"],
    [/Monthly Carbon Savings/, "{t('dashboard.monthlyCarbonSavings')}"],
    [/CO₂e reduced vs baseline/, "{t('dashboard.carbonReductions')}"],
    [/Highest Category \/ Most Improved/, "{t('dashboard.highestCategory')}"],
    [/High: Transport \(48%\)/, "{t('dashboard.max')}: Transport (48%)"],
    [/Improved: Food \(-12%\)/, "{t('dashboard.mostImpact')}: Food (-12%)"],
    [/Estimated Annual Footprint/, "{t('dashboard.estimatedAnnualFootprint')}"],
    [/CO₂e annual projection/, "{t('dashboard.basedOnLogs')}"],
    // Tabs
    [/<Tab label="Emissions Trends" \/>/, "<Tab label={t('dashboard.tabEmissionsOverTime')} />"],
    [/<Tab label="Category Breakdown" \/>/, "<Tab label={t('dashboard.tabCategoryBreakdown')} />"],
    [/<Tab label="Personalized Recommendations" \/>/, "<Tab label={t('dashboard.tabRecommendations')} />"],
    [/<Tab label="Benchmarking & Insights" \/>/, "<Tab label={t('dashboard.tabBenchmarking')} />"],
    [/<Tab label="Recent Activity History" \/>/, "<Tab label={t('dashboard.tabRecentLogs')} />"],
    // Chart Titles
    [/Daily Emissions Trend \(Selected Period\)/, "{t('dashboard.chartDailyEmissions')}"],
    [/No activities logged in this range\./, "{t('dashboard.noActivities')}"],
    [/Weekly Emissions Trend \(All Time\)/, "{t('dashboard.chartWeeklyEmissions')}"],
    [/No summaries generated\./, "{t('dashboard.noActivities')}"],
    [/Monthly Carbon Footprint Trend \(All Time\)/, "{t('dashboard.chartMonthlyEmissions')}"],
    [/No monthly summaries generated\./, "{t('dashboard.noActivities')}"],
    [/Donut Emission Breakdown \(Selected Period\)/, "{t('dashboard.chartEmissionsDist')}"],
    [/Carbon Emissions Distribution/, "{t('dashboard.chartEmissionsDist')}"],
    [/Emissions generated by your category choice/, "{t('dashboard.emissionsByCategory')}"],
    [/How you compare to similar profiles/, "{t('dashboard.howYouCompare')}"],
    [/Your Footprint/, "{t('dashboard.yourFootprint')}"],
    [/Peer Average/, "{t('dashboard.peerAverage')}"],
    [/National Target/, "{t('dashboard.nationalTarget')}"],
    [/Benchmark Comparison \(kg CO₂\)/, "{t('dashboard.chartBenchmarkComparison')}"],
    [/Sustainability Standing/, "{t('dashboard.sustainabilityStanding')}"],
    [/You are doing great! Your carbon footprint is below the peer average\./, "{t('dashboard.standingSummary')}"],
    // Recs
    [/Personalized Reduction recommendations/, "{t('dashboard.personalizedRecs')}"],
    [/Tailored strategies based on your activity pattern to help you cut carbon\./, "{t('dashboard.tailoredRecsSubtitle')}"],
    [/<TableCell>\s*Estimated Savings\s*<\/TableCell>/g, "<TableCell>{t('dashboard.estimatedSavings')}</TableCell>"],
    [/<TableCell>\s*Status\s*<\/TableCell>/g, "<TableCell>{t('dashboard.status')}</TableCell>"],
    [/<TableCell align="right">\s*Action\s*<\/TableCell>/g, "<TableCell align=\"right\">{t('dashboard.action')}</TableCell>"],
    [/<Button([^>]*)>\s*Implement\s*<\/Button>/g, "<Button$1>{t('dashboard.implement')}</Button>"],
    [/<Chip([^>]*)label="COMPLETED"([^>]*)\/>/g, "<Chip$1label={t('dashboard.completed')}$2/>"],
    [/<Chip([^>]*)label="ACTIVE"([^>]*)\/>/g, "<Chip$1label={t('dashboard.active')}$2/>"],
    [/No recommendations found\. Keep logging to get AI tips!/, "{t('dashboard.noRecs')}"],
    // Recent Activities
    [/Recent Activities \(Last 10 Actions\)/, "{t('dashboard.latestTrackedActions')}"],
    [/<TableCell>\s*Category\s*<\/TableCell>/g, "<TableCell>{t('dashboard.activityCategory')}</TableCell>"],
    [/<TableCell>\s*Activity Type\s*<\/TableCell>/g, "<TableCell>{t('dashboard.activityType')}</TableCell>"],
    [/<TableCell>\s*Quantity\s*<\/TableCell>/g, "<TableCell>{t('dashboard.activityQuantity')}</TableCell>"],
    [/<TableCell>\s*Emissions \(kg\)\s*<\/TableCell>/g, "<TableCell>{t('dashboard.activityEmissions')}</TableCell>"],
    [/<TableCell>\s*Date\s*<\/TableCell>/g, "<TableCell>{t('dashboard.activityDate')}</TableCell>"],
    [/No activities logged for this period\./, "{t('dashboard.noActivities')}"]
  ],
  "ActivityLogging.js": [
    [/import api from '\.\.\/api';/, "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
    [/const ActivityLogging = \(\) => \{/, "const ActivityLogging = () => {\n  const { t } = useTranslation();"],
    [/setError\('Could not retrieve activity logs\.'\);/, "setError(t('activity.retrieveError'));"],
    [/setSuccess\('Activity log updated successfully!'\);/, "setSuccess(t('activity.updateSuccess'));"],
    [/setSuccess\('Activity logged successfully!'\);/, "setSuccess(t('activity.logSuccess'));"],
    [/setSuccess\('Activity log deleted successfully!'\);/, "setSuccess(t('activity.deleteSuccess'));"],
    [/setError\('Quantity cannot be negative'\);/, "setError(t('activity.negativeError'));"],
    [/setError\(err\.response\?\.data\?\.message \|\| 'Logging action failed\.'\);/, "setError(err.response?.data?.message || t('activity.failedError'));"],
    [/setError\('Deletion failed\.'\);/, "setError(t('activity.deleteError'));"],
    [/Log Carbon Activity/, "{t('activity.logTitle')}"],
    [/Track your daily transport, utility, and diet choices to compute your real-time carbon footprint\./, "{t('activity.logSubtitle')}"],
    [/label="Category"/, "label={t('activity.category')}"],
    [/label="Activity Type"/, "label={t('activity.type')}"],
    [/label=\{\`Quantity \(\$\{CATEGORIES\[category\]\.unit\}\)\`\}/, "label={`${t('activity.quantity')} (${CATEGORIES[category].unit})`}"],
    [/label="Date"/, "label={t('activity.date')}"],
    [/Cancel Edit/, "{t('activity.cancelEdit')}"],
    [/<Button([^>]*)>\s*Update Log\s*<\/Button>/g, "<Button$1>{t('activity.updateLog')}</Button>"],
    [/<Button([^>]*)>\s*Log Activity\s*<\/Button>/g, "<Button$1>{t('activity.logBtn')}</Button>"],
    [/label="Filter by Date"/, "label={t('activity.filterByDate')}"],
    [/Reset Filter/, "{t('activity.resetFilter')}"],
    [/Daily Summary/, "{t('activity.dailySummary')}"],
    [/Total emissions for filtered date: \{dailyTotalEmission\.toFixed\(1\)\} kg CO₂/, "{t('activity.totalEmissions')} {dailyTotalEmission.toFixed(1)} kg CO₂"],
    [/Recent Activity Logs \(All-Time\)/, "{t('activity.recentLogsTitle')}"],
    [/<TableCell>\s*Actions\s*<\/TableCell>/g, "<TableCell>{t('activity.actions')}</TableCell>"],
    [/No activities logged yet\./, "{t('activity.noLogs')}"],
    [/window\.confirm\("Are you sure you want to delete this activity log\?"\)/, "window.confirm(t('activity.deleteConfirm'))"]
  ]
};

// Process
for (const [filename, fileRepls] of Object.entries(fileReplacements)) {
  const filepath = path.join(pagesDir, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filename}`);
    continue;
  }
  let content = fs.readFileSync(filepath, 'utf8');
  let modified = false;

  for (const [target, replacement] of fileRepls) {
    if (target.test(content)) {
      content = content.replace(target, replacement);
      modified = true;
    } else {
      console.warn(`[Warning] Pattern not matched in ${filename}: ${target}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Successfully translated: ${filename}`);
  }
}
console.log("Regex pages translations batch 1 completed!");
