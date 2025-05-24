type Config = {
	teams: {
		name: string;
		members: {
			name: string;
			email: string;
		}[];
	}[];
};

export const config: Config = {
	teams: [
		{
			name: "olympus",
			members: [
				{ name: "zeus", email: "zeus@example.com" },
				{ name: "athena", email: "athena@example.com" },
				{ name: "apollo", email: "apollo@example.com" },
			],
		},
		{
			name: "asgard",
			members: [
				{ name: "thor", email: "thor@example.com" },
				{ name: "freyja", email: "freyja@example.com" },
				{ name: "baldur", email: "baldur@example.com" },
			],
		},
	],
};
