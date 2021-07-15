import { userFixture } from "../../../users/tests/fixtures/UserFixture";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

const user = userFixture();

describe("Get Balance Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
  })

  it("should be able to show user balance", async () => {
    await createUserUseCase.execute(user);
    const userAuthenticated = await authenticateUserUseCase.execute(user);

    const balance = await getBalanceUseCase.execute({
      user_id: userAuthenticated.user.id as string
    });

    expect(balance).toHaveProperty("balance")
    expect(balance).toHaveProperty("statement")
  });

  it("should not be able to show user balance of a non-existent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "id"
      });
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
