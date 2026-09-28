'use client';
import { useState } from 'react';

interface ProductTabsProps {
  product: any;
  specs: { label: string; value: string }[];
  reviews: any[];
}

export default function ProductTabs({ product, specs, reviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'reviews', label: `Reviews (${reviews.length})` },
  ] as const;

  return (
    <div className="mt-10 sm:mt-12">
      <div className="flex gap-6 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-xs font-bold transition-colors relative cursor-pointer ${
              activeTab === tab.key ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-700 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        <div className="md:col-span-2">
          {activeTab === 'description' && (
            <div className="text-xs text-slate-600 leading-relaxed space-y-3">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="text-slate-400">No description available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              {specs.length > 0 ? (
                <table className="w-full text-xs">
                  <tbody>
                    {specs.map((s) => (
                      <tr key={s.label} className="border-b border-slate-100">
                        <td className="py-2.5 pr-4 font-bold text-slate-700 w-1/3">{s.label}</td>
                        <td className="py-2.5 text-slate-600">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-slate-400">No specification details added yet.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-900">{r.customer_name}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-amber-500 mb-1">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                    {r.comment && <p className="text-xs text-slate-600">{r.comment}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          )}
        </div>

        {activeTab !== 'reviews' && specs.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-5 h-fit">
            <h4 className="text-xs font-bold text-slate-900 mb-3">Specifications</h4>
            <div className="space-y-2">
              {specs.map((s) => (
                <div key={s.label} className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="font-semibold text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}