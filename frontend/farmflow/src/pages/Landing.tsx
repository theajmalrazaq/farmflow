import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Truck, Phone, CheckCircle2, Star, Plus, Minus, MapPin, Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import Button from '../components/Button';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [farms, setFarms] = useState<any[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await apiClient.get('/farms');
        
        setFarms(res.data.farms?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to fetch featured farms', err);
      } finally {
        setLoadingFarms(false);
      }
    };
    fetchFarms();
  }, []);

  return (
    <div className="bg-transparent text-white min-h-screen font-sans">
      
      <section className="relative pt-48 pb-20 lg:pt-64 lg:pb-32 overflow-hidden bg-bg-dark">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Farm Tractor" 
            className="w-full h-full object-cover brightness-[0.6]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/80 to-transparent"></div>
        </div>
        
        <div className="max-w-[1400px] mx-auto px-8 relative z-10 flex flex-col items-center text-center">
          <div className="max-w-3xl flex flex-col items-center">

            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6 ">
              The Marketplace for Pakistan's Finest Organic Farms
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-xl leading-relaxed">
              We bring 100% organic produce from certified farms all over Pakistan direct to your doorstep. Discover local farms and their freshest products.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <Link to="/discover">
                <Button size="lg">Discover Farms</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Cards Bottom of Hero */}
        <div className="max-w-[1400px] mx-auto px-8 mt-20 relative z-10 hidden md:grid grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] flex items-center gap-4 text-white border border-white/10">
            <div className="bg-primary/10 p-4 rounded-[32px] text-primary flex-shrink-0"><Leaf size={24}/></div>
            <div>
              <h4 className="font-bold text-lg text-white">Farms All Over Pakistan</h4>
              <p className="text-sm text-white/40">Scouted for quality</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] flex items-center gap-4 text-white border border-white/10">
            <div className="bg-primary/10 p-4 rounded-[32px] text-primary flex-shrink-0"><ShieldCheck size={24}/></div>
            <div>
              <h4 className="font-bold text-lg text-white">Certified Farm</h4>
              <p className="text-sm text-white/40">Guaranteed quality</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] flex items-center gap-4 text-white border border-white/10">
            <div className="bg-primary/10 p-4 rounded-[32px] text-primary flex-shrink-0"><Truck size={24}/></div>
            <div>
              <h4 className="font-bold text-lg text-white">Direct To Doorstep</h4>
              <p className="text-sm text-white/40">Fresh and fast</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Redesigned as Bento Grid */}
      <section className="py-32 bg-transparent relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-start mb-20">
            <div className="lg:w-1/2">
             
              <h2 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight">
                Cultivating a <span className="text-primary">Better</span> Way
              </h2>
            </div>
            <div className="lg:w-1/2">
              <p className="text-white/40 text-xl leading-relaxed">
                FarmFlow is a growing ecosystem bridging the gap between 500+ dedicated local farmers and conscious consumers. We provide the platform for Pakistan's best organic farms to reach your table directly.
              </p>
             
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[700px]">
            
            <div className="md:col-span-8 relative rounded-[48px] overflow-hidden group">
              <img 
                src="/imgone.jpg" 
                alt="The Farmer" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10">
                <h3 className="text-3xl font-bold text-white mb-4">Supporting Local Heritage</h3>
                <p className="text-white/60 max-w-lg">
                  Every purchase directly supports ancestral farming techniques and the families that preserve them across Pakistan's diverse agricultural landscape.
                </p>
              </div>
            </div>

            {/* Side Column Bento Items */}
            <div className="md:col-span-4 grid grid-rows-2 gap-6">
              <div className="relative rounded-[40px] overflow-hidden group">
                <img 
                  src="/imgtwo.webp" 
                  alt="Fresh Harvest" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                  <h4 className="text-xl font-bold text-white">Pure Freshness</h4>
                </div>
              </div>
              <div className="relative rounded-[40px] overflow-hidden group">
                <img 
                  src="/imgthree.jpeg" 
                  alt="Farm Community" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                  <h4 className="text-xl font-bold text-white">Community Driven</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Farms Section */}
      <section className="py-24 bg-bg-card/30 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-primary font-bold tracking-wider uppercase text-sm">Our Network</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold mt-4 text-white ">Meet Our Featured Farmers</h2>
              <p className="text-white/40 mt-4 text-lg">
                Discover the passionate people behind your food. Each farm is verified for quality and organic standards.
              </p>
            </div>
            <Link to="/discover">
              <Button variant="secondary" size="lg">View All Farms</Button>
            </Link>
          </div>

          {loadingFarms ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {farms.map((farm, i) => (
                <Link 
                  key={farm._id || i} 
                  to={`/farm/${farm.farmSlug}`}
                  className="group relative rounded-[40px] overflow-hidden bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-500"
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                    {farm.coverImage && (
                      <img 
                        src={farm.coverImage} 
                        alt={farm.farmName} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase tracking-widest mb-2">
                        <MapPin size={10} />
                        {farm.address?.split(',').pop() || 'Pakistan'}
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2 leading-tight">{farm.farmName}</h4>
                      <p className="text-white/60 text-sm font-medium line-clamp-1">{farm.farmDescription || 'Organic Producer'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Difference Section */}
      <section className="py-24 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-primary font-bold tracking-wider uppercase text-sm">Why Choose Us</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mt-4 mb-6 text-white">Discover Farms, Shop Pure Products</h2>
            <p className="text-white/40 text-lg mb-8">
              Explore diverse farms from the fertile plains of Punjab to the orchards of Gilgit. Transparency is our core—know exactly where your food comes from.
            </p>
            
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-primary flex-shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Verified Organic Farms</h4>
                  <p className="text-white/40">Every farm on our platform is personally visited and verified for organic practices.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-primary flex-shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Quality Assured</h4>
                  <p className="text-white/40">Every product goes through rigorous quality checks before reaching you.</p>
                </div>
              </div>
            </div>
            
            <Link to="/shop">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
          
          <div className="relative">
            <div className="rounded-3xl overflow-hidden h-[500px]">
              <img src="/whychoose.webp" alt="Why Choose FarmFlow" className="w-full h-full object-cover"/>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white/5 backdrop-blur-xl p-6 rounded-3xl flex items-center gap-4 border border-white/10">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white">
                <Leaf size={32} />
              </div>
              <div>
                <p className="text-3xl font-black text-white">25+</p>
                <p className="text-white/40 font-medium">Years of Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Products Preview - "What We Provide" */}
      <section className="py-32 bg-transparent relative overflow-visible">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col items-start mb-20">
            <div className="flex items-center gap-2 text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4">
              <Leaf size={16} className="fill-primary/20" />
              OUR SERVICE
            </div>
            <h2 className="text-5xl lg:text-7xl font-extrabold text-white ">
              What We Provide
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: 'Dairy Products', 
                img: '/imgfour.jpeg',
                icon: <Leaf size={28} />
              },
              { 
                title: 'Fresh Vegetables', 
                img: '/imgfive.webp',
                icon: <CheckCircle2 size={28} />
              },
              { 
                title: 'Organic Grains', 
                img: '/imgsiz.jpg',
                icon: <ShieldCheck size={28} />
              }
            ].map((item, i) => (
              <div key={i} className="relative pb-12">
                <div className="h-[480px] rounded-[48px] overflow-hidden">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute -bottom-2 left-6 right-6 bg-white/5 backdrop-blur-xl rounded-[32px] p-6 flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight">
                      {item.title.split(' ').map((word, idx) => (
                        <span key={idx} className="block">{word}</span>
                      ))}
                    </h3>
                  </div>
                  <Link to="/shop">
                    <Button size="icon" className="rounded-full">
                      <ArrowRight size={24} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
          <div className="rounded-[48px] overflow-hidden aspect-square lg:aspect-auto h-[600px]">
            <img 
              src="/testimonial.webp" 
              alt="Happy Customer" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex gap-1 text-amber-500 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} fill="currentColor" />
              ))}
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-10 ">
              "FarmFlow has completely changed how we source our food. Knowing exactly which farm my vegetables come from gives me immense peace of mind."
            </h2>
            <div>
              <p className="text-2xl font-black text-white">Amina Rehman</p>
              <p className="text-primary font-bold uppercase tracking-widest text-sm mt-1">Health-Conscious Mother, Lahore</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-transparent">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-2 text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4">
              <Leaf size={16} />
              GET ANSWERS
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-white ">Common Questions</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            {[
              { 
                q: "Are all products 100% organic?", 
                a: "Yes, every farm on our platform is personally verified for organic practices. We prioritize farms that avoid synthetic pesticides and fertilizers to bring you the purest nature has to offer." 
              },
              { 
                q: "How long does delivery take?", 
                a: "Most orders from local farms are delivered within 24-48 hours. We coordinate directly with the harvest schedules to ensure maximum freshness from the field to your table." 
              },
              { 
                q: "Can I visit the farms?", 
                a: "Absolutely! Transparency is our core value. Many of our partner farms offer guided tours for FarmFlow members. You can find 'Visit' options on specific farm profiles." 
              },
              { 
                q: "How do I list my farm on FarmFlow?", 
                a: "Simply click 'Join as a Farmer' and fill out the initial verification form. Our field experts will contact you for a site visit and quality assessment within 3-5 business days." 
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`group border rounded-[32px] transition-all duration-300 ${openFaq === i ? 'bg-white/5 border-primary/20' : 'bg-transparent border-white/5'}`}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-8 flex items-center justify-between gap-6"
                >
                  <h3 className="text-xl md:text-xl font-bold text-white  flex items-center gap-4">
                    <span className={`transition-colors duration-300 ${openFaq === i ? 'text-primary' : 'text-white/30'}`}>0{i+1}.</span>
                    {item.q}
                  </h3>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === i ? 'bg-primary text-black rotate-180' : 'bg-white/5 text-white/40'}`}>
                    {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-[300px] opacity-100 pb-8 px-8' : 'max-h-0 opacity-0'}`}>
                  <p className="text-white/40 leading-relaxed text-lg pl-12">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-transparent border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-xl font-bold text-white  mb-2">Want to Know More About Our Farms?</h2>
            <p className="text-white/40">Our team can provide detailed reports on the farms we partner with.</p>
          </div>
          <Button size="lg" leftIcon={<Phone size={20} />}>
            Contact Us Now
          </Button>
        </div>
      </section>

      
      <section className="py-24 relative overflow-hidden rounded-[48px] m-6 md:m-12 bg-bg-card border border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=1974&auto=format&fit=crop" 
            alt="Farmer in Field" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/80 to-transparent"></div>
        </div>
        
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8 border border-primary/20">
              <Leaf size={14} /> For Pakistani Farmers
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-8 ">
              Empowering You To <span className="text-primary">Grow More</span>
            </h2>
            <p className="text-xl text-white/30 mb-12 max-w-xl leading-relaxed">
              Join FarmFlow and bridge the gap between your hard-earned harvest and thousands of urban families. Get fair pricing, direct customer access, and modern management tools—all in one place.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" rightIcon={<ArrowRight size={20} />}>Start Selling Now</Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" size="lg">Explore Benefits</Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 relative">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[48px] flex flex-col gap-2">
              <span className="text-primary font-black text-4xl">0%</span>
              <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Platform Fees</p>
            </div>
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[48px] flex flex-col gap-2 translate-y-12">
              <span className="text-primary font-black text-4xl">5k+</span>
              <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Monthly Buyers</p>
            </div>
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[48px] flex flex-col gap-2 mt-4">
              <span className="text-primary font-black text-4xl">Direct</span>
              <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Payment Settlement</p>
            </div>
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[48px] flex flex-col gap-2 translate-y-12 mt-4">
              <span className="text-primary font-black text-4xl">Free</span>
              <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Stock Management</p>
            </div>
          </div>
        </div>
      </section>
      
      
      <footer className="bg-bg-dark text-white pt-20 pb-10 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-8 grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">Subscribe To Our Newsletter</h2>
            <p className="text-white/30">Get updates on new farm partners and seasonal fresh arrivals from all over Pakistan.</p>
          </div>
          <div className="flex gap-2">
            <input type="email" placeholder="Email Address" className="w-full bg-bg-primary/10 border border-white/20 rounded-full px-6 py-4 focus:outline-none focus:border-primary text-white" />
            <Button>Subscribe</Button>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-sm text-white/40">
          <p>&copy; 2026 FarmFlow. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
