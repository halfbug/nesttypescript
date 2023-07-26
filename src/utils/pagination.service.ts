import { Injectable } from '@nestjs/common';

@Injectable()
export class PaginationService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  paginate(result: any[], total: number, take: number, skip: number) {
    const lastPage = Math.ceil(total / take);
    const currentPage = Math.floor(skip / take) + 1;

    return {
      total,
      count: result.length,
      currentPage,
      lastPage,
      hasNextPage: currentPage < lastPage,
      hasPreviousPage: currentPage > 1,
    };
  }
}
