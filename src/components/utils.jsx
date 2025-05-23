export function saveRecentDecks(deck) {
  const savedDecks = JSON.parse(localStorage.getItem('recentDecks')) || [];

  const isExist = savedDecks.some((d) => d.deck.id === deck.deck.id);
  
  if (isExist) {

    const updatedDecks = savedDecks.filter((d) => d.deck.id !== deck.deck.id);
    const newDecks = [deck, ...updatedDecks].slice(0, 4); 
    localStorage.setItem('recentDecks', JSON.stringify(newDecks));
    console.log("Updated decks:", newDecks);
  } else {

    const newDecks = [deck, ...savedDecks].slice(0, 4);
    localStorage.setItem('recentDecks', JSON.stringify(newDecks));
    console.log("Added new deck:", newDecks);
  }
}
