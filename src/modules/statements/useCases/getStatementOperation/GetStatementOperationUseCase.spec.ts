import { AppError } from "../../../../shared/errors/AppError";
import { userFixture } from "../../../users/tests/fixtures/UserFixture";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;

const user = userFixture();

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should not be able to show a statement if the user is not found", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "user_id",
        statement_id: "statement_id"
      });
    }).rejects.toBeInstanceOf(AppError)
  })

  it("should not be able to show a non-existent statement", async () => {
    expect(async () => {
      await createUserUseCase.execute(user);
      const userAuthenticated = await authenticateUserUseCase.execute(user);

      await getStatementOperationUseCase.execute({
        user_id: userAuthenticated.user.id as string,
        statement_id: "statement_id"
      });
    }).rejects.toBeInstanceOf(AppError)
  })

  it("should be able to show a statement", async () => {
    await createUserUseCase.execute(user);
    const userAuthenticated = await authenticateUserUseCase.execute(user);

    const deposit = await createStatementUseCase.execute({
      user_id: userAuthenticated.user.id as string,
      amount: 600,
      type: OperationType.DEPOSIT,
      description: "Statement Description"
    });

    const statement = await getStatementOperationUseCase.execute({
      user_id: userAuthenticated.user.id as string,
      statement_id: deposit.id as string
    });

    expect(statement).toHaveProperty("id")
    expect(statement).toHaveProperty("user_id")
    expect(statement).toHaveProperty("description")
    expect(statement).toHaveProperty("amount")
  })
})
