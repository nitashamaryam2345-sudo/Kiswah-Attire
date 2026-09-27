import { createClient } from '@supabase/supabase-js';
import DashboardClient from './DashboardClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

export const revalidate = 0;

export default async function AdminDashboardPage() {
  let dbError: string | null = null;
  let products: any[] = [];
  let orders: any[] = [];
  let orderItems: any[] = [];

  try {
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .select('*');
    
    if (prodError) throw prodError;
    products = prodData || [];

    const { data: ordData, error: ordError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordError) throw ordError;
    orders = ordData || [];

    const { data: itemData, error: itemError } = await supabase
      .from('order_items')
      .select('*');

    if (!itemError) {
      orderItems = itemData || [];
    }

  } catch (error: any) {
    console.error('Dashboard Data Fetch Error:', error);
    dbError = error.message || 'Failed to fetch database records.';
  }

  const productSoldCount: { [key: string | number]: number } = {};
  const validOrderIds = new Set(
    orders.filter(o => o.status !== 'Cancelled').map(o => o.id)
  );

  orderItems.forEach(item => {
    if (validOrderIds.has(item.order_id)) {
      const prodId = item.product_id;
      const qty = Number(item.quantity || 1);
      productSoldCount[prodId] = (productSoldCount[prodId] || 0) + qty;
    }
  });

  const productsWithSales = products.map(p => ({
    ...p,
    sold: productSoldCount[p.id] !== undefined ? productSoldCount[p.id] : (Number(p.sold) || 0)
  }));

  const totalProducts = products.length;
  const totalOrders = orders.length;

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Delivered').length;

  const totalSalesAmount = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  // REAL MONTHLY SALES & GROWTH CALCULATION
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthOrders = orders.filter(o => {
    if (o.status === 'Cancelled' || !o.created_at) return false;
    const d = new Date(o.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentMonthSales = currentMonthOrders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  // Last Month Calculation
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const lastMonthOrders = orders.filter(o => {
    if (o.status === 'Cancelled' || !o.created_at) return false;
    const d = new Date(o.created_at);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const lastMonthSales = lastMonthOrders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  let monthGrowthPercent = 0;
  if (lastMonthSales > 0) {
    monthGrowthPercent = Math.round(((currentMonthSales - lastMonthSales) / lastMonthSales) * 100);
  } else if (currentMonthSales > 0) {
    monthGrowthPercent = 100;
  }

  const lowStockProducts = productsWithSales.filter(p => Number(p.stock ?? 0) <= 5);

  const topSellingProducts = [...productsWithSales]
    .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
    .slice(0, 4);

  const recentOrders = orders.slice(0, 5);

  const orderStatusCounts = {
    Pending: orders.filter(o => o.status === 'Pending').length,
    Confirmed: orders.filter(o => o.status === 'Confirmed').length,
    Shipped: orders.filter(o => o.status === 'Shipped').length,
    Delivered: orders.filter(o => o.status === 'Delivered').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  const salesLast7Days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const dayStr = day.toDateString();
    
    return orders
      .filter(o => o.status !== 'Cancelled' && o.created_at && new Date(o.created_at).toDateString() === dayStr)
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  });

  return (
    <DashboardClient
      totalProducts={totalProducts}
      products={productsWithSales}
      totalOrders={totalOrders}
      pendingOrdersCount={pendingOrdersCount}
      completedOrdersCount={completedOrdersCount}
      totalSalesAmount={totalSalesAmount}
      currentMonthSales={currentMonthSales}
      monthGrowthPercent={monthGrowthPercent}
      recentOrders={recentOrders}
      lowStockProducts={lowStockProducts}
      topSellingProducts={topSellingProducts}
      orderStatusCounts={orderStatusCounts}
      salesLast7Days={salesLast7Days}
      dbError={dbError}
    />
  );
}