import { AppError } from "../../../../shared/errors/AppError";
import { userFixture } from "../../../users/tests/fixtures/UserFixture";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

const user = userFixture();

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
  })

  it("it must not be possible to create a statement for a non-existent user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "id",
        amount: 400,
        type: OperationType.DEPOSIT,
        description: "Statement Description"
      });
    }).rejects.toBeInstanceOf(AppError)
  })

  it("should be able to create a statement", async () => {
    await createUserUseCase.execute(user);
    const userAuthenticated = await authenticateUserUseCase.execute(user);

    const deposit = await createStatementUseCase.execute({
      user_id: userAuthenticated.user.id as string,
      amount: 600,
      type: OperationType.DEPOSIT,
      description: "Statement Description"
    });

    expect(deposit).toHaveProperty("id")
    expect(deposit).toHaveProperty("user_id")
    expect(deposit.type).toEqual("deposit")

    const withdraw = await createStatementUseCase.execute({
      user_id: userAuthenticated.user.id as string,
      amount: 400,
      type: OperationType.WITHDRAW,
      description: "Statement Description"
    });

    expect(withdraw).toHaveProperty("id")
    expect(withdraw).toHaveProperty("user_id")
    expect(withdraw.type).toEqual("withdraw")

    const balance = await getBalanceUseCase.execute({
      user_id: userAuthenticated.user.id as string
    });

    expect(balance.statement.length).toEqual(2)
    expect(balance.balance).toEqual(200)
  });

  it("it must not be possible to make a withdrawal if you do not have sufficient funds", async () => {
    expect(async () => {
      await createUserUseCase.execute(user);
      const userAuthenticated = await authenticateUserUseCase.execute(user);

      await createStatementUseCase.execute({
        user_id: userAuthenticated.user.id as string,
        amount: 400,
        type: OperationType.WITHDRAW,
        description: "Statement Description"
      });
    }).rejects.toBeInstanceOf(AppError)
  });
})
