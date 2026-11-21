import React from "react";
import {
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FONT = '"Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif';
const CORAL = "#F05C58";
const BLUE = "#315FCB";
const PEACH = "linear-gradient(180deg, #FAD9B8 0%, #FDE7CE 50%, #F6C89B 100%)";
const AUDIO_SECONDS = [
  23.719125, 16.901188, 14.158313, 21.39425,
  18.573063, 18.520813, 22.151813, 16.744438,
] as const;
const SCENE_DURATIONS = AUDIO_SECONDS.map((seconds) => Math.ceil(seconds * 30));
const SCENE_STARTS = SCENE_DURATIONS.reduce<number[]>((starts, duration, index) => {
  starts.push(index === 0 ? 0 : starts[index - 1] + SCENE_DURATIONS[index - 1]);
  return starts;
}, []);

export const BP12080_SCENE_DURATIONS_IN_FRAMES = SCENE_DURATIONS;
export const BP12080_EXPLAINER_DURATION_IN_FRAMES =
  SCENE_STARTS[SCENE_STARTS.length - 1] + SCENE_DURATIONS[SCENE_DURATIONS.length - 1];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const popIn = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 110 } });

const Badge: React.FC = () => (
  <div
    style={{
      position: "absolute",
      zIndex: 30,
      top: 34,
      right: 34,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 18px 8px 9px",
      borderRadius: 999,
      background: "#fff",
      boxShadow: "0 6px 20px #593a2720",
      color: "#3A3232",
      font: `700 20px ${FONT}`,
      whiteSpace: "nowrap",
    }}
  >
    <svg width="48" height="48" viewBox="0 0 48 48" aria-label="360 degree ECG ring">
      <circle cx="24" cy="24" r="20" fill="#FFF8F2" stroke="#E97669" strokeWidth="2" />
      <path d="M5 25h10l4-7 6 14 5-11 4 4h9" fill="none" stroke="#E97669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="24" y="46" textAnchor="middle" fill="#3A3232" fontSize="7" fontWeight="700">360°</text>
    </svg>
    <span>Health Factor 360</span>
  </div>
);

const Bokeh: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    {[
      [78, 195, 86], [910, 290, 104], [160, 605, 46], [935, 730, 64],
      [72, 1030, 68], [1000, 1255, 95], [240, 1560, 52], [790, 1730, 80],
      [560, 350, 28], [605, 1400, 44],
    ].map(([left, top, size], index) => (
      <div
        key={index}
        style={{
          position: "absolute",
          left,
          top,
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#fff",
          opacity: index % 3 === 0 ? 0.35 : 0.22,
          filter: "blur(1px)",
        }}
      />
    ))}
  </div>
);

const Canvas: React.FC<{
  frame: number;
  background?: string;
  bokeh?: boolean;
  children: React.ReactNode;
}> = ({ frame, background = PEACH, bokeh = true, children }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", background, fontFamily: FONT }}>
    {bokeh && <Bokeh />}
    {children}
    <Badge />
    <div style={{ position: "absolute", inset: 0, zIndex: 25, pointerEvents: "none", opacity: 0.18 + Math.sin(frame / 28) * 0.025, background: "radial-gradient(ellipse at 50% 45%,transparent 42%,#7746221a 100%)" }} />
  </div>
);

const Pill: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = "#fff",
  style,
}) => (
  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "11px 22px", borderRadius: 999, background: color, color: "#403536", boxShadow: "0 5px 12px #482a251c", font: `700 24px ${FONT}`, ...style }}>
    {children}
  </div>
);

const Question: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ position: "absolute", display: "grid", placeItems: "center", width: 90, height: 90, borderRadius: "50%", background: "#fff", color: CORAL, font: `700 62px ${FONT}`, boxShadow: "0 10px 24px #552c2426", ...style }}>?</div>
);

const GoogEyes: React.FC<{ frame: number; x?: number; y?: number }> = ({ frame, x = 50, y = 25 }) => {
  const blink = (frame % 113 > 87 && frame % 113 < 93) ? 0.12 : 1;
  return (
    <g style={{ transformBox: "fill-box", transformOrigin: "center", transform: `scaleY(${blink})` }}>
      <ellipse cx={x - 22} cy={y} rx="19" ry="22" fill="#fff" />
      <ellipse cx={x + 22} cy={y} rx="19" ry="22" fill="#fff" />
      <circle cx={x - 18} cy={y + 3} r="8" fill="#253041" />
      <circle cx={x + 25} cy={y + 2} r="8" fill="#253041" />
      <circle cx={x - 20} cy={y} r="2.5" fill="#fff" />
      <circle cx={x + 23} cy={y - 1} r="2.5" fill="#fff" />
    </g>
  );
};

const NumberBlock: React.FC<{
  value: string;
  color: string;
  frame: number;
  style?: React.CSSProperties;
  bounce?: boolean;
}> = ({ value, color, frame, style, bounce = false }) => {
  const bob = bounce ? Math.sin(frame / 9) * 11 : 0;
  return (
    <div style={{ position: "absolute", width: 430, height: 290, transform: `translateY(${bob}px)`, ...style }}>
      <div style={{ position: "absolute", inset: "20px 0 0", borderRadius: 64, background: color === CORAL ? "#BD3B3B" : "#2448A7", transform: "skewY(-3deg)", boxShadow: "0 28px 0 #53362238,0 40px 45px #4A2C282b" }} />
      <div style={{ position: "absolute", inset: "0 0 24px", borderRadius: 64, background: `linear-gradient(155deg,${color === CORAL ? "#FF8376" : "#648BFA"} 0%,${color} 68%,${color === CORAL ? "#D84943" : "#284FAF"} 100%)`, boxShadow: "inset 0 10px 9px #ffffff5e,inset 0 -12px 12px #11111119" }}>
        <svg width="100%" height="100%" viewBox="0 0 430 266" aria-label={`${value} number block`}>
          <GoogEyes frame={frame} x={215} y={57} />
          <text x="215" y="205" textAnchor="middle" fill="#fff" fontFamily={FONT} fontSize="128" fontWeight="900" letterSpacing="-5">{value}</text>
        </svg>
      </div>
    </div>
  );
};

const Room: React.FC<{ floorY?: number }> = ({ floorY = 1260 }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg,#F7E5D1 0 54px,#F1D9C1 54px 108px)" }} />
    <div style={{ position: "absolute", left: 48, top: 325, width: 410, height: 340, padding: 14, background: "#fff", boxShadow: "0 12px 22px #674a3025" }}>
      <div style={{ position: "relative", height: "100%", overflow: "hidden", background: "#BDE4E7" }}>
        <div style={{ position: "absolute", right: 27, top: 20, width: 58, height: 58, borderRadius: "50%", background: "#FFD56F", boxShadow: "0 0 32px #FFE79A" }} />
        <div style={{ position: "absolute", inset: "58% 0 0", background: "#A6D4B5" }} />
        {[[20, 64, 115], [105, 75, 156], [210, 57, 98], [287, 73, 132]].map(([left, width, height]) => (
          <div key={left} style={{ position: "absolute", left, bottom: "42%", width, height, background: "#92AEB1", borderRadius: "5px 5px 0 0" }}>
            <div style={{ position: "absolute", inset: "12px 10px", background: "repeating-linear-gradient(90deg,#D8E9DB 0 7px,transparent 7px 21px),repeating-linear-gradient(0deg,transparent 0 18px,#D8E9DB 18px 24px)" }} />
          </div>
        ))}
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 12, background: "#fff", transform: "translateX(-50%)" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 12, background: "#fff", transform: "translateY(-50%)" }} />
      </div>
    </div>
    <div style={{ position: "absolute", top: 360, right: 72, width: 306, height: 246, padding: 12, background: "#89522E", boxShadow: "0 9px 20px #674a3025" }}>
      <svg width="100%" height="100%" viewBox="0 0 282 222" aria-label="Framed landscape">
        <rect width="282" height="222" fill="#C5E5D4" /><circle cx="216" cy="48" r="25" fill="#F8D176" />
        <path d="m0 147 74-82 56 70 52-55 100 89v53H0Z" fill="#93B798" />
        <path d="m0 169 89-58 66 66 56-46 71 59v32H0Z" fill="#587C5F" />
        <path d="M0 192q79-41 145 0t137-2v32H0Z" fill="#D6BA83" />
      </svg>
    </div>
    <div style={{ position: "absolute", top: floorY, left: 0, right: 0, height: 660, background: "linear-gradient(180deg,#C9844E,#9E592F)", boxShadow: "0 -9px 22px #59351d30" }} />
    <div style={{ position: "absolute", top: floorY, left: 0, right: 0, height: 24, background: "linear-gradient(#D99A65,#C9844E)" }} />
  </>
);

const Human: React.FC<{
  frame: number;
  shirt?: string;
  hair?: string;
  style?: React.CSSProperties;
  elderly?: boolean;
  upperBodyOnly?: boolean;
}> = ({ frame, shirt = "#3477C7", hair = "#342B28", style, elderly = false, upperBodyOnly = false }) => {
  const blink = frame % 97 > 80 && frame % 97 < 85 ? 0.08 : 1;
  return (
    <div style={{ position: "absolute", ...style }}>
      <svg width="100%" height="100%" viewBox="0 0 180 360" aria-label="Indian character">
        {!upperBodyOnly && <path d="M51 211h31v123H48zm48 0h31v123H99z" fill="#5D4038" />}
        {!upperBodyOnly && <path d="M39 324h42v22H35zm62 0h42v22H99z" fill="#343C43" />}
        <path d="M33 140q-5-14 3-22l16 8-2 84-17-2zm111-14 17-8q10 9 2 24l-14 62-16-5z" fill="#B77450" />
        <path d="M45 115q45-30 91 0l17 96q-62 34-124 0z" fill={shirt} />
        <rect x="78" y="91" width="25" height="33" rx="9" fill="#C98561" />
        <ellipse cx="90" cy="61" rx="45" ry="53" fill="#C98561" />
        <path d="M45 58Q42 7 90 8q49 1 46 53-19-24-45-24-24 0-46 21Z" fill={hair} />
        <g style={{ transformBox: "fill-box", transformOrigin: "center", transform: `scaleY(${blink})` }}>
          <ellipse cx="74" cy="63" rx="4" ry="6" fill="#302824" />
          <ellipse cx="106" cy="63" rx="4" ry="6" fill="#302824" />
        </g>
        {elderly && <g fill="none" stroke="#57443A" strokeWidth="3"><circle cx="73" cy="64" r="12" /><circle cx="108" cy="64" r="12" /><path d="M85 64h11" /></g>}
        <path d="M79 88q11 7 22-1" fill="none" stroke="#8F4D3D" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};

const PowerIcon: React.FC = () => (
  <svg width="35" height="35" viewBox="0 0 35 35" aria-label="Power button">
    <path d="M10 10a13 13 0 1 0 15 0M17.5 5v13" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const Monitor: React.FC<{ value: string; style?: React.CSSProperties; small?: boolean }> = ({ value, style, small = false }) => (
  <div style={{ position: "absolute", width: small ? 282 : 390, height: small ? 234 : 322, padding: small ? 15 : 21, boxSizing: "border-box", borderRadius: 32, background: "linear-gradient(145deg,#fff,#E8ECEA)", boxShadow: "0 20px 28px #352a2530,inset 0 -9px #C8CECC", ...style }}>
    <div style={{ height: small ? 142 : 220, display: "grid", placeItems: "center", borderRadius: 19, background: "#CAD9D0", color: "#263B36", font: `900 ${small ? 52 : 75}px ${FONT}`, letterSpacing: -3, boxShadow: "inset 0 5px 9px #768a8025" }}>{value}</div>
    <div style={{ display: "flex", justifyContent: "center", paddingTop: small ? 10 : 14 }}>
      <div style={{ width: small ? 54 : 67, height: small ? 43 : 48, display: "grid", placeItems: "center", borderRadius: 999, background: BLUE, boxShadow: "0 4px 0 #24479A" }}><PowerIcon /></div>
    </div>
  </div>
);

const Scene1: React.FC<{ frame: number; duration: number }> = ({ frame, duration }) => {
  const switchFrame = duration / 2;
  const transition = interpolate(frame, [switchFrame - 20, switchFrame + 16], [0, 1], clamp);
  return (
    <Canvas frame={frame} background={transition < 0.5 ? "#F7E5D1" : PEACH} bokeh={transition >= 0.5}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - transition }}><Room />
        <Human frame={frame} upperBodyOnly style={{ top: 655, left: 130, width: 350, height: 610 }} />
        <div style={{ position: "absolute", zIndex: 4, left: 76, top: 1025, width: 670, height: 24, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg,#D99A65,#A85F35)", boxShadow: "0 9px 18px #59351d35" }} />
        <div style={{ position: "absolute", zIndex: 4, left: 95, top: 1049, width: 632, height: 76, background: "linear-gradient(180deg,#A85F35,#8C4B2C)" }} />
        <Question style={{ top: 670, left: 360 }} />
        <div style={{ position: "absolute", zIndex: 6, left: 350, top: 1287, width: 192, height: 108, borderRadius: 25, background: "linear-gradient(145deg,#70A8F5,#3568C8)", boxShadow: "0 12px 0 #234889,0 24px 24px #3e251b2c" }} />
        <svg style={{ position: "absolute", zIndex: 6, left: 495, top: 1310, width: 200, height: 150 }} viewBox="0 0 200 150" aria-label="Monitor tube"><path d="M12 12c-6 79 65 124 120 86 31-22 26-61 61-61" fill="none" stroke="#252B2D" strokeWidth="10" strokeLinecap="round" /></svg>
        <Monitor value="120 / 80" style={{ zIndex: 7, top: 1235, right: 52 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: transition }}>
        <Question style={{ top: 350, left: 495, transform: `translateY(${Math.sin(frame / 11) * 9}px)` }} />
        <NumberBlock value="120" color={CORAL} frame={frame} style={{ left: 325, top: 590 }} />
        <NumberBlock value="80" color={BLUE} frame={frame} style={{ left: 325, top: 1040 }} />
      </div>
    </Canvas>
  );
};

const ClinicClock: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", top: 215, left: 72, width: 106, height: 106, borderRadius: "50%", background: "#fff", border: "9px solid #D7C6A7", boxShadow: "0 7px 14px #3332" }}>
    <div style={{ position: "absolute", left: 47, top: 18, width: 5, height: 37, borderRadius: 4, background: "#4A4540", transform: `rotate(${(frame / 30) * 6}deg)`, transformOrigin: "bottom" }} />
    <div style={{ position: "absolute", left: 49, top: 49, width: 29, height: 4, borderRadius: 4, background: "#4A4540", transform: "rotate(25deg)", transformOrigin: "left" }} />
    <div style={{ position: "absolute", left: 47, top: 47, width: 10, height: 10, borderRadius: "50%", background: CORAL }} />
  </div>
);

const Cross: React.FC = () => (
  <div style={{ position: "absolute", top: 270, right: 93, width: 112, height: 112, borderRadius: 28, display: "grid", placeItems: "center", background: "#4AA078", boxShadow: "0 10px 20px #255a3e35" }}>
    <svg width="68" height="68" viewBox="0 0 68 68" aria-label="Medical cross"><path d="M25 5h18v20h20v18H43v20H25V43H5V25h20Z" fill="#fff" /></svg>
  </div>
);

const Heart: React.FC<{ frame: number; style?: React.CSSProperties; color?: string }> = ({ frame, style, color = "#ED3348" }) => {
  const beat = 1 + Math.max(0, Math.sin((frame % 42) / 42 * Math.PI * 2)) * 0.07;
  return (
    <svg style={{ position: "absolute", overflow: "visible", transform: `scale(${beat})`, ...style }} width="330" height="360" viewBox="0 0 330 360" aria-label="Pumping anatomical heart">
      <path d="M158 101c-34-69 7-95 34-90 30 5 35 35 35 64l42-4c-9 37-30 65-48 83l38 23c-15 17-32 31-49 37-8 43-34 95-75 117-37-22-78-84-83-134-36-14-58-42-49-75 13-43 71-45 99-16 17-20 38-25 56-17Z" fill={color} stroke="#8F1D31" strokeWidth="9" />
      <path d="M159 106c7 31 16 62 25 86m44-113c-13 34-18 68-17 108M96 124c27 11 47 35 60 68m50 6c-17 20-29 46-37 74" fill="none" stroke="#FF8A83" strokeWidth="17" strokeLinecap="round" opacity=".8" />
      <path d="M190 13c-4-55 1-87 20-116m27 110c12-48 22-70 47-91m-93 91c-17-37-29-58-57-75" fill="none" stroke="#C7233D" strokeWidth="25" strokeLinecap="round" />
      <path d="M190 13c-4-55 1-87 20-116m27 110c12-48 22-70 47-91m-93 91c-17-37-29-58-57-75" fill="none" stroke="#F35C62" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
};

const Scene2: React.FC<{ frame: number; duration: number }> = ({ frame, duration }) => {
  const half = duration / 2;
  const second = interpolate(frame, [half - 12, half + 16], [0, 1], clamp);
  const mercury = interpolate(frame, [30, half - 20], [0.2, 0.82], clamp);
  return (
    <Canvas frame={frame} background={second > 0.5 ? "#2B0B17" : "#E8F5E9"} bokeh={false}>
      {second < 1 ? <div style={{ position: "absolute", inset: 0, opacity: 1 - second }}>
        <ClinicClock frame={frame} /><Cross />
        <Pill style={{ position: "absolute", top: 445, left: 80 }} color="#fff">mmHg</Pill>
        <div style={{ position: "absolute", top: 520, left: 250, width: 220, height: 1040, borderRadius: "65px 65px 45px 45px", background: "linear-gradient(90deg,#D3D3C9,#fff 28%,#E9E8DD)", boxShadow: "18px 24px 30px #15251c30,inset -12px 0 15px #8f96895c" }}>
          <div style={{ position: "absolute", top: 40, left: 89, width: 42, height: 840, borderRadius: 24, background: "#542D25", boxShadow: "inset 0 0 0 5px #34221f" }}>
            <div style={{ position: "absolute", bottom: 0, left: 8, right: 8, height: `${mercury * 100}%`, borderRadius: 18, background: "linear-gradient(90deg,#AD151B,#FA5550,#C4161C)", boxShadow: "0 0 24px #F43D4080" }} />
            {Array.from({ length: 16 }, (_, index) => <div key={index} style={{ position: "absolute", left: 47, top: index * 51, width: index % 5 === 0 ? 45 : 28, height: 4, background: "#615E56" }} />)}
            {[0, 50, 100, 150, 200, 250, 300].map((number, index) => <span key={number} style={{ position: "absolute", left: 101, top: 835 - index * 140, color: "#57564E", font: `700 18px ${FONT}` }}>{number}</span>)}
          </div>
          <div style={{ position: "absolute", bottom: 45, left: 40, width: 138, height: 78, borderRadius: "50% 45% 45% 50%", background: "linear-gradient(145deg,#333,#101010)", boxShadow: "inset 0 8px #ffffff20" }}>
            <div style={{ position: "absolute", left: 50, top: -18, width: 45, height: 30, borderRadius: 10, background: "#292929" }} />
          </div>
        </div>
        <Pill style={{ position: "absolute", right: 72, bottom: 250 }} color="#F8FCF8">0 – 300</Pill>
      </div> : null}
      <div style={{ position: "absolute", inset: 0, opacity: second }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1080 1920" aria-label="Branching arteries">
          <g fill="none" stroke="#8D1C2C" strokeWidth="28" strokeLinecap="round" opacity=".78">
            <path d="M541 900C440 720 445 540 330 360M541 900c75-220 65-395 215-560M546 1030c-198-30-295-214-448-248M550 1050c211-2 310-176 490-207M536 1110c-40 174-186 290-221 507m248-495c74 168 209 286 246 480" />
          </g>
          <g fill="none" stroke="#E54750" strokeWidth="9" strokeLinecap="round">
            <path d="M541 900C440 720 445 540 330 360M541 900c75-220 65-395 215-560M546 1030c-198-30-295-214-448-248M550 1050c211-2 310-176 490-207M536 1110c-40 174-186 290-221 507m248-495c74 168 209 286 246 480" />
          </g>
        </svg>
        <Heart frame={frame} style={{ left: 375, top: 760 }} />
        <Pill style={{ position: "absolute", left: 421, bottom: 315, color: "#70202A" }}>arteries</Pill>
      </div>
    </Canvas>
  );
};

const Scene3: React.FC<{ frame: number }> = ({ frame }) => {
  const mercury = interpolate(frame, [0, 300], [0.08, 0.78], clamp);
  const sys = interpolate(frame, [75, 112], [190, 0], clamp);
  const dia = interpolate(frame, [150, 190], [180, 0], clamp);
  const scaleTop = 516;
  const tickSpacing = 77;
  return (
    <Canvas frame={frame}>
      <Heart frame={frame} style={{ left: 90, top: 630, width: 320, height: 350 }} />
      <div style={{ position: "absolute", left: 375, top: 755, width: 410, height: 152, borderRadius: 80, background: "linear-gradient(180deg,#E99082aa,#C93A50bb)", border: "7px solid #F8B5A7", boxShadow: "0 16px 24px #732a252e,inset 0 10px 15px #fff5" }}>
        {Array.from({ length: 9 }, (_, index) => <div key={index} style={{ position: "absolute", left: `${8 + index * 11}%`, top: 48 + Math.sin((frame + index * 10) / 10) * 28, width: 29, height: 20, borderRadius: "50%", background: "#D7283B", boxShadow: "0 0 14px #EA283C" }} />)}
        <div style={{ position: "absolute", left: 35, top: -55, width: 8, height: 45, background: CORAL, transform: "rotate(-25deg)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -52, width: 8, height: 44, background: CORAL, transform: "rotate(20deg)" }} />
      </div>
      <div style={{ position: "absolute", left: 455, top: 680, color: "#BE3340", font: `900 48px ${FONT}`, transform: `translateX(${Math.sin(frame / 6) * 12}px)` }}>› › ›</div>
      <div style={{ position: "absolute", top: 470, right: 150, width: 190, height: 900, borderRadius: 90, background: "linear-gradient(90deg,#C9D2D1,#fff 40%,#E6EAE8)", boxShadow: "0 18px 34px #50342e36,inset -12px 0 10px #7f868433" }}>
        <div style={{ position: "absolute", top: 46, left: 68, width: 54, height: 806, borderRadius: 30, background: "#682D29" }}>
          <div style={{ position: "absolute", bottom: 0, left: 9, right: 9, height: `${mercury * 100}%`, borderRadius: 24, background: "linear-gradient(90deg,#C71928,#FF514C,#C71928)", boxShadow: "0 0 20px #F63445" }} />
          {Array.from({ length: 11 }, (_, i) => <div key={i} style={{ position: "absolute", left: 61, top: i * tickSpacing, width: i % 2 === 0 ? 37 : 22, height: 4, background: "#625A56" }} />)}
          {[200, 160, 120, 80, 40, 0].map((value) => {
            const tickIndex = (200 - value) / 20;
            return <span key={value} style={{ position: "absolute", left: 103, top: tickIndex * tickSpacing - 9, color: "#58514c", font: `700 17px ${FONT}` }}>{value}</span>;
          })}
        </div>
      </div>
      <div style={{ position: "absolute", top: scaleTop + 4 * tickSpacing, right: 364, width: 220, height: 5, background: CORAL, transform: `translateX(${sys}px)`, boxShadow: "0 0 10px #F05C58" }}>
        <Pill color={CORAL} style={{ position: "absolute", right: -15, top: -25, color: "#fff" }}>systolic 120</Pill>
      </div>
      <div style={{ position: "absolute", top: scaleTop + 6 * tickSpacing, right: 364, width: 220, height: 5, background: BLUE, transform: `translateX(${dia}px)`, boxShadow: "0 0 10px #315FCB" }}>
        <Pill color={BLUE} style={{ position: "absolute", right: -15, top: -25, color: "#fff" }}>80</Pill>
      </div>
      <Pill style={{ position: "absolute", top: 1420, right: 170 }}>mmHg</Pill>
    </Canvas>
  );
};

const CATEGORIES = [
  { name: "Normal", sys: "< 120", dia: "< 80", color: "#4BA777", dark: "#328257" },
  { name: "Elevated", sys: "120–129", dia: "< 80", color: "#E8B83D", dark: "#C58F21" },
  { name: "Stage 1", sys: "130–139", dia: "80–89", color: "#F08A42", dark: "#D86B2B" },
  { name: "Stage 2", sys: "140+", dia: "90+", color: "#E85954", dark: "#C94040" },
];

const Tower: React.FC<{ frame: number; animated?: boolean; rightInset?: number }> = ({ frame, animated = true, rightInset = 52 }) => {
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 52, right: rightInset, top: 350, height: 1220, display: "flex", flexDirection: "column-reverse", justifyContent: "space-between" }}>
      {CATEGORIES.map((item, index) => {
        const progress = animated ? popIn(frame, fps, index * 9) : 1;
        const beat = index === 2 && !animated ? 1 + Math.sin(frame / 7) * 0.025 : 1;
        return (
          <div key={item.name} style={{ position: "relative", height: 255, display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr", alignItems: "center", padding: "0 26px", borderRadius: 36, color: "#fff", background: `linear-gradient(145deg,${item.color},${item.dark})`, boxShadow: "0 18px 0 #4930202c,0 27px 35px #49302026,inset 0 9px #ffffff50", transform: `translateY(${(1 - progress) * 900}px) scale(${beat})`, opacity: Math.min(1, progress + 0.15) }}>
            <span style={{ font: `900 32px ${FONT}`, textShadow: "0 2px 3px #55332255" }}>{item.name}</span>
            <span style={{ justifySelf: "center", font: `900 33px ${FONT}` }}>{item.sys}</span>
            <span style={{ justifySelf: "center", font: `900 33px ${FONT}` }}>{item.dia}</span>
            <div style={{ position: "absolute", inset: "12px 16px auto", height: 10, borderRadius: 12, background: "#ffffff48" }} />
          </div>
        );
      })}
    </div>
  );
};

const Scene4: React.FC<{ frame: number }> = ({ frame }) => <Canvas frame={frame}><Tower frame={frame} /></Canvas>;

const Tile: React.FC<{ value: string; color: string; frame: number; delay: number; style?: React.CSSProperties }> = ({ value, color, frame, delay, style }) => {
  const { fps } = useVideoConfig();
  const progress = popIn(frame, fps, delay);
  return <div style={{ position: "absolute", width: 160, height: 120, display: "grid", placeItems: "center", borderRadius: 28, background: `linear-gradient(145deg,${color === CORAL ? "#FF897D" : "#7092FF"},${color})`, color: "#fff", font: `900 48px ${FONT}`, boxShadow: "0 13px 0 #202b4852,0 18px 24px #40292135,inset 0 7px #ffffff55", transform: `translateY(${(1 - progress) * -1200}px)`, ...style }}>{value}</div>;
};

const Scene5: React.FC<{ frame: number }> = ({ frame }) => (
  <Canvas frame={frame}>
    <Tower frame={frame} animated={false} rightInset={230} />
    <Tile value="125" color={CORAL} frame={frame} delay={20} style={{ left: 868, top: 1060 }} />
    <Tile value="85" color={BLUE} frame={frame} delay={65} style={{ left: 868, top: 735 }} />
    <div style={{ position: "absolute", left: 40, right: 40, top: 670, height: 255, borderRadius: 40, border: "8px solid #FFF2A5", boxShadow: "0 0 38px #FFDC62, inset 0 0 32px #fff8" }} />
  </Canvas>
);

const Clipboard: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", boxSizing: "border-box", borderRadius: 28, padding: "72px 38px 35px", background: "linear-gradient(140deg,#A96B3D,#87512F)", boxShadow: "0 20px 30px #4a2d2440,inset 0 3px #ffffff30", ...style }}>
    <div style={{ position: "absolute", top: 20, left: "50%", width: 96, height: 34, borderRadius: "8px 8px 16px 16px", background: "linear-gradient(#DEE0DA,#969B96)", transform: "translateX(-50%)", boxShadow: "0 3px 4px #473c34" }} />
    <div style={{ height: "100%", borderRadius: 13, background: "#FFF7E9", boxShadow: "inset 0 2px 7px #70451d20" }}>{children}</div>
  </div>
);

const Scene6: React.FC<{ frame: number; duration: number }> = ({ frame, duration }) => {
  const second = interpolate(frame, [duration / 2 - 18, duration / 2 + 18], [0, 1], clamp);
  const clothes = ["#377BC5", "#39AFA0", "#F5C649", "#E6AA65", "#7148A9"];
  return (
    <Canvas frame={frame}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - second }}>
        {clothes.map((shirt, index) => <Human key={index} frame={frame} shirt={shirt} hair={index === 2 ? "#ECE8DC" : "#302722"} elderly={index === 2} style={{ left: 20 + index * 207, top: 480 + (index % 2) * 25, width: 200, height: 440 }} />)}
        <Clipboard style={{ top: 1050, left: 120, width: 840, height: 600, transform: `rotate(${Math.sin(frame / 22) * 1.2}deg)` }}>
          <div style={{ padding: "66px 24px", textAlign: "center", color: "#534537", font: `900 42px ${FONT}` }}>NFHS-5 Survey - India</div>
          {[0, 1, 2].map((row) => <div key={row} style={{ display: "flex", alignItems: "center", gap: 24, margin: "24px 52px", color: "#3E9B5E", font: `900 42px ${FONT}` }}><span style={{ width: 45, height: 45, border: "4px solid #55A66D", borderRadius: 9, textAlign: "center", lineHeight: "39px" }}>✓</span><span style={{ height: 5, width: 360, background: "#D4C5AB" }} /></div>)}
        </Clipboard>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: second }}>
        <Monitor value="110/80" small style={{ left: 85, top: 540 }} />
        <div style={{ position: "absolute", top: 620, left: 510, color: "#634C3D", font: `900 52px ${FONT}` }}>vs</div>
        <Monitor value="148/92" small style={{ right: 85, top: 540 }} />
        <Clipboard style={{ top: 990, left: 130, width: 820, height: 520 }}>
          <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#534537", textAlign: "center", font: `900 43px/1.3 ${FONT}` }}>
            <div>Diagnosis:</div><div style={{ color: CORAL, fontSize: 56 }}>High BP?</div>
          </div>
        </Clipboard>
      </div>
    </Canvas>
  );
};

const Plant: React.FC = () => (
  <svg style={{ position: "absolute", right: 55, top: 980, width: 190, height: 340 }} viewBox="0 0 190 340" aria-label="Potted plant">
    <path d="M94 288V112m0 114c-56-20-64-58-58-85 39 4 60 32 58 85m1-39c48-6 66-39 62-67-36 8-58 27-62 67m-1 88c-43-13-57-39-55-64 32 6 52 21 55 64" fill="none" stroke="#327D4A" strokeWidth="13" strokeLinecap="round" />
    <path d="m44 273 102 0-15 63H58Z" fill="#B96143" /><path d="M38 270h114v16H38Z" fill="#D98256" />
  </svg>
);

const SidePerson: React.FC<{ upright: boolean; frame: number }> = ({ upright, frame }) => {
  const headX = upright ? 180 : 240;
  const torso = upright
    ? "M137 165Q196 145 262 174l17 165q-67 29-134 0Z"
    : "M156 167Q220 176 299 230l-36 125q-64 4-124-29Z";
  return (
    <svg style={{ position: "absolute", left: 270, top: 790, width: 500, height: 600 }} viewBox="0 0 500 600" aria-label={upright ? "Sitting upright" : "Slouching while seated"}>
      <path d="M112 178v397m170-169v169m-170-169h170m-170-98H83" fill="none" stroke="#80502F" strokeWidth="20" strokeLinecap="round" />
      {upright ? (
        <>
          <path d="M190 337 242 410l-6 166m-21-239 77 63-6 176" fill="none" stroke="#5C473B" strokeWidth="29" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M236 576h38q16 0 20 24h-58Zm48 0h8q16 0 20 24h-34Z" fill="#343C43" />
        </>
      ) : (
        <>
          <path d="M180 338Q270 365 318 410l-58 73-49-18m-16-123Q255 390 315 440l-55 80-48 0" fill="none" stroke="#5C473B" strokeWidth="29" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M211 465h-42q-18 0-22 14h64Zm1 55h48q17 0 22 14h-70Z" fill="#343C43" />
        </>
      )}
      <path d={torso} fill="#367BC4" />
      <circle cx={headX} cy={upright ? 112 : 145} r="53" fill="#BE7957" />
      <path d={upright ? "M130 112q8-67 60-57 43 8 47 57-30-28-65-28-22 0-42 28Z" : "M190 143q8-67 60-57 43 8 47 57-30-28-65-28-22 0-42 28Z"} fill="#302824" />
      <g style={{ transformBox: "fill-box", transformOrigin: "center", transform: `scaleY(${frame % 91 > 78 ? 0.08 : 1})` }}>
        <ellipse cx={headX - 18} cy={upright ? 116 : 149} rx="5" ry="7" fill="#302824" />
        <ellipse cx={headX + 17} cy={upright ? 116 : 149} rx="5" ry="7" fill="#302824" />
      </g>
      {!upright && <path d="M277 390q-52 35-107 8" fill="none" stroke="#3B302B" strokeWidth="14" strokeLinecap="round" />}
    </svg>
  );
};

const Scene7: React.FC<{ frame: number; duration: number }> = ({ frame, duration }) => {
  const correct = interpolate(frame, [duration / 2 - 12, duration / 2 + 14], [0, 1], clamp);
  return (
    <Canvas frame={frame} background="#F6E1CC" bokeh={false}>
      <Room floorY={1390} />
      <div style={{ position: "absolute", top: 150, left: 80, width: 90, height: 90, borderRadius: "50%", background: "#FFF9EF", border: "8px solid #A8794E", boxShadow: "0 8px 14px #503a2825" }}>
        <div style={{ position: "absolute", left: 41, top: 15, width: 5, height: 30, background: "#5B4532", transform: `rotate(${frame / 5}deg)`, transformOrigin: "bottom" }} />
        <div style={{ position: "absolute", left: 42, top: 41, width: 28, height: 4, background: "#5B4532", transform: "rotate(30deg)", transformOrigin: "left" }} />
      </div>
      <div style={{ position: "absolute", top: 1048, left: 100, width: 18, height: 260, background: "#80512F" }} />
      <div style={{ position: "absolute", top: 1048, left: 792, width: 18, height: 260, background: "#80512F" }} />
      <Monitor value="BP" small style={{ left: 92, top: 755, width: 260, height: 215 }} />
      <Plant />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - correct }}><SidePerson upright={false} frame={frame} />
        <div style={{ position: "absolute", left: 700, top: 875, width: 116, height: 116, display: "grid", placeItems: "center", border: "10px solid #E54347", borderRadius: "50%", color: "#E54347", font: `900 80px ${FONT}`, background: "#fff9" }}>×</div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: correct }}><SidePerson upright frame={frame} />
        <Pill style={{ position: "absolute", left: 390, top: 775 }} color="#fff">126/82</Pill>
        <Pill style={{ position: "absolute", left: 590, top: 775 }} color="#fff">124/80</Pill>
      </div>
      <div style={{ position: "absolute", left: 75, top: 1020, width: 760, height: 28, borderRadius: "7px 7px 0 0", background: "linear-gradient(180deg,#B37B4D,#84532F)", boxShadow: "0 12px 0 #654021" }} />
      <div style={{ position: "absolute", left: 100, top: 1048, width: 710, height: 76, background: "linear-gradient(180deg,#A96F43,#84512F)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: correct }}>
        <svg style={{ position: "absolute", left: 520, top: 983, width: 175, height: 80 }} viewBox="0 0 175 80" aria-label="Blood pressure cuff at heart level">
          <path d="M18 29q52 17 140 17" fill="none" stroke="#BE7957" strokeWidth="22" strokeLinecap="round" />
          <rect x="45" y="2" width="39" height="54" rx="10" fill="#26394C" />
          <path d="M42 29h45" stroke="#E7EAEC" strokeWidth="4" />
          <path d="M64 22c-11-11-22 1 0 18 21-17 11-29 0-18Z" fill="#F05C58" />
        </svg>
      </div>
    </Canvas>
  );
};

const Book: React.FC<{ color: string; title: string; style?: React.CSSProperties }> = ({ color, title, style }) => (
  <div style={{ position: "absolute", width: 355, height: 520, borderRadius: "22px 14px 14px 22px", background: `linear-gradient(90deg,#332b2b 0 14px,${color} 14px 100%)`, boxShadow: "14px 20px 0 #4a2c2533,22px 28px 28px #452c2935,inset 12px 0 #ffffff35", transform: "perspective(900px) rotateY(-8deg)", ...style }}>
    <div style={{ position: "absolute", inset: "22px 20px 22px 35px", border: "2px solid #ffffff85", borderRadius: 9, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", textAlign: "center", font: `900 36px/1.25 ${FONT}` }}>
      <svg width="78" height="72" viewBox="0 0 78 72" aria-label="Heart icon"><path d="M39 65 8 36C-5 19 7 1 22 5c8 2 13 9 17 16C44 14 50 6 59 5c15-2 24 16 11 31Z" fill="#fff" /></svg>
      <span style={{ marginTop: 24 }}>{title}</span>
    </div>
  </div>
);

const Scene8: React.FC<{ frame: number }> = ({ frame }) => (
  <Canvas frame={frame}>
    <NumberBlock value="120" color={CORAL} frame={frame} bounce style={{ left: 105, top: 365, width: 405 }} />
    <NumberBlock value="80" color={BLUE} frame={frame} bounce style={{ left: 570, top: 365, width: 405 }} />
    <Book color="#D94A44" title="AHA Guideline" style={{ left: 120, top: 1085 }} />
    <Book color="#315FCB" title="ACC Guideline" style={{ right: 115, top: 1085 }} />
  </Canvas>
);

const SceneLayer: React.FC<{ scene: number; duration: number }> = ({ scene, duration }) => {
  const frame = useCurrentFrame();
  switch (scene) {
    case 0: return <Scene1 frame={frame} duration={duration} />;
    case 1: return <Scene2 frame={frame} duration={duration} />;
    case 2: return <Scene3 frame={frame} />;
    case 3: return <Scene4 frame={frame} />;
    case 4: return <Scene5 frame={frame} />;
    case 5: return <Scene6 frame={frame} duration={duration} />;
    case 6: return <Scene7 frame={frame} duration={duration} />;
    case 7: return <Scene8 frame={frame} />;
    default: throw new Error(`Unknown BP 120/80 scene: ${scene}`);
  }
};

export const BP12080Explainer: React.FC = () => (
  <>
    {SCENE_DURATIONS.map((durationInFrames, index) => (
      <Sequence key={`scene-${index + 1}`} from={SCENE_STARTS[index]} durationInFrames={durationInFrames} name={`Scene ${index + 1}`}>
        <SceneLayer scene={index} duration={durationInFrames} />
      </Sequence>
    ))}
    {SCENE_STARTS.map((from, index) => (
      <Sequence key={`voiceover-${index + 1}`} from={from} durationInFrames={Math.ceil(AUDIO_SECONDS[index] * 30)} name={`Voiceover ${index + 1}`}>
        <Audio src={staticFile(`audio/bp12080/s${index + 1}.mp3`)} volume={1} />
      </Sequence>
    ))}
  </>
);
