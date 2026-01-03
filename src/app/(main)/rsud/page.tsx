"use client";

import { OpdDashboard } from "@/lib/opd";

const RSUD_OPD_ID = 3;

export default function Page() {
  return <OpdDashboard opdId={RSUD_OPD_ID} />;
}
