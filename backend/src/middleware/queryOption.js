// middleware/queryOptions.js
export const queryOptions =
  (searchableFields = [], defaultSortField = "createdAt") =>
  (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const sortBy = req.query.sortBy || defaultSortField;
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
    const search = req.query.search || "";

    let filter = {};

    // Search filter
    if (search && searchableFields.length > 0) {
      filter.$or = searchableFields.map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }

    // Category filter - ADD THIS
    if (req.query.category) {
      filter.category = req.query.category;
    }

    req.queryOptions = {
      page,
      limit,
      sort: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      filter,
    };

    next();
  };
