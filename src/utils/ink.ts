import {
	type Aspect,
	aspectById,
	isAspectId,
	resolveAspects,
} from "@/data/aspects";

type AspectWeights = Partial<Record<Aspect["id"], number>>;

const hexToRgb = (hex: string) => {
	const clean = hex.replace("#", "");
	return {
		r: Number.parseInt(clean.slice(0, 2), 16),
		g: Number.parseInt(clean.slice(2, 4), 16),
		b: Number.parseInt(clean.slice(4, 6), 16),
	};
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
	`#${[r, g, b]
		.map((value) => Math.round(value).toString(16).padStart(2, "0"))
		.join("")}`;

const clamp = (value: number) => Math.max(0, Math.min(255, value));

const normalizeHue = (hue: number) => {
	const rounded = Math.round(((hue % 360) + 360) % 360);
	return rounded === 360 ? 0 : rounded;
};

const srgbChannelToLinear = (value: number) =>
	value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

export function colorToHue(hex: string): number {
	const { r, g, b } = hexToRgb(hex);
	const red = srgbChannelToLinear(r / 255);
	const green = srgbChannelToLinear(g / 255);
	const blue = srgbChannelToLinear(b / 255);

	const l = Math.cbrt(
		0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue,
	);
	const m = Math.cbrt(
		0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue,
	);
	const s = Math.cbrt(
		0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue,
	);

	const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const labB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

	if (Math.hypot(a, labB) < 0.0001) return 0;

	return normalizeHue((Math.atan2(labB, a) * 180) / Math.PI);
}

function mixWeightedAspects(
	weightedAspects: Array<{ aspect: Aspect; weight: number }>,
) {
	const active = weightedAspects.filter(({ weight }) => weight > 0);
	if (active.length === 0) return aspectById.lantern.color;

	const mixed = active.reduce(
		(acc, { aspect, weight }) => {
			const rgb = hexToRgb(aspect.color);
			return {
				r: acc.r + rgb.r * weight,
				g: acc.g + rgb.g * weight,
				b: acc.b + rgb.b * weight,
				weight: acc.weight + weight,
			};
		},
		{ r: 0, g: 0, b: 0, weight: 0 },
	);

	return rgbToHex({
		r: clamp(mixed.r / mixed.weight),
		g: clamp(mixed.g / mixed.weight),
		b: clamp(mixed.b / mixed.weight),
	});
}

function buildDefaultWeights(aspects: Aspect[]) {
	const [primary, ...secondary] = aspects;
	const secondaryWeight = secondary.length > 0 ? 1 / secondary.length : 0;

	return [
		{ aspect: primary, weight: 6 },
		...secondary.map((aspect) => ({ aspect, weight: secondaryWeight })),
	];
}

export function mixAspects(aspects: Aspect[]) {
	if (aspects.length === 0) return aspectById.lantern.color;

	return mixWeightedAspects(buildDefaultWeights(aspects));
}

export function createInk(
	values: string[] | undefined,
	primaryAspect?: string,
	aspectWeights?: AspectWeights,
) {
	const resolved = resolveAspects(values);
	const weightedResolved = Object.keys(aspectWeights ?? {})
		.filter(isAspectId)
		.map((id) => aspectById[id]);
	const mergedResolved = [...resolved];
	for (const aspect of weightedResolved) {
		if (!mergedResolved.some((item) => item.id === aspect.id)) {
			mergedResolved.push(aspect);
		}
	}
	const primary =
		primaryAspect && isAspectId(primaryAspect)
			? aspectById[primaryAspect]
			: mergedResolved[0];
	const ordered =
		primary && mergedResolved.some((aspect) => aspect.id === primary.id)
			? [
					primary,
					...mergedResolved.filter((aspect) => aspect.id !== primary.id),
				]
			: mergedResolved;
	const aspects = ordered.length > 0 ? ordered : [aspectById.lantern];
	const hasPointWeights = aspects.some(
		(aspect) => (aspectWeights?.[aspect.id] ?? 0) > 0,
	);
	const weightedAspects = hasPointWeights
		? aspects.map((aspect) => ({
				aspect,
				weight: aspectWeights?.[aspect.id] ?? 0,
			}))
		: buildDefaultWeights(aspects);
	const color = mixWeightedAspects(weightedAspects);
	const rgb = hexToRgb(color);
	const rgbValue = `${rgb.r} ${rgb.g} ${rgb.b}`;
	const hue = colorToHue(color);

	return {
		aspects,
		color,
		hue,
		primary: aspects[0],
		rgbValue,
		textColor: aspects[0].textColor,
		style: `--hue: ${hue}; --primary: ${color}; --mansus-ink: ${color}; --mansus-ink-rgb: ${rgbValue}; --mansus-ink-text: ${aspects[0].textColor};`,
	};
}
