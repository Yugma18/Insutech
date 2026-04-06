/**
 * Master feature list — single source of truth for all plan feature keys.
 * Used for:
 *   - CSV template generation (pre-filled key/label/category/order)
 *   - Upload validation (reject unknown keys)
 *   - Consistent labels across all plans
 */
export const FEATURE_MASTER = [
  // ── Basic Info ──────────────────────────────────────────────────────────
  { featureKey: 'sum_insured_options',         featureLabel: 'Sum Insured Options',             featureCategory: 'Basic Info',        displayOrder: 0 },
  { featureKey: 'family_floater_limit',        featureLabel: 'Family Floater Limit',            featureCategory: 'Basic Info',        displayOrder: 1 },
  { featureKey: 'child_dependent_age',         featureLabel: 'Child Dependent Age',             featureCategory: 'Basic Info',        displayOrder: 2 },
  { featureKey: 'entry_age',                   featureLabel: 'Entry Age',                       featureCategory: 'Basic Info',        displayOrder: 3 },

  // ── Waiting Periods ─────────────────────────────────────────────────────
  { featureKey: 'waiting_period_initial',      featureLabel: 'Initial Waiting Period',          featureCategory: 'Waiting Periods',   displayOrder: 0 },
  { featureKey: 'waiting_period_ped',          featureLabel: 'PED Waiting Period',              featureCategory: 'Waiting Periods',   displayOrder: 1 },
  { featureKey: 'waiting_period_specific',     featureLabel: 'Specific Disease Waiting Period', featureCategory: 'Waiting Periods',   displayOrder: 2 },
  { featureKey: 'waiting_period_maternity',    featureLabel: 'Maternity Waiting Period',        featureCategory: 'Waiting Periods',   displayOrder: 3 },

  // ── Coverage ────────────────────────────────────────────────────────────
  { featureKey: 'inpatient_hospitalization',   featureLabel: 'In-Patient Hospitalization',      featureCategory: 'Coverage',          displayOrder: 0 },
  { featureKey: 'room_limit',                  featureLabel: 'Room Rent Limit',                 featureCategory: 'Coverage',          displayOrder: 1 },
  { featureKey: 'icu_limit',                   featureLabel: 'ICU Limit',                       featureCategory: 'Coverage',          displayOrder: 2 },
  { featureKey: 'pre_hospitalization_days',    featureLabel: 'Pre-Hospitalization',             featureCategory: 'Coverage',          displayOrder: 3 },
  { featureKey: 'post_hospitalization_days',   featureLabel: 'Post-Hospitalization',            featureCategory: 'Coverage',          displayOrder: 4 },
  { featureKey: 'day_care_procedures',         featureLabel: 'Day Care Procedures',             featureCategory: 'Coverage',          displayOrder: 5 },
  { featureKey: 'domiciliary_hospitalization', featureLabel: 'Domiciliary Hospitalization',     featureCategory: 'Coverage',          displayOrder: 6 },
  { featureKey: 'ayush_coverage',              featureLabel: 'AYUSH Coverage',                  featureCategory: 'Coverage',          displayOrder: 7 },
  { featureKey: 'organ_donor',                 featureLabel: 'Organ Donor Expenses',            featureCategory: 'Coverage',          displayOrder: 8 },
  { featureKey: 'advanced_modern_treatments',  featureLabel: 'Advanced / Modern Treatments',   featureCategory: 'Coverage',          displayOrder: 9 },
  { featureKey: 'critical_illness',            featureLabel: 'Critical Illness',                featureCategory: 'Coverage',          displayOrder: 10 },
  { featureKey: 'second_opinion',              featureLabel: 'Second Opinion',                  featureCategory: 'Coverage',          displayOrder: 11 },

  // ── Benefits ────────────────────────────────────────────────────────────
  { featureKey: 'restore_benefit',             featureLabel: 'Restore / Recharge Benefit',     featureCategory: 'Benefits',          displayOrder: 0 },
  { featureKey: 'cumulative_bonus',            featureLabel: 'Cumulative / Loyalty Bonus',     featureCategory: 'Benefits',          displayOrder: 1 },
  { featureKey: 'road_ambulance',              featureLabel: 'Road Ambulance',                  featureCategory: 'Benefits',          displayOrder: 2 },
  { featureKey: 'hospital_daily_cash',         featureLabel: 'Hospital Daily Cash',             featureCategory: 'Benefits',          displayOrder: 3 },
  { featureKey: 'convalescence_benefit',       featureLabel: 'Convalescence Benefit',           featureCategory: 'Benefits',          displayOrder: 4 },
  { featureKey: 'claims_protector',            featureLabel: 'Claims Protector',                featureCategory: 'Benefits',          displayOrder: 5 },
  { featureKey: 'inflation_protector',         featureLabel: 'Inflation Protector',             featureCategory: 'Benefits',          displayOrder: 6 },
  { featureKey: 'newborn_vaccination',         featureLabel: 'Newborn & Vaccination Cover',    featureCategory: 'Benefits',          displayOrder: 7 },
  { featureKey: 'preventive_health_checkup',   featureLabel: 'Preventive Health Check-up',     featureCategory: 'Benefits',          displayOrder: 8 },
  { featureKey: 'maternity_cover',             featureLabel: 'Maternity Cover',                 featureCategory: 'Benefits',          displayOrder: 9 },
  { featureKey: 'opd_coverage',                featureLabel: 'OPD Coverage',                    featureCategory: 'Benefits',          displayOrder: 10 },
  { featureKey: 'home_health_care',            featureLabel: 'Home Health Care',                featureCategory: 'Benefits',          displayOrder: 11 },

  // ── Optional Covers ─────────────────────────────────────────────────────
  { featureKey: 'air_ambulance',               featureLabel: 'Air Ambulance',                   featureCategory: 'Optional Covers',   displayOrder: 0 },
  { featureKey: 'no_proportionate_deduction',  featureLabel: 'No Proportionate Deduction',     featureCategory: 'Optional Covers',   displayOrder: 1 },
  { featureKey: 'worldwide_cover',             featureLabel: 'Worldwide Cover',                 featureCategory: 'Optional Covers',   displayOrder: 2 },
  { featureKey: 'non_payable_items',           featureLabel: 'Non-Payable Items Cover',        featureCategory: 'Optional Covers',   displayOrder: 3 },
  { featureKey: 'ped_waiting_reduction',       featureLabel: 'PED Waiting Period Reduction',   featureCategory: 'Optional Covers',   displayOrder: 4 },
  { featureKey: 'personal_accident',           featureLabel: 'Personal Accident Cover',        featureCategory: 'Optional Covers',   displayOrder: 5 },
  { featureKey: 'infinite_care',               featureLabel: 'Infinite Care / Enhanced Cover', featureCategory: 'Optional Covers',   displayOrder: 6 },
  { featureKey: 'jumpstart',                   featureLabel: 'JumpStart Benefit',               featureCategory: 'Optional Covers',   displayOrder: 7 },

  // ── Costs & Discounts ───────────────────────────────────────────────────
  { featureKey: 'co_pay',                      featureLabel: 'Co-Pay',                          featureCategory: 'Costs & Discounts', displayOrder: 0 },
  { featureKey: 'medical_checkup_age',         featureLabel: 'Pre-acceptance Medical Check-up', featureCategory: 'Costs & Discounts', displayOrder: 1 },
  { featureKey: 'family_discount',             featureLabel: 'Family Discount',                 featureCategory: 'Costs & Discounts', displayOrder: 2 },
  { featureKey: 'ncb_cb',                      featureLabel: 'NCB / Cumulative Bonus %',        featureCategory: 'Costs & Discounts', displayOrder: 3 },
  { featureKey: 'nri_advantage',               featureLabel: 'NRI Advantage',                   featureCategory: 'Costs & Discounts', displayOrder: 4 },
];

export const FEATURE_KEY_SET = new Set(FEATURE_MASTER.map((f) => f.featureKey));
