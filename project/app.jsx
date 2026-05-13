// app.jsx — Main app for 화장실찾기
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "homeLayout": "map",
  "scenario": "gangnam",
  "dark": false,
  "emergencyDirect": false
}/*EDITMODE-END*/;

function App({ setDeviceDark }) {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // navigation state
  const [tab, setTab] = useStateApp('home');
  const [stack, setStack] = useStateApp([]); // detail / review / alt / emergency
  const [activeSpot, setActiveSpot] = useStateApp(null);

  const scenario = window.JCH_DATA.SCENARIOS[t.scenario] || window.JCH_DATA.SCENARIOS.gangnam;

  // Sync dark mode to <html data-theme>
  useEffectApp(() => {
    document.documentElement.setAttribute('data-theme', t.dark ? 'dark' : 'light');
  }, [t.dark]);

  // Tell the device frame whether the status bar should use light icons.
  // True whenever the visible surface is dark (app-dark theme OR an emergency overlay).
  useEffectApp(() => {
    const top = stack[stack.length - 1];
    setDeviceDark(t.dark || top === 'emergency');
  }, [t.dark, stack, setDeviceDark]);

  // Apply emergency-direct: when on, the home is replaced by emergency overlay
  useEffectApp(() => {
    if (t.emergencyDirect) setStack(['emergency']);
    else if (stack[0] === 'emergency') setStack([]);
    // eslint-disable-next-line
  }, [t.emergencyDirect]);

  const openDetail = (spot) => {
    setActiveSpot(spot);
    setStack(prev => [...prev, 'detail']);
  };
  const openReview = () => setStack(prev => [...prev, 'review']);
  const openAlt = () => setStack(prev => [...prev, 'alt']);
  const openEmergency = () => setStack(prev => [...prev, 'emergency']);
  const openVisits = () => setStack(prev => [...prev, 'visits']);
  const closeTop = () => setStack(prev => prev.slice(0, -1));

  const renderHome = () => {
    if (t.homeLayout === 'list')    return <HomeList    scenario={scenario} onOpenDetail={openDetail} onOpenEmergency={openEmergency} onTab={(k) => k === 'map' ? setTweak('homeLayout', 'map') : setTab(k)} />;
    if (t.homeLayout === 'oneshot') return <HomeOneShot scenario={scenario} onOpenDetail={openDetail} onOpenEmergency={openEmergency} onTab={(k) => k === 'map' ? setTweak('homeLayout', 'map') : setTab(k)} />;
    return <HomeMap scenario={scenario} onOpenDetail={openDetail} onOpenEmergency={openEmergency} onTab={setTab} />;
  };

  const renderTabContent = () => {
    if (tab === 'search') return <SearchScreen scenario={scenario} onBack={() => setTab('home')} onOpenDetail={openDetail} />;
    if (tab === 'me')     return <MyScreen onOpenVisits={openVisits} />;
    return renderHome();
  };

  const top = stack[stack.length - 1];

  return (
    <div className="jch-app">
      {renderTabContent()}

      {/* Overlays — render on top of home */}
      {top === 'detail' && activeSpot && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--jch-bg)', zIndex: 30 }}>
          <DetailScreen spot={activeSpot} scenario={scenario}
                        onBack={closeTop}
                        onOpenReview={openReview}
                        onOpenAlt={openAlt} />
        </div>
      )}
      {top === 'visits' && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--jch-bg)', zIndex: 35 }}>
          <VisitsScreen onBack={closeTop}
                        onOpenDetail={openDetail}
                        onWriteReview={(spot) => { setActiveSpot(spot); setStack(prev => [...prev, 'review']); }} />
        </div>
      )}
      {top === 'review' && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--jch-bg)', zIndex: 40 }}>
          <ReviewScreen spot={activeSpot || scenario.spots[0]}
                        onBack={closeTop}
                        onSubmit={() => setStack([])} />
        </div>
      )}
      {top === 'alt' && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--jch-bg)', zIndex: 50 }}>
          <AltScreen scenario={scenario}
                     onBack={closeTop}
                     onOpenDetail={openDetail} />
        </div>
      )}
      {top === 'emergency' && (
        <EmergencyScreen scenario={scenario}
                         onClose={() => {
                           if (t.emergencyDirect) setTweak('emergencyDirect', false);
                           closeTop();
                         }}
                         onOpenDetail={(s) => { openDetail(s); }} />
      )}

      {/* Tab bar — visible only on root tabs (hidden behind any pushed overlay) */}
      {stack.length === 0 && (
        <TabBar active={tab} onChange={setTab} />
      )}

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="홈 레이아웃" />
        <TweakSelect label="레이아웃"
                     value={t.homeLayout}
                     options={[
                       { value: 'map',     label: '지도 + 카드' },
                       { value: 'list',    label: '리스트' },
                       { value: 'oneshot', label: '원샷 CTA' },
                     ]}
                     onChange={v => setTweak('homeLayout', v)} />

        <TweakSection label="데모 시나리오" />
        <TweakSelect label="위치"
                     value={t.scenario}
                     options={[
                       { value: 'gangnam',  label: '강남역 11번 출구' },
                       { value: 'hongdae',  label: '홍대입구역 9번 출구' },
                       { value: 'jongno',   label: '종로3가역 1번 출구' },
                     ]}
                     onChange={v => setTweak('scenario', v)} />

        <TweakSection label="모드" />
        <TweakToggle label="다크모드" value={t.dark}
                     onChange={v => setTweak('dark', v)} />
        <TweakToggle label="긴급모드 즉시 진입" value={t.emergencyDirect}
                     onChange={v => setTweak('emergencyDirect', v)} />
      </TweaksPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mount inside iOS frame, with auto-scaling to fit viewport
// ─────────────────────────────────────────────────────────────
function MobileMount() {
  const wrapRef = React.useRef(null);
  const [scale, setScale] = React.useState(1);
  const [deviceDark, setDeviceDark] = React.useState(false);
  const W = 402, H = 874;

  React.useEffect(() => {
    const measure = () => {
      const pad = 40;
      const vw = window.innerWidth - pad;
      const vh = window.innerHeight - pad;
      const s = Math.min(vw / W, vh / H, 1.25);
      setScale(s);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'grid', placeItems: 'center',
      background: 'radial-gradient(circle at 50% 30%, #F5F5F0 0%, #E8E6E0 100%)',
      overflow: 'hidden',
    }}>
      <div ref={wrapRef} style={{ transform: `scale(${scale})`, transformOrigin: 'center center', width: W, height: H }}>
        <IOSDevice width={W} height={H} dark={deviceDark}>
          <App setDeviceDark={setDeviceDark} />
        </IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MobileMount />);
