const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'frontend', 'src', 'pages', 'Recommendations.js');
let content = fs.readFileSync(filepath, 'utf8');

const replacements = [
  ["import api from '../api';", "import api from '../api';\nimport { useTranslation } from '../context/LanguageContext';"],
  ["const Recommendations = () => {", "const Recommendations = () => {\n  const { t } = useTranslation();"],
  ["setError('Could not retrieve personalized recommendations.');", "setError(t('recs.retrieveError'));"],
  ["setSuccess(`Recommendation marked as ${newStatus.replace('_', ' ').toLowerCase()}!`);", "setSuccess(t('recs.successUpdate'));"],
  ["setError('Failed to update recommendation status.');", "setError(t('recs.failUpdate'));"],
  ["Personalized Eco Recommendations", "{t('recs.insufficientDataTitle')}"],
  ["We need a little more activity data to generate personalized recommendations. Log at least 3 activities to enable our smart engine.", "{t('recs.insufficientDataDesc')}"],
  ["Go To Activity Logs", "{t('recs.goToLogs')}"],
  ["AI-powered recommendations based on your activity pattern to help you cut carbon emissions.", "{t('recs.subtitle')}"],
  ["label=\"Active Recommendations\"", "label={t('recs.tabActive')}"],
  ["label=\"Recommendation History\"", "label={t('recs.tabHistory')}"],
  ["label=\"Recommendation Analytics\"", "label={t('recs.tabAnalytics')}"],
  ["label=\"Filter by Category\"", "label={t('recs.filterCategory')}"],
  ["<MenuItem value=\"ALL\">All Categories</MenuItem>", "<MenuItem value=\"ALL\">{t('recs.filterAll')}</MenuItem>"],
  ["<MenuItem value=\"TRANSPORT\">Transport</MenuItem>", "<MenuItem value=\"TRANSPORT\">{t('dashboard.catTransport')}</MenuItem>"],
  ["<MenuItem value=\"ELECTRICITY\">Electricity</MenuItem>", "<MenuItem value=\"ELECTRICITY\">{t('dashboard.catElectricity')}</MenuItem>"],
  ["<MenuItem value=\"FOOD\">Food</MenuItem>", "<MenuItem value=\"FOOD\">{t('dashboard.catFood')}</MenuItem>"],
  ["<MenuItem value=\"SHOPPING\">Shopping</MenuItem>", "<MenuItem value=\"SHOPPING\">{t('dashboard.catShopping')}</MenuItem>"],
  ["label=\"Analysis Period\"", "label={t('recs.periodLabel')}"],
  ["<MenuItem value=\"7DAYS\">Last 7 Days</MenuItem>", "<MenuItem value=\"7DAYS\">{t('recs.period7')}</MenuItem>"],
  ["<MenuItem value=\"30DAYS\">Last 30 Days</MenuItem>", "<MenuItem value=\"30DAYS\">{t('recs.period30')}</MenuItem>"],
  ["<MenuItem value=\"CUSTOM\">Custom Range</MenuItem>", "<MenuItem value=\"CUSTOM\">{t('recs.periodCustom')}</MenuItem>"],
  ["label=\"From\"", "label={t('recs.from')}"],
  ["label=\"To\"", "label={t('recs.to')}"],
  [`<Button type="submit" variant="contained" color="secondary">
                  Apply Filter
                </Button>`, `<Button type="submit" variant="contained" color="secondary">
                  {t('recs.search')}
                </Button>`],
  ["Estimated Period Savings: ", "{t('recs.estSavings')}"],
  ["Active Recommendations: ", "{t('recs.activeRecsCount')}"],
  ["Completed Tasks: ", "{t('recs.completedRecsCount')}"],
  ["No active recommendations matching your filter.", "{t('recs.noActive')}"],
  ["CRITICAL", "{t('recs.badgeCritical')}"],
  ["HIGH", "{t('recs.badgeHigh')}"],
  ["MEDIUM", "{t('recs.badgeMedium')}"],
  ["LOW", "{t('recs.badgeLow')}"],
  ["Potential Savings: ", "{t('recs.potentialSavings')}"],
  [" kg CO2", "{t('recs.kg')}"],
  ["Implement Action", "{t('recs.actionImplement')}"],
  ["Ignore Recommendation", "{t('recs.actionIgnore')}"],
  ["Snooze (24h)", "{t('recs.actionSnooze')}"],
  ["View Details", "{t('recs.actionDetails')}"],
  ["No historical recommendations found.", "{t('recs.noHistory')}"],
  ["Re-activate", "{t('recs.actionReactivate')}"],
  ["Total Emissions Averted", "{t('recs.totalAverted')}"],
  ["Recommendation Implementation Rate", "{t('recs.implementationRate')}"],
  ["Estimated Carbon Savings by Category", "{t('recs.categorySavingsTitle')}"],
  ["Recommendation Status Distribution", "{t('recs.statusDistribution')}"],
  ["Not enough recommendation data to display charts.", "{t('recs.noDataAnalytics')}"],
  ["Recommendation Analysis Details", "{t('recs.dialogTitle')}"],
  ["Potential Carbon Reduction: ", "{t('recs.dialogPotential')}"],
  ["Difficulty / Feasibility Level: ", "{t('recs.dialogDifficulty')}"],
  ["Estimated Implementation Cost: ", "{t('recs.dialogCost')}"],
  ["Target Mitigation Timeline: ", "{t('recs.dialogTimeline')}"],
  ["Why this recommendation is generated:", "{t('recs.dialogWhy')}"],
  ["Actionable Implementation Steps:", "{t('recs.dialogHow')}"],
  [`            <Button onClick={() => setDetailRec(null)} color="inherit">
              Close
            </Button>`, `            <Button onClick={() => setDetailRec(null)} color="inherit">
              {t('recs.dialogClose')}
            </Button>`]
];

for (const [target, replacement] of replacements) {
  if (content.includes(target)) {
    content = content.split(target).join(replacement);
  } else {
    console.warn(`Target not found in Recommendations.js: "${target.slice(0, 40)}"`);
  }
}

fs.writeFileSync(filepath, content, 'utf8');
console.log("Recommendations.js successfully fixed and translated!");
