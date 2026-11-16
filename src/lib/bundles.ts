import { db } from "./db";
import { PrintLineKey } from "./catalog";
import { ensureCatalog } from "./catalogSync";

export async function getLineBundles(line: PrintLineKey) {
  await ensureCatalog();
  return db.package.findMany({
    where: { active: true, line },
    orderBy: [{ photoSlots: "asc" }, { sortOrder: "asc" }],
  });
}
