/**
 * サブカルポップBGMプロンプト生成エンジン
 */
import { MOTIFS, INSTRUMENTS, MELODY_INSTRUMENTS, SFX, KEYS, DENSITY, FOCUS_MODES, DURATIONS, NEGATIVE_OPTIONS } from './data.js';

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

  const melodyDef = MELODY_INSTRUMENTS.find(m => m.id === state.melodyInst) || MELODY_INSTRUMENTS[0];
  const hasMelody = melodyDef && melodyDef.id !== 'none';
  const isLocked = Boolean(state.lockMelodyInst);

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
    {
      label: 'イントロ (導入・準備)',
      ratio: 0.15,
      desc: hasMelody
        ? (useSfx ? `${sfxA.ja}とともに${melodyDef.ja}が穏やかに主旋律を立ち上げる。` : `${melodyDef.ja}の柔らかなメロディで集中に入る。`)
        : (useSfx ? `${sfxA.ja}とともに${coreInsts[0].ja}が穏やかに立ち上がる。` : `${coreInsts[0].ja}の柔らかなフレーズで集中に入る。`)
    },
    {
      label: 'メイングルーヴ (作業フロー)',
      ratio: 0.50,
      desc: hasMelody
        ? `${melodyDef.ja}が心地よい主旋律を奏で、${coreInsts.map(i => i.ja).join('・')}が噛み合うリフレイン。${isLocked ? '主旋律の音色は一貫キープ。' : ''}集中を邪魔しない一定のノリ。`
        : `${coreInsts.map(i => i.ja).join('・')}が噛み合う心地よいリフレイン。集中を邪魔しない一定のノリ。`
    },
    {
      label: '変化/ブリッジ (気晴らし)',
      ratio: 0.20,
      desc: isLocked
        ? `主旋律（${hasMelody ? melodyDef.ja : 'リード音色'}）の楽器は変えずに固定し、ベースラインや音圧の抜き差し、${useSfx ? sfxB.ja : '心地よい揺らぎ'}で変化を提示。`
        : (useSfx ? `音圧は保ちつつ一部フレーズを抜き差し、${sfxB.ja}を小気味よく挟む。` : '強度は変えず、ベースラインやシンセのフレーズで心地よい揺らぎを提示。')
    },
    {
      label: 'ループ地点 (シームレス)',
      ratio: 0.15,
      desc: '先頭のグルーヴへ自然に戻るためのなめらかな繋ぎ。'
    }
  ] : [
    {
      label: 'Intro (Focus Prep)',
      ratio: 0.15,
      desc: hasMelody
        ? (useSfx ? `Smooth entry with ${sfxA.en} and ${melodyDef.en}.` : `Gentle melody led by ${melodyDef.en}.`)
        : (useSfx ? `Smooth entry with ${sfxA.en} and ${coreInsts[0].en}.` : `Gentle entry led by ${coreInsts[0].en}.`)
    },
    {
      label: 'Main Groove (Flow State)',
      ratio: 0.50,
      desc: hasMelody
        ? `Steady pocket groove with ${melodyDef.en} leading, supported by ${coreInsts.map(i => i.en).join(', ')}.${isLocked ? ' Timbre kept strictly uniform.' : ''} Unobtrusive and deeply satisfying.`
        : `Steady pocket groove driven by ${coreInsts.map(i => i.en).join(', ')}. Unobtrusive and deeply satisfying.`
    },
    {
      label: 'Subtle Variation',
      ratio: 0.20,
      desc: isLocked
        ? `Subtle textural shift while strictly keeping ${hasMelody ? melodyDef.enShort : 'the lead instrument'} constant, accented by ${sfxB.en}.`
        : (useSfx ? `Tasteful motif rotation accented by ${sfxB.en} without breaking study concentration.` : 'Light textural shift while maintaining steady energy.')
    },
    {
      label: 'Loop Point (Seamless Turnaround)',
      ratio: 0.15,
      desc: 'Silky smooth transition designed to loop indefinitely.'
    }
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

  const melodyDef = MELODY_INSTRUMENTS.find(m => m.id === state.melodyInst) || MELODY_INSTRUMENTS[0];
  const hasMelody = melodyDef && melodyDef.id !== 'none';
  const isLocked = Boolean(state.lockMelodyInst);

  let prompt = '';

  if (state.lang === 'ja') {
    const instText = insts.length ? joinList(insts.map(i => i.ja), 'ja') : 'ローズピアノ、8bitピコピコ、軽快なベース';
    const sfxText = sfx.length && state.density !== 'none'
      ? `、${density.ja}${joinList(sfx.map(s => s.ja), 'ja')}をアクセントに忍ばせる`
      : '';
    const titlePrefix = title ? `曲名「${title}」のサブカルチャー的モチーフ。` : '';

    // メロディ指定文
    const melodySentence = hasMelody
      ? `主旋律（メロディライン）は【${melodyDef.ja}】が担当。`
      : '';

    // メロディ固定文
    let lockSentence = '';
    if (isLocked) {
      lockSentence = hasMelody
        ? `★メロディ固定指示: 最初から最後まで主旋律の楽器を変更せず、一貫して【${melodyDef.ja}】のみでメロディを奏でること（曲の途中で他の楽器やボーカルに切り替えない）。`
        : `★メロディ固定指示: 最初から最後まで曲全体で一貫した同一の主旋律楽器を用い、途中でメロディ担当楽器を切り替えないこと。`;
    }

    if (aiTarget === 'suno_udio') {
      const titleTag = title ? `[Title: ${title}] ` : '';
      const leadTag = hasMelody ? `[Lead: ${melodyDef.enShort || melodyDef.en}] ` : '';
      const lockTag = isLocked ? `[Consistent Lead Throughout] [No Lead Switching] ` : '';

      prompt = `${titleTag}[Genre: Neo Shibuya-kei, Chiptune Lofi Study Beat, City Pop Instrumental] [Tempo: ${state.tempo} BPM] [Key: ${key.baseNote}] ${leadTag}${lockTag}\n` +
        `${titlePrefix}作業・勉強がはかどるサブカルポップインストBGM。「${motif.ja}」の世界観。` +
        `編成: ${instText}。${melodySentence}${lockSentence ? ' ' + lockSentence + ' ' : ''}${key.ja}を使用${sfxText}。${focus.ja} 歌声なしのインスト限定。`;
    } else {
      prompt = `${titlePrefix}テンポ${state.tempo}BPMのユニークで軽くポップな作業用BGM。「${motif.ja}」の雰囲気。` +
        `編成は${instText}を中心とし、${melodySentence}${lockSentence ? ' ' + lockSentence + ' ' : ''}${key.ja}のお洒落なコード感${sfxText}。` +
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

    const melodySentenceEn = hasMelody
      ? ` The prominent melody line is carried exclusively by ${melodyDef.en}.`
      : '';

    let lockSentenceEn = '';
    if (isLocked) {
      lockSentenceEn = hasMelody
        ? ` CRITICAL RULE: Strictly maintain the exact same melodic lead instrument (${melodyDef.enShort || melodyDef.en}) from start to finish; do not switch, rotate, or alternate the lead melody instrument mid-track.`
        : ` CRITICAL RULE: Maintain a single consistent melodic lead instrument throughout the entire track without switching or rotating melody instruments mid-track.`;
    }

    if (aiTarget === 'suno_udio') {
      const titleTag = title ? `[Title: ${title}] ` : '';
      const leadTag = hasMelody ? `[Lead: ${melodyDef.enShort || melodyDef.en}] ` : '';
      const lockTag = isLocked ? `[Consistent Lead Throughout] [No Lead Switching] ` : '';

      prompt = `${titleTag}[Genre: Neo Shibuya-kei, 8-bit Chiptune Lofi, Japanese City Pop Instrumental, Study Beat] [Tempo: ${state.tempo} BPM] [Key: ${key.baseNote}] ${leadTag}${lockTag}\n` +
        `A stylish, bouncy and lighthearted instrumental study BGM${titleThemed} capturing ${motif.en}. Built on ${instText}.${melodySentenceEn}${lockSentenceEn} Featuring ${key.en}.${sfxText} ${focus.en} Strictly instrumental with no vocals.`;
    } else {
      prompt = `A breezy ${state.tempo} BPM instrumental study track${titleThemed} with ${motif.en}. ` +
        `Structured around ${instText}.${melodySentenceEn}${lockSentenceEn} Driven by ${key.en}.${sfxText} ` +
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
  const isLocked = Boolean(state.lockMelodyInst);

  if (state.lang === 'ja') {
    let text = selected.map(n => n.ja).join('、');
    if (isLocked && !state.negatives.has('lead_switching')) {
      text = text ? text + '、主旋律楽器の途中交代・メロディ音色の急変' : '主旋律楽器の途中交代・メロディ音色の急変';
    }
    if (!text) return '';
    return '【作業集中用・除外指示】' + text + 'は一切含めず、集中しやすいインストゥルメンタルにすること。';
  }

  const enList = selected.map(n => n.en);
  if (isLocked && !state.negatives.has('lead_switching')) {
    enList.push('switching lead instruments, sudden melody timbre change, rotating leads');
  }
  return enList.join(', ');
}
