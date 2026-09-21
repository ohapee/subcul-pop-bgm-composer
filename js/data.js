/**
 * サブカルポップBGMコンポーザー - 設定データ定義
 * 「ゲームBGM」と「ゆるかわ癒やし」の中間的な、お洒落で軽くポップな作業用BGM特化
 */

// サブカルチャーモチーフ・世界観
export const MOTIFS = [
  { id: 'kissaten_cyber', ja: 'レトロフューチャー純喫茶 (メロンソーダ・カセット)', en: 'a retro-futuristic Japanese kissaten cafe with neon melon soda and cassette tape warmth', enShort: 'retro kissaten cafe vibe' },
  { id: 'chiptune_lofi', ja: 'ピクセルチル / 8bitローファイ (ゲームボーイ × チル)', en: 'a stylish chiptune lofi-hiphop groove blending 8-bit handheld sounds with cozy study beats', enShort: '8-bit pixel lofi groove' },
  { id: 'shibuya_pop', ja: 'ネオ渋谷系ポップ (軽快カッティング・お洒落)', en: 'a breezy neo-Shibuya-kei pop groove with sunny rhythm guitars and sophisticated chic', enShort: 'breezy Shibuya-kei pop' },
  { id: 'midnight_tokyo', ja: '深夜ドライブ / シティポップ調 (夜景・洗練)', en: 'a smooth, neon-lit late-night city-pop drive soundtrack with sleek basslines and sparkling keys', enShort: 'late-night city-pop drive' },
  { id: 'akiba_bedroom', ja: '電脳ベッドルームポップ (Y2K・ミニマル)', en: 'a quirky Y2K electronic bedroom-pop aesthetic reminiscent of Tokyo geek culture', enShort: 'Y2K electronic bedroom-pop' },
  { id: 'shimokita_indie', ja: '下北沢インディーチル (古着屋・ゆったり)', en: 'a laid-back indie-pop study groove inspired by vintage vinyl shops in Shimokitazawa', enShort: 'Shimokitazawa indie study beat' },
  { id: 'rainy_study', ja: '雨の日のコーディング (没入・ホワイトノイズ)', en: 'a deeply focused coding beat with rainy window ambiance and gentle lo-fi piano chords', enShort: 'deep-focus rainy study beat' }
];

// 楽器・音色（お洒落で耳馴染みの良い編成）
export const INSTRUMENTS = [
  { id: 'rhodes_chill', ja: 'ローズピアノ (Rhodes / 温かいエレピ)', en: 'warm, velvety Rhodes electric piano chords with gentle vibrato' },
  { id: 'square_arp', ja: '8bitアルペジオ (レトロゲームのピコピコ)', en: 'playful 8-bit chiptune arpeggios tucked neatly in the mix' },
  { id: 'funky_bass', ja: '軽快なベースライン (ウォーキングベース)', en: 'a bouncy, melodic walking bassline with clean groove' },
  { id: 'guitar_cutting', ja: 'アコギ/エレキのカッティング', en: 'crisp, rhythmic guitar chops and light funk strumming' },
  { id: 'synth_pluck', ja: 'ベル系プラックシンセ (透明感)', en: 'sparkling glass-like synth plucks and clean melodic repeats' },
  { id: 'vibraphone', ja: 'ヴィブラフォン / 鉄琴 (カフェの響き)', en: 'a chic acoustic vibraphone with mellow jazz warmth' },
  { id: 'lofi_drums', ja: 'ローファイ・シャッフルビート (スナップ)', en: 'a relaxed lo-fi boom-bap drum groove with finger snaps and rim clicks' },
  { id: 'tape_flute', ja: 'メロトロン風フルート / 口笛', en: 'nostalgic vintage tape-flute tones or a casual whistled hook' },
  { id: 'voice_chops', ja: 'ウィスパー・ボイスチョップ (楽器化声)', en: 'airy, wordless whisper vocal chops acting as an instrument' }
];

// サブカル効果音・ギークアクセント
export const SFX = [
  { id: 'tape_click', ja: 'カセットテープのカチッ音', en: 'a tactile mechanical cassette deck play/stop click' },
  { id: 'vinyl_crackle', ja: 'レコードの針音・チリチリ', en: 'cozy analog vinyl hiss and needle crackle' },
  { id: 'typewriter', ja: 'タイプライター / キーボード打鍵音', en: 'satisfying vintage typewriter keys or mechanical keyboard clacks' },
  { id: 'camera_click', ja: 'オールドデジカメのシャッター音', en: 'a quick retro digital camera shutter sound' },
  { id: 'coin_pickup', ja: 'ゲームボーイ風コイン獲得音', en: 'a tiny 8-bit coin collect accent' },
  { id: 'soda_fizz', ja: 'メロンソーダの炭酸シュワシュワ', en: 'effervescent soda fizz and ice clinks in a glass' },
  { id: 'cafe_rain', ja: 'カフェの窓の雨音', en: 'soft raindrops tapping on a cafe windowpane' },
  { id: 'record_scratch', ja: 'さりげないレコードスクラッチ', en: 'a subtle, tasteful lo-fi record baby scratch' }
];

// 和声・コード進行（お洒落で知的、作業がはかどるコード）
export const KEYS = {
  marusa_eb: {
    ja: '丸サ進行 (Just the Two of Us / 都会的・最高にお洒落)',
    en: 'the iconic "Just the Two of Us" / Marusa chord progression (IVmaj7 - III7 - VIm7 - I7)',
    baseNote: 'Eb',
    scaleType: 'marusa'
  },
  city_maj7: {
    ja: 'シティポップ・メジャー7th (爽快で透明感のあるアーバン調)',
    en: 'breezy Japanese City Pop major 7th chords full of urban optimism',
    baseNote: 'C',
    scaleType: 'city_pop'
  },
  neo_soul_min: {
    ja: 'ネオソウル・マイナー7th (深く集中できる知的グルーヴ)',
    en: 'a deep-focus neo-soul minor 7th groove with sophisticated jazz harmony',
    baseNote: 'F',
    scaleType: 'neo_soul'
  },
  sweet_penta: {
    ja: '渋谷系ポップペンタ (明るく弾む陽気なレトロ)',
    en: 'playful Shibuya-kei major pentatonic riffs with retro sunshine vibes',
    baseNote: 'G',
    scaleType: 'shibuya'
  }
};

// 効果音の出現頻度
export const DENSITY = {
  none: { ja: '使わない (ビートと楽器のみ)', en: 'no sound effects' },
  occasional: { ja: 'たまに小気味よく挟む (推奨)', en: 'tastefully sprinkled every few bars' },
  frequent: { ja: '遊び心いっぱいに散りばめる', en: 'frequently scattered like a playful sonic collage' }
};

// 作業集中モード（作業効率・集中度合いの調整）
export const FOCUS_MODES = {
  flow: {
    id: 'flow',
    label: '集中フロー (一定リズム・邪魔しない)',
    ja: '作業やプログラミングに没頭できるよう、歌声や急な変化を排し、心地よいグルーヴを一定にキープする。',
    en: 'Designed for deep work and coding flow: instrumental only, no vocals, no sudden climaxes, keeping a constant pleasant groove.'
  },
  breezy: {
    id: 'breezy',
    label: '軽快ポップ (気分がアガる・適度な変化)',
    ja: '気分転換やお散歩、読書が楽しくなるような、適度なメロディ変化とお洒落なリズムアクセントをつける。',
    en: 'Light and uplifting for brainstorming and creative work: catchy instrumental motifs with tasteful variations.'
  },
  night_chill: {
    id: 'night_chill',
    label: '深夜チル (まったり夜更かし作業)',
    ja: '深夜の作業や読書に最適な、少しテンポを落としたまったりローファイ。レコードノイズ多めで心地よい浮遊感。',
    en: 'Late-night chill study beat: slightly slower tempo, dusty tape saturation, warm Rhodes, and dreamy ambient space.'
  }
};

// ネガティブプロンプト（集中を妨げる要素の除外）
export const NEGATIVE_OPTIONS = [
  { id: 'vocals_distract', ja: '人の歌声・騒がしいボーカル・ラップ (集中妨害防止)', en: 'vocals, singing, rapping, aggressive speech, distractions' },
  { id: 'heavy_drops', ja: '激しいEDMドロップ・過剰な重低音・ダブステップ', en: 'heavy EDM drops, dubstep wobbles, overwhelming sub-bass, club techno' },
  { id: 'screech_harsh', ja: '耳障りな甲高いノイズ・過度な歪み・シャウト', en: 'ear-piercing screech, harsh clipping, heavy metal distortion, screaming' },
  { id: 'chaotic_tempo', ja: '不規則なテンポ変更・激しい転調・緊迫感', en: 'chaotic tempo changes, aggressive key shifts, horror, tension' }
];

// トラック長（作業用ループ・動画用）
export const DURATIONS = [
  { id: '30', label: '30秒ループ (ショート動画/SNS)', sec: 30 },
  { id: '60', label: '60秒ループ (作業用BGM・標準)', sec: 60 },
  { id: '90', label: '90秒ループ (じっくり展開)', sec: 90 },
  { id: '120', label: '120秒ループ (長尺チル)', sec: 120 },
  { id: 'loop', label: 'シームレスループ (尺なし・無限作業用)', sec: null }
];

// 対象AIフォーマット
export const AI_TARGETS = [
  { id: 'flow', label: 'Google Flow Music', desc: 'Flow Music向けに最適化された指示スタイル' },
  { id: 'suno_udio', label: 'Suno / Udio 共通', desc: '[Style: Neo Shibuya-kei, Lofi Chiptune] などのタグ形式' },
  { id: 'plain', label: 'シンプル文章形式', desc: '汎用プロンプト' }
];

// レトロ・サブカル風の曲名ガチャワード
export const TITLE_SUGGESTIONS = [
  '純喫茶メロンソーダ',
  '月夜のプログラミング',
  'カセットテープの放課後',
  '下北沢レトロステップ',
  '8bitの夜景ドライブ',
  'ネオ渋谷系サイダー',
  '午前2時のタイプライター',
  '雨降るレコードショップ',
  '電脳少女の昼休み',
  'クリームソーダの惑星',
  '黄昏のローファイビート',
  '古着屋とアコースティック',
  'ワンルーム・エレクトロニカ',
  '週末のコーヒードリップ',
  'サイバーアキバ・ステップ',
  'トウキョウ・シティ・ポップ'
];
