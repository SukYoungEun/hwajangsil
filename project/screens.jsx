// screens.jsx — Screen components for 화장실찾기
const { useState, useRef, useEffect } = React;

// ─────────────────────────────────────────────────────────────
// Tiny icon helpers (inline SVGs, currentColor)
// ─────────────────────────────────────────────────────────────
// Icon helpers — accept either a number (Ic.foo(20)) or props object (<Ic.foo s={20}/>).
function _icSize(arg, def) {
  if (arg == null) return def;
  if (typeof arg === 'number') return arg;
  if (typeof arg === 'object' && typeof arg.s === 'number') return arg.s;
  return def;
}
function _icOn(arg) {
  if (typeof arg === 'object' && arg !== null && 'on' in arg) return arg.on;
  return false;
}
function _icProps(arg, defSize) {
  return { s: _icSize(arg, defSize), on: _icOn(arg) };
}
const _svg = (s, body, extra = {}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...extra}>{body}</svg>
);

const Ic = {
  search:   (a) => _svg(_icSize(a, 18), <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>),
  filter:   (a) => _svg(_icSize(a, 16), <path d="M3 6h18M6 12h12M10 18h4"/>),
  back:     (a) => _svg(_icSize(a, 22), <path d="M15 18l-6-6 6-6"/>, { strokeWidth: 2.2 }),
  close:    (a) => _svg(_icSize(a, 22), <path d="M18 6L6 18M6 6l12 12"/>, { strokeWidth: 2.2 }),
  arrowR:   (a) => _svg(_icSize(a, 18), <path d="M5 12h14M13 6l6 6-6 6"/>),
  arrowUp:  (a) => _svg(_icSize(a, 36), <path d="M12 19V5M6 11l6-6 6 6"/>, { strokeWidth: 2.4 }),
  navigate: (a) => _svg(_icSize(a, 18), <polygon points="3 11 22 2 13 21 11 13 3 11"/>),
  share:    (a) => _svg(_icSize(a, 18), <><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></>),
  star:     (a) => {
    const { s, on } = _icProps(a, 14);
    return <svg width={s} height={s} viewBox="0 0 24 24" fill={on ? '#E4BE00' : 'none'} stroke={on ? '#E4BE00' : 'currentColor'} strokeWidth="1.5" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  },
  bookmark: (a) => _svg(_icSize(a, 18), <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>),
  home:     (a) => _svg(_icSize(a, 22), <><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></>),
  pencil:   (a) => _svg(_icSize(a, 22), <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>),
  user:     (a) => _svg(_icSize(a, 22), <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>),
  pin:      (a) => _svg(_icSize(a, 18), <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></>),
  clock:    (a) => _svg(_icSize(a, 14), <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>),
  check:    (a) => _svg(_icSize(a, 14), <polyline points="20 6 9 17 4 12"/>, { strokeWidth: 2.5 }),
  x:        (a) => _svg(_icSize(a, 14), <path d="M18 6L6 18M6 6l12 12"/>, { strokeWidth: 2.2 }),
  plus:     (a) => _svg(_icSize(a, 14), <path d="M12 5v14M5 12h14"/>, { strokeWidth: 2.4 }),
  alarm:    (a) => _svg(_icSize(a, 18), <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3L2 6M19 3l3 3"/></>),
  camera:   (a) => _svg(_icSize(a, 20), <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>, { strokeWidth: 1.8 }),
  history:  (a) => _svg(_icSize(a, 16), <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></>),
};

// ─────────────────────────────────────────────────────────────
// Filter chip set
// ─────────────────────────────────────────────────────────────
function Filters({ active, onChange }) {
  const opts = [
    { k: 'all',     l: '전체' },
    { k: 'open',    l: '개방형', d: 'var(--palette-primary-52)' },
    { k: 'cafe',    l: '카페',   d: 'var(--jch-cafe)' },
    { k: 'station', l: '지하철', d: 'var(--jch-station)' },
    { k: 'h24',     l: '24시간' },
    { k: 'access',  l: '장애인용' },
    { k: 'diaper',  l: '기저귀교환대' },
  ];
  return (
    <div className="jch-chips">
      {opts.map(o => (
        <button key={o.k} className="jch-chip"
                data-active={active === o.k}
                onClick={() => onChange(o.k)}>
          {o.d && <span className="jch-chip-dot" style={{ background: o.d, color: o.d }} />}
          {o.l}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reusable: Map background + pins
// ─────────────────────────────────────────────────────────────
function MapView({ spots, me, activeId, onPinTap }) {
  return (
    <div className="jch-map">
      <svg className="jch-map-roads" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 30 L100 35" stroke="#fff" strokeWidth="6" strokeOpacity="0.85" fill="none"/>
        <path d="M0 65 L100 60" stroke="#fff" strokeWidth="4" strokeOpacity="0.85" fill="none"/>
        <path d="M22 0 L26 100" stroke="#fff" strokeWidth="5" strokeOpacity="0.85" fill="none"/>
        <path d="M62 0 L58 100" stroke="#fff" strokeWidth="6" strokeOpacity="0.85" fill="none"/>
        <path d="M0 88 L100 84" stroke="#fff" strokeWidth="2" strokeOpacity="0.7" fill="none"/>
        <path d="M85 0 L82 100" stroke="#fff" strokeWidth="2" strokeOpacity="0.7" fill="none"/>
        {/* small blocks */}
        <rect x="30" y="40" width="22" height="18" rx="2" fill="#fff" fillOpacity="0.35"/>
        <rect x="64" y="42" width="14" height="14" rx="2" fill="#fff" fillOpacity="0.35"/>
        <rect x="30" y="68" width="22" height="12" rx="2" fill="#fff" fillOpacity="0.3"/>
        <rect x="62" y="68" width="20" height="14" rx="2" fill="#fff" fillOpacity="0.3"/>
      </svg>

      {me && <div className="jch-me" style={{ left: `${me.x}%`, top: `${me.y}%` }} />}

      {spots.map(s => (
        <div key={s.id}
             className="jch-map-pin"
             data-active={activeId === s.id}
             style={{ left: `${s.x}%`, top: `${s.y}%` }}
             onClick={() => onPinTap && onPinTap(s)}>
          <div className="jch-pin-body" data-type={s.type} data-closed={s.isClosed}>
            <span className="jch-pin-glyph">{s.glyph}</span>
            {s.dist}m
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom tab bar
// ─────────────────────────────────────────────────────────────
function TabBar({ active, onChange }) {
  const tabs = [
    { k: 'home',   l: '홈',   i: Ic.home() },
    { k: 'search', l: '검색', i: Ic.search(22) },
    { k: 'me',     l: '마이', i: Ic.user() },
  ];
  return (
    <div className="jch-tabbar" role="tablist">
      {tabs.map(t => (
        <button key={t.k} className="jch-tab" data-active={active === t.k}
                role="tab" aria-selected={active === t.k} aria-label={t.l}
                onClick={() => onChange(t.k)}>
          {t.i}
          <span>{t.l}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Toilet card (horizontal)
// ─────────────────────────────────────────────────────────────
function ToiletCardH({ spot, urgent, onClick }) {
  return (
    <div className="jch-card-h" data-urgent={urgent} onClick={onClick}>
      <div className="jch-card-row">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="jch-card-name">{spot.name}</div>
          <div className="jch-card-sub">{spot.sub}</div>
        </div>
        <div className="jch-card-dist">{spot.dist}<small>m</small></div>
      </div>
      <div className="jch-card-meta">
        <span className="jch-tag" data-tone={spot.type}>
          {spot.type === 'open' ? '개방형' : spot.type === 'cafe' ? '카페' : '지하철역'}
        </span>
        {spot.isClosed
          ? <span className="jch-tag" data-tone="neg">영업종료</span>
          : <span className="jch-tag" data-tone="pos"><Ic.check/>지금 이용가능</span>}
        <span className="jch-tag">
          <Ic.star s={11} on/> {spot.rating.toFixed(1)}
        </span>
        <span className="jch-tag" data-tone={spot.paper ? 'pos' : 'warn'}>
          {spot.paper ? '휴지있음' : '휴지없음'}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// List row (vertical list home variant)
// ─────────────────────────────────────────────────────────────
function ListRow({ spot, onClick }) {
  return (
    <div className="jch-list-row" onClick={onClick}>
      <div className="jch-list-row-glyph" data-type={spot.type} data-closed={spot.isClosed}>
        {spot.glyph}
      </div>
      <div className="jch-list-row-body">
        <div className="jch-list-row-name">{spot.name}</div>
        <div className="jch-list-row-sub">{spot.sub}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
          {spot.isClosed
            ? <span className="jch-tag" data-tone="neg">영업종료</span>
            : <span className="jch-tag" data-tone="pos"><span style={{ width: 5, height: 5, borderRadius: 5, background: 'currentColor' }} /> 이용가능</span>}
          <span className="jch-tag"><Ic.star s={10} on/> {spot.rating.toFixed(1)}</span>
          {!spot.paper && <span className="jch-tag" data-tone="warn">휴지없음</span>}
          {spot.password && <span className="jch-tag" data-tone="warn">비번필요</span>}
          {spot.h24 && <span className="jch-tag">24h</span>}
        </div>
      </div>
      <div className="jch-list-row-dist">
        {spot.dist}<small>m · {spot.time}초</small>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME — Map + bottom-sheet variant
// ─────────────────────────────────────────────────────────────
function HomeMap({ scenario, onOpenDetail, onOpenEmergency, onTab }) {
  const [filter, setFilter] = useState('all');
  const [activeId, setActiveId] = useState(scenario.spots[0].id);

  let spots = scenario.spots;
  if (filter === 'open' || filter === 'cafe' || filter === 'station') {
    spots = spots.filter(s => s.type === filter);
  } else if (filter === 'h24')    spots = spots.filter(s => s.h24);
  else if (filter === 'access')   spots = spots.filter(s => s.accessible);
  else if (filter === 'diaper')   spots = spots.filter(s => s.diaper);

  const sorted = [...spots].sort((a, b) => a.dist - b.dist);
  const closest = sorted[0];

  return (
    <div className="jch-screen">
      <div className="jch-pad-top" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 6 }}>
        <div className="jch-header" style={{ paddingTop: 8 }}>
          <div className="jch-searchbar" style={{ background: 'rgba(255,255,255,0.96)', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
               onClick={() => onTab('search')}>
            {Ic.search()}
            <span style={{ color: 'var(--jch-text-3)' }}>화장실, 카페, 지하철역 검색</span>
            <button style={{ border: 0, background: 'transparent', color: 'var(--jch-text-2)', cursor: 'pointer', padding: 0 }}>
              {Ic.filter()}
            </button>
          </div>
        </div>
        <Filters active={filter} onChange={setFilter} />
      </div>

      <MapView
        spots={spots}
        me={scenario.me}
        activeId={activeId}
        onPinTap={(s) => setActiveId(s.id)}
      />

      {/* Emergency FAB — compact pill above the bottom sheet */}
      <button className="jch-fab" onClick={onOpenEmergency} aria-label={`긴급: 가장 가까운 화장실까지 ${closest ? closest.dist : 0}미터`}>
        <span className="jch-fab-glyph" aria-hidden="true">{Ic.alarm(16)}</span>
        <span>지금 당장!</span>
        {closest && <span className="jch-fab-dist" aria-hidden="true">{closest.dist}m</span>}
      </button>

      {/* Bottom sheet */}
      <div className="jch-sheet">
        <div className="jch-sheet-handle" />
        <div className="jch-sheet-head">
          <div className="jch-sheet-title">내 주변 · 가까운 순</div>
          <div className="jch-sheet-meta">{sorted.length}곳</div>
        </div>
        <div className="jch-cards-h">
          {sorted.map((s, i) => (
            <ToiletCardH key={s.id} spot={s} urgent={i === 0}
                         onClick={() => onOpenDetail(s)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME — List variant
// ─────────────────────────────────────────────────────────────
function HomeList({ scenario, onOpenDetail, onOpenEmergency, onTab }) {
  const [filter, setFilter] = useState('all');

  let spots = scenario.spots;
  if (filter === 'open' || filter === 'cafe' || filter === 'station') {
    spots = spots.filter(s => s.type === filter);
  } else if (filter === 'h24')    spots = spots.filter(s => s.h24);
  else if (filter === 'access')   spots = spots.filter(s => s.accessible);
  else if (filter === 'diaper')   spots = spots.filter(s => s.diaper);
  const sorted = [...spots].sort((a, b) => a.dist - b.dist);
  const closest = sorted[0];

  return (
    <div className="jch-screen">
      <div className="jch-pad-top">
        <div className="jch-header">
          <div className="jch-searchbar" onClick={() => onTab('search')}>
            {Ic.search()}
            <span style={{ color: 'var(--jch-text-3)' }}>화장실, 카페, 지하철역 검색</span>
          </div>
        </div>

        {/* Inline urgency band */}
        <div style={{ margin: '0 16px 12px', padding: 14, borderRadius: 16, background: 'var(--jch-urgent-soft)', border: '1px solid var(--jch-urgent)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
             onClick={onOpenEmergency}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--jch-urgent)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Ic.alarm s={22}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--jch-urgent)' }}>지금 급해요!</div>
            <div style={{ fontSize: 12, color: 'var(--jch-text-2)', marginTop: 2 }}>
              가장 가까운 {closest ? closest.name : '-'} · {closest ? closest.dist : 0}m
            </div>
          </div>
          <div style={{ color: 'var(--jch-urgent)' }}>{Ic.arrowR(20)}</div>
        </div>

        <Filters active={filter} onChange={setFilter} />
      </div>

      <div className="jch-scroll">
        <div className="jch-list">
          {sorted.map(s => (
            <ListRow key={s.id} spot={s} onClick={() => onOpenDetail(s)} />
          ))}
        </div>
        <div style={{ height: 90 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME — One-shot CTA variant
// ─────────────────────────────────────────────────────────────
function HomeOneShot({ scenario, onOpenDetail, onOpenEmergency, onTab }) {
  const sorted = [...scenario.spots].sort((a, b) => a.dist - b.dist);
  const top3 = sorted.slice(0, 3);

  return (
    <div className="jch-screen">
      <div className="jch-pad-top">
        <div className="jch-header" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--jch-text-3)' }}>
            {Ic.pin(16)} {scenario.label}
          </div>
        </div>
      </div>

      <div className="jch-scroll">
        <div className="jch-oneshot">
          <div className="jch-oneshot-hero">
            <div className="jch-oneshot-eyebrow">근처 화장실</div>
            <div className="jch-oneshot-q">한 번에<br/>안내해드릴게요</div>
            <div className="jch-oneshot-meta">
              가장 가까운 곳까지 <b>{top3[0]?.dist}m</b>
              <span style={{ color: 'var(--jch-text-3)' }}>· 도보 {top3[0]?.time}초</span>
            </div>
            <button className="jch-oneshot-btn" onClick={() => onOpenDetail(top3[0])}>
              <span>길안내 시작</span>
              <span className="jch-oneshot-btn-arr">{Ic.arrowR(16)}</span>
            </button>
            <span className="jch-oneshot-quiet-er" onClick={onOpenEmergency}>
              <span className="jch-stat-dot" /> 더 빠르게 보기
            </span>
          </div>

          <div>
            <div className="jch-oneshot-section-h">
              <div className="jch-oneshot-section-t">다른 후보</div>
              <div className="jch-oneshot-section-l" onClick={() => onTab('map')}>지도로 →</div>
            </div>
            <div className="jch-list" style={{ background: 'var(--jch-bg)', border: '1px solid var(--jch-line)', borderRadius: 16, overflow: 'hidden' }}>
              {top3.slice(1).map((s) => (
                <div key={s.id}>
                  <ListRow spot={s} onClick={() => onOpenDetail(s)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL page
// ─────────────────────────────────────────────────────────────
function DetailScreen({ spot, onBack, onOpenReview, scenario, onOpenAlt }) {
  const [slide, setSlide] = useState(0);
  const reviews = window.JCH_DATA.REVIEWS;

  return (
    <div className="jch-screen">
      {/* Floating header above scroll — always visible regardless of scroll position */}
      <div className="jch-detail-floating">
        <button className="jch-hero-back" onClick={onBack} aria-label="뒤로가기">{Ic.back(20)}</button>
        <div className="jch-detail-floating-right">
          <button className="jch-hero-act" aria-label="저장">{Ic.bookmark()}</button>
          <button className="jch-hero-act" aria-label="공유">{Ic.share()}</button>
        </div>
      </div>

      <div className="jch-scroll">
        {/* Hero */}
        <div className="jch-hero" onScroll={(e) => {
          const i = Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth);
          setSlide(i);
        }}>
          <div className="jch-hero-slide" data-bg="1">사진 1 · 입구</div>
          <div className="jch-hero-slide" data-bg="2">사진 2 · 내부</div>
          <div className="jch-hero-slide" data-bg="3">사진 3 · 세면대</div>
        </div>
        <div className="jch-hero-dots">
          {[0,1,2].map(i => <div key={i} className="jch-hero-dot" data-active={slide === i} />)}
        </div>

        {/* Head */}
        <div className="jch-detail-head">
          <div className="jch-detail-eyebrow">
            <span className="jch-tag" data-tone={spot.type}>
              {spot.type === 'open' ? '개방형 화장실' : spot.type === 'cafe' ? '카페' : '지하철역'}
            </span>
            <span>·</span>
            <span>{spot.sub}</span>
          </div>
          <div className="jch-detail-name">{spot.name}</div>
          <div className="jch-detail-status">
            {spot.isClosed ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--palette-red-64)' }}>
                <span className="jch-stat-dot" data-tone="closed" /> 영업종료
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--palette-green-64)' }}>
                <span className="jch-stat-dot" /> 이용가능
              </span>
            )}
            <span style={{ fontSize: 13, color: 'var(--jch-text-3)' }}>· {spot.hours}</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700 }}>
              {Ic.clock()} 도보 {Math.ceil(spot.time / 60 * 10) / 10}분 · {spot.dist}m
            </span>
          </div>
        </div>

        {/* Ratings strip — big-number system */}
        <div className="jch-ratings">
          <div className="jch-rating">
            <div className="jch-rating-label">전체</div>
            <div className="jch-rating-val">{spot.rating.toFixed(1)}</div>
            <div className="jch-rating-stars">
              {[1,2,3,4,5].map(i => <Ic.star key={i} s={10} on={i <= Math.round(spot.rating)}/>)}
            </div>
          </div>
          <div className="jch-rating">
            <div className="jch-rating-label">청결</div>
            <div className="jch-rating-val" data-tone={spot.cleanliness >= 4.5 ? 'pos' : spot.cleanliness >= 3.5 ? '' : 'warn'}>
              {spot.cleanliness.toFixed(1)}
            </div>
          </div>
          <div className="jch-rating">
            <div className="jch-rating-label">휴지</div>
            <div className="jch-rating-val" data-tone={spot.paper ? 'pos' : 'neg'} style={{ fontSize: 22 }}>
              {spot.paper ? <Ic.check s={22}/> : <Ic.x s={22}/>}
            </div>
          </div>
          <div className="jch-rating">
            <div className="jch-rating-label">비번</div>
            <div className="jch-rating-val" data-tone={spot.password ? 'warn' : 'pos'} style={{ fontSize: 22 }}>
              {spot.password ? '필요' : '없음'}
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="jch-actions">
          <button className="jch-btn" data-variant="secondary">{Ic.pin(18)} 지도</button>
          <button className="jch-btn" data-variant="primary-brand">{Ic.navigate()} 길찾기</button>
        </div>

        {/* Features grid */}
        <div className="jch-features">
          {[
            { l: '장애인용', on: spot.accessible, g: '♿' },
            { l: '기저귀',   on: spot.diaper,     g: '👶' },
            { l: '24시간',   on: spot.h24,        g: '24' },
            { l: '비밀번호', on: spot.password,   g: '🔒' },
          ].map((f, i) => (
            <div key={i} className="jch-feature" data-on={f.on}>
              <div className="jch-feature-glyph" style={{ fontSize: f.l === '24시간' ? 13 : 16, fontWeight: 800 }}>{f.g}</div>
              <span>{f.l}{f.on ? '' : ' 없음'}</span>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="jch-section">
          <div className="jch-section-h">
            <div className="jch-section-t">후기 <span style={{ color: 'var(--jch-text-3)', fontWeight: 600 }}>{reviews.length}</span></div>
            <div className="jch-section-l" onClick={onOpenReview}>작성하기 →</div>
          </div>
          {reviews.slice(0, 3).map((r, i) => (
            <div key={i} className="jch-review">
              <div className="jch-review-h">
                <div className="jch-avatar" data-color={(i % 5) + 1}>{r.initial}</div>
                <div>
                  <div className="jch-review-name">{r.name}</div>
                  <div className="jch-review-meta">{r.when}</div>
                </div>
                <div className="jch-review-stars">
                  <b>★</b> {r.rating}.0
                </div>
              </div>
              <div className="jch-review-text">{r.text}</div>
              <div className="jch-review-tags">
                {r.tags.map((t, j) => <span key={j} className="jch-tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* Nearby alternatives */}
        <div className="jch-section">
          <div className="jch-section-h">
            <div className="jch-section-t">근처 다른 곳</div>
            <div className="jch-section-l" onClick={onOpenAlt}>대안 보기 →</div>
          </div>
          <div className="jch-list" style={{ marginLeft: -16, marginRight: -16 }}>
            {scenario.spots.filter(s => s.id !== spot.id).slice(0, 3).map(s => (
              <ListRow key={s.id} spot={s} onClick={() => {}} />
            ))}
          </div>
        </div>

        <div style={{ height: 100 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EMERGENCY mode
// ─────────────────────────────────────────────────────────────
function EmergencyScreen({ scenario, onClose, onOpenDetail }) {
  const sorted = [...scenario.spots].sort((a, b) => a.dist - b.dist);
  const closest = sorted[0];
  const alts = sorted.slice(1, 3);

  return (
    <div className="jch-er">
      <div className="jch-er-pulse" />
      <div className="jch-er-pad">
        <div className="jch-er-top">
          <span className="jch-er-label">
            <span className="jch-stat-dot" /> 빠른 안내
          </span>
          <button className="jch-er-cancel" onClick={onClose}>취소</button>
        </div>

        <div className="jch-er-q">가장 가까운 화장실</div>
        <div className="jch-er-name">{closest.name}</div>

        <div className="jch-er-panel">
          <div className="jch-er-bigdist">
            {closest.dist}<small>m</small>
          </div>
          <div className="jch-er-meta">
            <span>도보 {closest.time}초</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{closest.sub}</span>
            {closest.password && <span className="jch-er-meta-tag">비번 필요</span>}
          </div>
        </div>

        <div className="jch-er-spacer" />

        <div className="jch-er-arrow">{Ic.arrowUp(36)}</div>

        {alts.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>
              근처 다른 곳
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alts.map(s => (
                <div key={s.id} className="jch-er-alt" onClick={() => onOpenDetail(s)}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.22)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>
                    {s.glyph}
                  </div>
                  <div className="jch-er-alt-meta">
                    <div className="jch-er-alt-name">{s.name}</div>
                    <div className="jch-er-alt-sub">{s.type === 'open' ? '개방형' : s.type === 'cafe' ? '카페' : '지하철역'} · 도보 {s.time}초</div>
                  </div>
                  <div className="jch-er-alt-dist">{s.dist}m</div>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="jch-er-go" onClick={() => onOpenDetail(closest)}>
          <span>길안내 시작</span>
          <span>{Ic.arrowR(22)}</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ALT (no open toilet → cafe/station suggestions)
// ─────────────────────────────────────────────────────────────
function AltScreen({ scenario, onBack, onOpenDetail }) {
  const cafes = scenario.spots.filter(s => s.type === 'cafe');
  const stations = scenario.spots.filter(s => s.type === 'station');

  return (
    <div className="jch-screen">
      <div className="jch-pad-top">
        <div className="jch-header">
          <button className="jch-header-back" onClick={onBack}>{Ic.back()}</button>
          <div className="jch-header-title">대안 찾기</div>
        </div>
      </div>
      <div className="jch-scroll">
        <div className="jch-empty">
          <div className="jch-empty-glyph">🧻</div>
          <div className="jch-empty-title">근처 50m 안에<br/>이용가능한 개방형 화장실이 없어요</div>
          <div className="jch-empty-sub">
            대신 가까운 카페와 지하철역을 추천드려요.<br/>
            카페는 음료 구매가 필요할 수 있습니다.
          </div>
        </div>

        <div className="jch-section" style={{ borderTop: '8px solid var(--jch-bg-soft)' }}>
          <div className="jch-section-h">
            <div className="jch-section-t">근처 카페 <span style={{ color: 'var(--jch-cafe)', fontWeight: 600 }}>{cafes.length}</span></div>
            <span className="jch-tag" data-tone="warn">구매 필요할 수 있음</span>
          </div>
          <div className="jch-list" style={{ marginLeft: -16, marginRight: -16 }}>
            {cafes.map(s => <ListRow key={s.id} spot={s} onClick={() => onOpenDetail(s)} />)}
          </div>
        </div>

        <div className="jch-section">
          <div className="jch-section-h">
            <div className="jch-section-t">근처 지하철역 <span style={{ color: 'var(--jch-station)', fontWeight: 600 }}>{stations.length}</span></div>
            <span className="jch-tag" data-tone="station">개찰구 통과</span>
          </div>
          <div className="jch-list" style={{ marginLeft: -16, marginRight: -16 }}>
            {stations.map(s => <ListRow key={s.id} spot={s} onClick={() => onOpenDetail(s)} />)}
          </div>
        </div>

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REVIEW writing
// ─────────────────────────────────────────────────────────────
function ReviewScreen({ spot, onBack, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [paper, setPaper] = useState(null);   // 'yes' | 'no' | null
  const [pw, setPw] = useState(null);
  const [clean, setClean] = useState(0);
  const [text, setText] = useState('');

  const canSubmit = rating > 0 && paper !== null && pw !== null;

  return (
    <div className="jch-screen">
      <div className="jch-pad-top">
        <div className="jch-header">
          <button className="jch-header-back" onClick={onBack} aria-label="닫기">{Ic.close()}</button>
          <div className="jch-header-title">후기 작성</div>
          <button className="jch-header-back" style={{ visibility: 'hidden' }}>{Ic.close()}</button>
        </div>
      </div>
      <div className="jch-scroll">
        <div className="jch-review-form">
          <div style={{ padding: 14, borderRadius: 12, background: 'var(--jch-bg-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="jch-list-row-glyph" data-type={spot.type}>{spot.glyph}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{spot.name}</div>
              <div style={{ fontSize: 12, color: 'var(--jch-text-3)', marginTop: 2 }}>{spot.sub}</div>
            </div>
          </div>

          <div className="jch-q-label" id="lbl-rating">전체 평점 <small>필수</small></div>
          <div className="jch-stars-input" role="radiogroup" aria-labelledby="lbl-rating">
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button" className="jch-star" data-on={i <= rating}
                      role="radio" aria-checked={i === rating} aria-label={`${i}점`}
                      onClick={() => setRating(i)}>★</button>
            ))}
          </div>

          <div className="jch-q-label" id="lbl-clean">청결도 <small>1~5</small></div>
          <div className="jch-stars-input" role="radiogroup" aria-labelledby="lbl-clean">
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button" className="jch-star" data-on={i <= clean}
                      role="radio" aria-checked={i === clean} aria-label={`${i}점`}
                      onClick={() => setClean(i)}>★</button>
            ))}
          </div>

          <div className="jch-q-label">시설 정보 <small>필수</small></div>
          <div className="jch-toggles">
            <div className="jch-toggle-row">
              <span className="jch-toggle-q">휴지가 있었나요?</span>
              <div className="jch-yn">
                <button className="jch-yn-btn" data-on={paper === 'yes'} onClick={() => setPaper('yes')}>있음</button>
                <button className="jch-yn-btn" data-on={paper === 'no'}  onClick={() => setPaper('no')}>없음</button>
              </div>
            </div>
            <div className="jch-toggle-row">
              <span className="jch-toggle-q">비밀번호가 필요한가요?</span>
              <div className="jch-yn">
                <button className="jch-yn-btn" data-on={pw === 'yes'} onClick={() => setPw('yes')}>필요</button>
                <button className="jch-yn-btn" data-on={pw === 'no'}  onClick={() => setPw('no')}>없음</button>
              </div>
            </div>
          </div>

          <div className="jch-q-label">한줄 후기 <small>선택</small></div>
          <textarea className="jch-textarea" placeholder="다른 사람에게 도움될 정보를 남겨주세요"
                    value={text} onChange={e => setText(e.target.value)} />

          <div className="jch-q-label">사진 <small>선택 · 최대 5장</small></div>
          <div className="jch-photos">
            <div className="jch-photo">{Ic.plus()} 추가</div>
            <div className="jch-photo">{Ic.camera()}</div>
            <div className="jch-photo">{Ic.camera()}</div>
            <div className="jch-photo">{Ic.camera()}</div>
          </div>

          <div style={{ height: 80 }} />
        </div>
      </div>
      <div className="jch-submit-bar">
        <button className="jch-submit-btn" disabled={!canSubmit} onClick={onSubmit}>
          {canSubmit ? '후기 등록' : '필수 항목을 입력해주세요'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SEARCH screen
// ─────────────────────────────────────────────────────────────
function SearchScreen({ scenario, onBack, onOpenDetail }) {
  const [q, setQ] = useState('');
  const recents = ['강남역 화장실', '스타벅스 강남R', '24시간 화장실'];
  const results = q.length > 0
    ? scenario.spots.filter(s => s.name.includes(q) || s.sub.includes(q))
    : [];

  return (
    <div className="jch-screen">
      <div className="jch-header" style={{ paddingTop: 56 }}>
        <button className="jch-header-back" onClick={onBack}>{Ic.back()}</button>
        <div className="jch-searchbar" style={{ height: 40 }}>
          {Ic.search()}
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="화장실, 카페, 지하철역 검색" autoFocus />
          {q && <button style={{ border: 0, background: 'transparent', color: 'var(--jch-text-3)', cursor: 'pointer' }} onClick={() => setQ('')}>{Ic.x(16)}</button>}
        </div>
      </div>

      <div className="jch-scroll">
        {q.length === 0 ? (
          <>
            <div className="jch-search-section-t">최근 검색어</div>
            <div className="jch-search-list">
              {recents.map((r, i) => (
                <div key={i} className="jch-search-row" onClick={() => setQ(r)}>
                  <div className="jch-search-icon">{Ic.history()}</div>
                  <div className="jch-search-body">
                    <div className="jch-search-title">{r}</div>
                  </div>
                  <button style={{ border: 0, background: 'transparent', color: 'var(--jch-text-3)', cursor: 'pointer' }}>{Ic.x(14)}</button>
                </div>
              ))}
            </div>
            <div className="jch-search-section-t">추천</div>
            <div className="jch-search-list">
              {scenario.spots.slice(0, 4).map(s => (
                <div key={s.id} className="jch-search-row" onClick={() => onOpenDetail(s)}>
                  <div className="jch-list-row-glyph" data-type={s.type} style={{ width: 32, height: 32, borderRadius: 10 }}>{s.glyph}</div>
                  <div className="jch-search-body">
                    <div className="jch-search-title">{s.name}</div>
                    <div className="jch-search-sub">{s.sub} · {s.dist}m</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="jch-search-list">
            {results.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--jch-text-3)' }}>
                검색 결과가 없어요
              </div>
            ) : (
              results.map(s => (
                <div key={s.id} className="jch-search-row" onClick={() => onOpenDetail(s)}>
                  <div className="jch-list-row-glyph" data-type={s.type} style={{ width: 32, height: 32, borderRadius: 10 }}>{s.glyph}</div>
                  <div className="jch-search-body">
                    <div className="jch-search-title">{s.name}</div>
                    <div className="jch-search-sub">{s.sub} · {s.dist}m</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VISITS — my visit history (reviews can only be written from here)
// ─────────────────────────────────────────────────────────────
function VisitsScreen({ onBack, onOpenDetail, onWriteReview }) {
  const { SCENARIOS, VISITS } = window.JCH_DATA;
  const [filter, setFilter] = useState('all'); // 'all' | 'unwritten' | 'written'

  const expanded = VISITS.map(v => {
    const spot = SCENARIOS[v.scenario]?.spots.find(s => s.id === v.spotId);
    return spot ? { ...v, spot, scenarioLabel: SCENARIOS[v.scenario].label } : null;
  }).filter(Boolean);

  const filtered = expanded.filter(v =>
    filter === 'all' ? true : filter === 'unwritten' ? !v.reviewed : v.reviewed
  );

  const unwrittenCount = expanded.filter(v => !v.reviewed).length;

  return (
    <div className="jch-screen">
      <div className="jch-pad-top">
        <div className="jch-header" style={{ paddingBottom: 8 }}>
          {onBack && <button className="jch-header-back" onClick={onBack}>{Ic.back()}</button>}
          <div className="jch-header-title">내 기록</div>
          {onBack && <button className="jch-header-back" style={{ visibility: 'hidden' }}>{Ic.back()}</button>}
        </div>
        <div className="jch-chips" style={{ paddingBottom: 12 }}>
          <button className="jch-chip" data-active={filter === 'all'} onClick={() => setFilter('all')}>전체 {expanded.length}</button>
          <button className="jch-chip" data-active={filter === 'unwritten'} onClick={() => setFilter('unwritten')}>후기 미작성 {unwrittenCount}</button>
          <button className="jch-chip" data-active={filter === 'written'} onClick={() => setFilter('written')}>작성 완료 {expanded.length - unwrittenCount}</button>
        </div>
      </div>

      <div className="jch-scroll" style={{ paddingBottom: 40 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--jch-text-3)', fontSize: 13 }}>
            해당하는 기록이 없어요
          </div>
        ) : (
          <div className="jch-list">
            {filtered.map(v => (
              <div key={v.id} className="jch-list-row" style={{ alignItems: 'flex-start' }}>
                <div className="jch-list-row-glyph" data-type={v.spot.type}>{v.spot.glyph}</div>
                <div className="jch-list-row-body" onClick={() => onOpenDetail(v.spot)} style={{ cursor: 'pointer' }}>
                  <div className="jch-list-row-name">{v.spot.name}</div>
                  <div className="jch-list-row-sub">{v.scenarioLabel} · 방문 {v.when}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                    {v.reviewed ? (
                      <>
                        <span className="jch-tag" data-tone="pos">
                          <Ic.check s={11}/> 후기 작성됨
                        </span>
                        <span className="jch-tag">
                          <Ic.star s={10} on/> {v.reviewRating}.0
                        </span>
                      </>
                    ) : (
                      <span className="jch-tag" data-tone="warn">후기 미작성</span>
                    )}
                  </div>
                </div>
                {!v.reviewed && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onWriteReview(v.spot); }}
                    style={{
                      flexShrink: 0, height: 36, padding: '0 14px', borderRadius: 10,
                      border: '1px solid var(--jch-text)', background: 'var(--jch-text)',
                      color: 'var(--jch-bg)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      letterSpacing: '-0.2px',
                    }}>
                    후기 쓰기
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { VisitsScreen });

// ─────────────────────────────────────────────────────────────
// MY page
// ─────────────────────────────────────────────────────────────
function MyScreen({ onOpenVisits }) {
  const { VISITS } = window.JCH_DATA;
  const unwritten = VISITS.filter(v => !v.reviewed).length;
  const reviewsWritten = VISITS.filter(v => v.reviewed).length;

  return (
    <div className="jch-screen">
      <div className="jch-pad-top">
        <div className="jch-header">
          <div className="jch-header-title">마이</div>
        </div>
      </div>
      <div className="jch-scroll" style={{ paddingBottom: 100 }}>
        <div style={{ padding: '16px 16px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="jch-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>나</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.4px' }}>김다오</div>
            <div style={{ fontSize: 12, color: 'var(--jch-text-3)', marginTop: 2 }}>방문 {VISITS.length}곳 · 후기 {reviewsWritten}개</div>
          </div>
        </div>

        {/* Prompt — only if there are unwritten reviews */}
        {unwritten > 0 && (
          <div style={{ padding: '0 16px 12px' }}>
            <div onClick={onOpenVisits} style={{
              padding: '14px 16px', borderRadius: 14,
              background: 'var(--jch-primary-soft)',
              border: '1px solid var(--jch-primary-08)',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'var(--jch-primary)',
                color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0,
                fontWeight: 800, letterSpacing: '-0.3px',
              }}>{unwritten}</div>
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.4 }}>
                <b>후기를 안 쓰신 곳이 {unwritten}곳 있어요</b>
                <div style={{ color: 'var(--jch-text-3)', fontSize: 12, marginTop: 1 }}>
                  다녀온 곳에서만 작성 가능합니다
                </div>
              </div>
              <span style={{ color: 'var(--jch-primary)' }}>{Ic.arrowR(18)}</span>
            </div>
          </div>
        )}

        {/* Stat cards — each one drills into the visits list */}
        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { l: '방문기록', v: VISITS.length },
            { l: '내 후기',  v: reviewsWritten },
            { l: '북마크',   v: 4 },
          ].map((s, i) => (
            <div key={i} onClick={onOpenVisits} style={{
              padding: '16px 12px', background: 'var(--jch-bg-soft)',
              borderRadius: 14, textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px' }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'var(--jch-text-3)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Menu sections */}
        <div className="jch-section">
          <div className="jch-section-t" style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, letterSpacing: 0.06, color: 'var(--jch-text-3)', textTransform: 'uppercase' }}>활동</div>
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, border: '1px solid var(--jch-line)', overflow: 'hidden' }}>
            {[
              { l: '내 방문기록 · 후기',  meta: `${VISITS.length}곳`, onClick: onOpenVisits },
              { l: '북마크',              meta: '4곳' },
              { l: '내가 등록한 화장실',  meta: '2곳' },
            ].map((row, i, arr) => (
              <div key={i} onClick={row.onClick} style={{
                padding: '14px 16px',
                borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--jch-line)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: row.onClick ? 'pointer' : 'default',
              }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{row.l}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--jch-text-3)', fontSize: 13 }}>
                  {row.meta}
                  {Ic.arrowR(16)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="jch-section">
          <div className="jch-section-t" style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, letterSpacing: 0.06, color: 'var(--jch-text-3)', textTransform: 'uppercase' }}>설정</div>
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, border: '1px solid var(--jch-line)', overflow: 'hidden' }}>
            {['알림 설정', '긴급모드 단축버튼', '필터 기본값', '개인정보 처리방침'].map((l, i, arr) => (
              <div key={i} style={{ padding: '14px 16px', borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--jch-line)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: 14 }}>{l}</span>
                <span style={{ color: 'var(--jch-text-3)' }}>{Ic.arrowR(16)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Filters, MapView, TabBar, ToiletCardH, ListRow,
  HomeMap, HomeList, HomeOneShot,
  DetailScreen, EmergencyScreen, AltScreen, ReviewScreen, SearchScreen, MyScreen,
  JCH_Ic: Ic,
});
