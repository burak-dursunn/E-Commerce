const Category = require('../models/category');

const category_create_get = async (req,res) => {
    try {
        const categoryList = await Category.find();
        res.send(categoryList);
    } catch (error) {
        res.status(404).json({
        success: false, 
        message: 'There is an error with wihle trying to get the catregoires',
        details: error.details
        })
    }
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
            success: false,
            error: 'An error occurred while trying the create the requested category on the server side',
            details: error.details,
        })
        
    }
}

const category_get_details = async (req,res) => {
    try {
        const category = await Category.findById(req.params.id);
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
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, 
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
    try {
        const object = await Category.findByIdAndDelete(req.params.id);
        console.log(`DELETE: Requested category object "${id}" was deleted`);
        res.status(201).json({ success: true, message: `DELETE: Catrgory object "${id}" was deleted`})
        
    } catch (error) {
        return res.status(404).json({
                error: 'An error occured while trying the delete the requsted category object',
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