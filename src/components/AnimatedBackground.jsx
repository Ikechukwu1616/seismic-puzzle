export default function AnimatedBackground() {
  return (
    <div className="seismic-bg" aria-hidden="true">
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <path
          className="wave-line"
          d="M-20,220 L120,220 L150,120 L190,320 L230,60 L270,400 L310,220 L500,220 L540,150 L580,300 L620,220 L820,220"
        />
        <path
          className="wave-line line-2"
          d="M-20,340 L100,340 L140,260 L180,420 L220,300 L400,300 L440,200 L480,380 L520,300 L820,300"
        />
        <path
          className="wave-line line-3"
          d="M-20,460 L200,460 L240,400 L280,500 L320,460 L600,460 L640,400 L680,500 L820,460"
        />
      </svg>
    </div>
  );
}
