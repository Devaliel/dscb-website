"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Star from "@/components/persona/star";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

/**
 * Total-visits counter — increments once per browser session via the
 * increment_visits() RPC (see supabase/visits-schema.sql). Renders nothing
 * until a count is known, so the footer never breaks if the table is missing.
 */
export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!supabaseEnabled) return;
    const sb = getSupabase();
    const visited = sessionStorage.getItem("dscb-visited");

    if (!visited) {
      // flag first so a double mount can't fire the RPC twice
      sessionStorage.setItem("dscb-visited", "1");
    }

    (visited
      ? sb
          .from("site_visits")
          .select("count")
          .eq("id", 1)
          .single()
          .then(({ data, error }) => (error ? null : Number(data.count)))
      : sb.rpc("increment_visits").then(({ data, error }) => {
          if (error) {
            sessionStorage.removeItem("dscb-visited");
            return null;
          }
          return Number(data);
        })
    ).then((n) => {
      if (n !== null && Number.isFinite(n)) setCount(n);
    });
  }, []);

  if (count === null) return null;

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-1.5"
    >
      <Star className="h-2 w-2 text-brand-400" />
      <span className="font-display text-xs font-bold uppercase italic tracking-wide">
        <span className="tabular-nums" style={{ color: "var(--color-brand-300)" }}>
          {count.toLocaleString("en-US")}
        </span>{" "}
        {count === 1 ? "duelist has" : "duelists have"} dropped by
      </span>
    </motion.p>
  );
}
