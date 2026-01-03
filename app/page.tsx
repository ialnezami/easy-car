import Link from "next/link";
import { getAgenciesCollection } from "@/lib/db/models";

export default async function HomePage() {
  let agencies: Array<{ slug: string; name: string }> = [];
  
  try {
    const agenciesCollection = await getAgenciesCollection();
    const results = await agenciesCollection
      .find({})
      .project({ slug: 1, name: 1 })
      .toArray();
    agencies = results as Array<{ slug: string; name: string }>;
  } catch (error) {
    console.error("Error fetching agencies:", error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent"></div>
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-white/90">Available Now</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight">
              Easy Car
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
              Find your perfect rental car with ease
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="btn-primary text-lg px-8 py-4 shadow-glow"
              >
                Get Started
              </Link>
              <Link
                href="/auth/signin"
                className="btn-secondary text-lg px-8 py-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Agencies Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        {agencies.length > 0 ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                Choose Your Agency
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Select from our trusted car rental agencies to browse available vehicles
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agencies.map((agency) => (
                <Link
                  key={agency.slug}
                  href={`/${agency.slug}`}
                  className="group card-hover p-8"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {agency.name.charAt(0)}
                    </div>
                    <svg className="w-6 h-6 text-primary-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {agency.name}
                  </h3>
                  <p className="text-slate-600">Browse vehicles →</p>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-semibold text-slate-900 mb-3">
              No agencies available yet
            </h3>
            <p className="text-slate-600 mb-6">Be the first to create an agency and start renting cars.</p>
            <Link
              href="/auth/signin"
              className="btn-primary"
            >
              Create Agency
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


