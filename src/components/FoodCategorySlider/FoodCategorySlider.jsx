import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './FoodCategorySlider.css';

const categories = [
    { name: 'Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=288&h=360&fit=crop', search: 'pizza' },
    { name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=288&h=360&fit=crop', search: 'burger' },
    { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=288&h=360&fit=crop', search: 'biryani' },
    { name: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=288&h=360&fit=crop', search: 'chinese' },
    { name: 'South Indian', image: 'https://images.unsplash.com/photo-1668236543090-82eb5eace6fc?w=288&h=360&fit=crop', search: 'south indian' },
    { name: 'North Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=288&h=360&fit=crop', search: 'north indian' },
    { name: 'Ice Cream', image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=288&h=360&fit=crop', search: 'ice cream' },
    { name: 'Rolls', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=288&h=360&fit=crop', search: 'rolls' },
    { name: 'Pasta', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=288&h=360&fit=crop', search: 'pasta' },
    { name: 'Cake', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=288&h=360&fit=crop', search: 'cake' },
    { name: 'Dosa', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=288&h=360&fit=crop', search: 'dosa' },
    { name: 'Salad', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=288&h=360&fit=crop', search: 'salad' },
];

export default function FoodCategorySlider() {
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    const scroll = (direction) => {
        if (scrollRef.current) {
            const amount = 340;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

    const handleClick = (search) => {
        navigate(`/search?q=${encodeURIComponent(search)}`);
    };

    return (
        <section className="food-categories">
            <div className="food-categories__header">
                <h2>What's on your mind?</h2>
                <div className="food-categories__arrows">
                    <button onClick={() => scroll('left')} className="food-categories__arrow"><FiChevronLeft /></button>
                    <button onClick={() => scroll('right')} className="food-categories__arrow"><FiChevronRight /></button>
                </div>
            </div>
            <div className="food-categories__slider" ref={scrollRef}>
                {categories.map((cat) => (
                    <div key={cat.name} className="food-categories__item" onClick={() => handleClick(cat.search)}>
                        <img src={cat.image} alt={cat.name} onError={(e) => { e.target.style.opacity = '0.3'; }} />
                        <span className="food-categories__label">{cat.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
