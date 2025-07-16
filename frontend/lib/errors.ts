export class ForbiddenError extends Error {
  constructor(message = "403 - Acceso denegado") {
    super(message);
    this.name = "ForbiddenError";
  }
}
