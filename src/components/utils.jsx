/*export function saveRecentDecks(deck) {
  const savedDecks = JSON.parse(localStorage.getItem('recentDecks')) || [];
  
  // Change this line to compare the nested id
  const isExist = savedDecks.some((d) => d.deck.id === deck.deck.id);
  
  if (!isExist) {
    const newDecks = [deck, ...savedDecks].slice(0, 4);
    localStorage.setItem('recentDecks', JSON.stringify(newDecks));
    console.log("Updated decks:", newDecks);
  }
}*/
export function saveRecentDecks(deck) {
  const savedDecks = JSON.parse(localStorage.getItem('recentDecks')) || [];
  
  // Заміни цю лінію, щоб порівняти вкладений id
  const isExist = savedDecks.some((d) => d.deck.id === deck.deck.id);
  
  if (isExist) {
    // Якщо дек вже є, ми переміщаємо його на початок списку
    const updatedDecks = savedDecks.filter((d) => d.deck.id !== deck.deck.id);
    const newDecks = [deck, ...updatedDecks].slice(0, 4); // Зберігаємо тільки 4 останні
    localStorage.setItem('recentDecks', JSON.stringify(newDecks));
    console.log("Updated decks:", newDecks);
  } else {
    // Якщо деки ще нема в списку, додаємо його
    const newDecks = [deck, ...savedDecks].slice(0, 4);
    localStorage.setItem('recentDecks', JSON.stringify(newDecks));
    console.log("Added new deck:", newDecks);
  }
}
