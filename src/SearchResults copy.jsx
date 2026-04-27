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
          const tokens = trimmedQuery.toLowerCase().split(/\s+/).filter(Boolean);
          const filtered = data.public_decks.filter(deck => {
            const name = deck.name ? deck.name.toLowerCase() : '';
            const description = deck.description ? deck.description.toLowerCase() : '';
            return tokens.every(token => name.includes(token) || description.includes(token));
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
      <div className="search-page">
        <div className="search-page-container">
          <div className="search-block">
            <h2 className="title search-title">
              {t("searchResultsFor", "Search Results for")} "<strong>{query.trim()}</strong>"
            </h2>

            {loading ? (
              <p>{t("loading", "Loading...")}</p>
            ) : results.length > 0 ? (
              <div className="search-results-grid">
                {results.map((deck) => (
                  <div
                    key={deck.id}
                    className="search-result-card"
                    onClick={() => navigate(`/deck/${deck.id}`)}
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
              <div className="search-empty-state">
                <p>
                  {t("noResultsFound", "No public decks found matching")} "<strong>{query.trim()}</strong>"
                </p>
                <p>
                  {t("tryDifferentKeywords", "Try searching with different keywords or browse popular decks on the home page.")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
