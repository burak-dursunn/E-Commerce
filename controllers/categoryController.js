    const Category = require('../models/category');

    const category_create_get = async (req,res) => {
        const categoryList = await Category.find();

        if(!categoryList) res.status(501).json({success: false})
        res.send(categoryList);
    }

    const category_create_post = async (req,res) => {
        const category = new Category ({
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        })
        //todo Asenkron yapı
        try {
            createdCategory = await category.save();
            res.status(201).send(category); 
        } catch (error) {
            return res.status(404).json({
                error: 'Sunucu tarafında kategori oluşturulurken hata oluştu',
                details: error.details,
                success: false,
            })
            
        }
    }

    module.exports = {
        category_create_get,
        category_create_post,
    }