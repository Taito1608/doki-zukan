-- 職種の選択肢変更に合わせて、登録済みの値を置き換える
--   ビジネス職   → ビジネス総合職
--   エンジニア職 → 未選択（ソフトウェア／リサーチのどちらか判断できないため、本人に選び直してもらう）
--   その他       → そのまま
update public.profiles set job_type = 'ビジネス総合職' where job_type = 'ビジネス職';
update public.profiles set job_type = null where job_type = 'エンジニア職';
