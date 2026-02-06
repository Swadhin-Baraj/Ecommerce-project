package com.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.model.Cart;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    CartRepository cartRepo;

    @Autowired
    UserRepository userRepo;

    @Autowired
    ProductRepository productRepo;

    // Add item to cart
    @GetMapping("/add")
    public String addToCart(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {

        User user = userRepo.findById(userId).orElse(null);
        Product product = productRepo.findById(productId).orElse(null);

        if (user == null || product == null) {
            return "User or Product not found";
        }

        Double totalPrice = product.getPrice() * quantity;
        Cart cartItem = new Cart(user, product, quantity, totalPrice);
        cartRepo.save(cartItem);

        return "Item added to cart";
    }

    // Get user cart
    @GetMapping("/get")
    public List<Cart> getUserCart(@RequestParam Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        return cartRepo.findByUser(user);
    }

    // Remove item from cart
    @GetMapping("/remove")
    public String removeFromCart(@RequestParam Long cartId) {
        if (cartRepo.existsById(cartId)) {
            cartRepo.deleteById(cartId);
            return "Item removed from cart";
        }
        return "Cart item not found";
    }

    // Clear cart
    @GetMapping("/clear")
    public String clearCart(@RequestParam Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return "User not found";
        }
        List<Cart> userCart = cartRepo.findByUser(user);
        cartRepo.deleteAll(userCart);
        return "Cart cleared";
    }

    // Get cart total
    @GetMapping("/total")
    public Double getCartTotal(@RequestParam Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return 0.0;
        }
        List<Cart> userCart = cartRepo.findByUser(user);
        return userCart.stream().mapToDouble(Cart::getTotalPrice).sum();
    }
}
