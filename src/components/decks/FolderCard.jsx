import { useNavigate } from "react-router-dom";
import "../../styles/folders.css";
import { useTranslation } from "react-i18next";
import "../../i18n";

export default function FolderCard({ className, created_at, name, decks }) {
  const navigate = useNavigate();
  const formattedDate = new Date(created_at).toISOString().split("T")[0];
  const { t, i18n } = useTranslation();

  const handleDeckClick = (id) => {
    navigate(`/learn/${id}`);
  };

  return (
    <div className={`${className} foldercard-container`}>
      <div className="foldercard-items">
        <h4 className="name">{name}</h4>
        <h5>{t("folders:createdAt")+ formattedDate}</h5>
      </div>
      <div className="foldercard-items">
        <h6>{t("folders:decks")}</h6>
        <ul>
          {decks.map((item) => (
            <li
              className="list cursor-pointer"
              key={item.id}
              onClick={() => handleDeckClick(item.id)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="foldercard-items">
        <button className="btn">
          <i className="material-icons">edit</i>
        </button>
        <button className="btn">
          <i className="material-icons">delete</i>
        </button>
        <button className="btn">
          <i className="material-icons">share</i>
        </button>
      </div>
    </div>
  );
}
