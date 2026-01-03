"use client";

import { OpdDashboard } from "@/lib/opd";

const OPD_ID = 7;

export default function Page() {
  return <OpdDashboard opdId={OPD_ID} />;
}
