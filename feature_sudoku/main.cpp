#include "includes.hpp"

int	main()
{
	std::array<std::array<int, 9>, 9> full_grid;
	std::array<std::array<int, 9>, 9> game_grid;

	sudoku_generator(full_grid);
	print_sudoku(full_grid);
	game_grid = full_grid;
	game_grid[8][6] = 0;
	game_grid[8][7] = 0;
	game_grid[8][8] = 0;
	game_grid[4][6] = 0;
	game_grid[4][7] = 0;
	game_grid[4][8] = 0; 
	game_grid[4][1] = 0;
	game_grid[4][2] = 0;
	game_grid[4][3] = 0;
	game_grid[0] = {}; 
	int count = 0;
	std::cout << "       " << std::endl;
	print_sudoku(game_grid);
	count_solutions(game_grid, count);

	// game_generator(game_grid);
}

// Evet, aynen öyle! Sudoku'yu zor yapan (ve sadece rastgele sayı yerleştirerek çözmeyi imkansız kılan) tam olarak bu durumdur.
// Şu anki hücre için her şey mükemmel görünse bile (yani satır, sütun ve kutu kurallarına uyuyor olsa bile), bu seçim ilerideki bir hücreyi çözülemez hale getirebilir.
// Bunu iki temel sebeple açıklayabiliriz:
// 1. "Çıkmaz Sokak" (Dead-end) Durumu
// Diyelim ki bir hücreye o anki kurallara göre "yasal" olan 5 sayısını yerleştirdiniz. Ancak bu 5 sayısını oraya koyduğunuz için, üç satır aşağıdaki bir hücrenin deneyebileceği tüm sayılar (1'den 9'a kadar) kendi satır veya sütunlarındaki sayılarla çakışır hale gelebilir.
// Bu durumda o hücre için koyabileceğiniz hiçbir sayı kalmaz. Eğer özyineleme (recursion) kullanmazsanız, algoritmanız orada takılır kalır.
// 2. Sudoku'nun Bir Bütün Olması
// Sudoku yerel kurallardan (satır, sütun, kutu) oluşsa da aslında global bir bulmacadır. Bir hücreye koyduğunuz sayı, kelebek etkisi gibi tablonun en uzak köşesindeki bir hücrenin kaderini belirleyebilir.
// Somut Bir Örnek (Basitleştirilmiş)
// Düşünün ki son iki boş hücreniz kaldı:
// Hücre A: Satırında 1 ve 2 eksik.
// Hücre B: Satırında sadece 1 eksik.
// Siz Hücre A'ya gidip "rastgele ve kurallara uygun" diyerek 1 sayısını yerleştirirseniz (çünkü satırında henüz 1 yok), Hücre B'ye geldiğinizde oraya koyacak sayı bulamazsınız (çünkü B'nin olduğu sütunda veya kutuda zaten 1 olmuş olur).
// İşte Recursion (Backtracking) burada devreye girer:
// Hücre B'de sayı kalmadığını fark eder (return false).
// Hücre A'ya geri döner ("Backtrack").
// "Demek ki 1 yanlıştı, şimdi 2'yi deneyelim" der.