// ============================================================================
// CapitalBridge Phase 2 Automated Test Suite
// Verifies: Fintech Design System, Accessible UI Primitives & Navigation Shell
// ============================================================================

import fs from 'fs';
import path from 'path';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    testsFailed++;
  }
}

async function runPhase2Tests() {
  console.log('\n======================================================');
  console.log('🎨 RUNNING PHASE 2 TEST SUITE: FINTECH DESIGN & SHELL');
  console.log('======================================================\n');

  const srcDir = path.resolve(process.cwd(), 'src');

  // ----------------------------------------------------
  // Test Suite 1: Design Tokens & CSS Architecture
  // ----------------------------------------------------
  console.log('--- Suite 1: Fintech Theme Tokens & Typography ---');
  const indexCss = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf-8');

  assert(indexCss.includes('@import "tailwindcss";'), 'Tailwind CSS v4 import present');
  assert(indexCss.includes('#0b0f19'), 'Fintech dark slate background token defined (#0b0f19)');
  assert(indexCss.includes('tabular-nums'), 'Tabular figures utility defined for highly legible financial figures');
  assert(indexCss.includes('font-family'), 'Accessible system font stack configured');
  assert(indexCss.includes('::-webkit-scrollbar'), 'Custom subtle scrollbar configured for polished fintech feel');

  // ----------------------------------------------------
  // Test Suite 2: UI Primitives & Accessibility Rules
  // ----------------------------------------------------
  console.log('\n--- Suite 2: Accessible UI Primitives ---');
  const badgeFile = fs.readFileSync(path.join(srcDir, 'components', 'ui', 'Badge.tsx'), 'utf-8');
  assert(badgeFile.includes('export const Badge'), 'Badge component exported');
  assert(badgeFile.includes('CheckCircle2') && badgeFile.includes('AlertTriangle'), 'Badge includes status icons (never relies on color alone)');

  const buttonFile = fs.readFileSync(path.join(srcDir, 'components', 'ui', 'Button.tsx'), 'utf-8');
  assert(buttonFile.includes('export const Button'), 'Button component exported');
  assert(buttonFile.includes('isLoading'), 'Button supports loading state with spinner');
  assert(buttonFile.includes('leftIcon') && buttonFile.includes('rightIcon'), 'Button supports left and right icon slots');

  const cardFile = fs.readFileSync(path.join(srcDir, 'components', 'ui', 'Card.tsx'), 'utf-8');
  assert(cardFile.includes('export const Card'), 'Card primitive component exported');
  assert(cardFile.includes('glass') && cardFile.includes('surface'), 'Card supports glass and surface elevations');

  // ----------------------------------------------------
  // Test Suite 3: Desktop Sidebar Navigation
  // ----------------------------------------------------
  console.log('\n--- Suite 3: Desktop Sidebar Navigation ---');
  const sidebarFile = fs.readFileSync(path.join(srcDir, 'components', 'layout', 'Sidebar.tsx'), 'utf-8');
  assert(sidebarFile.includes('Overview'), 'Sidebar contains Overview / Dashboard tab');
  assert(sidebarFile.includes('Evidence Center'), 'Sidebar contains Evidence Center tab');
  assert(sidebarFile.includes('Readiness Metrics'), 'Sidebar contains Readiness Metrics tab');
  assert(sidebarFile.includes('What-If Simulator'), 'Sidebar contains What-If Simulator tab');
  assert(sidebarFile.includes('AI Credit Coach'), 'Sidebar contains AI Credit Coach tab');
  assert(sidebarFile.includes('Action Plan'), 'Sidebar contains Action Plan tab');
  assert(sidebarFile.includes('Financial Passport'), 'Sidebar contains Financial Passport tab');
  assert(sidebarFile.includes('Lender View'), 'Sidebar contains Lender View tab');
  assert(sidebarFile.includes('Profile & Consent'), 'Sidebar contains Profile & Consent secondary link');
  assert(sidebarFile.includes('Deterministic Math'), 'Sidebar displays methodology and calculation disclaimer');

  // ----------------------------------------------------
  // Test Suite 4: Mobile Bottom Navigation
  // ----------------------------------------------------
  console.log('\n--- Suite 4: Mobile Viewport Bottom Navigation ---');
  const bottomNavFile = fs.readFileSync(path.join(srcDir, 'components', 'layout', 'BottomNav.tsx'), 'utf-8');
  assert(bottomNavFile.includes('lg:hidden'), 'BottomNav is hidden on desktop viewports');
  assert(bottomNavFile.includes('fixed bottom-0'), 'BottomNav is fixed to bottom of mobile viewport');
  assert(bottomNavFile.includes('Overview') && bottomNavFile.includes('Passport'), 'BottomNav contains essential mobile journey tabs');

  // ----------------------------------------------------
  // Test Suite 5: Navbar & Profile Context
  // ----------------------------------------------------
  console.log('\n--- Suite 5: Top Navbar & Persona Context ---');
  const navbarFile = fs.readFileSync(path.join(srcDir, 'components', 'layout', 'Navbar.tsx'), 'utf-8');
  assert(navbarFile.includes('CapitalBridge'), 'Navbar renders CapitalBridge brand logo');
  assert(navbarFile.includes('Explainable Financial-Readiness Platform'), 'Navbar renders platform subtitle');
  assert(navbarFile.includes('readinessBand'), 'Navbar displays live readiness band');
  assert(navbarFile.includes('score'), 'Navbar displays live readiness score');
  assert(navbarFile.includes('onOpenPassport'), 'Navbar includes direct Financial Passport action');
  assert(navbarFile.includes('onOpenProfile'), 'Navbar includes clickable Ama profile chip');

  // ----------------------------------------------------
  // Test Suite 6: Profile & Consent Drawer
  // ----------------------------------------------------
  console.log('\n--- Suite 6: Profile & Consent Drawer ---');
  const profileDrawerFile = fs.readFileSync(path.join(srcDir, 'components', 'ui', 'ProfileDrawer.tsx'), 'utf-8');
  assert(profileDrawerFile.includes('profile.businessName'), 'Profile drawer displays business enterprise name');
  assert(profileDrawerFile.includes('capitalGoalAmount'), 'Profile drawer displays capital goal (GH₵8,000)');
  assert(profileDrawerFile.includes('BN-2024-8192'), 'Profile drawer confirms Registrar General registration');
  assert(profileDrawerFile.includes('AMA Food Hygiene Permit'), 'Profile drawer confirms municipal health permit');

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runPhase2Tests();
