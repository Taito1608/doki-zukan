// 写真がない人の背景色（暖色系でそろえる）
const COLORS = ["#f97316", "#f59e0b", "#f472b6", "#fb7185", "#e0875a", "#ea8c55", "#ec6f8e", "#d9774b"];

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
    return <img
        src={url}
        alt={name}
        style={style}
        loading="lazy"
        decoding="async"
        className="shrink-0 rounded-full object-cover"
      />;
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
