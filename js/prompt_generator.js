/**
 * サブカルポップBGMプロンプト生成エンジン
 */
import { MOTIFS, INSTRUMENTS, MELODY_INSTRUMENTS, SFX, KEYS, DENSITY, FOCUS_MODES, DURATIONS, NEGATIVE_OPTIONS, SUBCUL_STYLES } from './data.js';

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
 * Hyper-Kawaii & Yami-Kawaii 指示・タグ生成ヘルパー
 */
function getKawaiiDescriptor(hyper, yami, lang) {
  const isHyper = hyper && hyper !== 'none';
  const isYami = yami && yami !== 'none';

  if (!isHyper && !isYami) {
    return { text: '', tag: '' };
  }

  if (lang === 'ja') {
    let tag = '';
    let text = '';

    if (isHyper && isYami) {
      tag = '[Hyper×Yami 病み甘ハイブリッド] ';
      if (hyper === 'full' && yami === 'full') {
        text = '【Hyper × Yami 病み甘ハイブリッド全開】飛び切りのパステルキラキラな甘さと、裏に潜む儚いダークネス・退廃美が激しく交錯する「病みかわいい×超絶カワイイ」の極致。甘くて痛い中毒性あるドリームポップ空間。';
      } else if (hyper === 'full') {
        text = '【Hyper-Kawaii全開（隠し味にYami）】極限までパステルで甘くキュートな超絶カワイイ電脳ポップに、ほんのり切なく儚い影（微ダークなアンニュイ感）をブレンド。';
      } else if (yami === 'full') {
        text = '【Yami-Kawaii全開（隠し味にHyper）】深く切ない病みかわいいアンニュイ空間に、微かにキラリと光るパステルの甘さを散りばめた中毒性あるダークチル。';
      } else {
        text = 'パステルの甘さ（Hyper-Kawaii要素）と、どこか儚く切ない影（Yami-Kawaii要素）が絶妙に溶け合う病み甘ポップのアクセント。';
      }
    } else if (isHyper) {
      tag = hyper === 'full' ? '[Ultra Hyper-Kawaii Pop] [Pastel Kawaii Aesthetic] ' : '[Hyper-Kawaii Touch] ';
      text = hyper === 'full'
        ? '【Hyper-Kawaii全開】極限まで甘く飛び切りキュートなHyper-Kawaiiスタイル。パステルピンクの電脳ポップ、キラキラ輝くベルチャイム、弾けるバブルシンセ、ドリーミーで愛らしさ溢れるメロディと世界観を前面に押し出す。'
        : 'ほんのりパステル調のHyper-Kawaii要素（キラキラ感と甘く愛らしいベルやシンセの余韻）をブレンド。';
    } else {
      tag = yami === 'full' ? '[Yami-Kawaii Dark Chill] [Menhera Pastel Goth] ' : '[Yami-Kawaii Mood] ';
      text = yami === 'full'
        ? '【Yami-Kawaii全開】甘さの裏に毒と切なさを秘めた本格的なYami-Kawaii（病みかわいい）スタイル。デチューンされた不安定なトーン、深夜の孤独や儚さを思わせるアンニュイで微ダークなメロディ、可愛さと退廃美が同居する独特のメンヘラチル空間。'
        : '隠し味としてほんのり切ないYami-Kawaii要素（少し影のあるアンニュイなトーンと儚いメロディ）を滲ませる。';
    }

    return { text, tag };
  } else {
    // 英語
    let tag = '';
    let text = '';

    if (isHyper && isYami) {
      tag = '[Hyper-Kawaii x Yami-Kawaii] [Pastel Goth Dream Pop] ';
      text = 'A captivating juxtaposition of ultra-saccharine hyper-kawaii pastel sparkle and melancholic yami-kawaii darkness—sweet, edgy, and emotionally intoxicating pastel-goth aesthetic.';
    } else if (isHyper) {
      tag = hyper === 'full' ? '[Ultra Hyper-Kawaii Pop] [Pastel Kawaii Aesthetic] ' : '[Hyper-Kawaii Touch] ';
      text = hyper === 'full'
        ? 'Maximum hyper-kawaii aesthetic: overflowing pastel cuteness, sparkling bubbly synths, playful dream-pop sweetness, and irresistible sugary charm.'
        : 'Subtly infused with hyper-kawaii pastel sweetness and sparkling dreamcore accents.';
    } else {
      tag = yami === 'full' ? '[Yami-Kawaii Dark Chill] [Menhera Pastel Goth] ' : '[Yami-Kawaii Mood] ';
      text = yami === 'full'
        ? 'Deeply atmospheric yami-kawaii aesthetic: poignant dark-cute melancholy, slightly detuned fragile melodies, alluring emotional vulnerability, and lonely midnight bedroom-chill nostalgia.'
        : 'Delicately shaded with subtle yami-kawaii melancholy and wistful, moody pastel undertones.';
    }

    return { text, tag };
  }
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
  const isSparse = Boolean(state.sparseNotes);

  const coreInsts = insts.length ? insts : [{ ja: 'ローズピアノ', en: 'warm Rhodes electric piano' }];
  const sfxA = sfx[0] || { ja: 'カセットテープのカチッ音', en: 'a tape deck click' };
  const sfxB = sfx[1] || sfx[0] || { ja: 'レコードの針音', en: 'vinyl crackle' };

  const subculStyleDef = SUBCUL_STYLES.find(s => s.id === state.subculStyle);
  const hasSubculStyle = subculStyleDef && subculStyleDef.id !== 'none';

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
      desc: isSparse
        ? (useSfx ? `${sfxA.ja}の余韻とともに、音数を極力絞って${hasMelody ? melodyDef.ja : coreInsts[0].ja}がポツリと静かに立ち上がる。` : `音数を極力絞り、静寂の中から${hasMelody ? melodyDef.ja : coreInsts[0].ja}がポツリと静かに立ち上がる。`)
        : (hasMelody
            ? (useSfx ? `${sfxA.ja}とともに${melodyDef.ja}が穏やかに主旋律を立ち上げる。` : `${melodyDef.ja}の柔らかなメロディで集中に入る。`)
            : (useSfx ? `${sfxA.ja}とともに${coreInsts[0].ja}が穏やかに立ち上がる。` : `${coreInsts[0].ja}の柔らかなフレーズで集中に入る。`))
    },
    {
      label: 'メイングルーヴ (作業フロー)',
      ratio: 0.50,
      desc: isSparse
        ? `余白と静寂を最大限に活かした極小音数グルーヴ。音符を敷き詰めず、一音一音の余韻を味わうミニマル空間。${hasSubculStyle ? subculStyleDef.descJa + ' ' : ''}${isLocked ? '主旋律の音色は一貫キープ。' : ''}`
        : (hasMelody
            ? `${melodyDef.ja}が心地よい主旋律を奏で、${coreInsts.map(i => i.ja).join('・')}が噛み合うリフレイン。${hasSubculStyle ? subculStyleDef.descJa + ' ' : ''}${isLocked ? '主旋律の音色は一貫キープ。' : ''}集中を邪魔しない一定のノリ。`
            : `${coreInsts.map(i => i.ja).join('・')}が噛み合う心地よいリフレイン。${hasSubculStyle ? subculStyleDef.descJa + ' ' : ''}集中を邪魔しない一定のノリ。`)
    },
    {
      label: '変化/ブリッジ (気晴らし)',
      ratio: 0.20,
      desc: isSparse
        ? `音数は決して増やさず、静かな余白を保ったまま、最小限の音符で繊細な揺らぎを提示${useSfx ? `（時折${sfxB.ja}を小さく配置）` : ''}。`
        : (isLocked
            ? `主旋律（${hasMelody ? melodyDef.ja : 'リード音色'}）の楽器は変えずに固定し、ベースラインや音圧の抜き差し、${useSfx ? sfxB.ja : '心地よい揺らぎ'}で変化を提示。`
            : (useSfx ? `音圧は保ちつつ一部フレーズを抜き差し、${sfxB.ja}を小気味よく挟む。` : '強度は変えず、ベースラインやシンセのフレーズで心地よい揺らぎを提示。'))
    },
    {
      label: 'ループ地点 (シームレス)',
      ratio: 0.15,
      desc: isSparse
        ? '静寂と余白を乱さずに自然と先頭へ還る、継ぎ目のないミニマルターン。'
        : '先頭のグルーヴへ自然に戻るためのなめらかな繋ぎ。'
    }
  ] : [
    {
      label: 'Intro (Focus Prep)',
      ratio: 0.15,
      desc: isSparse
        ? `Ultra-minimal entry with abundant silence and breathing room, led gently by ${hasMelody ? melodyDef.enShort : coreInsts[0].en}.`
        : (hasMelody
            ? (useSfx ? `Smooth entry with ${sfxA.en} and ${melodyDef.en}.` : `Gentle melody led by ${melodyDef.en}.`)
            : (useSfx ? `Smooth entry with ${sfxA.en} and ${coreInsts[0].en}.` : `Gentle entry led by ${coreInsts[0].en}.`))
    },
    {
      label: 'Main Groove (Flow State)',
      ratio: 0.50,
      desc: isSparse
        ? `Extremely sparse, spacious groove with plenty of negative space and silence between delicate notes.${hasSubculStyle ? ' ' + subculStyleDef.descEn : ''}${isLocked ? ' Lead timbre strictly uniform.' : ''} Uncluttered and deeply peaceful.`
        : (hasMelody
            ? `Steady pocket groove with ${melodyDef.en} leading, supported by ${coreInsts.map(i => i.en).join(', ')}.${hasSubculStyle ? ' ' + subculStyleDef.descEn : ''}${isLocked ? ' Timbre kept strictly uniform.' : ''} Unobtrusive and deeply satisfying.`
            : `Steady pocket groove driven by ${coreInsts.map(i => i.en).join(', ')}.${hasSubculStyle ? ' ' + subculStyleDef.descEn : ''} Unobtrusive and deeply satisfying.`)
    },
    {
      label: 'Subtle Variation',
      ratio: 0.20,
      desc: isSparse
        ? `Maintaining quiet space and minimal note density, introducing a delicate shift without adding extra notes.`
        : (isLocked
            ? `Subtle textural shift while strictly keeping ${hasMelody ? melodyDef.enShort : 'the lead instrument'} constant, accented by ${sfxB.en}.`
            : (useSfx ? `Tasteful motif rotation accented by ${sfxB.en} without breaking study concentration.` : 'Light textural shift while maintaining steady energy.'))
    },
    {
      label: 'Loop Point (Seamless Turnaround)',
      ratio: 0.15,
      desc: isSparse
        ? 'Seamless, whisper-quiet turnaround flowing effortlessly back to the beginning.'
        : 'Silky smooth transition designed to loop indefinitely.'
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
  const isSparse = Boolean(state.sparseNotes);

  const kawaii = getKawaiiDescriptor(state.hyperKawaii, state.yamiKawaii, state.lang);
  const subculStyleDef = SUBCUL_STYLES.find(s => s.id === state.subculStyle);
  const hasSubculStyle = subculStyleDef && subculStyleDef.id !== 'none';

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

    // 音数極小化指示文
    let sparseSentence = '';
    if (isSparse) {
      sparseSentence = '★音数極小化指示: 思いっきり音の数を減らし、余白（隙間）と静寂を最大限に重視すること。音符を敷き詰めず、ポツリ…ポツリ…と一音一音を慈しむように鳴らす極めてシンプルなミニマル編成。音の密度を極限まで低くし、静けさの中に優しい響きだけが漂う引き算の音空間にすること。';
    }

    // Kawaiiテイスト文
    const kawaiiSentence = kawaii.text ? kawaii.text : '';

    // サブカル派生スタイル文
    const subculStyleSentence = hasSubculStyle ? subculStyleDef.descJa : '';

    if (aiTarget === 'suno_udio') {
      const titleTag = title ? `[Title: ${title}] ` : '';
      const leadTag = hasMelody ? `[Lead: ${melodyDef.enShort || melodyDef.en}] ` : '';
      const lockTag = isLocked ? `[Consistent Lead Throughout] [No Lead Switching] ` : '';
      const sparseTag = isSparse ? `[Ultra-Sparse Arrangement] [Minimalist Note Density] [Maximum Breathing Room] ` : '';
      const kawaiiTag = kawaii.tag || '';
      const subculStyleTag = (hasSubculStyle && subculStyleDef.tag) ? `${subculStyleDef.tag} ` : '';

      prompt = `${titleTag}[Genre: Neo Shibuya-kei, Chiptune Lofi Study Beat, City Pop Instrumental] [Tempo: ${state.tempo} BPM] [Key: ${key.baseNote}] ${leadTag}${lockTag}${sparseTag}${kawaiiTag}${subculStyleTag}\n` +
        `${titlePrefix}作業・勉強がはかどるサブカルポップインストBGM。「${motif.ja}」の世界観。` +
        `編成: ${instText}。${melodySentence}${lockSentence ? ' ' + lockSentence + ' ' : ''}${sparseSentence ? ' ' + sparseSentence + ' ' : ''}${subculStyleSentence ? ' ' + subculStyleSentence + ' ' : ''}${kawaiiSentence ? ' ' + kawaiiSentence + ' ' : ''}${key.ja}を使用${sfxText}。${focus.ja} 歌声なしのインスト限定。`;
    } else {
      prompt = `${titlePrefix}テンポ${state.tempo}BPMのユニークで軽くポップな作業用BGM。「${motif.ja}」の雰囲気。` +
        `編成は${instText}を中心とし、${melodySentence}${lockSentence ? ' ' + lockSentence + ' ' : ''}${sparseSentence ? ' ' + sparseSentence + ' ' : ''}${subculStyleSentence ? ' ' + subculStyleSentence + ' ' : ''}${kawaiiSentence ? ' ' + kawaiiSentence + ' ' : ''}${key.ja}のお洒落なコード感${sfxText}。` +
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

    let sparseSentenceEn = '';
    if (isSparse) {
      sparseSentenceEn = ' CRITICAL RULE (Ultra-Sparse Note Density): Drastically reduce the number of notes. Maximize silence, negative space, and breathing room between minimal, delicate notes. Extremely sparse note density, strictly avoid crowded arrangements or busy phrases. A minimalist, stripped-down sonic space where notes fall like gentle, isolated drops with plenty of quiet space.';
    }

    const kawaiiSentenceEn = kawaii.text ? ` ${kawaii.text}` : '';
    const subculStyleSentenceEn = hasSubculStyle ? ` ${subculStyleDef.descEn}` : '';

    if (aiTarget === 'suno_udio') {
      const titleTag = title ? `[Title: ${title}] ` : '';
      const leadTag = hasMelody ? `[Lead: ${melodyDef.enShort || melodyDef.en}] ` : '';
      const lockTag = isLocked ? `[Consistent Lead Throughout] [No Lead Switching] ` : '';
      const sparseTag = isSparse ? `[Ultra-Sparse Arrangement] [Minimalist Note Density] [Maximum Breathing Room] ` : '';
      const kawaiiTag = kawaii.tag || '';
      const subculStyleTag = (hasSubculStyle && subculStyleDef.tag) ? `${subculStyleDef.tag} ` : '';

      prompt = `${titleTag}[Genre: Neo Shibuya-kei, 8-bit Chiptune Lofi, Japanese City Pop Instrumental, Study Beat] [Tempo: ${state.tempo} BPM] [Key: ${key.baseNote}] ${leadTag}${lockTag}${sparseTag}${kawaiiTag}${subculStyleTag}\n` +
        `A stylish, bouncy and lighthearted instrumental study BGM${titleThemed} capturing ${motif.en}. Built on ${instText}.${melodySentenceEn}${lockSentenceEn}${sparseSentenceEn}${subculStyleSentenceEn}${kawaiiSentenceEn} Featuring ${key.en}.${sfxText} ${focus.en} Strictly instrumental with no vocals.`;
    } else {
      prompt = `A breezy ${state.tempo} BPM instrumental study track${titleThemed} with ${motif.en}. ` +
        `Structured around ${instText}.${melodySentenceEn}${lockSentenceEn}${sparseSentenceEn}${subculStyleSentenceEn}${kawaiiSentenceEn} Driven by ${key.en}.${sfxText} ` +
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
  const isSparse = Boolean(state.sparseNotes);
  const isHyperFull = state.hyperKawaii === 'full';
  const isYamiFull = state.yamiKawaii === 'full';
  const subculStyle = state.subculStyle;

  if (state.lang === 'ja') {
    let parts = selected.map(n => n.ja);
    if (isSparse && !state.negatives.has('dense_notes')) {
      parts.push('音の詰め込みすぎ・過密なフレーズ・音数過多 (余白の破壊防止)');
    }
    if (isLocked && !state.negatives.has('lead_switching')) {
      parts.push('主旋律楽器の途中交代・メロディ音色の急変');
    }
    if (isHyperFull && !isYamiFull) {
      parts.push('泥臭い・暗すぎる不穏なトーン');
    }
    if (isYamiFull && !isHyperFull) {
      parts.push('過剰に能天気な明るさ・軽薄なポップ感');
    }
    if (subculStyle === 'jirai') {
      parts.push('過剰に能天気なカントリー・素朴すぎるアコースティック');
    } else if (subculStyle === 'tenshi') {
      parts.push('泥臭いディストーション・暑苦しい重圧ノイズ');
    } else if (subculStyle === 'yumekawa') {
      parts.push('攻撃的な激しい歪み・過度にダークで陰鬱な重圧感');
    }
    if (parts.length === 0) return '';
    return '【作業集中用・除外指示】' + parts.join('、') + 'は一切含めず、集中しやすいインストゥルメンタルにすること。';
  }

  const enList = selected.map(n => n.en);
  if (isSparse && !state.negatives.has('dense_notes')) {
    enList.push('dense notes, crowded arrangement, busy arpeggios, wall of sound, cluttered mix');
  }
  if (isLocked && !state.negatives.has('lead_switching')) {
    enList.push('switching lead instruments, sudden melody timbre change, rotating leads');
  }
  if (isHyperFull && !isYamiFull) {
    enList.push('gritty, muddy, aggressive dissonance, depressing gloom');
  }
  if (isYamiFull && !isHyperFull) {
    enList.push('overly cheerful slapstick, cheesy sunshine, corporate upbeat');
  }
  if (subculStyle === 'jirai') {
    enList.push('cheesy acoustic sunshine, rustic country, squeaky-clean optimism');
  } else if (subculStyle === 'tenshi') {
    enList.push('muddy distortion, abrasive noisy fuzz, aggressive heavy percussion');
  } else if (subculStyle === 'yumekawa') {
    enList.push('aggressive distortion, harsh noise, terrifying gothic heaviness');
  }
  return enList.join(', ');
}
