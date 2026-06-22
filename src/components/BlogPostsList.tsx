/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { BlogPost } from "../types";
import { BookOpen, Calendar, Clock, ArrowRight, X } from "lucide-react";

interface BlogPostsListProps {
  posts: BlogPost[];
}

export default function BlogPostsList({ posts }: BlogPostsListProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  if (!posts || posts.length === 0) return null;

  return (
    <section id="blog-section" className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Inspirasi & Edukasi</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Kanal Artikel Qeiza</h2>
            <p className="mt-2 text-gray-500 max-w-2xl">
              Dapatkan tips belanja pintar, review produk mendalam, dan tutorial penggunaan serta promo eksklusif langsung dari editor kami.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <div 
              id={`blog-card-${post.id}`}
              key={post.id} 
              className="group flex flex-col sm:flex-row gap-6 bg-gray-50 rounded-2xl p-5 hover:bg-gray-100/80 transition-all duration-300 cursor-pointer border border-gray-100 hover:border-emerald-100 hover:shadow-sm"
              onClick={() => setSelectedPost(post)}
            >
              <div className="relative w-full sm:w-44 h-44 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                <img 
                  referrerPolicy="no-referrer"
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      5 Mins Baca
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                    {post.content.replace(/[\*#]/g, "")}
                  </p>
                </div>
                
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span>Selengkapnya</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Modal Reader */}
      {selectedPost && (
        <div id="blog-reader-backdrop" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div id="blog-reader-card" className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              id="blog-reader-close-btn"
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/95 text-gray-700 hover:bg-white hover:text-black flex items-center justify-center shadow-md transition-colors border border-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gray-100">
              <img 
                referrerPolicy="no-referrer"
                src={selectedPost.imageUrl} 
                alt={selectedPost.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-4 text-xs text-gray-300 font-medium mb-2.5">
                  <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                    Editorial
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(selectedPost.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {selectedPost.title}
                </h1>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="prose prose-emerald max-w-none text-gray-700 leading-relaxed space-y-4 whitespace-pre-line">
                {selectedPost.content}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                    Q
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm">Tim Konten Qeiza</h5>
                    <p className="text-xs text-gray-400">Official Store Editor</p>
                  </div>
                </div>
                <button 
                  id="blog-reader-done-btn"
                  onClick={() => setSelectedPost(null)}
                  className="px-6 py-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 text-white font-medium text-sm transition-colors"
                >
                  Selesai Membaca
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
