export type ShareCardData = {
  streakDays: number;
  todayCompleted: number;
  todayTotal: number;
  examLabel: string;
  daysLeft: number;
  vocabularyLevel: string;
};

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawShareCard(canvas: HTMLCanvasElement, data: ShareCardData) {
  const width = 800;
  const height = 420;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dark = document.documentElement.classList.contains("dark");
  const background = dark ? "#171722" : "#ffffff";
  const foreground = dark ? "#e6e8ee" : "#14171f";
  const muted = dark ? "#8a8f9e" : "#737a88";
  const brand = "#4f6df5";
  const brandSoft = dark ? "#202946" : "#e9edff";

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = brandSoft;
  roundedRect(ctx, 48, 48, 96, 96, 24);
  ctx.fill();
  ctx.fillStyle = brand;
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("M", 96, 100);

  ctx.textAlign = "left";
  ctx.fillStyle = foreground;
  ctx.font = "bold 32px sans-serif";
  ctx.fillText("Metis", 168, 82);
  ctx.fillStyle = muted;
  ctx.font = "16px sans-serif";
  ctx.fillText("四六级督学学习工作台", 168, 112);

  ctx.textAlign = "center";
  ctx.fillStyle = foreground;
  ctx.font = "bold 96px sans-serif";
  ctx.fillText(String(data.streakDays), width / 2, 250);
  ctx.fillStyle = muted;
  ctx.font = "20px sans-serif";
  ctx.fillText("连续学习天数", width / 2, 308);

  const stats = [
    {
      label: "今日完成",
      value: `${data.todayCompleted}/${data.todayTotal}`,
    },
    { label: `${data.examLabel}倒计时`, value: `${data.daysLeft} 天` },
    { label: "词汇水平", value: data.vocabularyLevel },
  ];
  const gap = 24;
  const cardWidth = (width - 96 - gap * 2) / 3;
  stats.forEach((stat, index) => {
    const x = 48 + index * (cardWidth + gap);
    const y = 348;
    ctx.fillStyle = brandSoft;
    roundedRect(ctx, x, y, cardWidth, 68, 16);
    ctx.fill();
    ctx.fillStyle = brand;
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(stat.value, x + cardWidth / 2, y + 30);
    ctx.fillStyle = muted;
    ctx.font = "14px sans-serif";
    ctx.fillText(stat.label, x + cardWidth / 2, y + 54);
  });
}
