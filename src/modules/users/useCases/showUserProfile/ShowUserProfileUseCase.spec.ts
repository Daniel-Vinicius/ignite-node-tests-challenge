import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { userFixture } from "../../tests/fixtures/UserFixture";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

const user = userFixture();

describe("Show User Profile Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to show profile user", async () => {
    await createUserUseCase.execute(user);
    const userAuthenticated = await authenticateUserUseCase.execute(user);

    const profileUserReturned = await showUserProfileUseCase.execute(userAuthenticated.user.id as string);

    expect(profileUserReturned).toHaveProperty("id");
    expect(profileUserReturned).toHaveProperty("name");
    expect(profileUserReturned).toHaveProperty("email");
  })

  it("should not be able to show a profile of a non-existent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("id");
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
