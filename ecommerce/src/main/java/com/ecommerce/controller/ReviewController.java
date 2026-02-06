package com.ecommerce.controller;

import com.ecommerce.model.Review;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/add")
    public String addReview(Long productId, Long userId, Integer rating, String comment) {
        try {
            Product product = productRepository.findById(productId).orElse(null);
            User user = userRepository.findById(userId).orElse(null);

            if (product == null || user == null) {
                return "Product or User not found";
            }

            Review review = new Review(product, user, rating, comment);
            reviewRepository.save(review);
            return "Review added successfully";
        } catch (Exception e) {
            return "Error adding review: " + e.getMessage();
        }
    }

    @GetMapping("/product")
    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    @GetMapping("/average")
    public double getAverageRating(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double sum = reviews.stream().mapToInt(Review::getRating).sum();
        return sum / reviews.size();
    }

    @GetMapping("/count")
    public int getReviewCount(Long productId) {
        return reviewRepository.findByProductId(productId).size();
    }

    @GetMapping("/delete")
    public String deleteReview(Long reviewId) {
        try {
            reviewRepository.deleteById(reviewId);
            return "Review deleted successfully";
        } catch (Exception e) {
            return "Error deleting review: " + e.getMessage();
        }
    }
}
