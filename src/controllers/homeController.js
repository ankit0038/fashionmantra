exports.home = (req, res) => {
        res.status(200).send({
                success: true,
                msg: "Hello there!"
        });
}