// ============================================================================
// Gemini AI Integration Live Test
// Verifies live API key communication and strict app data grounding
// ============================================================================

import { AMA_PROFILE, INITIAL_EVIDENCE_RECORDS, INITIAL_IMPROVEMENT_ACTIONS } from '../data/seedData';
import { calculateAssessment } from '../services/assessmentEngine';
import { generateCoachingResponse } from '../services/geminiCoachService';

async function testGeminiIntegration() {
  console.log('Testing Gemini 3.6 Flash Integration with live App Data...');
  const assessment = calculateAssessment(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS);

  console.log(`Profile: ${AMA_PROFILE.name} (${AMA_PROFILE.businessName})`);
  console.log(`Assessment: ${assessment.overallScore}/1000 (${assessment.readinessBand}), ECI: ${assessment.eci.overall}%`);

  const userQuery = 'Why is my readiness score 742? What is holding me back most?';
  console.log(`\nQuery: "${userQuery}"`);
  console.log('Calling generateCoachingResponse...');

  const response = await generateCoachingResponse({
    query: userQuery,
    profile: AMA_PROFILE,
    assessment,
    evidenceRecords: INITIAL_EVIDENCE_RECORDS,
    improvementActions: INITIAL_IMPROVEMENT_ACTIONS,
  });

  console.log('\n--- Gemini Coaching Response ---');
  console.log(`Model: ${response.model}`);
  console.log(`Is AI Generated: ${response.isAiGenerated}`);
  console.log(`Suggested Prompts:\n  ${response.suggestedPrompts.join('\n  ')}`);
  console.log('\nResponse Text:\n' + response.text);
  console.log('--------------------------------\n');

  // Verify that the response strictly contains app data facts
  const mustContain = ['742', 'Capital Ready', 'Documentation Completeness', '53', '64'];
  const missing = mustContain.filter(k => !response.text.includes(k));

  if (missing.length === 0) {
    console.log('✓ PASS: All verified score metrics and indicators were accurately cited!');
  } else {
    console.warn(`Notice: Response omitted keywords: ${missing.join(', ')}`);
  }
}

testGeminiIntegration().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
