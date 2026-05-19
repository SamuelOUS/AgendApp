//Formato respuesta estado de peticion

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}
