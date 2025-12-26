const Category = require('../models/category');
const Product = require('../models/product');
const mongoose = require('mongoose');

const product_create_get = async (req, res) => {
    try {
        //! http://localhost:3000/api/v1/products?categories=1234,4213,...
        let filter = {};
        if (req.query.categories) {
            const categoryIds = req.query.categories.split(',').map(category => category.trim());
            filter = { category: categoryIds };
        }

        const productList = await Product.find(filter).sort({ dataCreated: -1 }).populate('category', 'name');
        if (productList.length === 0) {
            return res.status(200).json({ message: "No products found", data: [] });
        }
        //! Get the product names
        const productNames = productList.map(e => e.name);

        //* GET request is successful
        res.status(200).json({
            productLenght: productList.length,
            productNames: productNames,
            productList: productList
        })

    } catch (error) {
        res.status(500).json({ success: false, errorDetails: error.message })

    }
}

const product_create_post = async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) {
            return res.status(400).send('No category was found for the provided ID.');
        }

        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        });
        const savedProduct = await product.save();
        if (!savedProduct) {
            return res.status(500).send('The product could not be created.');
        }
        //* Product Creation successful
        res.status(201).send(savedProduct);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred on the server side during the creation process.',
            details: error.details
        });
        console.error(err);
    }
};


const product_get_details = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if(!product) {
            return res.status(404).json({
                success: false,
                message: "No product found"
            })
        }
        res.status(200).send(product);

    } catch (error) {
        res.status(404).json({
            success: false,
            message: 'There is no product that you searched it',
            details: error.message
        })
    }
}

const product_update = async (req, res) => {
    //todo Aşağıdaki şekilde bir promise yapısı izlenebilir.
    //todo if(!mongoose.isValidObjectId(req.params.id)) res.status(400).send("Invalid Product ID");
    try {
        const category = await Category.findById(req.body.category);
        if (!category) res.status(400).send("Invalid Category ID");

        const product = await Product.findByIdAndUpdate(req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: req.body.image,
                images: req.body.images,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured,
            }, { new: true }).populate('category', 'name');
        //? "new : true" line ensure the showing the updated product details in the console
        res.send(product)
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'There is no product that you searched it'
        })

    }
}

const product_delete = async (req, res) => {
    try {
        const { id } = req.params;
        const object = await Product.findByIdAndDelete(id);
        if (!object) {
            res.status(404).json({
                success: false,
                message: "Product was not found"
            })
        }

        console.log(`DELETE: Requested product object "${id}" was deleted`);
        res.status(201).json({ success: true, message: `DELETE: Product object "${id}" was deleted` })

    } catch (error) {
        return res.status(404).json({
            error: 'Sunucu tarafında silme işlemi sırasında hata oluştu',
            details: error.details,
            success: false,
        })
    }
}

const soft_delete = async (req,res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if(!product || product.$isDeleted) {
            return res.status(404).json({
                success: false,
                message: "The product provided ID could not be found"
            })
        }
        
        product.$isDeleted = true;
        product.deletedAt = Date.now();
        
        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product has been soft deleted"
        })

        
    } catch (error) {
        return res.statsu(500).json({
            success: false,
            message: "An unexptected server error occurred"
        })
        
    }
}

const count_of_products = async (req, res) => {
    const productCount = await Product.countDocuments();

    if (!productCount) res.status(500).json(
        {
            success: false,
            messagge: "Count of Product could not taken"
        })

    res.send({ success: true, productCount: productCount });
}

const get_featured_products = async (req, res) => {
    try {
        const count = req.params.count ? +req.params.count : 0;
        let query = Product.find({ isFeatured: true }).populate('category', 'name');
        if (count > 0) {
            query = query.limit(count);
        }

        const featuredProducts = await query;
        if (featuredProducts.length === 0) {
            return res.status(404).send({ success: false, message: "There are no featured products" })
        }

        res.send({
            success: true,
            length: featuredProducts.length,
            data: featuredProducts
        })
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const product_get_ids = async (req, res) => {
    try {
        const products = await Product.find().select('_id name');

        if(products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Empty List"
            })
        }

        res.status(200).json({
            success: true,
            products: products
        });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
}

//! Kategorilere göre gruplama
const accumulator = async (req, res) => {
    const accumulate = await Product.aggregate([
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryData' }
        },
        { $sort: { price: -1}},
        { $unwind: '$categoryData' },
        { $group: { _id: '$categoryData._id', categoryName: { $first: '$categoryData.name'}, 
                    productInclude: {$sum: 1}, productNames: { $push: '$name' }, 
                    totalPrice: {$sum: '$price'}} },
        {
            $project: {
                _id: 0,
                categoryId: '$_id',
                categoryName: 1,
                productInclude: 1,
                productNames: 1,
                totalPrice: 1
            }
        }
    ])

    if (accumulate.length == 0) res.send(400).send('The product informations cannot generetad');
    res.send(accumulate);
}

module.exports = {
    product_create_get,
    product_create_post,
    product_get_details,
    product_update,
    product_delete,
    soft_delete,
    count_of_products,
    get_featured_products,
    product_get_ids,
    accumulator,
}