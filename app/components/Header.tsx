"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, User, Menu, X, ChevronRight, Package, UserCheck, LogOut, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

const getCategorySlug = (cat: any) => {
  return cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
};

export default function Header({ categories, settings }: { categories: any[]; settings: any }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);

  // Subcategories state for dropdown menu
  const [subCategories, setSubCategories] = useState<any[]>([]);

  // Dropdown state for category menu
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState<string | null>(null);

  // User Auth & Dropdown States
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Store name ko dynamic banana
  const storeName = settings?.store_name || "Kiswah Attire";
  const nameParts = storeName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  // Auth session fetch & listener
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    window.location.href = '/';
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsFetchingProducts(true);
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data) {
          setAllProducts(data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsFetchingProducts(false);
      }
    };

    const fetchSubCategories = async () => {
      try {
        const { data, error } = await supabase.from('sub_categories').select('*');
        if (!error && data) {
          setSubCategories(data);
        }
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };

    fetchProducts();
    fetchSubCategories();
  }, []);

  const filteredProducts = allProducts.filter((p: any) => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          const cartItems = JSON.parse(storedCart);
          if (Array.isArray(cartItems)) {
            const totalQty = cartItems.reduce((sum: number, item: any) => sum + (Number(item.qty) || 0), 0);
            setCartCount(totalQty);
          } else {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
      } catch (err) {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 px-4 sm:px-10 py-3 transition-all duration-300">
        <div 
          className={`mx-auto max-w-[1250px] px-5 h-16 flex items-center justify-between gap-4 rounded-2xl transition-all duration-300 ${
            isScrolled 
              ? "bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90" 
              : "bg-white border border-slate-200/80 shadow-2xs"
          }`}
        >
          {/* Logo - Dynamic Store Name */}
          <Link href="/" className="flex items-center">
            <div>
              <span className="font-serif text-lg sm:text-xl font-black tracking-tight text-blue-950 block leading-none">
                {firstName} <span className="text-blue-700">{lastName}</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                Comfort for Every Home
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-slate-700">
            <Link href="/" className="text-blue-600">Home</Link>
            <Link href="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
            
            {categories && categories.map((cat: any) => {
              // Is category ki subcategories filter karna
              const categorySubs = subCategories.filter(
                (sub: any) => 
                  sub.category?.toLowerCase() === cat.name?.toLowerCase() || 
                  sub.category_id === cat.id
              );

              return (
                <div 
                  key={cat.id} 
                  className="relative group py-4"
                  onMouseEnter={() => setActiveCategoryDropdown(cat.id)}
                  onMouseLeave={() => setActiveCategoryDropdown(null)}
                >
                  <div className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer">
                    {cat.name}
                    {categorySubs.length > 0 && <ChevronDown size={11} className="opacity-70" />}
                  </div>

                  {/* Subcategories Dropdown Menu */}
                  {activeCategoryDropdown === cat.id && categorySubs.length > 0 && (
                    <div className="absolute top-full left-0 w-56 bg-white border border-slate-200/95 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                        {cat.name} List
                      </div>
                      {categorySubs.map((sub: any) => (
                        <Link
                          key={sub.id}
                          href={`/shop?sub=${encodeURIComponent(sub.name)}`}
                          className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors truncate"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center relative w-40 xl:w-52 cursor-pointer bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-400 hover:border-blue-600 transition-all"
            >
              <span>Search...</span>
              <Search size={13} className="absolute right-2.5 text-slate-400" />
            </div>

            {/* User Profile / Auth Dropdown Container */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  if (user) {
                    setDropdownOpen(!dropdownOpen);
                  } else {
                    window.location.href = '/login';
                  }
                }}
                className="p-1.5 text-slate-700 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <User size={16} />
              </button>

              {dropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {user.user_metadata?.name || 'Customer'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <UserCheck size={15} /> My Profile
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <Package size={15} /> My Orders
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link href="/cart" className="relative p-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors">
              <ShoppingBag size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH DRAWER MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSearchOpen(false)}
          ></div>

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Search Products</h3>
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 border-b border-slate-100 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for items..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 pr-10 transition-all"
                  />
                  <Search size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {searchQuery ? `Search Results (${filteredProducts.length})` : "You May Also Like"}
                </h4>

                {isFetchingProducts ? (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400 animate-pulse">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400">No matching products found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((p: any) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                      >
                        <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          <img src={p.image || '/clear-blue-floral-bedroom.png'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{p.name}</h5>
                          <p className="text-[10px] text-slate-400 mb-1">{p.category || 'Home Textile'}</p>
                          <p className="text-xs font-bold text-blue-700">Rs. {Number(p.price || 0).toLocaleString()}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="font-serif font-black text-sm text-blue-950">
                {firstName} <span className="text-blue-700">{lastName}</span>
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-3 text-xs font-bold text-slate-700 mb-auto">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 py-1 border-b border-slate-50">Home</Link>
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 border-b border-slate-50">Shop</Link>
              {categories && categories.map((cat: any) => (
                <Link 
                  key={cat.id} 
                  href={`/category/${getCategorySlug(cat)}`} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-blue-600 py-1 border-b border-slate-50"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 border-b border-slate-50">About</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">Contact</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}