import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { userFixture } from "../../tests/fixtures/UserFixture";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
const user = userFixture();

describe("Create User Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to create new user", async () => {
    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toHaveProperty("id");
    expect(userCreated.password).not.toEqual(user.password);
    expect(userCreated.email).toEqual(user.email);
  })

  it("should not be able to create new user with email duplicate", async () => {
    expect(async () => {
      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError)
  })
})
