
const Product = require('../models/product');

const product_create_get = (req, res) => {
    Product.find().sort({ createdAt: -1})
        .then(result => {
            res.send(result);
        })
        .catch(err => console.log(err))
}

const products_create_post = (req,res) => {
    // const product = new Product(req.body);
    const product = new Product({
        name: req.body.name,
        image: req.body.image,
        countInStock: req.body.countInStock
    })
    product.save()
        .then(createdProduct => {
            console.log('POST işlemi başarılı')
            res.status(201).json(createdProduct);
        })
        .catch(err => {
            console.log(`Ürün kaydetme sırasında hata: ${err}`);
            res.status(500).json({
                eroor: err,
                success: false
            })
        })  
}

module.exports = {
    product_create_get,
    products_create_post
}