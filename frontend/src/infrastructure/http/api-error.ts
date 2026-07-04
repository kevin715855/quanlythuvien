export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly messages: string[],
  ) {
    super(messages[0] || "Không thể kết nối đến máy chủ");
    this.name = "ApiError";
  }
}
