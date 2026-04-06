import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ─── Admin ───────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin@123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@insutech.in' },
    update: {},
    create: { email: 'admin@insutech.in', passwordHash, name: 'INSUTECH Admin' },
  });
  console.log('✓ Admin created  →  admin@insutech.in / admin@123');

  // ─── Insurers ─────────────────────────────────────────────────────────────
  const insurers = await Promise.all([
    upsertInsurer('ICICI Lombard', 'PVT', 'India\'s largest private health insurer offering comprehensive Elevate plans.'),
    upsertInsurer('SBI General', 'PVT', 'SBI-backed general insurer with competitive Super Health Prime plans.'),
    upsertInsurer('TATA AIG', 'PVT', 'Tata-AIG joint venture offering MediCare Premier with wide coverage.'),
    upsertInsurer('HDFC ERGO', 'PVT', 'HDFC-backed insurer with feature-rich Optima Secure health plans.'),
    upsertInsurer('Oriental Insurance', 'PSU', 'Government-backed insurer offering Mediclaim and Happy Family Floater plans.'),
    upsertInsurer('United India Insurance', 'PSU', 'PSU insurer with Platinum/Gold individual plans and Family Medicare.'),
    upsertInsurer('New India Assurance', 'PSU', 'India\'s largest public sector general insurer with Mediclaim plans.'),
  ]);

  const [icici, sbi, tata, hdfc, oriental, united, newIndia] = insurers;
  console.log('✓ Insurers seeded');

  // ─── Plans ────────────────────────────────────────────────────────────────

  // PVT — INDIVIDUAL
  const iciciInd = await upsertPlan(icici.id, 'Elevate', 'INDIVIDUAL', null, 1000000, 30000000, 18, 125);
  const sbiInd   = await upsertPlan(sbi.id,   'Super Health Prime', 'INDIVIDUAL', null, 500000, 20000000, 18, 999);
  const tataInd  = await upsertPlan(tata.id,  'MediCare Premier', 'INDIVIDUAL', null, 1000000, 20000000, 18, 65);
  const hdfcInd  = await upsertPlan(hdfc.id,  'Optima Secure', 'INDIVIDUAL', null, 500000, 20000000, 18, 35);

  // PVT — FAMILY FLOATER
  const iciciFF = await upsertPlan(icici.id, 'Elevate', 'FAMILY_FLOATER', null, 1000000, 30000000, 18, 125);
  const sbiFF   = await upsertPlan(sbi.id,   'Super Health Prime', 'FAMILY_FLOATER', null, 500000, 20000000, 18, 999);
  const tataFF  = await upsertPlan(tata.id,  'MediCare Premier', 'FAMILY_FLOATER', null, 1000000, 20000000, 18, 65);
  const hdfcFF  = await upsertPlan(hdfc.id,  'Optima Secure', 'FAMILY_FLOATER', null, 500000, 20000000, 18, 35);

  // PSU — INDIVIDUAL
  const orientalInd = await upsertPlan(oriental.id, 'Oriental Mediclaim', 'INDIVIDUAL', null, 300000, 5000000, 18, 65);
  const unitedPlatInd = await upsertPlan(united.id, 'Platinum Plan', 'INDIVIDUAL', 'Platinum', 300000, 2000000, 18, 35);
  const unitedGoldInd = await upsertPlan(united.id, 'Gold Plan', 'INDIVIDUAL', 'Gold', 300000, 1000000, 35, 60);
  const newIndiaInd = await upsertPlan(newIndia.id, 'NEW INDIA Mediclaim', 'INDIVIDUAL', null, 300000, 1500000, 18, 65);

  // PSU — FAMILY FLOATER
  const orientalSilverFF  = await upsertPlan(oriental.id, 'Happy Family Floater 2024', 'FAMILY_FLOATER', 'Silver',  300000,  500000, 21, 65);
  const orientalGoldFF    = await upsertPlan(oriental.id, 'Happy Family Floater 2024', 'FAMILY_FLOATER', 'Gold',    600000, 1000000, 21, 65);
  const orientalDiamondFF = await upsertPlan(oriental.id, 'Happy Family Floater 2024', 'FAMILY_FLOATER', 'Diamond', 1200000, 2000000, 21, 65);
  const unitedFF = await upsertPlan(united.id, 'Family Medicare', 'FAMILY_FLOATER', null, 300000, 2500000, 18, 60);
  const newIndiaFF = await upsertPlan(newIndia.id, 'Family Floater', 'FAMILY_FLOATER', null, 300000, 1500000, 18, 65);

  console.log('✓ Plans seeded');

  // ─── Features ─────────────────────────────────────────────────────────────

  // Helper for feature categories
  const BASIC     = 'Basic Info';
  const WAITING   = 'Waiting Periods';
  const COVERAGE  = 'Coverage';
  const BENEFITS  = 'Benefits';
  const OPTIONAL  = 'Optional Covers';
  const COSTS     = 'Costs & Discounts';

  // ── ICICI Elevate (Individual + FF share same features) ──
  for (const planId of [iciciInd.id, iciciFF.id]) {
    const isFF = planId === iciciFF.id;
    await seedFeatures(planId, [
      [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               '10L, 15L, 20L, 25L, 50L, 1Cr, 3Cr'],
      [BASIC,    1,  'family_floater_limit',       'Family Floater Limit',              isFF ? '2 Adults & 3 Kids' : 'N/A'],
      [BASIC,    2,  'child_dependent_age',        'Child Dependent Age',               '30 Years'],
      [BASIC,    3,  'entry_age',                  'Entry Age',                         '18 yrs to 125 yrs'],
      [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
      [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                '36 months (reducible to 24 or 12 months with add-on)'],
      [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '24 months (reducible to 12 months with add-on)'],
      [WAITING,  3,  'waiting_period_maternity',   'Maternity Waiting Period',          '24 months (reducible to 12 months with add-on)'],
      [COVERAGE, 0,  'inpatient_hospitalization',  'In-Patient Hospitalization',        'Covers hospitalization ≥24 hrs incl. ICU up to Sum Insured'],
      [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   'At Actual'],
      [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         'At Actual'],
      [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '90 days'],
      [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '180 days'],
      [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Covered fully up to Annual Sum Insured (wide list)'],
      [COVERAGE, 6,  'domiciliary_hospitalization','Domiciliary Hospitalization',       'Covered up to Annual Sum Insured'],
      [COVERAGE, 7,  'ayush_coverage',             'AYUSH Coverage',                    'Inpatient covered up to Annual Sum Insured'],
      [COVERAGE, 8,  'organ_donor',                'Organ Donor Expenses',              'Covered up to Annual Sum Insured'],
      [COVERAGE, 9,  'advanced_modern_treatments', 'Advanced/Modern Treatments',        'Covered up to Annual Sum Insured'],
      [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Lump sum up to Annual SI (max ₹50 lakhs) on diagnosis'],
      [COVERAGE, 11, 'second_opinion',             'Second Opinion',                    'Available for critical illness'],
      [BENEFITS, 0,  'restore_benefit',            'Restore/Reset Benefit',             'Reset up to 100% of base SI, unlimited times; not on first claim'],
      [BENEFITS, 1,  'cumulative_bonus',           'Cumulative / Loyalty Bonus',        '20% of SI per claim-free year, max 100%'],
      [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    'Covered as per schedule'],
      [BENEFITS, 3,  'hospital_daily_cash',        'Hospital Daily Cash',               'Not standard (available via add-on)'],
      [BENEFITS, 4,  'convalescence_benefit',      'Convalescence Benefit',             '₹20,000 lump sum for hospitalization >10 days'],
      [BENEFITS, 5,  'claims_protector',           'Claims Protector',                  'Makes non-payable items payable within overall SI'],
      [BENEFITS, 6,  'inflation_protector',        'Inflation Protector',               'Annual SI increases based on inflation rate at renewal'],
      [BENEFITS, 7,  'newborn_vaccination',        'Newborn & Vaccination',             'First year: up to 1% of SI, max ₹10,000'],
      [BENEFITS, 8,  'preventive_health_checkup',  'Preventive Health Check-up',        'Up to 0.5% of SI, max ₹5,000'],
      [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   'Available as optional cover (24-month waiting period)'],
      [BENEFITS, 10, 'opd_coverage',               'OPD / BeFit Coverage',              'OPD via BeFit: consults, diagnostics, pharmacy via app'],
      [BENEFITS, 11, 'home_health_care',           'Home Health Care',                  'Nursing at home ₹2,000/day up to 10 days post-hospitalization'],
      [OPTIONAL, 0,  'air_ambulance',              'Air Ambulance',                     'Domestic air ambulance covered (emergency)'],
      [OPTIONAL, 1,  'worldwide_cover',            'Worldwide Cover',                   'Cashless worldwide cover for planned & emergency (2yr waiting)'],
      [OPTIONAL, 2,  'ped_waiting_reduction',      'PED Waiting Period Reduction',      'Reducible from 36 to 24 or 12 months'],
      [OPTIONAL, 3,  'infinite_care',              'Infinite Care',                     'Unlimited expenses for one hospitalization claim'],
      [OPTIONAL, 4,  'jumpstart',                  'JumpStart',                         'Reduced waiting for listed PEDs (30 days for some)'],
      [COSTS,    0,  'co_pay',                     'Co-Pay',                            'No mandatory co-pay; voluntary co-pay 10–50% for premium discount'],
      [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   'As per policy terms'],
      [COSTS,    2,  'family_discount',            'Family Discount',                   'Available'],
      [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            '20% of SI per claim-free year, max 100%'],
      [COSTS,    4,  'nri_advantage',              'NRI Advantage',                     '25% discount on base premium for NRIs'],
    ]);
  }

  // ── SBI Super Health Prime ──
  for (const planId of [sbiInd.id, sbiFF.id]) {
    const isFF = planId === sbiFF.id;
    await seedFeatures(planId, [
      [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               '5L, 10L, 15L, 20L, 25L, 50L, 1Cr, 2Cr'],
      [BASIC,    1,  'family_floater_limit',       'Family Floater Limit',              isFF ? 'Max 6 Adults & any number of Kids' : 'N/A'],
      [BASIC,    2,  'child_dependent_age',        'Child Dependent Age',               '91 Days to 30 years'],
      [BASIC,    3,  'entry_age',                  'Entry Age',                         '18 yrs to No limit'],
      [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
      [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                '24 months'],
      [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '24 months'],
      [WAITING,  3,  'waiting_period_maternity',   'Maternity Waiting Period',          'Not Covered'],
      [COVERAGE, 0,  'inpatient_hospitalization',  'In-Patient Hospitalization',        'Inpatient hospitalization ≥24 hrs covered'],
      [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   'At Actual'],
      [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         'At Actual'],
      [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '60 days'],
      [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '90 days'],
      [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Covered up to Sum Insured'],
      [COVERAGE, 6,  'domiciliary_hospitalization','Domiciliary Hospitalization',       'Covered'],
      [COVERAGE, 7,  'ayush_coverage',             'AYUSH Coverage',                    'Inpatient covered'],
      [COVERAGE, 8,  'organ_donor',                'Organ Donor Expenses',              'Covered'],
      [COVERAGE, 9,  'advanced_modern_treatments', 'Advanced/Modern Treatments',        'Listed modern/advanced treatments covered; bariatric with sub-limits'],
      [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Not Covered'],
      [COVERAGE, 11, 'second_opinion',             'Second Opinion',                    'E-opinion available'],
      [BENEFITS, 0,  'restore_benefit',            'Restore/Reset Benefit',             'ReInsure: SI reinstated unlimited times up to 100%/200%'],
      [BENEFITS, 1,  'cumulative_bonus',           'Cumulative / Loyalty Bonus',        '50% of Base SI per claim-free year (Enhanced CB)'],
      [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    'Emergency road ambulance covered per hospitalization'],
      [BENEFITS, 3,  'hospital_daily_cash',        'Hospital Daily Cash',               'Not standard'],
      [BENEFITS, 4,  'convalescence_benefit',      'Convalescence Benefit',             'Recovery benefit lump sum as per policy'],
      [BENEFITS, 5,  'claims_protector',           'Claims Shield',                     'Non-payable items (List I) become payable for accepted claims'],
      [BENEFITS, 6,  'inflation_protector',        'Inflation Protector',               'Not Covered'],
      [BENEFITS, 7,  'newborn_vaccination',        'Newborn & Vaccination',             'Child vaccination covered till 12 years of age'],
      [BENEFITS, 8,  'preventive_health_checkup',  'Preventive Health Check-up',        'Annual health check-up available'],
      [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   'Not Covered'],
      [BENEFITS, 10, 'opd_coverage',               'OPD Coverage',                      'OPD including diagnostics & pharmacy available as option; dental & vision optional'],
      [BENEFITS, 11, 'home_health_care',           'Home Health Care',                  'Home care included'],
      [OPTIONAL, 0,  'air_ambulance',              'Air Ambulance',                     'Domestic air ambulance with specified limits'],
      [OPTIONAL, 1,  'worldwide_cover',            'Worldwide Cover',                   'Medical treatment abroad for listed major illnesses (India diagnosis)'],
      [OPTIONAL, 2,  'ped_waiting_reduction',      'PED Waiting Period Reduction',      'Not Covered'],
      [OPTIONAL, 3,  'infinite_care',              'Infinite Care / Enhanced ReInsure', 'Enhanced ReInsure adds back up to 200% SI in same year'],
      [OPTIONAL, 4,  'jumpstart',                  'JumpStart',                         'Not Covered'],
      [COSTS,    0,  'co_pay',                     'Co-Pay',                            'Co-pay (10/20%) and aggregate deductible options available'],
      [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   'As per policy terms'],
      [COSTS,    2,  'family_discount',            'Family Discount',                   'Available'],
      [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            '50% of Base SI per claim-free year'],
      [COSTS,    4,  'nri_advantage',              'NRI Advantage',                     'Not prominently highlighted'],
    ]);
  }

  // ── TATA AIG MediCare Premier ──
  for (const planId of [tataInd.id, tataFF.id]) {
    const isFF = planId === tataFF.id;
    await seedFeatures(planId, [
      [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               '10L, 15L, 20L, 25L, 50L, 1Cr, 2Cr'],
      [BASIC,    1,  'family_floater_limit',       'Family Floater Limit',              isFF ? '2 Adults & 3 Kids' : 'N/A'],
      [BASIC,    2,  'child_dependent_age',        'Child Dependent Age',               '25 Years'],
      [BASIC,    3,  'entry_age',                  'Entry Age',                         '18 yrs to 65 yrs'],
      [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
      [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                '24 months'],
      [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '24 months'],
      [WAITING,  3,  'waiting_period_maternity',   'Maternity Waiting Period',          'Not Covered'],
      [COVERAGE, 0,  'inpatient_hospitalization',  'In-Patient Hospitalization',        'Inpatient hospitalization ≥24 hrs covered; robust core cover'],
      [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   'At Actual'],
      [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         'At Actual'],
      [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '90 days'],
      [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '200 days'],
      [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Covered; list includes modern treatments'],
      [COVERAGE, 6,  'domiciliary_hospitalization','Domiciliary Hospitalization',       'Covered'],
      [COVERAGE, 7,  'ayush_coverage',             'AYUSH Coverage',                    'Inpatient and day-care covered'],
      [COVERAGE, 8,  'organ_donor',                'Organ Donor Expenses',              'Covered'],
      [COVERAGE, 9,  'advanced_modern_treatments', 'Advanced/Modern Treatments',        'Modern/high-end treatments covered; high-end diagnostics included'],
      [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Covered'],
      [COVERAGE, 11, 'second_opinion',             'Second Opinion',                    'Available; teleconsults included'],
      [BENEFITS, 0,  'restore_benefit',            'Restore/Reset Benefit',             'Restore Benefit: Auto-restore Basic SI upon exhaustion'],
      [BENEFITS, 1,  'cumulative_bonus',           'Cumulative / Loyalty Bonus',        '50% of base SI per claim-free year'],
      [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    'Covered; limits in policy schedule'],
      [BENEFITS, 3,  'hospital_daily_cash',        'Hospital Daily Cash',               'Not standard'],
      [BENEFITS, 4,  'convalescence_benefit',      'Convalescence Benefit',             'Convalescence / prolonged hospitalization benefits as per policy'],
      [BENEFITS, 5,  'claims_protector',           'Consumables Benefit',               'Covers expenses for specified consumables'],
      [BENEFITS, 6,  'inflation_protector',        'Inflation Protector',               'Not Covered'],
      [BENEFITS, 7,  'newborn_vaccination',        'Newborn & Vaccination',             'First-year vaccination benefits with caps. Covered'],
      [BENEFITS, 8,  'preventive_health_checkup',  'Preventive Health Check-up',        'Annual check-ups and high-end diagnostics'],
      [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   'Not Covered'],
      [BENEFITS, 10, 'opd_coverage',               'OPD Coverage',                      'OPD treatment and dental OPD included'],
      [BENEFITS, 11, 'home_health_care',           'Home Health Care',                  'High-SI home care (SI ≥₹75L) is a key differentiator'],
      [OPTIONAL, 0,  'air_ambulance',              'Air Ambulance',                     'Emergency air ambulance covered; domestic listed'],
      [OPTIONAL, 1,  'worldwide_cover',            'Worldwide Cover',                   'Global planned hospitalization available'],
      [OPTIONAL, 2,  'ped_waiting_reduction',      'PED Waiting Period Reduction',      'Not Covered'],
      [OPTIONAL, 3,  'infinite_care',              'Infinite Care',                     'Not Covered'],
      [OPTIONAL, 4,  'jumpstart',                  'JumpStart',                         'Not Covered'],
      [COSTS,    0,  'co_pay',                     'Co-Pay',                            'Co-pay/deductible features available'],
      [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   'As per policy terms'],
      [COSTS,    2,  'family_discount',            'Family Discount',                   'Available'],
      [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            '50% of base SI per claim-free year'],
      [COSTS,    4,  'nri_advantage',              'NRI Advantage',                     'Not prominent; check policy wording'],
    ]);
  }

  // ── HDFC Optima Secure ──
  for (const planId of [hdfcInd.id, hdfcFF.id]) {
    const isFF = planId === hdfcFF.id;
    await seedFeatures(planId, [
      [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               '5L, 10L, 15L, 20L, 25L, 50L, 1Cr, 2Cr'],
      [BASIC,    1,  'family_floater_limit',       'Family Floater Limit',              isFF ? 'Max 6 Adults & 6 Kids' : 'N/A'],
      [BASIC,    2,  'child_dependent_age',        'Child Dependent Age',               '25 Years'],
      [BASIC,    3,  'entry_age',                  'Entry Age',                         '18 yrs to 35 yrs (new policy)'],
      [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
      [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                '36 months'],
      [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '24 months'],
      [WAITING,  3,  'waiting_period_maternity',   'Maternity Waiting Period',          'Not Covered (standard)'],
      [COVERAGE, 0,  'inpatient_hospitalization',  'In-Patient Hospitalization',        'Covers inpatient ≥24 hrs incl. ICU'],
      [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   'At Actual'],
      [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         'At Actual'],
      [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '60 days'],
      [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '180 days'],
      [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Covered up to SI; broad list'],
      [COVERAGE, 6,  'domiciliary_hospitalization','Domiciliary Hospitalization',       'Covered'],
      [COVERAGE, 7,  'ayush_coverage',             'AYUSH Coverage',                    'Inpatient covered'],
      [COVERAGE, 8,  'organ_donor',                'Organ Donor Expenses',              'Covered up to SI'],
      [COVERAGE, 9,  'advanced_modern_treatments', 'Advanced/Modern Treatments',        'Covered where included in insurer list'],
      [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Not Covered (standard)'],
      [COVERAGE, 11, 'second_opinion',             'Second Opinion',                    'E-opinion for critical illness available as option'],
      [BENEFITS, 0,  'restore_benefit',            'Restore/Reset Benefit',             'Automatic Restore 100% of SI'],
      [BENEFITS, 1,  'cumulative_bonus',           'Cumulative / Loyalty Bonus',        '10%/25% of SI per claim-free year, max 100%'],
      [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    'Covered as per policy schedule'],
      [BENEFITS, 3,  'hospital_daily_cash',        'Hospital Daily Cash',               'Daily cash for shared rooms'],
      [BENEFITS, 4,  'convalescence_benefit',      'Protect Benefit',                   'Payment towards non-medical expenses (Annexure B)'],
      [BENEFITS, 5,  'claims_protector',           'Protect Benefit',                   'Payment towards non-medical listed expenses'],
      [BENEFITS, 6,  'inflation_protector',        'Inflation Protector',               'Not Covered'],
      [BENEFITS, 7,  'newborn_vaccination',        'Newborn & Vaccination',             'Not standard; first-year vaccination not included by default'],
      [BENEFITS, 8,  'preventive_health_checkup',  'Preventive Health Check-up',        'Available if chosen or plan-specific'],
      [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   'Not Covered (standard)'],
      [BENEFITS, 10, 'opd_coverage',               'OPD Coverage',                      'Limited; focus on preventive checkups and in-hospital benefits'],
      [BENEFITS, 11, 'home_health_care',           'Home Health Care',                  'Home care included'],
      [OPTIONAL, 0,  'air_ambulance',              'Air Ambulance',                     'Emergency air ambulance available as optional'],
      [OPTIONAL, 1,  'worldwide_cover',            'Worldwide Cover',                   'Global Health Cover (emergency & planned) optional'],
      [OPTIONAL, 2,  'ped_waiting_reduction',      'PED Waiting Period Reduction',      'Not Covered'],
      [OPTIONAL, 3,  'infinite_care',              'Secure Benefit',                    'Additional SI amount available for all admissible claims'],
      [OPTIONAL, 4,  'jumpstart',                  'JumpStart',                         'Not Covered'],
      [COSTS,    0,  'co_pay',                     'Co-Pay',                            'Aggregate deductible and voluntary deductible options; co-pay options may apply'],
      [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   'As per policy terms'],
      [COSTS,    2,  'family_discount',            'Family Discount',                   'Available'],
      [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            '10%/25% per claim-free year, max 100%'],
      [COSTS,    4,  'nri_advantage',              'NRI Advantage',                     'Less prominent; check HDFC policy'],
    ]);
  }

  // ── Oriental Insurance — Individual ──
  await seedFeatures(orientalInd.id, [
    [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               '3 lac to 50 lac'],
    [BASIC,    1,  'family_floater_limit',       'Family Floater Limit',              'N/A (Individual plan)'],
    [BASIC,    3,  'entry_age',                  'Entry Age',                         '18 to 65 years'],
    [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
    [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                'After 3 years'],
    [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '2 years'],
    [COVERAGE, 0,  'inpatient_hospitalization',  'In-Patient Hospitalization',        'Min 24 hrs (exceptions included)'],
    [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   '1% of SI'],
    [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         '2% of SI'],
    [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '30 days'],
    [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '60 days'],
    [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Covered'],
    [COVERAGE, 6,  'domiciliary_hospitalization','Domiciliary Hospitalization',       'Yes'],
    [COVERAGE, 9,  'advanced_modern_treatments', 'Advanced/Modern Treatments',        'As per policy'],
    [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Covered'],
    [COVERAGE, 11, 'second_opinion',             'Second Opinion',                    'Yes'],
    [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    '₹2,000 OR 1% of SI (whichever less) per hospitalization; max ₹4,000 per policy'],
    [BENEFITS, 3,  'hospital_daily_cash',        'Hospital Daily Cash',               'Yes — 0.1% of SI per day, max 6 days (if hospitalized >2 days)'],
    [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   'Not Covered'],
    [OPTIONAL, 0,  'air_ambulance',              'Air Ambulance',                     'Not standard'],
    [OPTIONAL, 3,  'personal_accident',          'Personal Accident',                 'Optional: ₹2 lac to ₹10 lac'],
    [COSTS,    0,  'co_pay',                     'Co-Pay',                            'No'],
    [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   'Above 55 years'],
    [COSTS,    2,  'family_discount',            'Family Discount',                   '10%'],
    [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            'No'],
  ]);

  // ── United India — Platinum (Individual) ──
  await seedFeatures(unitedPlatInd.id, [
    [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               '3L, 5L, 8L, 10L, 15L, 20L'],
    [BASIC,    3,  'entry_age',                  'Entry Age',                         '18 months to 35 years'],
    [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
    [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                'PED Cover from Day 1'],
    [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '2 years'],
    [COVERAGE, 0,  'inpatient_hospitalization',  'In-Patient Hospitalization',        'Min 24 hrs (exceptions included)'],
    [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   '1% of SI'],
    [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         '2% of SI'],
    [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '30 days'],
    [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '60 days (10% of SI)'],
    [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Covered'],
    [COVERAGE, 6,  'domiciliary_hospitalization','Domiciliary Hospitalization',       'Yes'],
    [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Covered'],
    [COVERAGE, 11, 'second_opinion',             'Second Opinion',                    'No'],
    [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    'Up to ₹2,500 per person per policy period'],
    [BENEFITS, 3,  'hospital_daily_cash',        'Hospital Daily Cash',               'Up to ₹20,000 per person per policy period'],
    [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   'Not Covered'],
    [COSTS,    0,  'co_pay',                     'Co-Pay',                            'NA'],
    [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   'Above 45 years — free every 3 claim-free years (1% of avg SI)'],
    [COSTS,    2,  'family_discount',            'Family Discount',                   '5%'],
    [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            'No'],
  ]);

  // ── United India — Gold (Individual) ──
  await seedFeatures(unitedGoldInd.id, [
    [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               '3L, 5L, 8L, 10L'],
    [BASIC,    3,  'entry_age',                  'Entry Age',                         '35 to 60 years'],
    [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
    [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                'After 3 years'],
    [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '2 years'],
    [COVERAGE, 0,  'inpatient_hospitalization',  'In-Patient Hospitalization',        'Min 24 hrs (exceptions included)'],
    [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   '1% of SI'],
    [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         '2% of SI'],
    [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '30 days'],
    [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '60 days (Actual or 10% of SI, whichever less)'],
    [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Covered'],
    [COVERAGE, 6,  'domiciliary_hospitalization','Domiciliary Hospitalization',       'Yes'],
    [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Covered'],
    [COVERAGE, 11, 'second_opinion',             'Second Opinion',                    'No'],
    [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    'Up to ₹2,500 per person per policy period'],
    [BENEFITS, 3,  'hospital_daily_cash',        'Hospital Daily Cash',               'Up to ₹20,000 per person per policy period'],
    [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   'Not Covered'],
    [COSTS,    0,  'co_pay',                     'Co-Pay',                            'NA'],
    [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   'Above 45 years — free every 3 claim-free years (1% of avg SI)'],
    [COSTS,    2,  'family_discount',            'Family Discount',                   '5%'],
    [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            'No'],
  ]);

  // ── New India — Individual ──
  await seedFeatures(newIndiaInd.id, [
    [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               '3 lac to 15 lac'],
    [BASIC,    3,  'entry_age',                  'Entry Age',                         '18 to 65 years'],
    [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
    [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                'After 4 years'],
    [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '2 years'],
    [COVERAGE, 0,  'inpatient_hospitalization',  'In-Patient Hospitalization',        'Min 24 hrs (exceptions included)'],
    [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   '1% of SI'],
    [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         '2% of SI'],
    [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '30 days'],
    [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '60 days'],
    [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Covered'],
    [COVERAGE, 6,  'domiciliary_hospitalization','Domiciliary Hospitalization',       'Yes'],
    [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Covered'],
    [COVERAGE, 11, 'second_opinion',             'Second Opinion',                    'No'],
    [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    'Ambulance services not exceeding 1% of the Sum Insured'],
    [BENEFITS, 3,  'hospital_daily_cash',        'Hospital Daily Cash',               '0.1% of SI per day (SI up to 3 lac)'],
    [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   'Available above 5 lac SI (optional)'],
    [OPTIONAL, 1,  'no_proportionate_deduction', 'No Proportionate Deduction',        'Available for SI of 8L & above'],
    [OPTIONAL, 2,  'non_payable_items',          'Non-Payable Items Cover',           'Available for SI of 8L & above; max ₹15,000/year'],
    [COSTS,    0,  'co_pay',                     'Co-Pay',                            'YES — new customers aged above 60 years'],
    [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   'Above 50 years'],
    [COSTS,    2,  'family_discount',            'Family Discount',                   '10%'],
    [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            'Yes — CB on SI'],
  ]);

  // ── Oriental Happy Family Floater — Silver ──
  await seedFeatures(orientalSilverFF.id, psuFFFeatures(oriental.id, 'Silver', '3 lac to 5 lac', 'Per Illness ₹1,000 max; 1% of SI max ₹3,000/yr', '10% on each & every claim', 'Yes, 50% SI or 100% SI'));
  await seedFeatures(orientalGoldFF.id,   psuFFFeatures(oriental.id, 'Gold',   '6 lac to 10 lac', 'Per Illness ₹2,000 max; 1% of SI max ₹6,000/yr', 'NA', 'Yes, 50% SI or 100% SI'));
  await seedFeatures(orientalDiamondFF.id, psuFFFeatures(oriental.id, 'Diamond', '12L, 15L, 18L & 20L', 'Per Illness ₹3,000 max; 1% of SI max ₹8,000/yr', 'NA', 'NA'));
  await seedFeatures(unitedFF.id, [
    [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               '3L to 10L, 15L, 20L & 25L'],
    [BASIC,    3,  'entry_age',                  'Entry Age',                         '18 to 60 years'],
    [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
    [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                '3 years'],
    [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '2 years'],
    [WAITING,  3,  'waiting_period_maternity',   'Maternity Waiting Period',          '24 months'],
    [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   '1% of SI'],
    [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         '2% of SI'],
    [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '30 days'],
    [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '60 days (10% of SI)'],
    [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Yes'],
    [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Covered'],
    [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    '0.5% of SI max ₹2,500 per event; 1% of SI max ₹5,000 per policy period'],
    [BENEFITS, 3,  'hospital_daily_cash',        'Hospital Daily Cash',               'Above 5 lac SI'],
    [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   'Optional (3 lac and above); max ₹40,000 normal / ₹60,000 caesarean; includes newborn cover'],
    [BENEFITS, 0,  'restore_benefit',            'Restore/Recharge of SI',            'Above 3 lac SI'],
    [COSTS,    0,  'co_pay',                     'Co-Pay',                            '10% above 60 years'],
    [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   'Above 45 years — free every 3 claim-free years'],
    [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            'Yes — Discount up to 50% after 3 claim-free renewals'],
  ]);
  await seedFeatures(newIndiaFF.id, [
    [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               '3 to 15 lacs'],
    [BASIC,    3,  'entry_age',                  'Entry Age',                         '18 to 65 years'],
    [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
    [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                '4 years'],
    [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '2 years'],
    [WAITING,  3,  'waiting_period_maternity',   'Maternity Waiting Period',          '36 months'],
    [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   '1% of SI'],
    [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         '2% of SI'],
    [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '30 days'],
    [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '60 days'],
    [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Yes'],
    [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Covered'],
    [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    '1% of Sum Insured'],
    [BENEFITS, 3,  'hospital_daily_cash',        'Hospital Daily Cash',               '0.1% per day, max 1% of SI'],
    [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   'Yes — 10% of SI; includes newborn baby cover'],
    [COSTS,    0,  'co_pay',                     'Co-Pay',                            'NA'],
    [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   'Above 55 years — free every 3 claim-free years'],
    [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            'Yes — CB on SI'],
    [OPTIONAL, 1,  'no_proportionate_deduction', 'No Proportionate Deduction',        'Available for SI of 8L & above'],
    [OPTIONAL, 2,  'non_payable_items',          'Non-Payable Items Cover',           'Available for SI of 8L & above; max ₹15,000/year'],
  ]);

  console.log('✓ Plan features seeded');

  // ─── Premiums ──────────────────────────────────────────────────────────────
  // PVT — Individual premiums (from Excel)
  await seedPremiums(iciciInd.id, [
    { ageGroup: 30, familyConfig: '1A', sumInsured: 1000000, annualPremium: 7182 },
    { ageGroup: 40, familyConfig: '1A', sumInsured: 1000000, annualPremium: 9537 },
    { ageGroup: 50, familyConfig: '1A', sumInsured: 1000000, annualPremium: 15101 },
    { ageGroup: 60, familyConfig: '1A', sumInsured: 1000000, annualPremium: 24893 },
  ]);
  await seedPremiums(sbiInd.id, [
    { ageGroup: 30, familyConfig: '1A', sumInsured: 500000, annualPremium: 7903 },
    { ageGroup: 40, familyConfig: '1A', sumInsured: 500000, annualPremium: 9242 },
    { ageGroup: 50, familyConfig: '1A', sumInsured: 500000, annualPremium: 13348 },
    { ageGroup: 60, familyConfig: '1A', sumInsured: 500000, annualPremium: 22799 },
  ]);
  await seedPremiums(tataInd.id, [
    { ageGroup: 30, familyConfig: '1A', sumInsured: 1000000, annualPremium: 11579 },
    { ageGroup: 40, familyConfig: '1A', sumInsured: 1000000, annualPremium: 13876 },
    { ageGroup: 50, familyConfig: '1A', sumInsured: 1000000, annualPremium: 20363 },
    { ageGroup: 60, familyConfig: '1A', sumInsured: 1000000, annualPremium: 32592 },
  ]);
  await seedPremiums(hdfcInd.id, [
    { ageGroup: 30, familyConfig: '1A', sumInsured: 500000, annualPremium: 13100 },
    { ageGroup: 40, familyConfig: '1A', sumInsured: 500000, annualPremium: 14600 },
    { ageGroup: 50, familyConfig: '1A', sumInsured: 500000, annualPremium: 23450 },
    { ageGroup: 60, familyConfig: '1A', sumInsured: 500000, annualPremium: 35450 },
  ]);

  // PVT — Family Floater premiums
  await seedPremiums(iciciFF.id, [
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 1000000, annualPremium: 16605 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 1000000, annualPremium: 19348 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 1000000, annualPremium: 40317 },
  ]);
  await seedPremiums(sbiFF.id, [
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 500000, annualPremium: 18020 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 500000, annualPremium: 19921 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 500000, annualPremium: 43569 },
  ]);
  await seedPremiums(tataFF.id, [
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 1000000, annualPremium: 26555 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 1000000, annualPremium: 28117 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 1000000, annualPremium: 49834 },
  ]);
  await seedPremiums(hdfcFF.id, [
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 500000, annualPremium: 24522 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 500000, annualPremium: 26973 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 500000, annualPremium: 55010 },
  ]);

  // PSU — Individual premiums
  await seedPremiums(orientalInd.id, [
    { ageGroup: 30, familyConfig: '1A', sumInsured: 300000, annualPremium: 5801 },
    { ageGroup: 40, familyConfig: '1A', sumInsured: 300000, annualPremium: 6995 },
    { ageGroup: 60, familyConfig: '1A', sumInsured: 300000, annualPremium: 15010 },
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 17188 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 22321 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 32563 },
  ]);
  await seedPremiums(unitedPlatInd.id, [
    { ageGroup: 30, familyConfig: '1A', sumInsured: 300000, annualPremium: 6318 },
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 18407 },
  ]);
  await seedPremiums(unitedGoldInd.id, [
    { ageGroup: 40, familyConfig: '1A', sumInsured: 300000, annualPremium: 9214 },
    { ageGroup: 60, familyConfig: '1A', sumInsured: 300000, annualPremium: 21586 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 22359 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 43391 },
  ]);
  await seedPremiums(newIndiaInd.id, [
    { ageGroup: 30, familyConfig: '1A', sumInsured: 300000, annualPremium: 7133 },
    { ageGroup: 40, familyConfig: '1A', sumInsured: 300000, annualPremium: 9354 },
    { ageGroup: 60, familyConfig: '1A', sumInsured: 300000, annualPremium: 23295 },
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 24297 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 28123 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 53178 },
  ]);

  // PSU — Family Floater premiums
  await seedPremiums(orientalSilverFF.id, [
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 10292 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 11311 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 25929 },
  ]);
  await seedPremiums(orientalGoldFF.id, [
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 600000, annualPremium: 14936 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 600000, annualPremium: 17451 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 600000, annualPremium: 36769 },
  ]);
  await seedPremiums(orientalDiamondFF.id, [
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 1200000, annualPremium: 22756 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 1200000, annualPremium: 28096 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 1200000, annualPremium: 61352 },
  ]);
  await seedPremiums(unitedFF.id, [
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 19912 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 24187 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 47906 },
  ]);
  await seedPremiums(newIndiaFF.id, [
    { ageGroup: 30, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 20652 },
    { ageGroup: 40, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 23905 },
    { ageGroup: 60, familyConfig: '2A+2C', sumInsured: 300000, annualPremium: 45201 },
  ]);

  console.log('✓ Premiums seeded');
  console.log('\n✅ Database seeded successfully!');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function upsertInsurer(name, category, description) {
  return prisma.insurer.upsert({
    where: { name },
    update: { category, description },
    create: { name, category, description },
  });
}

// Workaround: upsert by name since there's no unique constraint on name+type+variant
async function upsertPlan(insurerId, name, planType, variant, minSumInsured, maxSumInsured, minEntryAge, maxEntryAge) {
  const existing = await prisma.plan.findFirst({ where: { insurerId, name, planType, variant: variant ?? null } });
  if (existing) {
    return prisma.plan.update({
      where: { id: existing.id },
      data: { minSumInsured, maxSumInsured, minEntryAge, maxEntryAge },
    });
  }
  return prisma.plan.create({
    data: { insurerId, name, planType, variant, minSumInsured, maxSumInsured, minEntryAge, maxEntryAge },
  });
}

async function seedFeatures(planId, rows) {
  // rows: [category, displayOrder, key, label, value]
  for (const [featureCategory, displayOrder, featureKey, featureLabel, featureValue] of rows) {
    await prisma.planFeature.upsert({
      where: { planId_featureKey: { planId, featureKey } },
      update: { featureLabel, featureValue, featureCategory, displayOrder },
      create: { planId, featureKey, featureLabel, featureValue, featureCategory, displayOrder },
    });
  }
}

async function seedPremiums(planId, rows) {
  // Delete existing first to avoid duplicates on re-seed
  await prisma.premium.deleteMany({ where: { planId } });
  await prisma.premium.createMany({ data: rows.map((r) => ({ planId, ...r })) });
}

// Shared feature builder for PSU Oriental Family Floater variants
function psuFFFeatures(insurerId, variant, siOptions, ambulance, coPay, restore) {
  const BASIC = 'Basic Info', WAITING = 'Waiting Periods', COVERAGE = 'Coverage', BENEFITS = 'Benefits', COSTS = 'Costs & Discounts';
  return [
    [BASIC,    0,  'sum_insured_options',        'Sum Insured Options',               siOptions],
    [BASIC,    3,  'entry_age',                  'Entry Age',                         '21 to 65 years'],
    [WAITING,  0,  'waiting_period_initial',     'Initial Waiting Period',            '30 days'],
    [WAITING,  1,  'waiting_period_ped',         'PED Waiting Period',                '3 years'],
    [WAITING,  2,  'waiting_period_specific',    'Specific Disease Waiting Period',   '2 years'],
    [COVERAGE, 1,  'room_limit',                 'Room Rent Limit',                   '1% of SI'],
    [COVERAGE, 2,  'icu_limit',                  'ICU Limit',                         '2% of SI'],
    [COVERAGE, 3,  'pre_hospitalization_days',   'Pre-Hospitalization',               '30 days'],
    [COVERAGE, 4,  'post_hospitalization_days',  'Post-Hospitalization',              '60 days'],
    [COVERAGE, 5,  'day_care_procedures',        'Day Care Procedures',               'Yes'],
    [COVERAGE, 10, 'critical_illness',           'Critical Illness',                  'Covered'],
    [BENEFITS, 2,  'road_ambulance',             'Road Ambulance',                    ambulance],
    [BENEFITS, 9,  'maternity_cover',            'Maternity Cover',                   variant === 'Diamond' ? 'Yes — 2.5% of SI; 24-month waiting' : 'Not Covered'],
    [BENEFITS, 0,  'restore_benefit',            'Restore/Recharge of SI',            restore],
    [COSTS,    0,  'co_pay',                     'Co-Pay',                            coPay],
    [COSTS,    1,  'medical_checkup_age',        'Pre-acceptance Medical Check-up',   variant === 'Diamond' ? 'Above 55 years' : 'Above 60 years'],
    [COSTS,    3,  'ncb_cb',                     'NCB / Cumulative Bonus',            'Yes — Discount'],
  ];
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
