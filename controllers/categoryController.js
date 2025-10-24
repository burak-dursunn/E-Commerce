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

const category_get_details = async (req,res) => {
    const id = req.params.id;
    try {
        const category = await Category.findById(id);
        res.status(200).send(category);
        
    } catch (error) {
        res.status(404).json({
        success: false, 
        message: 'The category with the given ID was not found',
        details: error.details
        })
    }
}

const category_update = async (req,res) => {
    const id = req.params.id;
    try {
        const category = await Category.findByIdAndUpdate(id, 
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        })
        res.send(category)
        
    } catch (error) {
        res.status(400).json({
            success: false,
            messaje: 'There is no category that you searched it'
        })
    }
    
}

const category_delete = async (req,res) => {
    const id = req.params.id;

    try {
        const object = await Category.findByIdAndDelete(id)
        res.status(201).json({ success: true, message: `DELETE: Catrgory object ${id} was deleted`})
        
    } catch (error) {
        return res.status(404).json({
                error: 'Sunucu tarafında silme işlemi sırasında hata oluştu',
                details: error.details,
                success: false,
            })
    }
}

module.exports = {
    category_create_get,
    category_create_post,
    category_get_details,
    category_update,
    category_delete,
}