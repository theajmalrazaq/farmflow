import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { MapPin, ArrowRight, Loader2, Search, Filter } from 'lucide-react';

const Discover = () => {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await apiClient.get('/farms');
        setFarms(res.data.farms || []);
      } catch (err) {
        console.error('Failed to fetch farms', err);
        setFarms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  const filteredFarms = farms.filter(f => 
    f.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-transparent min-h-screen pt-40 pb-24">
      <div className="max-w-[1400px] mx-auto px-8">
        <header className="mb-16 max-w-[800px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1]  mb-6">
            Discover <span className="text-primary">Farms</span>
          </h1>
          <p className="text-white/40 text-lg leading-relaxed">
            Explore verified organic farms from every corner of Pakistan. Meet the farmers and shop their products directly.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative flex items-center group">
            <Search size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by farm name or location..." 
              className="w-full bg-bg-primary border border-white/10 rounded-full py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full flex items-center gap-2 hover:bg-white/10 transition-all font-bold">
            <Filter size={18} /> All Regions
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFarms.map((farm) => (
              <Link 
                key={farm._id} 
                to={`/farm/${farm.farmSlug}`}
                className="group bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden hover:border-primary/30 transition-all duration-500 flex flex-col"
              >
                <div className="h-64 overflow-hidden relative bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {farm.coverImage ? (
                    <img 
                      src={farm.coverImage} 
                      alt={farm.farmName} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-primary/40">
                      <h2 className="text-4xl font-bold font-syne opacity-20">{farm.farmName}</h2>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div className="w-16 h-16 rounded-[32px] bg-white/5 p-1 border border-white/20 overflow-hidden flex items-center justify-center">
                      {farm.logo ? (
                        <img 
                          src={farm.logo} 
                          alt={farm.farmName} 
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {(!farm.logo) ? (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-xl rounded-xl">
                          {farm.farmName?.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="hidden w-full h-full bg-primary flex items-center justify-center text-white font-bold text-xl rounded-xl">
                          {farm.farmName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white  mb-2 group-hover:text-primary transition-colors">{farm.farmName}</h3>
                  <div className="flex items-center gap-2 text-white/40 text-sm mb-4">
                    <MapPin size={16} className="text-primary" />
                    <span>{farm.address}</span>
                  </div>
                  <p className="text-white/40 line-clamp-2 mb-6 flex-1">
                    {farm.farmDescription || 'Verified organic producer on FarmFlow.'}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                    <span className="text-primary font-bold inline-flex items-center gap-2">
                      View Products <ArrowRight size={18} />
                    </span>
                    <span className="bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-primary/10">
                      Verified
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredFarms.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No farms found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
