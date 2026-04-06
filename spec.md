# CourseFlow

## Current State
The per-course Referral Settings tab in `AdminCourseEditorPage` shows two hardcoded slab rows ("1–9 referrals" and "10+ referrals") where only the commission rate % is editable. The min/max referral counts are fixed labels and cannot be changed.

The global Commission Tiers in `AdminDashboardPage` already supports fully editable min, max (with Unlimited checkbox), and rate per tier, with add/delete rows.

## Requested Changes (Diff)

### Add
- Fully editable slab table in the per-course Referral Settings tab: each slab row exposes editable Min Referrals, Max Referrals (with Unlimited checkbox), and Commission Rate % inputs.
- Add Tier and Remove (trash) buttons per row, matching the global tiers UX.

### Modify
- Replace the two hardcoded static slab cards with a dynamic, editable table (same pattern as the global commission tiers table in AdminDashboardPage).
- State: replace `slabRates` (2-element array) with `editableSlabs` (full array of `{minReferrals, maxReferrals|null, rate, _key}`).
- `handleSaveReferral` writes all editable slab data (not just rates) to `ReferralSettings.slabs`.
- Initialize `editableSlabs` from existing per-course `referralSettings` if available, otherwise fall back to `globalCommissionTiers`.

### Remove
- Remove the two static hardcoded slab cards with fixed "1–9" and "10+" labels.

## Implementation Plan
1. In `AdminCourseEditorPage`, replace `slabRates` state with `editableSlabs` state (array with `_key`).
2. Render a table with Min Referrals, Max Referrals (+ Unlimited checkbox), Rate %, and Delete button columns.
3. Add an "Add Tier" button.
4. Update `handleSaveReferral` to map `editableSlabs` (without `_key`) into `ReferralSettings.slabs`.
