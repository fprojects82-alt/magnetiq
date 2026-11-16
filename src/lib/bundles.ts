import { db } from "./db";
import { PrintLineKey } from "./catalog";

export async function getLineBundles(line: PrintLineKey) {
  return db.package.findMany({
    where: { active: true, line },
    orderBy: [{ photoSlots: "asc" }, { sortOrder: "asc" }],
  });
}
