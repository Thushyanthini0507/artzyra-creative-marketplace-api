/**
 * Pagination utility for consistent pagination across all list endpoints
 * @param {Array} data - Array of results
 * @param {Number} total - Total count
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} Formatted pagination response
 */
export const formatPaginationResponse = (data, total, page = 1, limit = 10) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / limitNum);

  return {
    data,
    pagination: {
      currentPage: pageNum,
      limit: limitNum,
      totalItems: total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      nextPage: pageNum < totalPages ? pageNum + 1 : null,
      prevPage: pageNum > 1 ? pageNum - 1 : null,
    },
  };
};
