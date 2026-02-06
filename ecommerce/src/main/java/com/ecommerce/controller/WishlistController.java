package com.ecommerce.controller;

import com.ecommerce.model.Wishlist;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.WishlistRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {
    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/add")
    public String addToWishlist(Long userId, Long productId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            Product product = productRepository.findById(productId).orElse(null);

            if (user == null || product == null) {
                return "User or Product not found";
            }

            Wishlist existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
            if (existing != null) {
                return "Product already in wishlist";
            }

            Wishlist wishlist = new Wishlist(user, product);
            wishlistRepository.save(wishlist);
            return "Added to wishlist";
        } catch (Exception e) {
            return "Error adding to wishlist: " + e.getMessage();
        }
    }

    @GetMapping("/get")
    public List<Wishlist> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    @GetMapping("/remove")
    public String removeFromWishlist(Long userId, Long productId) {
        try {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
            return "Removed from wishlist";
        } catch (Exception e) {
            return "Error removing from wishlist: " + e.getMessage();
        }
    }

    @GetMapping("/check")
    public boolean isInWishlist(Long userId, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId);
        return wishlist != null;
    }
}
