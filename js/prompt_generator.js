/**
 * サブカルポップBGMプロンプト生成エンジン
 */
import { MOTIFS, INSTRUMENTS, SFX, KEYS, DENSITY, FOCUS_MODES, DURATIONS, NEGATIVE_OPTIONS } from './data.js';

function joinList(arr, lang) {
  if (!arr || arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (lang === 'ja') return arr.join('、');
  return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
}

function pick(items, ids) {
  return ids.map(id => items.find(i => i.id === id)).filter(Boolean);
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

/**
 * 構成タイムラインの計算（作業BGM向け）
 */
export function buildTimelineData(state) {
  const durationDef = DURATIONS.find(d => d.id === state.duration) || DURATIONS[1];
  const insts = pick(INSTRUMENTS, [...state.insts]);
  const sfx = pick(SFX, [...state.sfx]);
  const lang = state.lang;
  const useSfx = state.density !== 'none' && sfx.length > 0;

  const coreInsts = insts.length ? insts : [{ ja: 'ローズピアノ', en: 'warm Rhodes electric piano' }];
  const sfxA = sfx[0] || { ja: 'カセットテープのカチッ音', en: 'a tape deck click' };
  const sfxB = sfx[1] || sfx[0] || { ja: 'レコードの針音', en: 'vinyl crackle' };

  if (durationDef.sec === null) {
    return {
      isSeamless: true,
      sections: [],
      message: lang === 'ja'
        ? '作業没入用のシームレスループ仕様です。音楽AIにプロンプトを入力し、無限リピート再生でお使いください。'
        : 'Engineered for seamless study looping with no jarring breaks. Feed directly to music AI for endless focus.'
    };
  }

  const sections = lang === 'ja' ? [
    { label: 'イントロ (導入・準備)', ratio: 0.15, desc: useSfx ? `${sfxA.ja}とともに${coreInsts[0].ja}が穏やかに立ち上がる。` : `${coreInsts[0].ja}の柔らかなフレーズで集中に入る。` },
    { label: 'メイングルーヴ (作業フロー)', ratio: 0.50, desc: `${coreInsts.map(i => i.ja).join('・')}が噛み合う心地よいリフレイン。集中を邪魔しない一定のノリ。` },
    { label: '変化/ブリッジ (気晴らし)', ratio: 0.20, desc: useSfx ? `音圧は保ちつつ一部フレーズを抜き差し、${sfxB.ja}を小気味よく挟む。` : '強度は変えず、ベースラインやシンセのフレーズで心地よい揺らぎを提示。' },
    { label: 'ループ地点 (シームレス)', ratio: 0.15, desc: '先頭のグルーヴへ自然に戻るためのなめらかな繋ぎ。' }
  ] : [
    { label: 'Intro (Focus Prep)', ratio: 0.15, desc: useSfx ? `Smooth entry with ${sfxA.en} and ${coreInsts[0].en}.` : `Gentle entry led by ${coreInsts[0].en}.` },
    { label: 'Main Groove (Flow State)', ratio: 0.50, desc: `Steady pocket groove driven by ${coreInsts.map(i => i.en).join(', ')}. Unobtrusive and deeply satisfying.` },
    { label: 'Subtle Variation', ratio: 0.20, desc: useSfx ? `Tasteful motif rotation accented by ${sfxB.en} without breaking study concentration.` : 'Light textural shift while maintaining steady energy.' },
    { label: 'Loop Point (Seamless Turnaround)', ratio: 0.15, desc: 'Silky smooth transition designed to loop indefinitely.' }
  ];

  let currentTime = 0;
  const computedSections = sections.map(sec => {
    const startSec = currentTime;
    const duration = durationDef.sec * sec.ratio;
    currentTime += duration;
    return {
      ...sec,
      timeFormatted: fmtTime(startSec),
      durationSec: Math.round(duration)
    };
  });

  return {
    isSeamless: false,
    sections: computedSections,
    totalSeconds: durationDef.sec
  };
}

/**
 * プロンプト本文の組み立て
 */
export function buildPrompt(state) {
  const motif = MOTIFS.find(m => m.id === state.motif) || MOTIFS[0];
  const insts = pick(INSTRUMENTS, [...state.insts]);
  const sfx = pick(SFX, [...state.sfx]);
  const key = KEYS[state.key] || KEYS.marusa_eb;
  const density = DENSITY[state.density] || DENSITY.occasional;
  const focus = FOCUS_MODES[state.focusMode] || FOCUS_MODES.flow;
  const aiTarget = state.aiTarget || 'flow';
  const title = (state.trackTitle || '').trim();

  let prompt = '';

  if (state.lang === 'ja') {
    const instText = insts.length ? joinList(insts.map(i => i.ja), 'ja') : 'ローズピアノ、8bitピコピコ、軽快なベース';
    const sfxText = sfx.length && state.density !== 'none'
      ? `、${density.ja}${joinList(sfx.map(s => s.ja), 'ja')}をアクセントに忍ばせる`
      : '';
    const titlePrefix = title ? `曲名「${title}」のサブカルチャー的モチーフ。` : '';

    if (aiTarget === 'suno_udio') {
      const titleTag = title ? `[Title: ${title}] ` : '';
      prompt = `${titleTag}[Genre: Neo Shibuya-kei, Chiptune Lofi Study Beat, City Pop Instrumental] [Tempo: ${state.tempo} BPM] [Key: ${key.baseNote}]\n` +
        `${titlePrefix}作業・勉強がはかどるサブカルポップインストBGM。「${motif.ja}」の世界観。` +
        `編成: ${instText}。${key.ja}を使用${sfxText}。${focus.ja} 歌声なしのインスト限定。`;
    } else {
      prompt = `${titlePrefix}テンポ${state.tempo}BPMのユニークで軽くポップな作業用BGM。「${motif.ja}」の雰囲気。` +
        `編成は${instText}を中心とし、${key.ja}のお洒落なコード感${sfxText}。` +
        `${focus.ja} 歌声なしのインストゥルメンタル。`;
    }

    if (state.embedTimeline && state.duration !== 'loop') {
      const tl = buildTimelineData(state);
      if (!tl.isSeamless && tl.sections.length > 0) {
        prompt += '\n\n【構成タイムライン指示】\n' +
          tl.sections.map(s => `[${s.timeFormatted}] ${s.label}: ${s.desc}`).join('\n');
      }
    }
  } else {
    // 英語プロンプト
    const instText = insts.length ? joinList(insts.map(i => i.en), 'en') : 'warm Rhodes piano, 8-bit chiptune arpeggios, and bouncy bass';
    const sfxText = sfx.length && state.density !== 'none'
      ? ` ${density.en.charAt(0).toUpperCase() + density.en.slice(1)}, tastefully accent with ${joinList(sfx.map(s => s.en), 'en')}.`
      : '';
    const titleThemed = title ? ` themed after "${title}",` : '';

    if (aiTarget === 'suno_udio') {
      const titleTag = title ? `[Title: ${title}] ` : '';
      prompt = `${titleTag}[Genre: Neo Shibuya-kei, 8-bit Chiptune Lofi, Japanese City Pop Instrumental, Study Beat] [Tempo: ${state.tempo} BPM] [Key: ${key.baseNote}]\n` +
        `A stylish, bouncy and lighthearted instrumental study BGM${titleThemed} capturing ${motif.en}. Built on ${instText}, featuring ${key.en}.${sfxText} ${focus.en} Strictly instrumental with no vocals.`;
    } else {
      prompt = `A breezy ${state.tempo} BPM instrumental study track${titleThemed} with ${motif.en}. ` +
        `Structured around ${instText}, driven by ${key.en}.${sfxText} ` +
        `${focus.en} Instrumental only, zero distractions.`;
    }

    if (state.embedTimeline && state.duration !== 'loop') {
      const tl = buildTimelineData(state);
      if (!tl.isSeamless && tl.sections.length > 0) {
        prompt += '\n\nStructure Timeline:\n' +
          tl.sections.map(s => `[${s.timeFormatted}] ${s.label}: ${s.desc}`).join('\n');
      }
    }
  }

  return prompt.trim();
}

/**
 * ネガティブプロンプト
 */
export function buildNegativePrompt(state) {
  const selected = pick(NEGATIVE_OPTIONS, [...state.negatives]);
  if (selected.length === 0) return '';

  if (state.lang === 'ja') {
    return '【作業集中用・除外指示】' + selected.map(n => n.ja).join('、') + 'は一切含めず、集中しやすいインストゥルメンタルにすること。';
  }
  return selected.map(n => n.en).join(', ');
}
