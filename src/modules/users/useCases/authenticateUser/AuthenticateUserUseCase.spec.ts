import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { userFixture } from "../../tests/fixtures/UserFixture";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

const user = userFixture();

describe("Authenticate User Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to authenticate an user", async () => {
    await createUserUseCase.execute(user);

    const tokenAndUserObject = await authenticateUserUseCase.execute(user);

    expect(tokenAndUserObject.user.name).toEqual(user.name);
    expect(tokenAndUserObject.user.email).toEqual(user.email);
    expect(tokenAndUserObject.user).toHaveProperty("id")
    expect(tokenAndUserObject).toHaveProperty("token");
  })

  it("should not be able to authenticate an non-existent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate with incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "incorrectPassword",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

})
