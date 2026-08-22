"use client";

import { useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TableInstance,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Rendered left of the column-visibility button, receives table instance for filter wiring. */
  toolbar?: (table: TableInstance<TData>) => ReactNode;
  /** Floating bar shown when rows are selected. */
  bulkActions?: (table: TableInstance<TData>) => ReactNode;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
  enableSelection?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  /** Max height of the scroll container; header stays sticky inside it. */
  maxHeight?: string;
  /** Seeds the built-in global filter, e.g. from a URL query param. */
  initialGlobalFilter?: string;
  /**
   * Opt-in server-side paging. Omitted, the table behaves exactly as before
   * and filters/sorts/pages the rows it was handed — which is what the other
   * tables here rely on. Supplied, `data` is one page and the server owns
   * filtering, sorting and counting, so the client-side row models are
   * bypassed rather than re-filtering a page that is already correct.
   */
  serverPagination?: {
    pageIndex: number;
    pageCount: number;
    rowCount: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    onSortChange?: (sort: SortingState) => void;
    loading?: boolean;
  };
}

export function DataTable<TData>({
  columns,
  data,
  toolbar,
  bulkActions,
  onRowClick,
  getRowId,
  enableSelection = false,
  pageSize = 25,
  emptyMessage = "No results found.",
  maxHeight = "calc(100vh - 320px)",
  initialGlobalFilter = "",
  serverPagination,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter);

  const server = serverPagination;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      ...(server ? { pagination: { pageIndex: server.pageIndex, pageSize } } : {}),
    },
    manualPagination: !!server,
    manualSorting: !!server,
    manualFiltering: !!server,
    pageCount: server?.pageCount,
    rowCount: server?.rowCount,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
      server?.onSortChange?.(next);
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(server ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    getRowId,
    enableRowSelection: enableSelection,
    columnResizeMode: "onChange",
    initialState: { pagination: { pageSize } },
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-2">{toolbar?.(table)}</div>
        <ColumnVisibilityMenu table={table} />
      </div>

      {selectedCount > 0 && bulkActions && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-foreground">
            {selectedCount} selected
          </span>
          <div className="flex flex-wrap items-center gap-1.5">{bulkActions(table)}</div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => table.resetRowSelection()}
          >
            Clear
          </Button>
        </div>
      )}

      <div
        className="overflow-auto rounded-lg border border-border bg-card"
        style={{ maxHeight }}
      >
        <table className="w-full caption-bottom text-sm" style={{ minWidth: table.getTotalSize() }}>
          <thead className="sticky top-0 z-10 bg-card shadow-[inset_0_-1px_0_0_var(--border)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                    className="group/th relative h-10 px-3 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground select-none"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 uppercase tracking-wide hover:text-foreground"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover/th:opacity-60" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 cursor-col-resize rounded bg-border opacity-0 transition-opacity group-hover/th:opacity-100",
                          header.column.getIsResizing() && "bg-ring opacity-100"
                        )}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <DataTableRow key={row.id} row={row} onRowClick={onRowClick} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <DataTablePagination table={table} server={server} />
    </div>
  );
}

function DataTableRow<TData>({
  row,
  onRowClick,
}: {
  row: Row<TData>;
  onRowClick?: (row: TData) => void;
}) {
  return (
    <tr
      data-state={row.getIsSelected() ? "selected" : undefined}
      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
      className={cn(
        "border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40 data-[state=selected]:bg-primary/5",
        onRowClick && "cursor-pointer"
      )}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          style={{ width: cell.column.getSize() }}
          className="px-3 py-2.5 align-middle"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

function ColumnVisibilityMenu<TData>({ table }: { table: TableInstance<TData> }) {
  const hideableColumns = table.getAllLeafColumns().filter((c) => c.getCanHide());
  if (hideableColumns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            View
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {hideableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
            className="capitalize"
          >
            {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DataTablePagination<TData>({
  table,
  server,
}: {
  table: TableInstance<TData>;
  server?: { rowCount: number; onPageChange: (i: number) => void; onPageSizeChange?: (s: number) => void };
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  // Server mode knows the true total; client mode can only count what it holds.
  const totalRows = server ? server.rowCount : table.getFilteredRowModel().rows.length;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(totalRows, (pageIndex + 1) * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
        <span className="font-medium text-foreground">{totalRows.toLocaleString()}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              const next = Number(v ?? 25);
              table.setPageSize(next);
              server?.onPageSizeChange?.(next);
            }}
            items={{ "10": "10", "25": "25", "50": "50", "100": "100" }}
          >
            <SelectTrigger size="sm" className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => { table.setPageIndex(0); server?.onPageChange(0); }}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => { const i = Math.max(0, table.getState().pagination.pageIndex - 1); table.setPageIndex(i); server?.onPageChange(i); }}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-sm tabular-nums text-muted-foreground">
            {pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => { const i = table.getState().pagination.pageIndex + 1; table.setPageIndex(i); server?.onPageChange(i); }}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => { const i = table.getPageCount() - 1; table.setPageIndex(i); server?.onPageChange(i); }}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
