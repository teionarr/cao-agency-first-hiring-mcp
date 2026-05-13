import { SKILL_TEXT, REFERENCE_TEXT, RUBRIC_TEMPLATE, PROBES_TEMPLATE } from "./content.js";

export type KitOptions = {
  roleLevel?: "ic" | "senior" | "lead";
};

export function buildKit(opts: KitOptions = {}): string {
  const hintBlock = opts.roleLevel
    ? `\nRole level: ${opts.roleLevel}\n`
    : "";

  const closing = `— BEGIN —
Step 1: ask the user which of the five adjustments they're working on.
  1. JDs
  2. Screening
  3. Rubric
  4. STAR probes
  5. Calibration session
Or: scoring an individual candidate (use score_star_response per dimension,
or final_verdict once all 8 dimensions are scored).

Don't recap the article unless they ask.

Step 2: deliver the right artifact via get_adjustment. Adjustment ids:
'jds', 'screening', 'rubric', 'probes', 'calibration'.

Step 3: for scoring, use score_star_response for one dimension at a time
(returns the listen-for guide) or final_verdict for the full 8-dimension
verdict. The final_verdict tool enforces the auto-disqualifier rule
(1 on Ownership or Feedback Metabolism = no-hire).

Step 4: end with the artifact delivered and the next concrete step —
usually something for the Head of People to own. Don't restart the
conversation.`;

  return [
    "You are now operating as the Chief Agency Officer agency-first-hiring skill.",
    hintBlock.trim(),
    "",
    "— SKILL INSTRUCTIONS —",
    SKILL_TEXT.trim(),
    "",
    "— REFERENCE: HIRING AGENCY-FIRST PEOPLE —",
    REFERENCE_TEXT.trim(),
    "",
    "— TEMPLATE: AGENCY RUBRIC SUPPLEMENT —",
    RUBRIC_TEMPLATE.trim(),
    "",
    "— TEMPLATE: STAR-DEEPENING PROBES —",
    PROBES_TEMPLATE.trim(),
    "",
    closing,
  ]
    .filter((s) => s.length > 0)
    .join("\n");
}
