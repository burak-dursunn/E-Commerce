const Product = require('../models/product');

const product_create_get = (req, res) => {
    //todo rewrite with asynchronous dunction
    Product.find().sort({ createdAt: -1})
        .then(result => {
            res.send(result);
        })
        .catch(err => console.log(err))
}

const product_create_post = (req,res) => {
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

const product_get_details = async (req,res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).send(product);
        
    } catch (error) {
        res.status(404).json({
            success: false, 
            message: 'There is no product that you searched it',
            details: error.details
        })       
    }
}

const product_update = async (req,res) => {
        try {
            const product = await Product.findByIdAndUpdate(req.params.id, 
            {
                //todo fix the json content
                name: req.params.name,
                icon: req.params.icon,
                color: req.params.color
            })
            res.send(product)
        } catch (error) {
            res.status(400).json({
            success: false,
            messaje: 'There is no product that you searched it'
        },{ new : true})
            
        }
    }

const product_delete = async (req,res) => {
    try {
        const object = await Product.findByIdAndDelete(req.params.id);
        console.log(`DELETE: Requested product object "${id}" was deleted`);
        res.status(201).json({ success: true, message: `DELETE: Product object "${id}" was deleted`})
        
    } catch (error) {
        return res.status(404).json({
                error: 'Sunucu tarafında silme işlemi sırasında hata oluştu',
                details: error.details,
                success: false,
            })
    }
}
module.exports = {
    product_create_get,
    product_create_post,
    product_get_details,
    product_update,
    product_delete,
}