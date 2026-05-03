import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postcode = searchParams.get("postcode")?.replace(/\s/g, "").toUpperCase();
  const huisnummer = searchParams.get("huisnummer");

  if (!postcode || !huisnummer) {
    return NextResponse.json({ error: "Postcode en huisnummer verplicht" }, { status: 400 });
  }

  const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${postcode}+${huisnummer}&fq=type:adres&fl=straatnaam,woonplaatsnaam,postcode,huisnummer&rows=1`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return NextResponse.json({ error: "PDOK niet bereikbaar" }, { status: 502 });

  const data = await res.json();
  const docs = data?.response?.docs;
  if (!docs?.length) return NextResponse.json({ found: false });

  const doc = docs[0];
  return NextResponse.json({
    found: true,
    straat: doc.straatnaam ?? "",
    woonplaats: doc.woonplaatsnaam ?? "",
    postcode: doc.postcode ?? postcode,
    huisnummer: doc.huisnummer ?? huisnummer,
  });
}
