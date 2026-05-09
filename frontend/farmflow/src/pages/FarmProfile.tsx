import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { MapPin, Users, Info, ChevronRight, Loader2, ArrowLeft, ShoppingBag, ShoppingCart } from 'lucide-react';

const FarmProfile = () => {
  const { farmSlug } = useParams();
  const [farmData, setFarmData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmProfile = async () => {
      try {
        const res = await apiClient.get(`/farms/${farmSlug}`);
        setFarmData(res.data);
      } catch (err) {
        console.error('Failed to fetch farm profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmProfile();
  }, [farmSlug]);

  const handleAddToCart = async (product: any) => {
    try {
      await apiClient.post('/cart/add', { productId: product._id, quantity: 1 });
      alert(`${product.name} added to cart!`);
    } catch (err: any) {
      console.error('Failed to add to cart', err);
      alert(err.response?.data?.message || 'Please login to add items to cart.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!farmData || !farmData.farm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white  mb-2">Farm Not Found</h1>
          <p className="text-white/40 mb-6">The farm you're looking for doesn't exist or has been removed.</p>
          <Link to="/discover" className="text-primary font-bold hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  const { farm, products } = farmData;

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <div className="h-80 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10 z-10" />
        {farm.coverImage ? (
          <img src={farm.coverImage} className="w-full h-full object-cover" alt={farm.farmName} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary-dark" />
        )}
        <Link to="/discover" className="absolute top-8 left-8 z-20 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all">
          <ArrowLeft size={24} />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-primary flex items-center justify-center text-white text-2xl font-bold">
              {farm.logo ? (
                <img src={farm.logo} className="w-full h-full object-cover" alt={farm.farmName} />
              ) : (
                farm.farmName?.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{farm.farmName}</h1>
              <p className="text-white/40 max-w-xl font-medium">{farm.farmDescription || "A dedicated organic farm bringing fresh produce to your table."}</p>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2 text-white/40 text-sm font-bold">
                  <Users size={18} className="text-primary" />
                  <span>{farm.stats?.employeeCount || 0} Employees</span>
                </div>
                <div className="flex items-center gap-2 text-white/40 text-sm font-bold">
                  <Info size={18} className="text-primary" />
                  <span>{farm.stats?.cattleCount || 0} Livestock</span>
                </div>
              </div>
            </div>
          </div>
          <button className="bg-primary text-black px-10 py-5 rounded-[24px] font-bold text-sm hover:scale-105 transition-all active:scale-95">
            Contact Farm
          </button>
        </div>

        <div className="mt-20">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-2xl font-bold text-white ">Featured Products</h2>
            <span className="text-white/40 font-bold">{products?.length || 0} items available</span>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product: any) => {
                const stock = product.quantity ?? 0;
                const isOutOfStock = stock === 0;
                const isLowStock = stock > 0 && stock <= 10;
                return (
                  <div 
                    key={product._id} 
                    className={`group bg-white/5 border rounded-[32px] overflow-hidden transition-all duration-500 ${isOutOfStock ? 'border-white/5 opacity-75' : 'border-white/5 hover:border-primary/20'}`}
                  >
                    <div className="h-56 relative overflow-hidden bg-white/5/30">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className={`w-full h-full object-cover transition-transform duration-700 ${!isOutOfStock && 'group-hover:scale-110'}`}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-3">
                          <ShoppingBag size={40} className="opacity-20" />
                        </div>
                      )}

                      {/* Category badge — top left */}
                      <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl">
                        {product.category || 'Fresh'}
                      </div>

                      {/* Stock badge — top right */}
                      <div className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl backdrop-blur-md ${
                        isOutOfStock 
                          ? 'bg-red-500 text-white' 
                          : isLowStock 
                          ? 'bg-amber-400 text-white' 
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${stock} left` : `${stock} kg`}
                      </div>

                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-white/5 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-[32px]">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                        {product.description && (
                          <p className="text-white/40 text-sm line-clamp-2 leading-relaxed mt-1 font-medium">{product.description}</p>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-0.5">Per kg</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-primary text-xs font-bold">Rs.</span>
                            <span className="text-2xl font-bold text-white er">{product.price}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => !isOutOfStock && handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className={`w-12 h-12 rounded-[32px] flex items-center justify-center transition-all active:scale-90 ${
                            isOutOfStock
                              ? 'bg-white/10 text-white/20 cursor-not-allowed'
                              : 'bg-primary text-black hover:brightness-110 shadow-lg shadow-primary/10'
                          }`}
                        >
                          <ShoppingCart size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5/50 rounded-[32px] p-20 text-center border-2 border-dashed border-white/10">
              <ShoppingBag size={48} className="mx-auto text-white/20 mb-4" />
              <p className="text-white/40 font-medium">No products listed yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmProfile;
