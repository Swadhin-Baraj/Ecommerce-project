package com.ecommerce.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    ProductRepository repo;

    // Get all products
    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    // Add product
    @GetMapping("/add")
    public String addProduct(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam Integer quantity,
            @RequestParam String category,
            @RequestParam(required = false, defaultValue = "https://via.placeholder.com/200") String imageUrl) {

        Product p = new Product(name, description, price, quantity, category, imageUrl);
        repo.save(p);
        return "Product Added Successfully";
    }

    // Get product by id
    @GetMapping("/get")
    public Product getProduct(@RequestParam Long id) {
        return repo.findById(id).orElse(null);
    }

    // Delete product
    @GetMapping("/delete")
    public String deleteProduct(@RequestParam Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return "Product Deleted Successfully";
        }
        return "Product Not Found";
    }

    // Update product quantity
    @PostMapping("/update-quantity")
    public String updateQuantity(@RequestParam Long id, @RequestParam Integer newQuantity) {
        if (repo.existsById(id)) {
            Product p = repo.findById(id).get();
            p.setQuantity(newQuantity);
            repo.save(p);
            return "Quantity Updated Successfully";
        }
        return "Product Not Found";
    }

    // Search products by name or description
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String keyword) {
        List<Product> allProducts = repo.findAll();
        String lowerKeyword = keyword.toLowerCase();
        return allProducts.stream()
                .filter(p -> p.getName().toLowerCase().contains(lowerKeyword) || 
                       p.getDescription().toLowerCase().contains(lowerKeyword))
                .collect(Collectors.toList());
    }

    // Filter products by category
    @GetMapping("/category")
    public List<Product> getProductsByCategory(@RequestParam String category) {
        List<Product> allProducts = repo.findAll();
        return allProducts.stream()
                .filter(p -> p.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }

    // Filter products by price range
    @GetMapping("/price-range")
    public List<Product> getProductsByPriceRange(@RequestParam Double minPrice, @RequestParam Double maxPrice) {
        List<Product> allProducts = repo.findAll();
        return allProducts.stream()
                .filter(p -> p.getPrice() >= minPrice && p.getPrice() <= maxPrice)
                .collect(Collectors.toList());
    }

    // Get all categories
    @GetMapping("/categories")
    public List<String> getAllCategories() {
        List<Product> allProducts = repo.findAll();
        return allProducts.stream()
                .map(Product::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }

    // Get featured products (limited)
    @GetMapping("/featured")
    public List<Product> getFeaturedProducts() {
        List<Product> allProducts = repo.findAll();
        return allProducts.stream().limit(8).collect(Collectors.toList());
    }
}
