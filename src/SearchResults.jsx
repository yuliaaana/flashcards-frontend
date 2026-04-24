import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from './components/homepage/Header';
import './styles/homepage.css';
import { useTranslation } from "react-i18next";
import "./i18n";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("home");

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userId = localStorage.getItem('user_id');

    // Fetch all public decks and filter by query
    fetch(`http://127.0.0.1:5000/api/public-decks/${userId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch public decks");
        return response.json();
      })
      .then((data) => {
        console.log("Fetched public decks:", data);
        if (data.public_decks && Array.isArray(data.public_decks)) {
          const searchTerm = trimmedQuery.toLowerCase();
          const filtered = data.public_decks.filter(deck => {
            const nameMatch = deck.name && deck.name.toLowerCase().includes(searchTerm);
            const descMatch = deck.description && deck.description.toLowerCase().includes(searchTerm);
            return nameMatch || descMatch;
          });
          console.log(`Search for "${trimmedQuery}" found ${filtered.length} results`);
          setResults(filtered);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching public decks:', error);
        setResults([]);
        setLoading(false);
      });
  }, [query]);

  return (
    <>
      <Header />
      <div style={{ padding: '40px 20px', minHeight: '80vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '24px' }}>
            {t("searchResultsFor", "Search Results for")} "<strong>{query.trim()}</strong>"
          </h2>

          {loading ? (
            <p>{t("loading", "Loading...")}</p>
          ) : results.length > 0 ? (
            <div className="card-container">
              {results.map((deck) => (
                <div 
                  key={deck.id} 
                  className="recent-deck-card"
                  onClick={() => navigate(`/deck/${deck.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-content">
                    <h4>{deck.name}</h4>
                    <p className="card-description">{deck.description || t("noDescription", "No description")}</p>
                    <p className="card-meta">
                      {deck.terms} {t("terms", "terms")} • {t("by", "By")} {deck.creator}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
              <p style={{ fontSize: '18px' }}>
                {t("noResultsFound", "No public decks found matching")} "<strong>{query.trim()}</strong>"
              </p>
              <p style={{ fontSize: '14px', marginTop: '16px', color: '#999' }}>
                {t("tryDifferentKeywords", "Try searching with different keywords or browse popular decks on the home page.")}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
