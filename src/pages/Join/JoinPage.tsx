// src/pages/Join/JoinPage.tsx
import { Link } from "react-router-dom";
import { JOIN_CARDS } from "./Join.data";
import "./JoinPage.css";

const JoinPage: React.FC = () => {
  return (
    <section className="join-section">
      <div className="join-container">
        <div className="join-grid">
          {JOIN_CARDS.map((card) => (
            <div className="join-card" key={card.title}>
              <h3 className="join-title">{card.title}</h3>

              <img
                src={card.image}
                alt={card.title}
                className="join-image"
              />

              <p className="join-text">{card.text}</p>

              <Link to={card.link} className="join-btn">
                {card.button}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JoinPage;
