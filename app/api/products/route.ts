import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, stock, category, subCategory, image, description, oldPrice, status } = body;

    const { data, error } = await supabase
      .from('products')
      .insert([
        { 
          name, 
          price: Number(price), 
          stock: Number(stock), 
          category, 
          sub_category: subCategory || null, // Yahan subcategory save ho rahi hai
          image: image || null,
          description: description || null,
          old_price: oldPrice ? Number(oldPrice) : null, // old_price column ke liye
          status: status || 'Active',
        }
      ])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error('Server Catch Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}