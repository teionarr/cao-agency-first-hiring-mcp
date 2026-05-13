// Agency-first IC hiring scoring.
// Source: content/templates/agency-rubric.md
// Disqualifier rule: 1 on Ownership OR 1 on Feedback Metabolism = no-hire.

export type DimensionScore = 1 | 2 | 3;

export type AgencyScores = {
  initiative: DimensionScore;
  verification: DimensionScore;
  taste: DimensionScore;
  question_quality: DimensionScore;
  feedback_metabolism: DimensionScore;
  ambiguity_tolerance: DimensionScore;
  ownership: DimensionScore;
  scope_expansion: DimensionScore;
};

export type Verdict = {
  band: "hire" | "discuss" | "no-hire";
  headline: string;
  rationale: string;
  strong_count: number;
  weak_count: number;
  disqualifying_weakness: string | null;
};

const CRITICAL_DIMENSIONS: (keyof AgencyScores)[] = ["ownership", "feedback_metabolism"];

export function finalVerdict(
  scores: AgencyScores,
  role_level: "ic" | "senior" | "lead" = "ic"
): Verdict {
  const dims = Object.entries(scores) as [keyof AgencyScores, DimensionScore][];
  const strong = dims.filter(([, s]) => s === 3).length;
  const weak = dims.filter(([, s]) => s === 1).length;

  const dqDim = CRITICAL_DIMENSIONS.find((d) => scores[d] === 1);
  const dq = dqDim ? prettyDim(dqDim) : null;

  if (dq) {
    return {
      band: "no-hire",
      headline: "NO HIRE — disqualifying weakness.",
      rationale: `Candidate scored 1 on ${dq}, a critical dimension. The rubric rule: any 1 on Ownership or Feedback metabolism is a no-hire regardless of other scores.`,
      strong_count: strong,
      weak_count: weak,
      disqualifying_weakness: dq,
    };
  }

  // Article rule: "A score of 3 on Initiative, Taste, and Question quality is a hire
  // even with a slightly weaker functional skillset" — meaning the three taste-cluster
  // 3s + no critical-disqualifier = HIRE
  const tasteCluster =
    scores.initiative === 3 && scores.taste === 3 && scores.question_quality === 3;

  // Senior/lead level requires more strong dimensions; IC can hire on the 3+strong rule
  const seniorThreshold = role_level === "ic" ? 4 : 5;

  if (tasteCluster || strong >= seniorThreshold) {
    return {
      band: "hire",
      headline: "HIRE.",
      rationale: tasteCluster
        ? `3 on Initiative, Taste, and Question quality with no disqualifying weakness. Per the rubric, this is a hire even with a slightly weaker functional skillset. Strong on ${strong}/8 dimensions overall.`
        : `Strong on ${strong}/8 dimensions with no disqualifying weakness. Meets the ${role_level === "ic" ? "IC" : "senior+"} hire threshold.`,
      strong_count: strong,
      weak_count: weak,
      disqualifying_weakness: null,
    };
  }

  // Otherwise, discuss
  return {
    band: "discuss",
    headline: "DISCUSS — panel debrief required.",
    rationale: `Strong on ${strong}/8 dimensions at ${role_level} level. No disqualifying weakness. Below the auto-hire threshold but not a no-hire. Bring to debrief: which dimensions are the panel willing to accept at 2 for this role, which they're not.`,
    strong_count: strong,
    weak_count: weak,
    disqualifying_weakness: null,
  };
}

function prettyDim(d: keyof AgencyScores): string {
  return d
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatVerdict(
  scores: AgencyScores,
  v: Verdict,
  role_level: "ic" | "senior" | "lead",
  candidate?: string
): string {
  const head = candidate ? `## Candidate: ${candidate}\n` : "";
  const rows = (Object.keys(scores) as (keyof AgencyScores)[])
    .map((k) => `- ${prettyDim(k)}: ${scores[k]}/3`)
    .join("\n");

  return `# Agency-First Candidate Report

${head}## Role level: ${role_level}

## Scores
${rows}

## Tally
- Strong (3): ${v.strong_count}/8
- Weak (1): ${v.weak_count}/8
${v.disqualifying_weakness ? `- Disqualifying weakness: **${v.disqualifying_weakness}**\n` : ""}

## Verdict
**${v.headline}**

${v.rationale}

## Next step
${
  v.band === "hire"
    ? "Move to offer. The Head of People prepares the offer letter; the CEO publicly defends the rubric if a function head pushes back."
    : v.band === "discuss"
      ? "Panel debrief. Decide whether the 2s are acceptable for the role's agency profile, or whether to keep searching."
      : "No hire. Brief the recruiter on what didn't show up; this candidate is closed for the role."
}`;
}

// STAR-response scoring helper: returns guidance on what to listen for.
// We don't actually score from raw text — the LLM does that. We return the rubric.
export function starScoringGuide(dimension: keyof AgencyScores): string {
  const guides: Record<keyof AgencyScores, string> = {
    initiative: `**Initiative — listen for:**
- 3 (strong): named a problem nobody asked them to fix; expanded a mandate before being told
- 2 (acceptable): pushed work forward when blocked; took ownership of an unowned problem
- 1 (weak): waited for direction; "I did what was asked"`,
    verification: `**Verification — listen for:**
- 3 (strong): describes how they checked their own work, including how they were wrong
- 2 (acceptable): mentions verification as a practice; can name a specific instance
- 1 (weak): trusts outputs without testing; "the test passed so it was good"`,
    taste: `**Taste — listen for:**
- 3 (strong): names quality criteria the team didn't have; rejected work that "technically met requirements"
- 2 (acceptable): can distinguish good from mediocre when prompted; has opinions about quality
- 1 (weak): "everything looks fine to me"; can't name what good looks like`,
    question_quality: `**Question quality — listen for:**
- 3 (strong): the question they asked reframed the problem; got the team to a different answer
- 2 (acceptable): asks clarifying questions before jumping to solutions
- 1 (weak): jumps to solutions; questions are "how do I do X" not "is X the right thing"`,
    feedback_metabolism: `**Feedback metabolism — listen for:**
- 3 (strong): names a specific recent mistake clearly; describes what they changed and how it played out
- 2 (acceptable): has examples of feedback received; can describe how they applied it
- 1 (weak): every story ends in success; "the only thing I'd do differently is start earlier"`,
    ambiguity_tolerance: `**Ambiguity tolerance — listen for:**
- 3 (strong): operated without complete information; made calls when variables were missing
- 2 (acceptable): can name how they handle ambiguity; mostly comfortable with "we'll figure it out"
- 1 (weak): needs every variable defined; "I couldn't start because the spec wasn't clear"`,
    ownership: `**Ownership — listen for (DISQUALIFIER if 1):**
- 3 (strong): says "I" for results; takes responsibility for failures including others' parts
- 2 (acceptable): mix of "I" and "we"; doesn't deflect on failures but doesn't always own them
- 1 (weak): "we" for failures, "I" for successes; attributes losses to others — AUTO NO-HIRE`,
    scope_expansion: `**Scope expansion — listen for:**
- 3 (strong): expanded a mandate before; took on adjacent problems and made them theirs
- 2 (acceptable): has stepped outside the role description; can name when and why
- 1 (weak): growth was lateral only; never took on something outside the JD`,
  };
  return guides[dimension];
}
