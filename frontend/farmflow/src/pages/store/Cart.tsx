import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import AddressModal from '../../components/modals/AddressModal';

const Cart = () => {
  const { showToast } = useToast();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const imageCache = useState<Record<string, string>>({})[0];

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await apiClient.get('/cart');
        const cartData = res.data.cart;
        if (cartData?.items) {
          cartData.items.forEach((item: any) => {
            if (item.product?.image) {
              imageCache[item.product._id] = item.product.image;
            }
          });
        }
        setCart(cartData);
      } catch (err) {
        console.error('Failed to fetch cart', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    setCart((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any) =>
        item.product._id === productId ? { ...item, quantity } : item
      ),
    }));
    try {
      const res = await apiClient.put('/cart/update', { productId, quantity });
      setCart(res.data.cart);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err: any) {
      const res = await apiClient.get('/cart');
      setCart(res.data.cart);
    }
  };

  const removeItem = async (productId: string) => {
    setCart((prev: any) => ({
      ...prev,
      items: prev.items.filter((item: any) => item.product._id !== productId),
    }));
    try {
      const res = await apiClient.post('/cart/remove', { productId });
      setCart(res.data.cart);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err: any) {
      const res = await apiClient.get('/cart');
      setCart(res.data.cart);
    }
  };

  const handlePlaceOrder = async (address: string) => {

    setPlacingOrder(true);
    try {
      const orderItems = cart.items.map((item: any) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      }));

      await apiClient.post('/orders', {
        items: orderItems,
        deliveryAddress: address,
        notes: "Placed via website"
      });

      await apiClient.post('/cart/clear'); 
      window.dispatchEvent(new Event('cartUpdated'));
      setOrderSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Order placement failed', err);
      showToast(err.response?.data?.message || 'Failed to place order.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center pt-32 pb-20 px-6">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 text-center flex flex-col items-center gap-8">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <CheckCircle2 size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Order Received!</h2>
            <p className="text-white/40 leading-relaxed">
              Your harvest is being prepared. Farmers have been notified and will begin fulfillment shortly.
            </p>
          </div>
          <Link to="/discover" className="w-full">
            <Button fullWidth size="lg">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
  const shipping = items.length > 0 ? 500 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-bg-dark pt-40 pb-24">
      <div className="max-w-[1400px] mx-auto px-8">
        <header className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
                Your <span className="text-primary">Cart</span>
              </h1>
              <p className="text-white/40 text-lg leading-relaxed">
                {items.length === 0 ? "Your cart is currently empty." : `Review your selected organic products from verified farms across Pakistan.`}
              </p>
            </div>
            <Link to="/shop">
              <Button variant="secondary" leftIcon={<ArrowLeft size={18} />}>Continue Shopping</Button>
            </Link>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-[48px] py-32 flex flex-col items-center gap-8 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-white/20">
              <ShoppingBag size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your basket is empty</h2>
              <p className="text-white/40 max-w-md">
                Looks like you haven't added any fresh produce yet. Start exploring our organic farms!
              </p>
            </div>
            <Link to="/shop">
              <Button size="lg">Explore Marketplace</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 flex flex-col gap-4">
              {items.map((item: any) => (
                <div 
                  key={item.product._id} 
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-8 group hover:bg-white/[0.08] transition-all"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                    <img 
                      src={imageCache[item.product._id] || item.product.image || 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&q=80'} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white mb-1">{item.product.name}</h3>
                    <div className="flex items-center gap-2 justify-center sm:justify-start text-white/40 text-sm">
                      <MapPin size={14} className="text-primary/40" />
                      {item.product.farmer?.farmName || 'Verified Farm'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/5 px-2 py-2 rounded-2xl border border-white/5">
                    <Button 
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)} 
                      disabled={item.quantity <= 1}
                      className="w-10 h-10 rounded-xl"
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="text-white font-bold text-lg min-w-[30px] text-center">{item.quantity}</span>
                    <Button 
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="w-10 h-10 rounded-xl"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>

                  <div className="text-right min-w-[120px]">
                    <span className="block text-xl font-bold text-white">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
                    <span className="text-white/30 text-xs font-bold uppercase">Total</span>
                  </div>

                  <Button 
                    size="icon"
                    variant="danger"
                    onClick={() => removeItem(item.product._id)} 
                    className="w-12 h-12 rounded-2xl"
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              ))}
            </div>

            <aside className="lg:col-span-4 sticky top-40 bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Order Summary</h3>
                <p className="text-white/40 text-sm">Review your costs before harvest checkout</p>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-white/40">Subtotal</span>
                  <span className="text-white font-bold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-white/40">Delivery Fee</span>
                  <span className="text-white font-bold">Rs. {shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-white/40">GST (5%)</span>
                  <span className="text-white font-bold">Rs. {tax.toLocaleString()}</span>
                </div>
                
                <div className="h-[1px] bg-white/10 my-2"></div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">Grand Total</span>
                  <span className="text-3xl font-bold text-primary tracking-tighter">Rs. {Math.round(total).toLocaleString()}</span>
                </div>
              </div>

              <Button 
                onClick={() => setIsAddressModalOpen(true)}
                isLoading={placingOrder}
                fullWidth
                size="lg"
                rightIcon={<ArrowRight size={22} />}
                className="h-16 text-lg"
              >
                Place Order
              </Button>
              
              <div className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-2xl border border-white/5">
                <ShieldCheck size={20} className="text-primary/60" />
                <p className="text-[10px] text-white/40 font-medium leading-tight ">
                  Secure direct-to-farm checkout guaranteed by FarmFlow.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
      <AddressModal 
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handlePlaceOrder}
        initialValue={localStorage.getItem('deliveryAddress') || ''}
      />
    </div>
  );
};

export default Cart;
