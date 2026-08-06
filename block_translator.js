const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');

function makeBlockRegex(text) {
  let escaped = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  escaped = escaped.replace(/\s+/g, '\\s+');
  return new RegExp(escaped, 'g');
}

const fileBlocks = {
  "Dashboard.js": [
    [
      "import api from '../api';",
      "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"
    ],
    [
      "const Dashboard = () => {",
      "const Dashboard = () => {\n  const { t } = useTranslation();"
    ],
    [
      `<Typography variant="h4" fontWeight={800} gutterBottom>
            Carbon Footprint Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced real-time tracking, benchmarking comparisons, and personalized sustainability tips.
          </Typography>`,
      `<Typography variant="h4" fontWeight={800} gutterBottom>
            {t('dashboard.analyticsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.analyticsSubtitle')}
          </Typography>`
    ],
    [
      `<Button 
            variant="outlined" 
            color="primary" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleDownload('csv')}
          >
            Export CSV
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleDownload('pdf')}
          >
            Export PDF
          </Button>`,
      `<Button 
            variant="outlined" 
            color="primary" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleDownload('csv')}
          >
            {t('dashboard.exportCSV')}
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleDownload('pdf')}
          >
            {t('dashboard.exportPDF')}
          </Button>`
    ],
    [
      `      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/login')}>
              Sign In Again
            </Button>
          }
        >
          {error} Your session token may have expired. Please re-authenticate to load your live analytics data.
        </Alert>
      )}`,
      `      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/login')}>
              {t('dashboard.signInAgain')}
            </Button>
          }
        >
          {error} {t('dashboard.sessionExpiredAlert')}
        </Alert>
      )}`
    ],
    [
      `<TextField
            select
            label="Select Date Range Filter"
            value={presetRange}
            onChange={handlePresetChange}
            fullWidth
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="last-7">Last 7 Days</MenuItem>
            <MenuItem value="last-30">Last 30 Days</MenuItem>
            <MenuItem value="this-month">This Month</MenuItem>
            <MenuItem value="prev-month">Previous Month</MenuItem>
            <MenuItem value="custom">Custom Date Range</MenuItem>
          </TextField>`,
      `<TextField
            select
            label={t('dashboard.selectDateRangeFilter')}
            value={presetRange}
            onChange={handlePresetChange}
            fullWidth
          >
            <MenuItem value="today">{t('dashboard.presetToday')}</MenuItem>
            <MenuItem value="yesterday">{t('dashboard.presetYesterday')}</MenuItem>
            <MenuItem value="last-7">{t('dashboard.presetLast7')}</MenuItem>
            <MenuItem value="last-30">{t('dashboard.presetLast30')}</MenuItem>
            <MenuItem value="this-month">{t('dashboard.presetThisMonth')}</MenuItem>
            <MenuItem value="prev-month">{t('dashboard.presetPrevMonth')}</MenuItem>
            <MenuItem value="custom">{t('dashboard.presetCustom')}</MenuItem>
          </TextField>`
    ],
    [
      `<Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="From"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="To"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                sx={{ height: '56px' }}
              >
                Search
              </Button>
            </Grid>`,
      `<Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label={t('dashboard.from')}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label={t('dashboard.to')}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                sx={{ height: '56px' }}
              >
                {t('dashboard.search')}
              </Button>
            </Grid>`
    ],
    [
      `<Typography variant="body2" color="text.secondary" fontWeight={600}>Period Emissions</Typography>
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {(dateRangeSummary?.totalEmissions ?? 0).toFixed(1)} <Typography variant="caption" sx={{ fontWeight: 500 }}>kg</Typography>
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <Chip 
                      size="small" 
                      color={(dateRangeSummary?.percentageChange ?? 0) >= 0 ? "error" : "success"}
                      label={(dateRangeSummary?.percentageChange ?? 0) >= 0 ? \`+\${(dateRangeSummary?.percentageChange ?? 0).toFixed(0)}% vs previous\` : \`\${(dateRangeSummary?.percentageChange ?? 0).toFixed(0)}% vs previous\`}
                      sx={{ fontWeight: 700, mr: 1 }}
                    />
                  </Box>`,
      `<Typography variant="body2" color="text.secondary" fontWeight={600}>{t('dashboard.periodEmissions')}</Typography>
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {(dateRangeSummary?.totalEmissions ?? 0).toFixed(1)} <Typography variant="caption" sx={{ fontWeight: 500 }}>kg</Typography>
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <Chip 
                      size="small" 
                      color={(dateRangeSummary?.percentageChange ?? 0) >= 0 ? "error" : "success"}
                      label={(dateRangeSummary?.percentageChange ?? 0) >= 0 ? \`+\${(dateRangeSummary?.percentageChange ?? 0).toFixed(0)}% \${t('dashboard.vsPrevious')}\` : \`\${(dateRangeSummary?.percentageChange ?? 0).toFixed(0)}% \${t('dashboard.vsPrevious')}\`}
                      sx={{ fontWeight: 700, mr: 1 }}
                    />
                  </Box>`
    ],
    [
      `<Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Daily Average
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {(dateRangeSummary?.averageDailyEmissions ?? 0).toFixed(1)} <Typography variant="caption" sx={{ fontWeight: 500 }}>kg</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total {dateRangeSummary?.activityCount ?? 0} logs tracked
                  </Typography>`,
      `<Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {t('dashboard.dailyAverage')}
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {(dateRangeSummary?.averageDailyEmissions ?? 0).toFixed(1)} <Typography variant="caption" sx={{ fontWeight: 500 }}>kg</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('dashboard.totalLogsTracked')}: {dateRangeSummary?.activityCount ?? 0}
                  </Typography>`
    ],
    [
      `<Typography variant="body2" color="text.secondary" fontWeight={600}>Peak/Min Days</Typography>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 1, color: '#ef4444' }}>
                    Max: {dateRangeSummary ? dateRangeSummary.peakEmission.toFixed(1) : 0} kg
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="success.main">
                    Min: {dateRangeSummary ? dateRangeSummary.minEmission.toFixed(1) : 0} kg
                  </Typography>`,
      `<Typography variant="body2" color="text.secondary" fontWeight={600}>{t('dashboard.peakMinDays')}</Typography>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 1, color: '#ef4444' }}>
                    {t('dashboard.max')}: {dateRangeSummary ? dateRangeSummary.peakEmission.toFixed(1) : 0} kg
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="success.main">
                    {t('dashboard.min')}: {dateRangeSummary ? dateRangeSummary.minEmission.toFixed(1) : 0} kg
                  </Typography>`
    ],
    [
      `<Typography variant="body2" color="text.secondary" fontWeight={600}>Period Eco Score</Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1, color: '#10b981' }}>
                    {ecoScore} / 100
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Percentile standing: {percentile}%
                  </Typography>`,
      `<Typography variant="body2" color="text.secondary" fontWeight={600}>{t('dashboard.periodEcoScore')}</Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1, color: '#10b981' }}>
                    {ecoScore} / 100
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('dashboard.percentileStanding')}: {percentile}%
                  </Typography>`
    ],
    [
      `<Typography variant="body2" color="text.secondary" fontWeight={600}>Goal Completion %</Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1, color: '#06b6d4' }}>
                    {goalCompletion.toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">On track for 2026 targets</Typography>`,
      `<Typography variant="body2" color="text.secondary" fontWeight={600}>{t('dashboard.goalCompletion')}</Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1, color: '#06b6d4' }}>
                    {goalCompletion.toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{t('dashboard.activeTargets')}</Typography>`
    ],
    [
      `              <Typography variant="body2" color="text.secondary" fontWeight={600}>Monthly Carbon Savings</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                {(savingsSummary?.totalSavings || 0).toFixed(1)} kg
              </Typography>
              <Typography variant="caption" color="text.secondary">CO₂e reduced vs baseline</Typography>`,
      `              <Typography variant="body2" color="text.secondary" fontWeight={600}>{t('dashboard.monthlyCarbonSavings')}</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                {(savingsSummary?.totalSavings || 0).toFixed(1)} kg
              </Typography>
              <Typography variant="caption" color="text.secondary">{t('dashboard.carbonReductions')}</Typography>`
    ],
    [
      `              <Typography variant="body2" color="text.secondary" fontWeight={600}>Highest Category / Most Improved</Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 1, color: '#3b82f6' }}>High: Transport (48%)</Typography>
              <Typography variant="subtitle2" fontWeight={700} color="success.main">Improved: Food (-12%)</Typography>`,
      `              <Typography variant="body2" color="text.secondary" fontWeight={600}>{t('dashboard.highestCategory')}</Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 1, color: '#3b82f6' }}>{t('dashboard.max')}: Transport (48%)</Typography>
              <Typography variant="subtitle2" fontWeight={700} color="success.main">{t('dashboard.mostImpact')}: Food (-12%)</Typography>`
    ],
    [
      `              <Typography variant="body2" color="text.secondary" fontWeight={600}>Estimated Annual Footprint</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                {dateRangeSummary ? (dateRangeSummary.averageDailyEmissions * 365).toFixed(0) : 1850} kg
              </Typography>
              <Typography variant="caption" color="text.secondary">CO₂e annual projection</Typography>`,
      `              <Typography variant="body2" color="text.secondary" fontWeight={600}>{t('dashboard.estimatedAnnualFootprint')}</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                {dateRangeSummary ? (dateRangeSummary.averageDailyEmissions * 365).toFixed(0) : 1850} kg
              </Typography>
              <Typography variant="caption" color="text.secondary">{t('dashboard.basedOnLogs')}</Typography>`
    ],
    [
      `      <Tabs 
        value={tabValue} 
        onChange={(e, nv) => setTabValue(nv)} 
        sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Emissions Trends" />
        <Tab label="Category Breakdown" />
        <Tab label="Personalized Recommendations" />
        <Tab label="Benchmarking & Insights" />
        <Tab label="Recent Activity History" />
      </Tabs>`,
      `      <Tabs 
        value={tabValue} 
        onChange={(e, nv) => setTabValue(nv)} 
        sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label={t('dashboard.tabEmissionsOverTime')} />
        <Tab label={t('dashboard.tabCategoryBreakdown')} />
        <Tab label={t('dashboard.tabRecommendations')} />
        <Tab label={t('dashboard.tabBenchmarking')} />
        <Tab label={t('dashboard.tabRecentLogs')} />
      </Tabs>`
    ],
    [
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Daily Emissions Trend (Selected Period)
              </Typography>
              {dailyChartData.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">No activities logged in this range.</Typography>
                </Box>`,
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('dashboard.chartDailyEmissions')}
              </Typography>
              {dailyChartData.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">{t('dashboard.noActivities')}</Typography>
                </Box>`
    ],
    [
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Weekly Emissions Trend (All Time)
              </Typography>
              {weeklyChartData.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">No summaries generated.</Typography>
                </Box>`,
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('dashboard.chartWeeklyEmissions')}
              </Typography>
              {weeklyChartData.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">{t('dashboard.noActivities')}</Typography>
                </Box>`
    ],
    [
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Monthly Carbon Footprint Trend (All Time)
              </Typography>
              {monthlyChartData.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">No monthly summaries generated.</Typography>
                </Box>`,
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('dashboard.chartMonthlyEmissions')}
              </Typography>
              {monthlyChartData.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">{t('dashboard.noActivities')}</Typography>
                </Box>`
    ],
    [
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Donut Emission Breakdown (Selected Period)
              </Typography>
              {categoryBreakdown.length === 0 || categoryBreakdown.every(c => c.emissionValue === 0) ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">No activities logged in this range.</Typography>
                </Box>`,
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('dashboard.chartEmissionsDist')}
              </Typography>
              {categoryBreakdown.length === 0 || categoryBreakdown.every(c => c.emissionValue === 0) ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">{t('dashboard.noActivities')}</Typography>
                </Box>`
    ],
    [
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Carbon Emissions Distribution
              </Typography>
              {categoryBreakdown.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">No activities logged in this range.</Typography>
                </Box>`,
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('dashboard.chartEmissionsDist')}
              </Typography>
              {categoryBreakdown.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">{t('dashboard.noActivities')}</Typography>
                </Box>`
    ],
    [
      `              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Emissions generated by your category choice
              </Typography>`,
      `              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('dashboard.emissionsByCategory')}
              </Typography>`
    ],
    [
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                How you compare to similar profiles
              </Typography>`,
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('dashboard.howYouCompare')}
              </Typography>`
    ],
    [
      `              <Typography variant="body2" color="text.secondary" mb={0.5}>Your Footprint (Current Month)</Typography>`,
      `              <Typography variant="body2" color="text.secondary" mb={0.5}>{t('dashboard.yourFootprint')} (Current Month)</Typography>`
    ],
    [
      `              <Typography variant="body2" color="text.secondary" mb={0.5}>Peer Average</Typography>`,
      `              <Typography variant="body2" color="text.secondary" mb={0.5}>{t('dashboard.peerAverage')}</Typography>`
    ],
    [
      `              <Typography variant="body2" color="text.secondary" mb={0.5}>National Target</Typography>`,
      `              <Typography variant="body2" color="text.secondary" mb={0.5}>{t('dashboard.nationalTarget')}</Typography>`
    ],
    [
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Benchmark Comparison (kg CO₂)
              </Typography>`,
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('dashboard.chartBenchmarkComparison')}
              </Typography>`
    ],
    [
      `              <Typography variant="h6" fontWeight={700} gutterBottom>
                Sustainability Standing
              </Typography>
              <Alert severity="success" variant="outlined" sx={{ border: '1px solid rgba(16,185,129,0.15)', background: 'transparent' }}>
                You are doing great! Your carbon footprint is below the peer average.
              </Alert>`,
      `              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('dashboard.sustainabilityStanding')}
              </Typography>
              <Alert severity="success" variant="outlined" sx={{ border: '1px solid rgba(16,185,129,0.15)', background: 'transparent' }}>
                {t('dashboard.standingSummary')}
              </Alert>`
    ],
    [
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                💡 Actionable Eco-Recommendations
              </Typography>
              
              {recommendations?.recommendations?.length === 0 ? (
                <Box py={4} textAlign="center">
                  <Typography color="text.secondary">No recommendations found. Keep logging to get AI tips!</Typography>
                </Box>`,
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                💡 {t('dashboard.personalizedRecs')}
              </Typography>
              
              {recommendations?.recommendations?.length === 0 ? (
                <Box py={4} textAlign="center">
                  <Typography color="text.secondary">{t('dashboard.noRecs')}</Typography>
                </Box>`
    ],
    [
      `              <Typography variant="body2" color="text.secondary">
                Tailored strategies based on your activity pattern to help you cut carbon.
              </Typography>`,
      `              <Typography variant="body2" color="text.secondary">
                {t('dashboard.tailoredRecsSubtitle')}
              </Typography>`
    ],
    [
      `<TableCell>Estimated Savings</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>`,
      `<TableCell>{t('dashboard.estimatedSavings')}</TableCell>
                      <TableCell>{t('dashboard.status')}</TableCell>
                      <TableCell align="right">{t('dashboard.action')}</TableCell>`
    ],
    [
      `<Button 
                              size="small" 
                              variant="outlined" 
                              color="success"
                              onClick={() => handleUpdateRecStatus(rec.id, 'COMPLETED')}
                            >
                              Implement
                            </Button>`,
      `<Button 
                              size="small" 
                              variant="outlined" 
                              color="success"
                              onClick={() => handleUpdateRecStatus(rec.id, 'COMPLETED')}
                            >
                              {t('dashboard.implement')}
                            </Button>`
    ],
    [
      `                            <Chip label="COMPLETED" size="small" color="success" />`,
      `                            <Chip label={t('dashboard.completed')} size="small" color="success" />`
    ],
    [
      `                            <Chip label="ACTIVE" size="small" color="info" />`,
      `                            <Chip label={t('dashboard.active')} size="small" color="info" />`
    ],
    [
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Recent Activities (Last 10 Actions)
              </Typography>`,
      `              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                {t('dashboard.latestTrackedActions')}
              </Typography>`
    ],
    [
      `                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Activity Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    </TableRow>`,
      `                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.activityName')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.activityDate')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.activityDescription')}</TableCell>
                    </TableRow>`
    ],
    [
      `                        <TableCell colSpan={3} align="center">No activities recorded yet.</TableCell>`,
      `                        <TableCell colSpan={3} align="center">{t('dashboard.noActivitiesRecorded')}</TableCell>`
    ]
  ],
  "ActivityLogging.js": [
    [
      "import api from '../api';",
      "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"
    ],
    [
      "const ActivityLogging = () => {",
      "const ActivityLogging = () => {\n  const { t } = useTranslation();"
    ],
    [
      "setError('Could not retrieve activity logs.');",
      "setError(t('activity.retrieveError'));"
    ],
    [
      "setSuccess('Activity log updated successfully!');",
      "setSuccess(t('activity.updateSuccess'));"
    ],
    [
      "setSuccess('Activity logged successfully!');",
      "setSuccess(t('activity.logSuccess'));"
    ],
    [
      "setSuccess('Activity log deleted successfully!');",
      "setSuccess(t('activity.deleteSuccess'));"
    ],
    [
      "setError('Quantity cannot be negative');",
      "setError(t('activity.negativeError'));"
    ],
    [
      "setError(err.response?.data?.message || 'Logging action failed.');",
      "setError(err.response?.data?.message || t('activity.failedError'));"
    ],
    [
      "setError('Deletion failed.');",
      "setError(t('activity.deleteError'));"
    ],
    [
      `          <Typography variant="h4" fontWeight={900} gutterBottom>
            Log Carbon Activity
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your daily transport, utility, and diet choices to compute your real-time carbon footprint.
          </Typography>`,
      `          <Typography variant="h4" fontWeight={900} gutterBottom>
            {t('activity.logTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('activity.logSubtitle')}
          </Typography>`
    ],
    [
      `              <TextField
                select
                label="Category"`,
      `              <TextField
                select
                label={t('activity.category')}`
    ],
    [
      `              <TextField
                select
                label="Activity Type"`,
      `              <TextField
                select
                label={t('activity.type')}`
    ],
    [
      `              <TextField
                type="number"
                label={\`Quantity (\${CATEGORIES[category].unit})\`}
                InputProps={{ inputProps: { min: 0 } }}`,
      `              <TextField
                type="number"
                label={\`\${t('activity.quantity')} (\${CATEGORIES[category].unit})\`}
                InputProps={{ inputProps: { min: 0 } }}`
    ],
    [
      `              <TextField
                type="date"
                label="Date"`,
      `              <TextField
                type="date"
                label={t('activity.date')}`
    ],
    [
      `              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button variant="outlined" color="inherit" fullWidth onClick={resetForm}>
                  Cancel Edit
                </Button>
                <Button type="submit" variant="contained" color="secondary" fullWidth disabled={loading}>
                  Update Log
                </Button>
              </Stack>`,
      `              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button variant="outlined" color="inherit" fullWidth onClick={resetForm}>
                  {t('activity.cancelEdit')}
                </Button>
                <Button type="submit" variant="contained" color="secondary" fullWidth disabled={loading}>
                  {t('activity.updateLog')}
                </Button>
              </Stack>`
    ],
    [
      `              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
                Log Activity
              </Button>`,
      `              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
                {t('activity.logBtn')}
              </Button>`
    ],
    [
      `          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            Recent Activity Logs (All-Time)
          </Typography>
          
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              type="date"
              label="Filter by Date"`,
      `          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            {t('activity.recentLogsTitle')}
          </Typography>
          
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              type="date"
              label={t('activity.filterByDate')}`
    ],
    [
      `            <Button variant="outlined" color="inherit" onClick={() => setFilterDate('')}>
              Reset Filter
            </Button>`,
      `            <Button variant="outlined" color="inherit" onClick={() => setFilterDate('')}>
              {t('activity.resetFilter')}
            </Button>`
    ],
    [
      `          {filterDate && (
            <Card sx={{ mb: 3, p: 2, border: '1px solid rgba(16,185,129,0.15)', bgcolor: 'rgba(16,185,129,0.01)' }}>
              <Typography variant="subtitle2" color="primary" fontWeight={800}>Daily Summary</Typography>
              <Typography variant="subtitle1" fontWeight={700}>Total emissions for filtered date: {dailyTotalEmission.toFixed(1)} kg CO₂</Typography>
            </Card>
          )}`,
      `          {filterDate && (
            <Card sx={{ mb: 3, p: 2, border: '1px solid rgba(16,185,129,0.15)', bgcolor: 'rgba(16,185,129,0.01)' }}>
              <Typography variant="subtitle2" color="primary" fontWeight={800}>{t('activity.dailySummary')}</Typography>
              <Typography variant="subtitle1" fontWeight={700}>{t('activity.totalEmissions')} {dailyTotalEmission.toFixed(1)} kg CO₂</Typography>
            </Card>
          )}`
    ],
    [
      `<TableCell align="right">Actions</TableCell>`,
      `<TableCell align="right">{t('activity.actions')}</TableCell>`
    ],
    [
      `                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No activities logged yet.</Typography>
                    </TableCell>
                  </TableRow>`,
      `                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">{t('activity.noLogs')}</Typography>
                    </TableCell>
                  </TableRow>`
    ],
    [
      `if (window.confirm("Are you sure you want to delete this activity log?")) {`,
      `if (window.confirm(t('activity.deleteConfirm'))) {`
    ]
  ],
  "Goals.js": [
    [
      "import api from '../api';",
      "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"
    ],
    [
      "const Goals = () => {",
      "const Goals = () => {\n  const { t } = useTranslation();"
    ],
    [
      "setError('Could not retrieve goals.');",
      "setError(t('goals.retrieveError'));"
    ],
    [
      "setError('Target reduction percentage must be between 1% and 100%');",
      "setError(t('goals.validationTarget'));"
    ],
    [
      "setSuccess('Goal established successfully!');",
      "setSuccess(t('goals.successCreate'));"
    ],
    [
      "setError(err.response?.data?.message || 'Failed to establish goal.');",
      "setError(err.response?.data?.message || t('goals.failCreate'));"
    ],
    [
      "setSuccess('Goal deleted successfully!');",
      "setSuccess(t('goals.successDelete'));"
    ],
    [
      "setError('Goal deletion failed.');",
      "setError(t('goals.failDelete'));"
    ],
    [
      `          <Typography variant="h4" fontWeight={900} gutterBottom>
            Sustainability Goals
          </Typography>`,
      `          <Typography variant="h4" fontWeight={900} gutterBottom>
            {t('goals.title')}
          </Typography>`
    ],
    [
      `            <Typography variant="subtitle1" fontWeight={850} sx={{ mb: 2 }}>
              🎯 Establish Custom Sustainability Goal
            </Typography>`,
      `            <Typography variant="subtitle1" fontWeight={850} sx={{ mb: 2 }}>
              🎯 {t('goals.establishTitle')}
            </Typography>`
    ],
    [
      `              <TextField
                label="Goal Title (e.g. 15% Commute Reduction)"`,
      `              <TextField
                label={t('goals.formTitle')}`
    ],
    [
      `              <TextField
                type="number"
                label="Target Reduction (%)"`,
      `              <TextField
                type="number"
                label={t('goals.formTarget')}`
    ],
    [
      `              <TextField
                type="date"
                label="Start Date"`,
      `              <TextField
                type="date"
                label={t('goals.formStart')}`
    ],
    [
      `              <TextField
                type="date"
                label="Target End Date"`,
      `              <TextField
                type="date"
                label={t('goals.formEnd')}`
    ],
    [
      `              <Button type="submit" variant="contained" color="secondary" fullWidth disabled={loading}>
                {loading ? 'Creating...' : 'Create Goal'}
              </Button>`,
      `              <Button type="submit" variant="contained" color="secondary" fullWidth disabled={loading}>
                {loading ? t('goals.formCreating') : t('goals.formSubmit')}
              </Button>`
    ],
    [
      `          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            Your Goals & Target Progress
          </Typography>
          
          {goals.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Typography variant="body2" color="text.secondary">
                You don't have any active carbon reduction goals.
              </Typography>
            </Paper>`,
      `          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            {t('goals.listTitle')}
          </Typography>
          
          {goals.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Typography variant="body2" color="text.secondary">
                {t('goals.noGoals')}
              </Typography>
            </Paper>`
    ],
    [
      `<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Target: {goal.targetReductionPercentage}% Reduction
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {goal.startDate} to {goal.targetDate}
                      </Typography>`,
      `<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {t('goals.targetReduction')} {goal.targetReductionPercentage}% Reduction
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {goal.startDate} {t('goals.to')} {goal.targetDate}
                      </Typography>`
    ]
  ],
  "Feedback.js": [
    [
      "import api from '../api';",
      "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"
    ],
    [
      "const Feedback = () => {",
      "const Feedback = () => {\n  const { t } = useTranslation();"
    ],
    [
      "setSuccess('Feedback submitted successfully! Thank you for helping us improve.');",
      "setSuccess(t('feedback.successMsg'));"
    ],
    [
      "setError('Failed to submit feedback.');",
      "setError(t('feedback.errorMsg'));"
    ],
    [
      `          <Typography variant="h4" fontWeight={900} gutterBottom>
            Submit Platform Feedback
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Help us improve Carbon Tracker. Share your experience, report bugs, or request features.
          </Typography>`,
      `          <Typography variant="h4" fontWeight={900} gutterBottom>
            {t('feedback.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('feedback.subtitle')}
          </Typography>`
    ],
    [
      `              <TextField
                select
                label="Feedback Category"`,
      `              <TextField
                select
                label={t('feedback.formCategory')}`
    ],
    [
      `              <TextField
                select
                label="Star Rating (1-5)"`,
      `              <TextField
                select
                label={t('feedback.formRating')}`
    ],
    [
      `              <TextField
                label="Written Feedback"`,
      `              <TextField
                label={t('feedback.formText')}`
    ],
    [
      `              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Grid>`,
      `              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? t('feedback.submitting') : t('feedback.formSubmit')}
                </Button>
              </Grid>`
    ]
  ],
  "LoginPage.js": [
    [
      "import { useAuth } from '../context/AuthContext';",
      "import { useAuth } from '../context/AuthContext';\nimport { useTranslation } from '../context/LanguageContext';"
    ],
    [
      "const LoginPage = () => {",
      "const LoginPage = () => {\n  const { t } = useTranslation();"
    ],
    [
      `          <Typography variant="h3" fontWeight={900} sx={{ mb: 2, lineHeight: 1.2 }}>
            Measure, Reduce, and <Box component="span" sx={{ color: 'primary.main' }}>Offset</Box> Your Footprint.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            Join thousands of community members logging their daily activities, competing on the leaderboard, and completing carbon reduction goals.
          </Typography>`,
      `          <Typography variant="h3" fontWeight={900} sx={{ mb: 2, lineHeight: 1.2 }}>
            {t('auth.loginHeroTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            {t('auth.loginHeroDesc')}
          </Typography>`
    ],
    [
      `                  <Typography variant="h5" fontWeight={900} color="primary.main">1,250+</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>TONS CO2 SAVED</Typography>`,
      `                  <Typography variant="h5" fontWeight={900} color="primary.main">1,250+</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>{t('auth.tonsSaved')}</Typography>`
    ],
    [
      `                  <Typography variant="h5" fontWeight={900} color="secondary.main">280K+</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>ACTIVITIES LOGGED</Typography>`,
      `                  <Typography variant="h5" fontWeight={900} color="secondary.main">280K+</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>{t('auth.activitiesLogged')}</Typography>`
    ],
    [
      `          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to manage your carbon footprint logs and tracker.
          </Typography>`,
      `          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('auth.loginSubtitle')}
          </Typography>`
    ],
    [
      `              <TextField
                label="Email Address"`,
      `              <TextField
                label={t('auth.email')}`
    ],
    [
      `              <TextField
                label="Password"`,
      `              <TextField
                label={t('auth.password')}`
    ],
    [
      `                  <Link to="/forgot-password" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                    Forgot Password?
                  </Link>`,
      `                  <Link to="/forgot-password" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                    {t('auth.forgot_password')}
                  </Link>`
    ],
    [
      `                <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>`,
      `                <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                  {loading ? t('auth.loggingIn') : t('auth.login')}
                </Button>`
    ],
    [
      `            <Divider>Or</Divider>`,
      `            <Divider>{t('auth.or')}</Divider>`
    ],
    [
      `          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }}
          >
            Sign In with Google
          </Button>`,
      `          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }}
          >
            {t('auth.googleLogin')}
          </Button>`
    ],
    [
      `          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                Register here
              </Link>
            </Typography>
          </Box>`,
      `          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              {t('auth.noAccount')}{' '}
              <Link to="/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                {t('auth.registerHere')}
              </Link>
            </Typography>
          </Box>`
    ]
  ],
  "RegisterPage.js": [
    [
      "import { useAuth } from '../context/AuthContext';",
      "import { useAuth } from '../context/AuthContext';\nimport { useTranslation } from '../context/LanguageContext';"
    ],
    [
      "const RegisterPage = () => {",
      "const RegisterPage = () => {\n  const { t } = useTranslation();"
    ],
    [
      `          <Typography variant="h3" fontWeight={900} sx={{ mb: 2, lineHeight: 1.2 }}>
            Start Your <Box component="span" sx={{ color: 'primary.main' }}>Green</Box> Journey Today.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            Create your account to unlock personalized recommendations, track your sustainability logs, and visualize progress in real-time.
          </Typography>`,
      `          <Typography variant="h3" fontWeight={900} sx={{ mb: 2, lineHeight: 1.2 }}>
            {t('auth.registerHeroTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            {t('auth.registerHeroDesc')}
          </Typography>`
    ],
    [
      `              <Typography variant="subtitle2" fontWeight={800} color="secondary.main" gutterBottom>
                Did you know?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Logging activities daily helps build eco-conscious habits. Average users reduce their carbon output by 15% in their first month!
              </Typography>`,
      `              <Typography variant="subtitle2" fontWeight={800} color="secondary.main" gutterBottom>
                {t('auth.didYouKnow')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t('auth.didYouKnowDesc')}
              </Typography>`
    ],
    [
      `          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Join the carbon tracking platform and begin measuring impact.
          </Typography>`,
      `          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('auth.registerSubtitle')}
          </Typography>`
    ],
    [
      `              <TextField
                label="Full Name"`,
      `              <TextField
                label={t('auth.fullName')}`
    ],
    [
      `              <TextField
                label="Email Address"`,
      `              <TextField
                label={t('auth.email')}`
    ],
    [
      `              <TextField
                label="Mobile Number"`,
      `              <TextField
                label={t('auth.mobileNumber')}`
    ],
    [
      `              <TextField
                label="Password"`,
      `              <TextField
                label={t('auth.password')}`
    ],
    [
      `              <TextField
                label="Confirm Password"`,
      `              <TextField
                label={t('auth.confirmPassword')}`
    ],
    [
      `              <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>`,
      `              <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                {loading ? t('auth.registering') : t('auth.register')}
              </Button>`
    ],
    [
      `          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                Sign in here
              </Link>
            </Typography>
          </Box>`,
      `          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                {t('auth.loginHere')}
              </Link>
            </Typography>
          </Box>`
    ],
    [
      `    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return "Password must be alphanumeric (contain both letters and numbers).";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character (e.g. @, #, $, %, etc.).";
    }`,
      `    if (password.length < 8) {
      return t('auth.validationPasswordLength');
    }
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return t('auth.validationPasswordAlphanumeric');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return t('auth.validationPasswordSpecial');
    }`
    ],
    [
      `    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }`,
      `    if (password !== confirmPassword) {
      setError(t('profile.passwordMatchError'));
      return;
    }`
    ],
    [
      `      if (res.data.success) {
        setSuccess("Registration completed! Redirecting to login...");`,
      `      if (res.data.success) {
        setSuccess(t('auth.registrationSuccess'));`
    ]
  ],
  "ForgotPasswordPage.js": [
    [
      "import api from '../api';",
      "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"
    ],
    [
      "const ForgotPasswordPage = () => {",
      "const ForgotPasswordPage = () => {\n  const { t } = useTranslation();"
    ],
    [
      `          <Typography variant="h5" fontWeight={900} gutterBottom>
            Forgot Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your registered email address to receive a 6-digit verification code.
          </Typography>`,
      `          <Typography variant="h5" fontWeight={900} gutterBottom>
            {t('auth.forgotPasswordTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('auth.forgotPasswordSubtitle')}
          </Typography>`
    ],
    [
      `              <TextField
                label="Email Address"`,
      `              <TextField
                label={t('auth.email')}`
    ],
    [
      `              <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>`,
      `              <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                {loading ? t('auth.forgotPasswordSending') : t('auth.forgotPasswordBtn')}
              </Button>`
    ],
    [
      `            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              Back to Sign In
            </Link>`,
      `            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              {t('auth.loginHere')}
            </Link>`
    ]
  ],
  "OtpVerificationPage.js": [
    [
      "import api from '../api';",
      "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"
    ],
    [
      "const OtpVerificationPage = () => {",
      "const OtpVerificationPage = () => {\n  const { t } = useTranslation();"
    ],
    [
      `          <Typography variant="h5" fontWeight={900} gutterBottom>
            Verify OTP
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the 6-digit code sent to <strong>{email}</strong>.
          </Typography>`,
      `          <Typography variant="h5" fontWeight={900} gutterBottom>
            {t('auth.otpTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            <Box component="span">{t('auth.otpSubtitle')} <strong>{email}</strong></Box>
          </Typography>`
    ],
    [
      `              <TextField
                label="Email Address"`,
      `              <TextField
                label={t('auth.email')}`
    ],
    [
      `              <TextField
                label="6-Digit OTP"`,
      `              <TextField
                label={t('auth.otpLabel')}`
    ],
    [
      `              <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>`,
      `              <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                {loading ? t('auth.otpsending') : t('auth.otpBtnVerify')}
              </Button>`
    ],
    [
      `            <Button color="secondary" onClick={handleResend} disabled={resendLoading}>
              Resend OTP
            </Button>`,
      `            <Button color="secondary" onClick={handleResend} disabled={resendLoading}>
              {t('auth.resendOtp')}
            </Button>`
    ],
    [
      `            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              Back to Sign In
            </Link>`,
      `            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              {t('auth.loginHere')}
            </Link>`
    ]
  ],
  "Profile.js": [
    [
      "import api from '../api';",
      "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"
    ],
    [
      "const Profile = () => {",
      "const Profile = () => {\n  const { t } = useTranslation();"
    ],
    [
      `    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }`,
      `    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordError(t('profile.passwordMatchError'));
      return;
    }`
    ],
    [
      `      if (res.data.success) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordState({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }`,
      `      if (res.data.success) {
        setPasswordSuccess(t('profile.passwordSuccess'));
        setPasswordState({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }`
    ],
    [
      `    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password. Please check your credentials.');
    }`,
      `    } catch (err) {
      setPasswordError(err.response?.data?.message || t('profile.passwordFail'));
    }`
    ],
    [
      `          <Typography variant="h4" fontWeight={900} gutterBottom>
            User Profile Center
          </Typography>`,
      `          <Typography variant="h4" fontWeight={900} gutterBottom>
            {t('profile.title')}
          </Typography>`
    ],
    [
      `      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
      >
        <Tab label="Profile Information" />
        <Tab label="Activity History" />
        <Tab label="Badges & Badging" />
        <Tab label="Carbon Certificates" />
        <Tab label="Achievements" />
        <Tab label="Rewards & Levels" />
        <Tab label="Notifications" />
        <Tab label="Settings" />
      </Tabs>`,
      `      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
      >
        <Tab label={t('profile.tabProfile')} />
        <Tab label={t('profile.tabHistory')} />
        <Tab label={t('profile.tabBadges')} />
        <Tab label={t('profile.tabCertificates')} />
        <Tab label={t('profile.tabAchievements')} />
        <Tab label={t('profile.tabRewards')} />
        <Tab label={t('profile.tabNotifications')} />
        <Tab label={t('profile.tabSettings')} />
      </Tabs>`
    ],
    [
      `            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
              Edit Profile Details
            </Typography>`,
      `            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
              {t('profile.editTitle')}
            </Typography>`
    ],
    [
      `                  <TextField
                    label="Full Name"`,
      `                  <TextField
                    label={t('profile.fullName')}`
    ],
    [
      `                  <TextField
                    label="Email Address"`,
      `                  <TextField
                    label={t('profile.email')}`
    ],
    [
      `                  <TextField
                    label="Mobile Number"`,
      `                  <TextField
                    label={t('profile.mobileNumber')}`
    ],
    [
      `                  <TextField
                    type="date"
                    label="Date of Birth"`,
      `                  <TextField
                    type="date"
                    label={t('profile.dob')}`
    ],
    [
      `                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={profileInfo.gender || ''}
                      onChange={(e) => setProfileInfo({ ...profileInfo, gender: e.target.value })}
                      label="Gender"
                    >`,
      `                  <FormControl fullWidth>
                    <InputLabel>{t('profile.gender')}</InputLabel>
                    <Select
                      value={profileInfo.gender || ''}
                      onChange={(e) => setProfileInfo({ ...profileInfo, gender: e.target.value })}
                      label={t('profile.gender')}
                    >`
    ],
    [
      `                  <TextField
                    label="Sustainability Preferences"
                    placeholder="e.g. Vegetarian, EV Driver, Solar Energy user..."`,
      `                  <TextField
                    label={t('profile.preferences')}
                    placeholder={t('profile.preferencesPlaceholder')}`
    ],
    [
      `                  <TextField
                    label="Country"`,
      `                  <TextField
                    label={t('profile.country')}`
    ],
    [
      `                  <TextField
                    label="State"`,
      `                  <TextField
                    label={t('profile.state')}`
    ],
    [
      `                  <TextField
                    label="City"`,
      `                  <TextField
                    label={t('profile.city')}`
    ],
    [
      `              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Button>`,
      `              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={saveLoading}
              >
                {saveLoading ? t('profile.saving') : t('profile.saveChanges')}
              </Button>`
    ]
  ]
};

// Process each file
for (const [filename, fileRepls] of Object.entries(fileBlocks)) {
  const filepath = path.join(pagesDir, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filename}`);
    continue;
  }
  let content = fs.readFileSync(filepath, 'utf8');
  
  content = content.replace(/\r\n/g, '\n');
  let modified = false;

  for (let [target, replacement] of fileRepls) {
    // Escape target to regex
    const regex = makeBlockRegex(target);

    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    } else {
      console.warn(`[Warning] Block not found in ${filename}: "${target.slice(0, 50).replace(/\n/g, '\\n')}..."`);
    }
  }

  if (modified) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Successfully block-translated: ${filename}`);
  }
}
console.log("Unified block-level translations completed!");
