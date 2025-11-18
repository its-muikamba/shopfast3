import React, { useState } from 'react';
import { LiveOrder, Restaurant, Review } from '../types';
import { ChevronDownIcon, StarIcon, XIcon } from './Icons';
import { StarRating } from './Icons';


const ReviewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
    restaurantName: string;
}> = ({ isOpen, onClose, onSubmit, restaurantName }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0) {
            onSubmit(rating, comment);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-lg shadow-xl w-full max-w-md p-6 relative bg-white">
                <button onClick={onClose} className="absolute top-3 right-3 text-copy-light hover:text-copy">
                    <XIcon className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-copy mb-2">Leave a Review</h2>
                <p className="text-copy-light text-sm mb-4">How was your experience at {restaurantName}?</p>
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center my-6">
                        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts... (optional)"
                        rows={4}
                        className="w-full shadcn-input"
                    />
                    <button
                        type="submit"
                        disabled={rating === 0}
                        className="w-full mt-6 bg-primary text-brand-charcoal font-bold py-3 rounded-lg disabled:bg-surface-light disabled:cursor-not-allowed disabled:text-copy-lighter shadow-glow-primary"
                    >
                        Submit Review
                    </button>
                </form>
            </div>
        </div>
    );
};

interface OrderHistoryCardProps {
    order: LiveOrder;
    restaurant: Restaurant;
    onAddReview: (restaurantId: string, orderId: string, reviewData: Omit<Review, 'id' | 'userId' | 'userName'>) => void;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ order, restaurant, onAddReview }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    // Mock date for display purposes
    const orderDate = new Date(parseInt(order.id.split('-')[1])).toLocaleDateString();
    
    const handleReviewSubmit = (rating: number, comment: string) => {
        onAddReview(restaurant.id, order.id, {
            rating,
            comment,
            timestamp: Date.now(),
        });
        setIsReviewModalOpen(false);
    };

    const isOrderComplete = order.status === 'Served' || order.status === 'Delivered' || order.paymentStatus === 'paid';


    return (
        <>
        <div className="glass-card rounded-2xl p-4 transition-all duration-300">
            <div className="flex items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <img src={restaurant.logoUrl} alt={restaurant.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="ml-4 flex-grow">
                    <h3 className="font-bold text-copy">{restaurant.name}</h3>
                    <p className="text-sm text-copy-light">{orderDate}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-copy">{restaurant.currency.symbol}{order.total.toFixed(2)}</p>
                    <p className="text-xs text-copy-light">{order.items.length} items</p>
                </div>
                 <ChevronDownIcon className={`w-6 h-6 ml-2 text-copy-light transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-surface-light">
                    <h4 className="font-semibold text-copy-light mb-2">Order Details:</h4>
                    <div className="space-y-2">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-copy-light">{item.name} <span className="text-copy-lighter">x{item.quantity}</span></span>
                                <span className="font-medium text-copy">{restaurant.currency.symbol}{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                     <div className="border-t border-surface-light my-2"></div>
                     <div className="flex justify-between font-bold text-copy text-right">
                        <span>Total Paid</span>
                        <span>{restaurant.currency.symbol}{order.total.toFixed(2)}</span>
                    </div>

                    {isOrderComplete && !order.isReviewed && (
                        <button 
                            onClick={() => setIsReviewModalOpen(true)}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-primary/20 text-primary font-bold py-2 px-4 rounded-lg hover:bg-primary/30 transition">
                            <StarIcon className="w-5 h-5" />
                            Leave a Review
                        </button>
                    )}
                     {isOrderComplete && order.isReviewed && (
                         <p className="text-center mt-4 text-sm text-secondary italic">You have reviewed this order.</p>
                    )}
                </div>
            )}
        </div>
        <ReviewModal 
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onSubmit={handleReviewSubmit}
            restaurantName={restaurant.name}
        />
        </>
    );
};

export default OrderHistoryCard;