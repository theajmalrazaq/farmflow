import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Star, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  Plus, 
  Loader2, 
  ShoppingCart,
  UserCircle
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  const fetchProduct = async () => {
    try {
      const res = await apiClient.get(`/products/${id}`);
      setProduct(res.data.product);
    } catch (err) {
      console.error('Failed to fetch product', err);
      showToast('Product not found', 'error');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/register');
      return;
    }

    try {
      await apiClient.post('/cart/add', { productId: id, quantity: 1 });
      window.dispatchEvent(new Event('cartUpdated'));
      showToast('Added to cart successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to add to cart', 'error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to leave a review', 'error');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await apiClient.post(`/products/${id}/review`, reviewForm);
      showToast('Review submitted!', 'success');
      setReviewForm({ rating: 5, comment: '' });
      fetchProduct();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!product) return null;

  const stock = product.quantity ?? 0;
  const isOutOfStock = stock === 0;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-48 pb-24 flex flex-col gap-8 min-h-screen">
      
      <Link 
        to="/shop" 
        className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors group w-fit"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-widest">Back to Marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        <div className="relative group">
          <div className="aspect-square rounded-[32px] overflow-hidden bg-white/5 border border-white/10 glass relative">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-4">
                <ShoppingBag size={80} />
                <span className="font-bold uppercase tracking-widest text-sm">No Image Available</span>
              </div>
            )}
            
            {isOutOfStock && (
              <div className="absolute inset-0 bg-bg-dark/60 backdrop-blur-md flex items-center justify-center">
                <span className="px-8 py-4 bg-red-500 text-white font-black uppercase tracking-[0.2em] rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
          
          
          <div className="absolute top-8 left-8 bg-primary/90 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full border border-white/20 shadow-2xl">
            {product.category || 'Premium'}
          </div>
        </div>

        
        <div className="flex flex-col gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-white/40 text-sm font-medium">({product.numReviews || 0} customer reviews)</span>
            </div>
            
            <h1 className="text-3xl font-black text-white leading-tight mb-3">{product.name}</h1>
            
            {product.farmer && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                  {product.farmer.farmName?.charAt(0) || product.farmer.name?.charAt(0)}
                </div>
                <p className="text-white/60 text-sm">
                  Grown with care by <Link to={`/farm/${product.farmer.farmSlug}`} className="text-primary font-bold hover:underline">{product.farmer.farmName || product.farmer.name}</Link>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-primary text-lg font-bold">Rs.</span>
            <span className="text-4xl font-black text-white tracking-tighter">{product.price}</span>
            <span className="text-white/30 font-bold ml-2">/ {product.category === 'livestock' ? 'animal' : 'kg'}</span>
          </div>

          <p className="text-white/60 text-base leading-relaxed font-medium">
            {product.description || 'Experience the taste of pure, farm-fresh quality. Our products are harvested at the peak of ripeness and delivered directly to your doorstep, ensuring maximum nutrition and flavor.'}
          </p>

          <div className="flex flex-col gap-5 p-6 bg-white/5 border border-white/10 rounded-[24px] glass">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Availability</span>
                <span className={`text-sm font-bold ${isOutOfStock ? 'text-red-400' : 'text-primary'}`}>
                  {isOutOfStock ? 'Currently Unavailable' : `${stock} Units in Stock`}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Delivery</span>
                <span className="text-sm font-bold text-white/80">24-48 Hours</span>
              </div>
            </div>

            <Button 
              size="lg"
              variant={isOutOfStock ? 'secondary' : 'primary'}
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="w-full h-12 text-base"
              leftIcon={<ShoppingCart size={20} />}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Collection'}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <Truck size={18} className="text-primary" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-center">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <ShieldCheck size={18} className="text-primary" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-center">Quality Guard</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <Clock size={18} className="text-primary" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-center">Always Fresh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/10 pt-12">
        
        <div className="lg:col-span-2 flex flex-col gap-10">
          <div className="flex items-center gap-4">
            <MessageSquare size={24} className="text-primary" />
            <h2 className="text-xl font-black text-white">Guest Reviews</h2>
          </div>

          <div className="flex flex-col gap-6">
            {(product.reviews || []).length > 0 ? (
              product.reviews.map((review: any, i: number) => (
                <div key={i} className="p-6 rounded-[24px] bg-white/5 border border-white/10 glass flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{review.name || 'Anonymous User'}</p>
                        <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-primary">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={12} fill={j < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed font-medium">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center gap-4">
                <MessageSquare size={48} className="text-white/10" />
                <p className="text-white/40 font-medium italic">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>

        
        <div className="flex flex-col gap-8">
          <div className="p-6 rounded-[32px] bg-bg-primary border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-500"></div>
            
            <h3 className="text-xl font-black text-white mb-2">Leave a Review</h3>
            <p className="text-sm text-white/40 font-medium mb-8">Share your feedback with the community.</p>

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-6 relative">
              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${reviewForm.rating >= star ? 'bg-primary text-black' : 'bg-white/5 text-white/20 hover:bg-white/10'}`}
                    >
                      <Star size={18} fill={reviewForm.rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Your Thoughts</label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-colors font-medium resize-none"
                  placeholder="Describe your experience with this product..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                ></textarea>
              </div>

              <Button 
                type="submit" 
                disabled={submittingReview} 
                className="w-full h-12"
                leftIcon={submittingReview ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </Button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;
