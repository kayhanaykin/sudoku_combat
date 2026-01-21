// services/api.js
export const getTopPlayers = () => {
	return new Promise((resolve) => {
		setTimeout(() => {
			// Sanki veritabanından geliyormuş gibi 10 kişilik liste dönelim
			const mockDatabase = [
				{ id: 1, username: "Ege_K", score: 1500 },
				{ id: 2, username: "Cadet42", score: 1240 },
				{ id: 3, username: "Marvin", score: 980 },
				{ id: 4, username: "Guest_01", score: 450 },
				{ id: 5, username: "Bot_Alpha", score: 320 },
				{ id: 6, username: "NoobMaster", score: 100 }, // Bu ilk 5'e girememeli
				{ id: 7, username: "LatePlayer", score: 50 },
			];
			resolve(mockDatabase);
		}, 1000); // 1 saniye gecikme (internet hızı simülasyonu)
	});
};
