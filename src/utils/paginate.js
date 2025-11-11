// get by pagination
const pagination = async (page, limit) => {
  try {
    return Customer.find()
      .skip((page - 1) * limit)
      .limit(limit);
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

export default pagination;
