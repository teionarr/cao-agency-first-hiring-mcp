<h1 align="center">CAO: Agency-First Hiring MCP</h1>

<p align="center">
  <b>One URL. Any LLM. Five surgical adjustments to your existing hiring process so the next 50 hires are agency-weighted.</b>
</p>

<p align="center">
  <a href="https://cao-agency-first-hiring-mcp.levitin.workers.dev"><img alt="Live" src="https://img.shields.io/badge/live-cao--agency--first--hiring--mcp.levitin.workers.dev-00C7B7?style=flat-square"></a>
  <img alt="MCP" src="https://img.shields.io/badge/MCP-Streamable_HTTP-7C3AED?style=flat-square">
  <img alt="Cloudflare" src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square">
</p>

---

## What this is

The CAO hire is one decision. This is the next fifty.

Your hiring process already extracts "X did Y to reach Z" cleanly. STAR works. What STAR doesn't reach is **how** the candidate operated while shipping it — what they didn't know, what they decided without authority, what they almost missed.

This MCP runs the five surgical adjustments from the [Hiring agency-first people](https://ai-lead.levitin.io/chief-agency-officer/) subarticle:

> **JDs · Screening · Rubric · STAR probes · Calibration session**

Same loop, deeper signal. No new interview structure. No ATS replacement. No comp redesign. The discipline is in *not* changing the working machinery — and folding in the five additions that surface agency, alongside the technical and functional dimensions you already score.

The MCP delivers the skill, the subarticle, the agency rubric supplement (IC vs senior bars), and 24 STAR-deepening probes into whatever LLM you're already paying for. Free to run, identical across Claude / ChatGPT / Gemini.

---

## Install in 30 seconds

### Claude Code (one command)

```bash
claude mcp add cao-agency-first --transport http \
  https://cao-agency-first-hiring-mcp.levitin.workers.dev/mcp
```

Restart Claude Code. The `start_agency_first_hiring` tool and `agency-first-hiring` prompt will appear.

<details>
<summary><b>Claude Desktop</b></summary>

```json
{
  "mcpServers": {
    "cao-agency-first": {
      "url": "https://cao-agency-first-hiring-mcp.levitin.workers.dev/mcp"
    }
  }
}
```
</details>

<details>
<summary><b>Claude.ai (web)</b></summary>

Settings → **Connectors** → **Add custom connector** → paste:

```
https://cao-agency-first-hiring-mcp.levitin.workers.dev/mcp
```
</details>

<details>
<summary><b>ChatGPT</b> (Pro / Team / Enterprise)</summary>

Settings → **Connectors** → **Custom MCP** → paste the URL above.
</details>

<details>
<summary><b>Gemini CLI</b></summary>

`~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "cao-agency-first": {
      "httpUrl": "https://cao-agency-first-hiring-mcp.levitin.workers.dev/mcp"
    }
  }
}
```
</details>

---

## How to use it

```
You: Augment our existing rubric to score for agency. We have a senior
     engineer panel on Wednesday.
LLM: [calls start_agency_first_hiring + get_adjustment("rubric"), returns
      the 8 dimensions with IC vs senior bars and the calibration session
      structure for the panel briefing]
```

```
You: Score this STAR response from a senior IC candidate on Ownership.
     "We migrated to the new platform. It took longer than planned because
     the platform team's docs were wrong. We got there eventually."
LLM: [calls score_star_response("ownership"), returns the rubric. Notes:
      "we" language for both success and failure → score 1. AUTO NO-HIRE
      if confirmed across other ownership probes.]
```

```
You: Final candidate, senior engineer. Strong on Initiative, Verification,
     Taste, Question quality, Scope expansion. Weak on Feedback metabolism
     (= 1). Acceptable on Ambiguity tolerance and Ownership.
LLM: [calls final_verdict(...,feedback_metabolism:1,...) →
      NO HIRE — disqualifying weakness on Feedback metabolism]
```

---

## The eight agency dimensions

| Dimension | What strong looks like | Disqualifier |
|---|---|---|
| Initiative | Pushed work forward without prompting; expanded mandates uninvited. | Waited for direction. |
| Verification | Checks own and others' output. | Trusts outputs without testing. |
| Taste | Distinguishes good from mediocre, has rejected work that "technically met requirements". | Everything looks fine. |
| Question quality | The question reframes the problem. | Jumps to solutions. |
| Feedback metabolism | Names a recent mistake clearly. | Every story ends in success. **Score 1 = auto no-hire.** |
| Ambiguity tolerance | Operates without complete information. | Needs every variable defined. |
| Ownership | Says "I" for results, not "we" for failures. | Attributes losses. **Score 1 = auto no-hire.** |
| Scope expansion | Has expanded a mandate before. | Growth was lateral only. |

**The scoring tool enforces:**
- **Auto no-hire** when Ownership = 1 OR Feedback metabolism = 1 (regardless of other dimensions)
- **Auto hire** when Initiative + Taste + Question quality = 3 each, with no disqualifying weakness (the "even with a slightly weaker functional skillset" rule from the article)

---

## What gets loaded

| Artifact | What it is |
|---|---|
| **Skill** | How to coach the Head of People through the five adjustments. |
| **Reference** | Full subarticle — JDs, screening, rubric, probes, calibration session, no-change list. |
| **Agency rubric supplement** | 8 dimensions with IC/junior vs senior/manager+ bars. Folds into the existing rubric document. |
| **STAR-deepening probes** | 24 probes (3 per dimension). Layer underneath existing STAR questions. |

---

## What the server exposes

| Type | Name | Description |
|---|---|---|
| Tool | `start_agency_first_hiring` | Returns the full kit + a directive to ask which adjustment you're on. Optional `role_level` hint. |
| Tool | `get_adjustment` | Args: `adjustment` (`jds`, `screening`, `rubric`, `probes`, `calibration`). Returns that adjustment's content. Aliases accepted. |
| Tool | `score_star_response` | Args: `dimension` (one of the 8). Returns the listen-for guide with 1/2/3 score signals. |
| Tool | `final_verdict` | Args: 8 dimension scores + `role_level` + optional `candidate` name. Returns HIRE / DISCUSS / NO HIRE with rationale and next step. Enforces auto-disqualifier and auto-hire rules. |
| Prompt | `agency-first-hiring` | Same as the start tool. |
| Resource | `skill://cao-agency-first-hiring` | The coaching skill. |
| Resource | `reference://hiring-agency-first-people` | The article body. |
| Resource | `template://agency-rubric` | The rubric supplement. |
| Resource | `template://agency-interview-questions` | The 24 STAR-deepening probes. |

---

## Privacy

- **No authentication.** Public read-only endpoint.
- **No tracking.** No analytics, no per-user logs.
- **No candidate data uploads.** Scoring takes 8 integers; candidate interview transcripts never leave your LLM.

---

## Run your own copy

```bash
git clone git@github.com:teionarr/cao-agency-first-hiring-mcp.git
cd cao-agency-first-hiring-mcp
npm install
npx wrangler login
npm run deploy
```

---

## The four-MCP family

| # | Card | MCP | URL |
|---|---|---|---|
| 01 | How to talk to your exec team | [cao-exec-conversation](https://github.com/teionarr/cao-exec-conversation-mcp) | `https://cao-exec-conversation-mcp.levitin.workers.dev/mcp` |
| 02 | Adopt the toolkit without the title | [cao-toolkit](https://github.com/teionarr/cao-toolkit-mcp) | `https://cao-toolkit-mcp.levitin.workers.dev/mcp` |
| 03 | Hiring a Chief Agency Officer | [cao-hiring](https://github.com/teionarr/cao-hiring-mcp) | `https://cao-hiring-mcp.levitin.workers.dev/mcp` |
| 04 | Hiring agency-first people | **cao-agency-first-hiring** (this) | `https://cao-agency-first-hiring-mcp.levitin.workers.dev/mcp` |

Umbrella repo: [chief-agency-officer](https://github.com/teionarr/chief-agency-officer).

---

## License

MIT. The skill, reference, rubric, and probes are based on original work by [@teionarr](https://github.com/teionarr) at [ai-lead.levitin.io](https://ai-lead.levitin.io).
