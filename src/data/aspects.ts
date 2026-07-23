export const aspectIds = [
	"lantern",
	"forge",
	"edge",
	"winter",
	"heart",
	"grail",
	"moth",
	"knock",
	"secretHistories",
] as const;

export type AspectId = (typeof aspectIds)[number];

export type Aspect = {
	id: AspectId;
	zh: string;
	meaning: string;
	color: string;
	iconAverage: string;
	textColor: string;
	icon: string;
	hidden?: boolean;
};

export const aspects: Aspect[] = [
	{
		id: "lantern",
		zh: "灯",
		meaning: "“生命是束纯净的火焰，我们内心都拥有一颗无形的太阳。”",
		color: "#e0d23f",
		iconAverage: "#837500",
		textColor: "#1d1b05",
		icon: "/assets/aspects/lantern.png",
	},
	{
		id: "forge",
		zh: "铸",
		meaning: "“火是严冬，却是带有温度。火是暖春，却会耗尽一切。”",
		color: "#d4772e",
		iconAverage: "#7a441e",
		textColor: "#190c03",
		icon: "/assets/aspects/forge.png",
	},
	{
		id: "edge",
		zh: "刃",
		meaning: "一切征服都在刃处开始。有一位居于此处者目盲。另一位强力无匹。第三位我们从不提起。",
		color: "#b5b545",
		iconAverage: "#676923",
		textColor: "#151504",
		icon: "/assets/aspects/edge.png",
	},
	{
		id: "winter",
		zh: "冬",
		meaning: "……",
		color: "#95c8d2",
		iconAverage: "#67828b",
		textColor: "#061012",
		icon: "/assets/aspects/winter.png",
	},
	{
		id: "heart",
		zh: "心",
		meaning: "为了保护我们所知世界的表皮，不息之心无尽地搏动着。",
		color: "#c6576d",
		iconAverage: "#72383f",
		textColor: "#19070b",
		icon: "/assets/aspects/heart.png",
	},
	{
		id: "grail",
		zh: "杯",
		meaning: "“食、色、性，有溺而无还者也。”",
		color: "#b53a31",
		iconAverage: "#712b23",
		textColor: "#180504",
		icon: "/assets/aspects/grail.png",
	},
	{
		id: "moth",
		zh: "蛾",
		meaning: "我知道有一个人会将蛾子捉来关在玻璃罩下。然后在如今夜一般的夜晚，将它们逐个放出，令其死于火烛。",
		color: "#b8ad90",
		iconAverage: "#75715e",
		textColor: "#15110a",
		icon: "/assets/aspects/moth.png",
	},
	{
		id: "knock",
		zh: "启",
		meaning: "启不允许封闭和孤立存在。它欢快地将我们推出无知的庇护。",
		color: "#9c55d4",
		iconAverage: "#562577",
		textColor: "#100518",
		icon: "/assets/aspects/knock.png",
	},
	{
		id: "secretHistories",
		zh: "秘史",
		meaning: "并行历史、隐秘路径、树林中的岔路与叙事的不确定性。",
		color: "#bd4eb3",
		iconAverage: "#82227b",
		textColor: "#170516",
		icon: "/assets/aspects/secretHistories.png",
		hidden: true,
	},
];

export const visibleAspects = aspects.filter((aspect) => !aspect.hidden);

export const aspectById = Object.fromEntries(
	aspects.map((aspect) => [aspect.id, aspect]),
) as Record<AspectId, Aspect>;

export function isAspectId(value: string): value is AspectId {
	return (aspectIds as readonly string[]).includes(value);
}

export function resolveAspects(values: string[] | undefined): Aspect[] {
	const ids = values?.filter(isAspectId) ?? [];
	if (ids.length === 0) return [];
	return ids.map((id) => aspectById[id]);
}
