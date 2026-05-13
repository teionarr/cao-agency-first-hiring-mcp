import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { buildKit } from "./kit.js";
import { SKILL_TEXT, REFERENCE_TEXT, MAIN_ARTICLE_TEXT, RUBRIC_TEMPLATE, PROBES_TEMPLATE } from "./content.js";
import { getAdjustment, knownAdjustmentIds } from "./adjustments.js";
import {
  finalVerdict,
  formatVerdict,
  starScoringGuide,
  type AgencyScores,
  type DimensionScore,
} from "./scoring.js";

const SERVER_NAME = "cao-agency-first-hiring";
const SERVER_VERSION = "1.0.0";

export class AgencyFirstHiringMCP extends McpAgent {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    this.server.registerTool(
      "start_agency_first_hiring",
      {
        title: "Start agency-first hiring augmentation",
        description:
          "Begin coaching the Head of People (or CEO briefing one) through the " +
          "five surgical adjustments to the existing hiring process. Returns the " +
          "skill, the full article, the agency rubric supplement, and the 24 " +
          "STAR-deepening probes, with a directive to ask which adjustment the " +
          "user is working on.",
        inputSchema: {
          role_level: z
            .enum(["ic", "senior", "lead"])
            .optional()
            .describe(
              "Optional role level. Affects scoring bar (IC and senior have " +
                "different thresholds for the same dimension)."
            ),
        },
      },
      async ({ role_level }) => ({
        content: [{ type: "text", text: buildKit({ roleLevel: role_level }) }],
      })
    );

    this.server.registerTool(
      "get_adjustment",
      {
        title: "Get one of the five adjustments",
        description:
          "Return one adjustment's full content. Adjustment ids: 'jds' " +
          "(How-you-will-work-here JD section), 'screening' (read non-linear " +
          "career arcs as signal), 'rubric' (the 8 agency dimensions), " +
          "'probes' (24 STAR-deepening probes), 'calibration' (15-min " +
          "three-block calibration session structure). Friendly aliases " +
          "accepted (jd, scorecard, star, etc.).",
        inputSchema: {
          adjustment: z
            .string()
            .describe(
              "Adjustment id. Examples: 'jds', 'screening', 'rubric', " +
                "'probes', 'calibration'."
            ),
        },
      },
      async ({ adjustment }) => {
        const a = getAdjustment(adjustment);
        if (!a) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text:
                  `Unknown adjustment '${adjustment}'. ` +
                  `Known: ${knownAdjustmentIds().join(", ")}. ` +
                  `Aliases accepted: jd, screen, scorecard, dimensions, star, panel.`,
              },
            ],
          };
        }
        return {
          content: [{ type: "text", text: `## ${a.title}\n\n${a.body}` }],
        };
      }
    );

    this.server.registerTool(
      "score_star_response",
      {
        title: "Get the listen-for guide for one dimension",
        description:
          "Return the rubric's listen-for signals for one of the 8 agency " +
          "dimensions, with the 1/2/3 score definitions. Use this in the moment " +
          "you're scoring a STAR response — match what the candidate said against " +
          "the listed signals.",
        inputSchema: {
          dimension: z
            .enum([
              "initiative",
              "verification",
              "taste",
              "question_quality",
              "feedback_metabolism",
              "ambiguity_tolerance",
              "ownership",
              "scope_expansion",
            ])
            .describe("Which dimension to fetch the listen-for guide for."),
        },
      },
      async ({ dimension }) => ({
        content: [{ type: "text", text: starScoringGuide(dimension) }],
      })
    );

    this.server.registerTool(
      "final_verdict",
      {
        title: "Compute the candidate's final agency verdict",
        description:
          "Apply the article's verdict logic to per-dimension scores. Each of " +
          "the 8 dimensions scored 1 (weak), 2 (acceptable), or 3 (strong). " +
          "Returns the verdict — HIRE / DISCUSS / NO HIRE — with rationale. " +
          "Auto-disqualifier rule: any 1 on Ownership or Feedback Metabolism = " +
          "no-hire regardless of other scores. Auto-hire rule: 3 on Initiative + " +
          "Taste + Question quality, with no disqualifying weakness, = hire.",
        inputSchema: {
          initiative: z.number().int().min(1).max(3),
          verification: z.number().int().min(1).max(3),
          taste: z.number().int().min(1).max(3),
          question_quality: z.number().int().min(1).max(3),
          feedback_metabolism: z.number().int().min(1).max(3),
          ambiguity_tolerance: z.number().int().min(1).max(3),
          ownership: z.number().int().min(1).max(3),
          scope_expansion: z.number().int().min(1).max(3),
          role_level: z.enum(["ic", "senior", "lead"]).default("ic"),
          candidate: z.string().max(120).optional(),
        },
      },
      async (args) => {
        const scores: AgencyScores = {
          initiative: args.initiative as DimensionScore,
          verification: args.verification as DimensionScore,
          taste: args.taste as DimensionScore,
          question_quality: args.question_quality as DimensionScore,
          feedback_metabolism: args.feedback_metabolism as DimensionScore,
          ambiguity_tolerance: args.ambiguity_tolerance as DimensionScore,
          ownership: args.ownership as DimensionScore,
          scope_expansion: args.scope_expansion as DimensionScore,
        };
        const v = finalVerdict(scores, args.role_level);
        return {
          content: [
            { type: "text", text: formatVerdict(scores, v, args.role_level, args.candidate) },
          ],
        };
      }
    );

    this.server.registerPrompt(
      "agency-first-hiring",
      {
        title: "Run the agency-first hiring augmentation",
        description:
          "Coach the Head of People through the 5 surgical adjustments.",
        argsSchema: {
          role_level: z.enum(["ic", "senior", "lead"]).optional(),
        },
      },
      ({ role_level }) => ({
        messages: [
          {
            role: "user",
            content: { type: "text", text: buildKit({ roleLevel: role_level }) },
          },
        ],
      })
    );

    this.server.registerResource(
      "skill",
      "skill://cao-agency-first-hiring",
      {
        title: "Agency-first hiring skill",
        description:
          "The coaching skill: 5-adjustment placement, content delivery, " +
          "scoring with auto-disqualifier and auto-hire rules.",
        mimeType: "text/markdown",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: SKILL_TEXT }],
      })
    );

    this.server.registerResource(
      "main-article",
      "reference://chief-agency-officer-main",
      {
        title: "The Chief Agency Officer — main article (full thesis)",
        description:
          "The full main article on the Chief Agency Officer role and the " +
          "four-way framework. The 'why' behind every MCP in this family.",
        mimeType: "text/markdown",
      },
      async (uri) => ({
        contents: [
          { uri: uri.href, mimeType: "text/markdown", text: MAIN_ARTICLE_TEXT },
        ],
      })
    );

    this.server.registerResource(
      "reference",
      "reference://hiring-agency-first-people",
      {
        title: "Hiring agency-first people (article)",
        description: "Full text of the subarticle.",
        mimeType: "text/markdown",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: REFERENCE_TEXT }],
      })
    );

    this.server.registerResource(
      "rubric-template",
      "template://agency-rubric",
      {
        title: "Agency rubric supplement",
        description: "8 dimensions × IC vs senior bars. Fold into the existing rubric.",
        mimeType: "text/markdown",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: RUBRIC_TEMPLATE }],
      })
    );

    this.server.registerResource(
      "probes-template",
      "template://agency-interview-questions",
      {
        title: "STAR-deepening probes",
        description: "24 probes (3 per dimension × 8 dimensions). Layer under existing STAR questions.",
        mimeType: "text/markdown",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: PROBES_TEMPLATE }],
      })
    );
  }
}

const LANDING_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>CAO Agency-First Hiring MCP</title>
  <style>
    :root { color-scheme: light dark; }
    body { font: 16px/1.6 -apple-system, system-ui, sans-serif; max-width: 640px; margin: 4rem auto; padding: 0 1.5rem; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    @media (prefers-color-scheme: dark) { pre { background: #1a1a1a; } }
    h1 { margin-bottom: 0.25rem; }
    .sub { color: #666; margin-top: 0; }
  </style>
</head>
<body>
  <h1>CAO: Agency-First Hiring MCP</h1>
  <p class="sub">5 surgical adjustments to your existing hiring process so the next 50 hires are agency-weighted.</p>

  <h2>Install (Claude Code, one command)</h2>
  <pre>claude mcp add cao-agency-first --transport http \\
  https://cao-agency-first-hiring-mcp.levitin.workers.dev/mcp</pre>

  <p>Other clients: see the <a href="https://github.com/teionarr/cao-agency-first-hiring-mcp">README</a>.</p>
  <p>Article: <a href="https://ai-lead.levitin.io/chief-agency-officer/">ai-lead.levitin.io/chief-agency-officer</a></p>
</body>
</html>`;

type Env = Record<string, unknown>;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return AgencyFirstHiringMCP.serveSSE("/sse").fetch(request, env, ctx);
    }
    if (url.pathname === "/mcp") {
      return AgencyFirstHiringMCP.serve("/mcp").fetch(request, env, ctx);
    }
    if (url.pathname === "/healthz") {
      return new Response("ok", { status: 200, headers: { "content-type": "text/plain" } });
    }
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(LANDING_HTML, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
      });
    }
    return new Response("Not found", { status: 404 });
  },
};
