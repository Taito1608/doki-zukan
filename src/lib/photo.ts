// 顔写真の保存形式（クライアント・サーバー共通）
//   <ユーザーID>/<uuid>.jpg    … 512px（プロフィールページなど大きく表示する場所用）
//   <ユーザーID>/<uuid>_s.jpg  … 192px のサムネイル（一覧・ホームなど小さく表示する場所用）

export const PHOTO_SIZE = 512;
export const THUMB_SIZE = 192;

/** 写真は保存先ごとに毎回新しいファイル名になるので、長くキャッシュしてよい（秒） */
export const PHOTO_CACHE_SECONDS = 60 * 60 * 24 * 30;

export function thumbPathOf(path: string) {
  return path.replace(/\.jpg$/, "_s.jpg");
}
