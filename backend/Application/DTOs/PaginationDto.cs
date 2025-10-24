using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public record PaginationDto(int Page = 1, int PageSize = 10);

    public record PagedResultDto<T>
    {
        public List<T> Items { get; init; }
        public int TotalCount { get; init; }
        public int Page { get; init; }
        public int PageSize { get; init; }
        public int TotalPages { get; init; }

        public PagedResultDto(List<T> items, int totalCount, int page, int pageSize, int totalPages)
        {
            Items = items;
            TotalCount = totalCount;
            Page = page;
            PageSize = pageSize;
            TotalPages = totalPages;
        }
    }
}