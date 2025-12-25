import Link from "next/link";
import { getAgenciesCollection } from "@/lib/db/models";

export default async function HomePage() {
  let agencies: Array<{ slug: string; name: string }> = [];
  
  try {
    const agenciesCollection = await getAgenciesCollection();
    agencies = await agenciesCollection
      .find({})
      .project({ slug: 1, name: 1 })
      .toArray();
  } catch (error) {
    console.error("Error fetching agencies:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Easy Car
          </h1>
          <p className="text-xl text-gray-600">
            Find your perfect rental car
          </p>
        </div>

        {agencies.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Select an Agency
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agencies.map((agency) => (
                <Link
                  key={agency.slug}
                  href={`/${agency.slug}`}
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {agency.name}
                  </h3>
                  <p className="text-gray-600">View vehicles →</p>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No agencies available yet.</p>
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:underline"
            >
              Sign in to create an agency
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

