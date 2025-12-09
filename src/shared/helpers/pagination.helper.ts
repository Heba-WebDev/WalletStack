export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const computePaginationMeta = (
  total: number,
  limit: number,
  page: number,
): PaginationMeta => {
  const safeLimit = Math.max(limit, 1);
  const safePage = Math.max(page, 1);
  const totalPages = Math.max(Math.ceil(total / safeLimit), 1);

  return {
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
  };
};

