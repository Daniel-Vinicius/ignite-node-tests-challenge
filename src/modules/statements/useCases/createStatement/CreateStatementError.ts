import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateStatementError {
  export class UserNotFound extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }

  export class TransferNeedsSenderId extends AppError {
    constructor() {
      super('To make a transfer, is necessary pass the sender_id field.', 400);
    }
  }
}
