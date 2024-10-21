const queryPagination = (limit, page, totalRecords) => {
    const paginationLimit = limit || 10
    const paginationPage = parseInt(page) || 1
    const paginationOffset = (paginationPage - 1) * paginationLimit
    const paginationTotalPages = totalRecords ? Math.ceil(totalRecords/paginationLimit) : 0
    return { paginationLimit, paginationPage, paginationOffset, paginationTotalPages }
  }
  export default queryPagination