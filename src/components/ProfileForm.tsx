"use client";

import { useActionState, useRef, useState } from "react";
import { saveProfile, type ActionState } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import {
  HOBBY_SUGGESTIONS,
  JOB_TYPES,
  MAX_HOBBIES,
  MAX_HOBBY_LENGTH,
  PREFECTURES,
} from "@/lib/constants";
import { cleanHobbies, normalizeHobby } from "@/lib/common";
import type { Profile } from "@/lib/types";
import { Avatar } from "./Avatar";

type Props = {
  userId: string;
  initial: Partial<Profile>;
  initialPhotoUrl: string | null;
  next: "home" | "profile";
  submitLabel: string;
};

/** 写真を正方形・最大512pxのJPEGに縮小する（通信量と保存容量の節約） */
async function resizeImage(file: File, size = 512): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    const out = Math.min(size, side);
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    canvas.getContext("2d")!.drawImage(img, sx, sy, side, side, 0, 0, out, out);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.85),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

const fieldClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-brand-500";
const labelClass = "mb-1.5 block text-sm font-bold text-stone-700";

export function ProfileForm({ userId, initial, initialPhotoUrl, next, submitLabel }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProfile, {});
  const [photoPath, setPhotoPath] = useState<string | null>(initial.photo_path ?? null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [hobbies, setHobbies] = useState<string[]>(initial.hobbies ?? []);
  const [hobbyInput, setHobbyInput] = useState("");
  // 送信エラー時にReactがフォームをリセットしても入力が消えないよう、すべて制御コンポーネントにする
  const [name, setName] = useState(initial.display_name ?? "");
  const [birthMonth, setBirthMonth] = useState(initial.birth_month?.toString() ?? "");
  const [birthDay, setBirthDay] = useState(initial.birth_day?.toString() ?? "");
  const [hometown, setHometown] = useState(initial.hometown ?? "");
  const [jobType, setJobType] = useState(initial.job_type ?? "");
  const [message, setMessage] = useState(initial.message ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPhotoError(null);
    try {
      const blob = await resizeImage(file);
      const path = `${userId}/${crypto.randomUUID()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;
      setPhotoPath(path);
      setPhotoUrl(URL.createObjectURL(blob));
    } catch {
      setPhotoError("写真をアップロードできませんでした。別の写真でお試しください。");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function toggleHobby(h: string) {
    setHobbies((cur) =>
      cur.some((x) => x.toLowerCase() === h.toLowerCase())
        ? cur.filter((x) => x.toLowerCase() !== h.toLowerCase())
        : cleanHobbies([...cur, h]),
    );
  }

  function addHobbyFromInput() {
    const parts = hobbyInput.split(/[,、，\s]+/).map(normalizeHobby).filter(Boolean);
    if (parts.length === 0) return;
    setHobbies((cur) => cleanHobbies([...cur, ...parts]));
    setHobbyInput("");
  }

  const hasHobby = (h: string) => hobbies.some((x) => x.toLowerCase() === h.toLowerCase());
  const customHobbies = hobbies.filter(
    (h) => !(HOBBY_SUGGESTIONS as readonly string[]).some((s) => s.toLowerCase() === h.toLowerCase()),
  );

  return (
    <form action={action} className="space-y-7">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="photo_path" value={photoPath ?? ""} />
      <input type="hidden" name="hobbies" value={JSON.stringify(hobbies)} />

      {/* 写真 */}
      <div className="flex flex-col items-center gap-3">
        <Avatar name={name || "？"} url={photoUrl} size={112} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-bold active:bg-stone-100 disabled:opacity-60"
          >
            {uploading ? "アップロード中…" : photoPath ? "写真を変更" : "写真を選ぶ（任意）"}
          </button>
          {photoPath && !uploading && (
            <button
              type="button"
              onClick={() => {
                setPhotoPath(null);
                setPhotoUrl(null);
              }}
              className="rounded-full px-3 py-2 text-sm text-stone-500 underline"
            >
              写真を外す
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
        {photoError && <p className="text-sm text-red-600">{photoError}</p>}
      </div>

      {/* 名前 */}
      <div>
        <label className={labelClass} htmlFor="display_name">
          名前 <span className="text-brand-600">必須</span>
        </label>
        <input
          id="display_name"
          name="display_name"
          required
          maxLength={30}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：山田 太郎"
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-stone-500">同期が分かる名前にしてください（フルネーム推奨）</p>
      </div>

      {/* 誕生日 */}
      <div>
        <span className={labelClass}>誕生日（任意）</span>
        <div className="flex items-center gap-2">
          <select
            name="birth_month"
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
            className={fieldClass}
          >
            <option value="">月</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
          <select
            name="birth_day"
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value)}
            className={fieldClass}
          >
            <option value="">日</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}日
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-xs text-stone-500">登録すると、誕生日に同期から寄せ書きが届きます</p>
      </div>

      {/* 出身地 */}
      <div>
        <label className={labelClass} htmlFor="hometown">
          出身地（任意）
        </label>
        <select
          id="hometown"
          name="hometown"
          value={hometown}
          onChange={(e) => setHometown(e.target.value)}
          className={fieldClass}
        >
          <option value="">選ばない</option>
          {PREFECTURES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* 趣味 */}
      <div>
        <span className={labelClass}>
          趣味・好きなこと（任意・{MAX_HOBBIES}個まで）
        </span>
        <div className="flex flex-wrap gap-2">
          {HOBBY_SUGGESTIONS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => toggleHobby(h)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                hasHobby(h)
                  ? "border-brand-500 bg-brand-500 font-bold text-white"
                  : "border-stone-300 bg-white text-stone-700"
              }`}
            >
              {h}
            </button>
          ))}
          {customHobbies.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => toggleHobby(h)}
              className="rounded-full border border-brand-500 bg-brand-500 px-3 py-1.5 text-sm font-bold text-white"
            >
              {h} ×
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={hobbyInput}
            onChange={(e) => setHobbyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                addHobbyFromInput();
              }
            }}
            maxLength={MAX_HOBBY_LENGTH * 3}
            placeholder="その他を入力（例：温泉）"
            className={fieldClass}
          />
          <button
            type="button"
            onClick={addHobbyFromInput}
            className="shrink-0 rounded-xl bg-stone-800 px-4 font-bold text-white active:bg-stone-900"
          >
            追加
          </button>
        </div>
      </div>

      {/* 職種 */}
      <div>
        <label className={labelClass} htmlFor="job_type">
          職種（任意）
        </label>
        <select
          id="job_type"
          name="job_type"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className={fieldClass}
        >
          <option value="">選ばない</option>
          {JOB_TYPES.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>

      {/* 一言 */}
      <div>
        <label className={labelClass} htmlFor="message">
          一言（任意・100文字まで）
        </label>
        <textarea
          id="message"
          name="message"
          maxLength={100}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="例：最近はサウナにハマってます。おすすめ教えてください！"
          className={fieldClass}
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || uploading}
        className="w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white shadow-sm active:bg-brand-600 disabled:opacity-60"
      >
        {pending ? "保存しています…" : submitLabel}
      </button>
    </form>
  );
}
