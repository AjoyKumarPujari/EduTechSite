const Category = require("../models/Category");


//create category done testing with admin login 
exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};
//showAllCategories api tested successfully
exports.showAllCategories = async (req, res) => {
	try {
		const allCategorys = await Category.find(
			{},
			{ name: true, description: true }
		);
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};


//category page details
exports.categoryPageDetails = async (req,res) => {
	try {
		//get category id
		const {categoryId} = req.body;
		//get courses which are related to category Id
		const selectedCategory = await Category.findById(categoryId)
												.populate("courses")
												.exec();
		//validation
		if(!selectedCategory){
			return res.status(404).json({
				success: false,
				message: "Data Not Available"
			});
		}
		//get cources for different categories
		const differentCategories = await Category.find({
									_id: {$ne: categoryId},
									})
									.populate("courses")
									.exac();
		//get top seling courses
		//return response
		res.status(200).json({
			success: true,
			data: {
				selectedCategory,
				differentCategories,
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}