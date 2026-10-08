// SLDA skills API — 서버 간 호출 전용 (§14: 2·3단 자산은 프론트에 내려가지 않는다)
// Deploy: 이 폴더를 maenglion/homepage/supabase/functions/slda-skills/ 로 복사 후, homepage 루트에서
//         supabase functions deploy slda-skills --no-verify-jwt   (프로젝트 nafpbwqdjxcftwfpadfr)
// 1단 전처리 지시문은 여기서 내려주지 않는다 — slda-issue-prompt(DB slda_prompts) 가 담당 (homepage §14.4).
// Secrets: SLDA_API_KEY (서버 간 공유키), GH_TOKEN (private repo raw 읽기), GH_REPO=maenglion/slda-skills, GH_REF=main
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const KEY = Deno.env.get("SLDA_API_KEY")!;
const GH_TOKEN = Deno.env.get("GH_TOKEN")!;
const REPO = Deno.env.get("GH_REPO") ?? "maenglion/slda-skills";
const REF = Deno.env.get("GH_REF") ?? "main";
const cache = new Map<string, { t: number; body: string }>();
const TTL = 5 * 60 * 1000;

async function raw(path: string): Promise<string> {
  const k = `${REF}:${path}`; const c = cache.get(k);
  if (c && Date.now() - c.t < TTL) return c.body;
  const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${REF}/${path}`, { headers: { Authorization: `token ${GH_TOKEN}` } });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  const body = await r.text(); cache.set(k, { t: Date.now(), body }); return body;
}
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8" } });

// total_king: 메타 → 스킬 배치 (결정적). 점수 없음.
function dispatch(d: any, m: { mod: string; data_class?: string; sources?: string[]; signals?: string[]; flags?: string[]; pair_id?: string; output?: string }) {
  const has = (arr: string[] | undefined, pat: string) => (arr ?? []).some(s => new RegExp(pat, "i").test(s));
  const pub = m.data_class === "public";
  const order: string[] = [...d.always_first];
  if (!pub) { order.push(d.context.case_index); if (m.pair_id) order.push(d.context.counterpart_ledger.skill); }
  if (has(m.sources, "call|audio|stt|통화")) order.push("slda-transcript");
  const mod = d.modules[m.mod]; if (!mod) throw new Error(`unknown mod: ${m.mod}`);
  if (pub && !d.data_class.public_modules.includes(m.mod)) throw new Error(`mod ${m.mod} is not a public-track module`);
  if (!pub && mod.data_class === "public") throw new Error(`mod ${m.mod} requires data_class=public (no PII input)`);
  order.push(mod.skill);
  for (const s of mod.sub ?? []) if (has(m.sources, "신청서|제출명령|사실조회|과세정보|금융거래")) order.push(s.skill);
  if (has(m.signals, "ai_mention") && ["controversy", "dispute"].includes(m.mod)) order.push("slda-ai-invocation");
  if (has(m.signals, "probe|repeat_question|silence")) order.push("slda-probe");
  if (has(m.flags, "style")) order.push("slda-stylistic-drift");
  if (/^(html|pdf)$/i.test(m.output ?? "")) order.push("slda-report-html");
  return { order: [...new Set(order)], verdict_mode: mod.verdict_mode, data_class: pub ? "public" : "private", preprocess_directive: pub ? null : (d.preprocess_directive[m.mod] ?? null)  // 참고용 경로. 실제 발급은 slda-issue-prompt };
}

serve(async (req) => {
  if (req.headers.get("x-slda-key") !== KEY) return json({ error: "unauthorized" }, 401);
  const url = new URL(req.url); const p = url.pathname.replace(/^\/slda-skills/, "");
  try {
    if (p === "/manifest") return new Response(await raw("manifest.json"), { headers: { "content-type": "application/json" } });
    const m = p.match(/^\/skill\/(slda-[a-z-]+)$/);
    if (m) return new Response(await raw(`${m[1]}/SKILL.md`), { headers: { "content-type": "text/markdown; charset=utf-8" } });
    if (p === "/rubrics") return new Response(await raw("rubrics.json"), { headers: { "content-type": "application/json" } });
    if (p === "/dispatch" && req.method === "POST") {
      const meta = await req.json(); const d = JSON.parse(await raw("dispatch.json")); const R = JSON.parse(await raw("rubrics.json"));
      const plan = dispatch(d, meta);
      const rubrics = [...new Set([...(R.by_module[meta.mod] ?? []), ...plan.order.flatMap((s: string) => R.overlay_rubrics[s] ?? [])])].sort();
      (plan as any).rubrics = rubrics;
      const bundle = meta.bundle ? (await Promise.all(plan.order.map(s => raw(`${s}/SKILL.md`)))).join("\n\n---\n\n") : undefined;
      return json({ ...plan, dispatch_version: d.version, bundle });
    }
    return json({ error: "not found", routes: ["GET /manifest", "GET /rubrics", "GET /skill/:name", "POST /dispatch {mod,sources,signals,flags,pair_id,output,bundle}"] }, 404);
  } catch (e) { return json({ error: String(e) }, 500); }
});
