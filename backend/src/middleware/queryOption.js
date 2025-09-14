// middleware/queryOptions.js
export const queryOptions =
  (searchableFields = [], defaultSortField = "createdAt") =>
  (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || defaultSortField; // use custom default
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
    const search = req.query.search || "";

    let filter = {};
    if (search && searchableFields.length > 0) {
      filter.$or = searchableFields.map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
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
