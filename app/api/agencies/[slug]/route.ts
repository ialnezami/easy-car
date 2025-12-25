import { NextRequest, NextResponse } from "next/server";
import { getAgenciesCollection } from "@/lib/db/models";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const agenciesCollection = await getAgenciesCollection();
    const agency = await agenciesCollection.findOne({ slug: params.slug });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(agency);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch agency" },
      { status: 500 }
    );
  }
}

