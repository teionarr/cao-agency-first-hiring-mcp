// The five surgical adjustments from the article.
// Source: content/REFERENCE_agency_first_hiring.md

export type AdjustmentId = "jds" | "screening" | "rubric" | "probes" | "calibration";

const ADJUSTMENTS: Record<AdjustmentId, { title: string; body: string }> = {
  jds: {
    title: "Adjustment 1: JDs — name the operating posture, not just the outcomes",
    body: `Add a short "How you'll work here" section to existing JD templates. Two to four sentences naming the operating posture. This filters for agency at the funnel stage, before the candidate gets to a screen.

**Add to JDs (adapt to your voice; keep the shape):**
- "You will ship from week two. Onboarding is something you do alongside the work, not before it."
- "You will figure out things nobody has documented. We don't have a runbook for everything."
- "You will own outcomes that cross functional lines. We don't reward staying in your lane."
- "We hire for what you've built and shipped, not where you've worked."

**Remove from JDs:**
- "5-7 years of relevant experience required" — use shipping evidence instead
- "Bachelor's degree required" — unless legally mandated
- "Experience with [specific tool] required" — unless truly non-negotiable
- Long "responsibilities" lists that read like committee deliverables

The Head of People audits the JD template library, updates each role family with the new "How you'll work here" language, and briefs recruiters on what's changing and why. One to two weeks of work. The effect persists across every JD that goes out from then on.`,
  },
  screening: {
    title: "Adjustment 2: Screening — pattern-match less, read non-linear paths",
    body: `Even when screeners are looking for accomplishment signal, they tend to favor candidates whose careers look like the standard escalator. The candidate who went IC → senior → staff → principal at brand-name companies gets advanced; the candidate who went IC → founder → operator → consultant gets quietly screened out, even when their shipped work is stronger.

The adjustment is calibration, not weights. The screener should be reading career arcs for evidence of agency expressed over time, not just for legibility.

**Read these as signal:**
- Function-jumps and role-jumps that came with named expansions of mandate
- Time spent as a founder, even on something that didn't work — if the candidate can name what they learned
- Self-directed work: open-source contributions, writing, side projects, anything they made without permission
- Tenure of 18+ months with a named outcome at each role

**Read these as weak signal:**
- Linear title progression at brand-name companies as a substitute for shipped work
- Generic resume language: "led cross-functional initiative," "drove alignment," "managed stakeholders"
- Roles with no named outcome — just job duties listed
- Educational pedigree as a primary filter for non-credentialed work

The Head of People rewrites the screening criteria for each role family, briefs the recruiting team on what non-linear arcs look like in practice, and updates whatever resume-scoring tool the company uses. The point isn't to flip the filter — it's to stop letting clean escalator patterns auto-pass over messier-but-stronger candidates.`,
  },
  rubric: {
    title: "Adjustment 3: Augment the existing rubric",
    body: `Don't replace what's there. The technical and functional dimensions already being scored still matter. Add the 8 agency dimensions alongside them.

**The 8 dimensions:**
- Initiative
- Verification
- Taste
- Question quality
- Feedback metabolism
- Ambiguity tolerance
- Ownership
- Scope expansion

The rubric supplement (template://agency-rubric) names what "strong" looks like at IC/junior and at senior/manager+ levels, because the bar shifts with seniority. A junior IC who has shipped something nobody asked for is strong on Initiative. A senior who has only done that is borderline. The supplement makes those distinctions explicit so panels don't have to invent them.

The Head of People folds the supplement into the existing rubric document, updates the panel-training materials, and runs one calibration session per role family to align on what the scores mean in practice.

**Critical disqualifier:** a score of 1 on Ownership or Feedback Metabolism is a no-hire regardless of other scores. The final_verdict tool enforces this.`,
  },
  probes: {
    title: "Adjustment 4: Probes that go beneath the STAR answer",
    body: `Behavioral interviewing gets you the STAR answer — "X did Y to reach Z." That's the surface. The candidate has polished it.

The agency probes (template://agency-interview-questions) go underneath. After the candidate finishes their story, the panelist picks one or two probes to surface what the STAR doesn't reach.

**Example:**
- STAR: "I led the migration to the new platform, finished in six months, reduced infrastructure cost by 30%."
- Probe: "What didn't you know when you started?"
- Probe: "What did you decide without authority?"
- Probe: "Knowing what you know now, would you do it the same way?"

The polished STAR can't be polished further by the probe — the candidate either has answers underneath or they don't. The probes are hard to rehearse precisely because they go where the rehearsal didn't go.

**Usage discipline:** one or two probes per behavioral question, not all three. Pick the probe that best fits what the STAR didn't reach. Firing all three feels like interrogation and degrades signal.

The Head of People circulates the probe sheet, briefs the interview panels on how the probes layer onto existing behavioral questions, and updates the interview-prep templates the recruiting team sends to interviewers ahead of each loop. No new interview structure — same loop, deeper probes.`,
  },
  calibration: {
    title: "Adjustment 5: Restructure the calibration session",
    body: `In every calibration session, the panel explicitly discusses the agency failure modes — rehearsed answers, scope avoidance, deflection of ownership, refusal to name mistakes. Naming the failure modes once before the loop helps panelists recognize them in real time, when the candidate is in the room.

**15-minute three-block structure:**

**First 5 min — The role's agency profile.**
Which of the 8 dimensions matter most for this specific role? What's the bar at this seniority? The recruiter walks the panel through the rubric supplement, level-calibrated.

**Next 5 min — The failure modes.**
What does a weak answer look like for each priority dimension? Rehearsed bullet points, deflection, "we" language for failures, hedging on specificity. The panel names them out loud.

**Last 5 min — The verdict rule.**
Confirm the no-hire heuristics. A score of 1 on Ownership or Feedback metabolism is a no-hire, regardless of other scores. A score of 3 on Initiative, Taste, and Question quality is a hire even with a slightly weaker functional skillset.`,
  },
};

export function getAdjustment(id: string): { title: string; body: string } | null {
  const trimmed = id.trim().toLowerCase() as AdjustmentId;
  const aliases: Record<string, AdjustmentId> = {
    jd: "jds",
    job_description: "jds",
    "job-descriptions": "jds",
    screen: "screening",
    resumes: "screening",
    scorecard: "rubric",
    dimensions: "rubric",
    star: "probes",
    "star-probes": "probes",
    "interview-questions": "probes",
    "calibration-session": "calibration",
    panel: "calibration",
  };
  const resolved = aliases[trimmed] ?? (trimmed as AdjustmentId);
  return ADJUSTMENTS[resolved] ?? null;
}

export function knownAdjustmentIds(): AdjustmentId[] {
  return Object.keys(ADJUSTMENTS) as AdjustmentId[];
}
