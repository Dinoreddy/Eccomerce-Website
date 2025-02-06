import Products from "../models/products.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Products.find({ _id: { $in: req.user.cartItems } });

    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return {...product.toJSON(),  quantity: item.quantity };
    });
    res.json(cartItems);
  } catch (error) {
    console.log("error in getting cart products" + error.message);
    return res
      .status(500)
      .json({
        message: "Error in getting cart products",
        error: error.message,
      });
  }
};
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    // Find if the product already exists in cart
    const existingItem = user.cartItems.find((item) => item.id === productId);
		if (existingItem) {
			existingItem.quantity += 1;
    } else {
      // If product doesn't exist, add new cart item
      user.cartItems.push({
        _id: productId,
        quantity: 1
      });
    }

    // Save the updated user
    const updatedUser = await user.save();
    console.log("updatedUser",updatedUser);
    // Populate the product details in the response
    await updatedUser.populate('cartItems.product');


    res.json({
      success: true,
      cartItems: updatedUser.cartItems
    });

  } catch (error) {
    console.error("Error in adding to cart:", error);
    res.status(500).json({ 
      success: false,
      message: "Error in adding to cart", 
      error: error.message 
    });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter(
        (item) => item.id !== productId
      );
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("error in removing from cart" + error.message);
    return res
      .status(500)
      .json({ message: "Error in removing from cart", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find(
      (item) => item.id === productId
    );
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.id !== productId
        );
        await user.save();
        return res.json(user.cartItems);
      }

      existingItem.quantity = quantity;

      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    console.log("error in updating quantity" + error.message);
    return res
      .status(500)
      .json({ message: "Error in updating quantity", error: error.message });
  }
};
