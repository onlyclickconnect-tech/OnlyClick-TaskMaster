// Dummy development config for frontend-only mode
export const DEV_CONFIG = {
	MOCK_USER: {
		id: 1,
		name: 'John Doe',
		email: 'john@example.com',
		phone: '1234567890',
		avatar: "../../assets/images/onboard3.png",
		stats: { jobs: 5, earnings: 1000 },
	},
	MOCK_STATS: {
		jobs: 5,
		earnings: 1000,
	},
};

export function simulateDelay(ms = 300) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
