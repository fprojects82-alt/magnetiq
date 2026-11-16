import { NextRequest, NextResponse } from "next/server";
import { findValidCoupon } from "@/lib/orders";

export async function POST(req: NextRequest) {
  let code: unknown;
  try {
    ({ code } = await req.json());
  } catch {
    return NextResponse.json({ valid: false, message: "Enter a coupon code." }, { status: 400 });
  }
  if (typeof code !== "string" || !code.trim() || code.length > 50) {
    return NextResponse.json({ valid: false, message: "Enter a coupon code." });
  }
  try {
    const coupon = await findValidCoupon(code);
    if (!coupon) {
      return NextResponse.json({ valid: false, message: "This coupon is invalid or expired." });
    }
    return NextResponse.json({ valid: true, code: coupon.code, percent: coupon.percent });
  } catch {
    return NextResponse.json({ valid: false, message: "Could not check the coupon. Try again." }, { status: 500 });
  }
}
