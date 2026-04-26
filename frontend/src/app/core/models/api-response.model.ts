export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiError {
  success: boolean;
  message: string;
  error_code: string;
  status_code: number;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}
