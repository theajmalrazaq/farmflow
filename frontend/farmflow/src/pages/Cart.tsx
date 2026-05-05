import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await apiClient.get('/cart');
        setCart(res.data);
      } catch (err) {
        console.error('Failed to fetch cart', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      await apiClient.put('/cart/update', { productId, quantity });
      const res = await apiClient.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await apiClient.post('/cart/remove', { productId });
      const res = await apiClient.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  if (loading) return <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  const items = cart?.items || [];
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Your Shopping Cart</h1>
        <p className="text-zinc-400 mt-1">You have {items.length} items in your cart.</p>
      </header>

      {items.length === 0 ? (
        <div className="py-32 flex flex-col items-center gap-6 text-zinc-500">
          <ShoppingBag size={80} className="opacity-20" />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
            <p className="mt-2">Looks like you haven't added anything to your cart yet.</p>
          </div>
          <button className="bg-primary text-black font-bold px-8 py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {items.map((item: any) => (
                <motion.div 
                  key={item.product._id} 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex items-center gap-6 glass"
                >
                  <img 
                    src={item.product.image || 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=100&q=80'} 
                    alt={item.product.name} 
                    className="w-20 h-20 rounded-xl object-cover border border-white/5" 
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{item.product.name}</h3>
                    <p className="text-primary font-bold text-sm mt-0.5">${item.product.price} / kg</p>
                  </div>
                  <div className="flex items-center gap-4 bg-bg-accent px-4 py-2 rounded-xl border border-border-subtle">
                    <button 
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)} 
                      disabled={item.quantity <= 1}
                      className="text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-white font-bold min-w-[20px] text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <span className="block text-lg font-black text-white">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => removeItem(item.product._id)} 
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <aside className="sticky top-28 bg-bg-surface border border-border-subtle rounded-3xl p-8 glass flex flex-col gap-8">
            <h3 className="text-xl font-bold text-white">Order Summary</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-zinc-400 font-medium">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 font-medium">
                <span>Shipping</span>
                <span className="text-white">$5.00</span>
              </div>
              <div className="flex justify-between text-zinc-400 font-medium">
                <span>Tax (5%)</span>
                <span className="text-white">${(subtotal * 0.05).toFixed(2)}</span>
              </div>
              <div className="h-px bg-border-subtle my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">Total</span>
                <span className="text-3xl font-black text-primary">${(subtotal + 5 + (subtotal * 0.05)).toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full h-14 bg-primary text-black font-black text-lg rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/20">
              Checkout Now <ArrowRight size={20} />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
