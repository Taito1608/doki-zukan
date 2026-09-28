const COLORS = ["#fb923c", "#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#facc15", "#f87171", "#2dd4bf"];

function colorFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

/** 写真がなければ名前の頭文字を丸く表示する */
export function Avatar({ name, url, size = 56 }: { name: string; url: string | null; size?: number }) {
  const style = { width: size, height: size };
  if (url) {
    // 署名付きURLは毎回変わるため next/image ではなく img を使う
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} style={style} className="shrink-0 rounded-full object-cover" />;
  }
  return (
    <div
      style={{ ...style, background: colorFor(name), fontSize: size * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      aria-label={name}
    >
      {Array.from(name.trim())[0] ?? "？"}
    </div>
  );
}
