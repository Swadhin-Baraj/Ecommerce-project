package com.ecommerce.controller;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.model.Product;
import com.ecommerce.model.Wishlist;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.WishlistRepository;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private WishlistRepository wishlistRepo;

    // Simple recommendations for a user based on wishlist categories
    @GetMapping("/user")
    public List<Product> recommendForUser(@RequestParam Long userId) {
        List<Wishlist> wishlist = wishlistRepo.findByUserId(userId);

        // collect categories from wishlist
        Set<String> categories = wishlist.stream()
                .map(w -> w.getProduct())
                .filter(Objects::nonNull)
                .map(p -> p.getCategory())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<Product> all = productRepo.findAll();

        // if we don't have wishlist categories, fall back to featured products
        if (categories.isEmpty()) {
            return all.stream().limit(8).collect(Collectors.toList());
        }

        Set<Long> wishlistIds = wishlist.stream()
                .map(w -> w.getProduct())
                .filter(Objects::nonNull)
                .map(p -> p.getId())
                .collect(Collectors.toSet());

        return all.stream()
                .filter(p -> p.getCategory() != null && categories.contains(p.getCategory()))
                .filter(p -> p.getId() != null && !wishlistIds.contains(p.getId()))
                .limit(8)
                .collect(Collectors.toList());
    }
}
