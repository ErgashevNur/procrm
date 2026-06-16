import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { apiUrl, imageUrl } from "@/lib/api";

const C = {
  pageBg: "#0f1822",
  cardBg: "#1a2535",
  cardBorder: "#243449",
  blue: "#4D8EF5",
  text: "#FFFFFF",
  textMuted: "#8A9BB5",
  textDim: "#4A6080",
};

function formatPrice(price) {
  if (price == null || price === "") return "";
  if (Number(price) === 0) return "Bepul";
  return Number(price).toLocaleString("uz-UZ") + " so'm";
}

async function readJson(res) {
  if (!res) return null;
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function pickArray(payload) {
  const cands = [
    payload,
    payload?.data,
    payload?.items,
    payload?.results,
    payload?.data?.items,
    payload?.data?.results,
  ];
  for (const c of cands) if (Array.isArray(c)) return c;
  return [];
}

// ─── Product Card ────────────────────────────────────────────────────────────

function ProductCard({ product }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = product.img || [];

  return (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(77,142,245,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image area */}
      <div
        style={{
          position: "relative",
          height: 200,
          background: "#0d1420",
          flexShrink: 0,
        }}
      >
        {images.length > 0 ? (
          <img
            src={imageUrl(images[imgIdx])}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingBag size={44} color={C.textDim} strokeWidth={1.2} />
          </div>
        )}

        {/* Image dots */}
        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 4,
            }}
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                style={{
                  width: i === imgIdx ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  border: "none",
                  background: i === imgIdx ? C.blue : "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "width 0.2s, background 0.2s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          padding: "14px 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: C.text,
            lineHeight: 1.35,
          }}
        >
          {product.name}
        </div>
        {product.desc && (
          <div
            style={{
              fontSize: 12,
              color: C.textMuted,
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.desc}
          </div>
        )}
        <div
          style={{
            fontWeight: 800,
            fontSize: 16,
            color: C.blue,
            marginTop: "auto",
            paddingTop: 6,
          }}
        >
          {formatPrice(product.price)}
        </div>
      </div>
    </div>
  );
}

// ─── Main Public Shop Page ───────────────────────────────────────────────────

export default function PublicShop() {
  const { companyId } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fromPrice, setFromPrice] = useState("");
  const [toPrice, setToPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch || "",
        fromPrice: fromPrice || "0",
        toPrice: toPrice || "999999999",
        companyId: String(companyId),
      });
      const res = await fetch(apiUrl(`product/all?${params}`));
      if (!res.ok) return;
      const payload = await readJson(res);
      setProducts(pickArray(payload));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [companyId, debouncedSearch, fromPrice, toPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleApplyFilters = () => {
    setFiltersOpen(false);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setFromPrice("");
    setToPrice("");
    setSearch("");
  };

  if (!companyId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.textMuted,
          fontFamily: "'Segoe UI',system-ui,sans-serif",
        }}
      >
        Do'kon topilmadi
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.pageBg,
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        color: C.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(22,32,48,0.98)",
          borderBottom: `1px solid ${C.cardBorder}`,
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            height: 58,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={20} color={C.blue} strokeWidth={2} />
            <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
              <span style={{ color: C.blue }}>Mini</span>Shop
            </span>
          </div>
          <div style={{ flex: 1 }} />

          {/* Desktop search */}
          <div
            style={{
              position: "relative",
              width: "min(100%, 360px)",
              display: "none",
            }}
            className="desktop-search"
          >
            <Search
              size={14}
              color={C.textDim}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mahsulot qidirish..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 8,
                padding: "8px 10px 8px 32px",
                color: C.text,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile/all search + filters */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 200px",
              minWidth: 180,
            }}
          >
            <Search
              size={14}
              color={C.textDim}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mahsulot qidirish..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 9,
                padding: "10px 10px 10px 34px",
                color: C.text,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Price filter */}
          <input
            type="number"
            value={fromPrice}
            onChange={(e) => setFromPrice(e.target.value)}
            placeholder="Min narx"
            style={{
              width: 120,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 9,
              padding: "10px 12px",
              color: C.text,
              fontSize: 13,
              outline: "none",
            }}
          />
          <input
            type="number"
            value={toPrice}
            onChange={(e) => setToPrice(e.target.value)}
            placeholder="Max narx"
            style={{
              width: 120,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 9,
              padding: "10px 12px",
              color: C.text,
              fontSize: 13,
              outline: "none",
            }}
          />
          {(fromPrice || toPrice || search) && (
            <button
              onClick={handleResetFilters}
              style={{
                background: "transparent",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 8,
                padding: "9px 14px",
                color: C.textMuted,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Tozalash
            </button>
          )}
        </div>
      </div>

      {/* Products grid */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 20px 40px",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: 10,
              color: C.textMuted,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                border: `2px solid ${C.blue}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Yuklanmoqda...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: C.textMuted,
            }}
          >
            <ShoppingBag
              size={52}
              color={C.textDim}
              strokeWidth={1.2}
              style={{ margin: "0 auto 16px" }}
            />
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: C.text,
                marginBottom: 8,
              }}
            >
              Mahsulotlar topilmadi
            </p>
            <p style={{ fontSize: 14 }}>
              {search || fromPrice || toPrice
                ? "Filtrlarni o'zgartirib ko'ring"
                : "Hali mahsulot qo'shilmagan"}
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 12,
                color: C.textMuted,
                marginBottom: 14,
                fontWeight: 600,
              }}
            >
              {products.length} ta mahsulot
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${C.cardBorder}`,
          padding: "16px 20px",
          textAlign: "center",
          fontSize: 11,
          color: C.textDim,
        }}
      >
        Powered by{" "}
        <span style={{ color: C.blue, fontWeight: 700 }}>Kotibam CRM</span>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .desktop-search { display: none !important; }
        }
      `}</style>
    </div>
  );
}
