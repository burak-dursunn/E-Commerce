function errorHandler(err,req,res,next) {
    if(err.name === 'UnauthorizedE rror') {
        res.status(401).json({errorName: err.name, message: 'The user is not authorized'})
    }
    else if (err.name === 'Validation Error') {
        res.status(400).send(err)
    }

    return res.status(500).json({name: err.name, message: err.message || 'Interval server error'})

}

module.exports = errorHandler;