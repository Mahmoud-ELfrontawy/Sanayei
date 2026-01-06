// pages/Home/sections/CardsRow/CardsRow.tsx
import { CARDS_ROW_DATA } from "../../../../constants/cardsRow.data";
import "./CardsRow.css";

const CardsRow: React.FC = () => {
    return (
        <div className="cards-row-wrapper">
            <div className="cards-row">
                {CARDS_ROW_DATA.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={index}
                            className="card flex items-start gap-3"
                        >
                            <div className="card-icon" aria-hidden="true">
                                <Icon size={18} />
                            </div>

                            <div className="card-content">
                                <h3 className="card-title">{item.title}</h3>
                                <p className="card-text">{item.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CardsRow;
